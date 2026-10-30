# Substack for Claude

Lets Claude read your Substack posts and write drafts for you, from your own Mac. **It can't publish or email your readers.** You review each draft in Substack and press Publish yourself.

Ask Claude things like:

- "Turn these notes into a Substack draft."
- "Rewrite the intro of my latest draft."
- "What have I written about pricing?"

## Before you start

**This is unofficial.** Substack has no public way to write drafts, so this uses the same private route Substack's own website uses, signed in with your browser session. It could stop working if Substack changes its website, and you use it at your own risk on your own account.

You need:

- A Mac with Claude installed
- [Node.js](https://nodejs.org) (the LTS version)
- A Substack account with a publication

## Install

Open Terminal, paste these three lines, and press Enter. If your Mac offers to install developer tools, accept, then run them again.

```bash
git clone https://github.com/Philm-moxywolf/substack-mcp.git ~/substack-mcp
cd ~/substack-mcp
./install.sh
```

The installer asks for your Substack name and your key. It then adds this to Claude's settings, keeping a backup of each settings file ending in `.bak-substack`.

When it finishes, quit Claude with **Cmd + Q**, reopen it, and ask: *List my Substack drafts.*

Keep the `substack-mcp` folder where it is, because Claude runs it from there.

## Get your Substack key

Your key is what lets this act as you. **Treat it like a password.** Never send it to anyone, paste it into a chat, or share a screenshot of the panel below. This works in Chrome and Edge.

1. Sign in to Substack and go to `https://YOURNAME.substack.com/publish/posts`.
2. In the menu bar, choose **View > Developer > Developer Tools**.
3. Click **Network**. If you can't see it, click **>>** or **+** at the end of that row.
4. Click **Fetch/XHR**, then press **Cmd + R** to reload the page.
5. Click a row in the list that shows **200** under Status. One starting with `publication` or `drafts` is best.
6. On the right, click **Headers** and scroll to **Request Headers**.
7. Find the long **Cookie** line, then find `connect.sid=` in it. If it isn't there, look for `substack.sid=`.
8. Select only the part after the `=`, up to but not including the next `;`. It starts with `s%3A`. Right-click it and choose **Copy**.

Don't use the Application panel: the value there may not work. Don't copy the whole Cookie line either.

Paste the key only when the installer asks for it. If you paste it at a normal Terminal prompt, it gets saved in your Terminal history.

## If it stops working

- **Drafts stop working or Substack refuses:** you've probably been signed out, so your key has expired. Get a new key, then run `./install.sh` in the `substack-mcp` folder.
- **Claude can't see Substack:** quit with **Cmd + Q** and reopen it. Your Mac needs to be on, because this runs on your computer.
- **"Too many requests":** wait and try again later.

If your key is ever exposed, sign out of Substack everywhere you can, which cancels it. Then get a new one.

## Tools

| Tool | What it does |
|---|---|
| `list_posts` | Lists published posts |
| `search_posts` | Searches published posts |
| `get_post` | Reads a post's full text |
| `list_drafts` | Lists your drafts |
| `get_draft` | Reads a draft |
| `create_draft` | Creates a draft from Markdown |
| `update_draft` | Edits a draft (refuses published posts) |

Your key is stored in macOS Keychain, not in a file. Your Substack name is stored in `~/.config/substack-mcp/config.json`.

## Remove it

Delete the `substack-mcp` folder and `~/.config/substack-mcp`, then run this to remove your key from Keychain:

```bash
security delete-generic-password -s substack-mcp -a substack.sid
```

To disconnect Claude, remove the `substack` entry under `mcpServers` in `~/.claude.json` and in `~/Library/Application Support/Claude/claude_desktop_config.json`.
