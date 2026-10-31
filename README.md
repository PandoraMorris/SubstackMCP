# Substack for Claude

This lets Claude write drafts in your Substack for you.

You talk to Claude. Claude writes the draft. The draft appears in your Substack. You read it, and if you like it, you press Publish.

**Claude can never publish anything or email your readers. Only you can do that.**

Once it's set up, you can ask Claude things like:

- "Turn these notes into a Substack draft."
- "Rewrite the start of my latest draft."
- "What have I written about pricing?"

---

# Setup guide

Setup takes about 20 minutes. Do the parts in order and don't skip any.

## Before you start: what you need

- **A Mac.** This doesn't work on Windows.
- **The Claude desktop app**, installed and signed in. Get it from `claude.ai/download`. (The website and phone app can't use this. See Part 7.)
- **Google Chrome or Microsoft Edge.** Safari won't work for one step. Both are free.
- **A Substack account** you can sign in to. The email sign-in link is fine. You don't need a password.
- **The internet.**

## How to read these steps

- **"Click"** means press the left side of your mouse or trackpad once.
- **"Press Enter"** means press the big key on the right of your keyboard marked **return** or **Enter**.
- **"Cmd"** is the key marked **⌘ command**, on either side of the space bar.
- **"Cmd + Space"** means hold down **Cmd**, press **Space** once, then let go of both.
- When a step says **"Type"**, type exactly what it shows, letter for letter.
- To paste a line into Terminal, **copy it from this page, click inside Terminal, press Cmd + V, then press Enter.** Paste one grey box at a time.

---

## Part 1: Install Node.js

Node.js is a free program this needs to run. You only do this once.

1. Open your web browser.
2. Click in the address bar at the top, type `nodejs.org`, and press **Enter**.
3. Click the big green button that says **LTS**. A file downloads.
4. Open your **Downloads** folder. One way is to click the **Finder** icon (the blue smiling face) at the bottom of your screen, then click **Downloads** on the left.
5. Double-click the file that starts with **node** and ends in **.pkg**.
6. A window opens. Click **Continue** on each screen, then **Agree**, then **Install**.
7. If your Mac asks for your password, type the password you use to unlock your Mac and press **Enter**. Nothing appears as you type it. That's normal.
8. When it says **The installation was successful**, click **Close**.

---

## Part 2: Open Terminal

Terminal is a window where you type instructions to your Mac. It looks plain, but it's safe to use if you follow these steps exactly.

1. Press **Cmd + Space**. A search bar appears in the middle of your screen.
2. Type `Terminal`.
3. Press **Enter**.

A white or black window opens with some text and a blinking line. That's Terminal. **Keep it open for the rest of the setup.**

---

## Part 3: Download this project

1. Paste this into Terminal and press **Enter**:

   ```bash
   git clone https://github.com/Philm-moxywolf/Substack-MCP.git ~/substack-mcp
   ```

**If a box pops up asking to install "command line developer tools":** click **Install**, then **Agree**, and wait for it to finish. It can take 5 to 20 minutes. When it's done, click inside Terminal, press **Cmd + V** and **Enter** again.

You'll know it worked when Terminal shows a few lines that say **Cloning into** and then goes quiet. You now have a folder called **substack-mcp** in your home folder.

---

## Part 4: Add the Substack Key Grabber to your browser

Claude needs a **key** that proves to Substack it's you. Your browser already has it, because you sign in to Substack there. This small add-on hands it over in one click. You only add it once.

Do this in **Chrome or Edge**:

1. Click the address bar, type the line for your browser, and press **Enter**:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
2. Turn on **Developer mode**. It's a switch at the top right in Chrome, or on the left side in Edge.
3. Click **Load unpacked**. A window opens to pick a folder.
4. Press **Cmd + Shift + H** to jump to your home folder. Double-click **substack-mcp**, click once on **extension**, then click **Select**.
5. **Substack Key Grabber** now shows in the list.
6. Pin it so it's easy to find. Click the **puzzle piece** icon at the top right of the browser, then click the **pin** next to Substack Key Grabber. A small **S** icon appears in the toolbar.
7. In the same browser, go to `substack.com` and **sign in** if you aren't already. Use the email link if that's how you normally sign in.

Leave the browser open and go back to Terminal.

---

## Part 5: Run the setup

1. Paste this into Terminal and press **Enter**. Nothing seems to happen. That's correct.

   ```bash
   cd ~/substack-mcp
   ```

2. Paste this into Terminal and press **Enter**:

   ```bash
   ./install.sh
   ```

3. Terminal says **1 of 4: Building...** Wait. This can take a minute or two.
4. Terminal says **2 of 4: Your Substack** and waits. Type the first part of your Substack address, then press **Enter**.
   - If your Substack is `janesmith.substack.com`, type `janesmith`.
   - Not sure? Open your Substack in the browser and look at the address bar.
   - If you use your own web address, like `news.janesmith.com`, type that instead.
5. Terminal says **3 of 4: Your Substack key** and asks **Use the browser add-on? [Y/n]**. Press **Enter**.
6. Terminal says **Ready. Now click the Substack Key Grabber button in your browser.**
7. Go to your browser. Click the **S** icon in the toolbar, then click **Grab my Substack key**.
8. The add-on says **Saved!** Back in Terminal, it says **Substack accepted your key.** You have 5 minutes to click. If you miss it, just do step 2 again.
9. Terminal says **4 of 4: Connecting to Claude**, then **Connected**, then **All done.**

---

## Part 6: Start using it

1. Click on the Claude app.
2. Press **Cmd + Q** to quit it completely. (Closing the window isn't enough.)
3. Open Claude again.
4. Start a new chat, type this and press **Enter**: `List my Substack drafts`
5. The first time, Claude asks permission to use a Substack tool. Click **Allow** (or **Always allow**, so it stops asking).

If Claude shows your drafts, everything works. If you have no drafts yet, it may say there aren't any, which is fine too.

You can close Terminal now. **Don't move or delete the `substack-mcp` folder in your home folder.** Claude needs it to stay where it is.

---

## Part 7: Use it in a Claude Project

A **Project** is a space in Claude with its own instructions and files. Set one up for your newsletter and Claude will remember your voice and your rules in every chat inside it.

**Where it works:** in the **Claude desktop app on the Mac where you ran the setup**, in normal chats and in Projects. It does **not** work on the claude.ai website, the phone app, or another computer, because it runs on your Mac. Your Mac needs to be on and the Claude app open.

### Set up the Project (once)

1. In the Claude desktop app, click **Projects** in the left sidebar.
2. Click **New project**. Name it something like **My Substack** and create it.
3. Find the project's **instructions** box and paste the text below into it. Change the first line to your newsletter's name.

   ```text
   You help me write my Substack newsletter, [YOUR NEWSLETTER NAME].

   Tools: you have Substack tools. Use them, don't guess.
   - To learn my voice, use search_posts and get_post to read 2–3 of my published posts on a related topic before you draft.
   - Save every piece as a Substack draft with create_draft, then give me the editUrl.
   - To change an existing draft, use get_draft first, then update_draft with the complete new body (update_draft replaces the whole body).
   - Write the body in Markdown: short paragraphs, ## headings, bullet lists and links. Don't repeat the title in the body.
   - Audience is "everyone" unless I say otherwise ("only_paid", "only_free" or "founding").

   Rules:
   - You can't publish or email anyone. Never say a post is published or sent. I review the draft in Substack and press Publish myself.
   - Never put anything from my Substack key or settings into a chat.
   ```

4. Optional: add files that help, such as a style guide, your About page, or a few of your favourite posts.

### Use it

Open the Project and start a chat inside it. For example:

- "Here are my notes from today's call. Turn them into a draft post called 'What I learned about pricing'."
- "Read my last three posts and tell me which topics I keep coming back to."
- "Open my latest draft and tighten the first two paragraphs."

Claude saves the draft and gives you a link. Open it in Substack, read it, edit anything you like, and press Publish when you're happy.

**Can't see the Substack tools in a chat?** In the message box, open the tools menu (the button next to where you type) and check **substack** is switched on. If it isn't listed at all, quit Claude with **Cmd + Q** and open it again.

---

# Keep your key secret

The setup saves a **key** that lets this act as you on Substack. It's like the key to your house.

- It's stored safely in your Mac's **Keychain**, where your Mac keeps passwords. The add-on only ever sends it to your own Mac.
- **Never send it to anyone, paste it into a chat, or share a screenshot of it.** That includes the person who sent you this guide.
- If you think someone has seen it, sign out of Substack on every device. That makes the old key stop working. Then sign in again and refresh your key (below).

---

# Refresh your key

Substack signs you out every so often, and then Claude says it can't reach your drafts. Getting a fresh key takes about 30 seconds:

1. In Chrome or Edge, sign in to Substack again.
2. Open Terminal (Part 2), paste this and press **Enter**:

   ```bash
   cd ~/substack-mcp && npm run grab:ext
   ```

3. When it says **Ready**, click the **S** icon, then **Grab my Substack key**.
4. Terminal says **Got it.** Quit Claude with **Cmd + Q** and open it again.

---

# If something goes wrong

**Terminal says "Node.js is missing"**
Do Part 1 again. Then close Terminal, open it again (Part 2), and continue from Part 5.

**Terminal says "command not found" or "No such file or directory"**
Something got skipped or mistyped. Copy and paste each line again rather than typing it. If you see `quote>`, press **Control + C** and paste the line again.

**Terminal says "couldn't find a Substack"**
Your Substack name was typed wrong. Do Part 5 again and check the name.

**The add-on says "Couldn't find your Substack sign-in key"**
You're not signed in to Substack in that browser. Sign in at `substack.com`, reload the page, then click the add-on again.

**The add-on says "Couldn't reach the setup on your Mac"**
Terminal isn't waiting for it. Do Part 5 again (or "Refresh your key"), wait for **Ready**, then click.

**Terminal says "Something is already using port 8789"**
An earlier setup window is still waiting. Close the other Terminal window, or press **Control + C** in it, then try again.

**Terminal says "Substack refused"**
You may be signed in to a different Substack account than the name you typed. Check both, then do Part 5 again.

**Claude can't see your drafts**
Quit Claude with **Cmd + Q** and open it again. Your Mac needs to be on, because this runs on your computer. If it worked before, your key has probably run out: see "Refresh your key".

**Terminal says "The Claude app isn't installed yet"**
Install the Claude desktop app from `claude.ai/download`, open it once and sign in, then do Part 5 again. When it asks about your saved key, press **Enter** to keep it.

**"Too many requests"**
Substack wants you to slow down. Wait an hour and try again.

---

# Get your key by hand

Only use this if the add-on doesn't work for you. It works in Chrome and Edge.

1. In Chrome or Edge, sign in to Substack.
2. Click the address bar, type `yourname.substack.com/publish/posts` (using your Substack name) and press **Enter**.
3. In the menu bar at the very top of your screen, click **View**, then **Developer**, then **Developer Tools**. A panel opens.
4. In the row of words at the top of that panel, click **Network**. If you can't see it, click **>>** at the end of the row, then **Network**.
5. Just below, click **Fetch/XHR**.
6. Press **Cmd + R**. A list of rows appears.
7. Click any row that shows **200** in the **Status** column.
8. On the right, click **Headers**, then scroll down to **Request Headers**.
9. Find the long line called **Cookie**. Look in it for `substack.sid=`. If it isn't there, look for `connect.sid=`.
10. Select only the part **after** the `=`, up to but not including the next `;`. It starts with `s%3A`. Right-click it and choose **Copy**.
11. In Terminal, paste this and press **Enter**:

    ```bash
    cd ~/substack-mcp && npm run paste-key
    ```

12. When it asks, press **Cmd + V**, then **Enter**. Nothing shows as you paste. That's normal. It checks the key with Substack before saving it, and says **Saved.**
13. If you haven't run the setup yet, do Part 5 now. When it asks about your saved key, press **Enter** to keep it.

---

# For the technically curious

**This is unofficial.** Substack has no public way to write drafts, so this uses the same private route Substack's own website uses, signed in as you. It could stop working if Substack changes its website. You use it at your own risk, on your own account.

| Tool | What it does |
|---|---|
| `list_posts` | Lists published posts |
| `search_posts` | Searches published posts |
| `get_post` | Reads a post's full text |
| `list_drafts` | Lists your drafts |
| `get_draft` | Reads a draft |
| `create_draft` | Creates a draft from Markdown |
| `update_draft` | Edits a draft (refuses published posts) |

- It's a local MCP server that Claude starts over stdio. Your key never leaves your Mac except in requests to Substack.
- Your key is stored in macOS Keychain (service `substack-mcp`, account `substack.sid`), never in a file.
- Your Substack name is stored in `~/.config/substack-mcp/config.json`.
- The installer adds a `substack` entry under `mcpServers` in Claude's desktop config and in `~/.claude.json` (Claude Code), keeping a backup ending in `.bak-substack`. Pass `--no-connect` to skip this.
- Why an add-on: Substack's session cookie is httpOnly and held in the browser's memory (partitioned), so it isn't in the cookie files on disk. The add-on reads it through the browser's cookies API and posts it to a listener on `127.0.0.1:8789` (`npm run grab:ext`), which only saves it if Substack confirms it's a signed-in session.
- `npm run grab` opens a fresh sign-in window instead. It only works for accounts with a Substack password, because Substack won't send a sign-in link to an automated browser.

## Remove it

1. Delete the `substack-mcp` folder in your home folder, and the folder `~/.config/substack-mcp`.
2. Paste this into Terminal and press **Enter**, to remove your key from Keychain:

   ```bash
   security delete-generic-password -s substack-mcp -a substack.sid
   ```

3. In Chrome or Edge, go to `chrome://extensions` or `edge://extensions` and click **Remove** on Substack Key Grabber.
4. To disconnect Claude, remove the `substack` entry under `mcpServers` in `~/Library/Application Support/Claude/claude_desktop_config.json` and in `~/.claude.json`.
