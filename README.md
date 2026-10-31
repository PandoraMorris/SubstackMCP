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

Setup takes about 15 minutes. Do the parts in order and don't skip any.

## Before you start: what you need

- **A Mac.** This doesn't work on Windows.
- **The Claude app**, installed and signed in.
- **A Substack account** that you can sign in to, with your email and password.
- **The internet.**

## How to read these steps

- **"Click"** means press the left side of your mouse or trackpad once.
- **"Press Enter"** means press the big key on the right of your keyboard marked **return** or **Enter**.
- **"Cmd"** is the key marked **⌘ command**, on either side of the space bar.
- **"Cmd + Space"** means hold down **Cmd**, press **Space** once, then let go of both.
- When a step says **"Type"**, type exactly what it shows, letter for letter.

---

## Part 1: Install Node.js

Node.js is a free program this needs to run. You only do this once.

1. Open a web browser such as Safari or Chrome.
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

1. Copy the line below. Hover over the grey box and click the copy button on its right, or select the whole line with your mouse and press **Cmd + C**.

   ```bash
   git clone https://github.com/Philm-moxywolf/Substack-MCP.git ~/substack-mcp
   ```

2. Click inside the Terminal window.
3. Press **Cmd + V** to paste it.
4. Press **Enter**.

**If a box pops up asking to install "command line developer tools":** click **Install**, then **Agree**, and wait for it to finish. It can take 5 to 20 minutes. When it's done, click inside Terminal, press **Cmd + V** and **Enter** again.

You'll know it worked when Terminal shows a few lines that say **Cloning into** and then goes quiet.

---

## Part 4: Run the setup

1. Copy this line, then click inside Terminal, press **Cmd + V**, and press **Enter**:

   ```bash
   cd ~/substack-mcp
   ```

   Nothing seems to happen. That's correct.

2. Copy this line, then click inside Terminal, press **Cmd + V**, and press **Enter**:

   ```bash
   ./install.sh
   ```

3. Terminal says **1 of 4: Building...** Wait. This can take a minute or two.

### Step 2 of 4: Your Substack name

4. Terminal says **2 of 4: Your Substack** and waits for you to type.
5. Type the first part of your Substack address, then press **Enter**.
   - If your Substack is `janesmith.substack.com`, type `janesmith`.
   - Not sure? Open your Substack in a browser and look at the address bar.
   - If you use your own web address, like `news.janesmith.com`, type that instead.

### Step 3 of 4: Your Substack key

6. Terminal says **Open the browser now? [Y/n]**.
7. Press **Enter**.
8. Wait. **The first time, this can take a few minutes**, because it downloads a browser. Leave it alone until a new browser window opens.
9. The window may say it is **"being controlled by automated test software"**. That's normal. It's the window this setup opened.
10. **In that new window**, sign in to Substack with your email and password.

    **Important:** If Substack emails you a sign-in link instead, don't click the link in your email. In your email, right-click the link and choose **Copy Link**, then click the address bar at the top of the new window, press **Cmd + V**, and press **Enter**. Signing in anywhere else won't work.

11. When you see your Substack page and you're signed in, go back to Terminal. The window closes on its own.
12. Terminal says **Substack accepted your key.**

You have 5 minutes to sign in. If you take longer, just start Part 4 again.

### Step 4 of 4: Connecting to Claude

13. Terminal says **Connected**, then **All done.**

---

## Part 5: Start using it

1. Click on the Claude app.
2. Press **Cmd + Q** to quit it completely.
3. Open Claude again.
4. Type this and press **Enter**: `List my Substack drafts`

If Claude shows a list of your drafts, everything works. If you have no drafts yet, it may say there aren't any, which is fine too.

You can close Terminal now.

**Don't move or delete the `substack-mcp` folder in your home folder.** Claude needs it to stay where it is.

---

# Keep your key secret

The setup saves a **key** that lets this act as you on Substack. It's like the key to your house.

- It's stored safely in your Mac's **Keychain**, where your Mac keeps passwords.
- **Never send it to anyone, paste it into a chat, or share a screenshot of it.** That includes the person who sent you this guide.
- If you think someone has seen it, sign out of Substack on every device. That makes the old key stop working. Then do Part 4 again.

---

# If something goes wrong

**Terminal says "Node.js is missing"**
Do Part 1 again. Then close Terminal, open it again (Part 2), and continue from Part 4.

**Terminal says "command not found" or "No such file or directory"**
Something got skipped or mistyped. Copy and paste each line again rather than typing it.

**Terminal says "couldn't find a Substack"**
Your Substack name was typed wrong. Run Part 4 again and check the name.

**The browser window never opened, or it said "didn't capture your key"**
Run Part 4 again. If it still fails, use **Get your key by hand** below.

**Terminal says "Substack refused"**
You may have signed in to a different Substack account than the name you typed. Run Part 4 again and check both.

**Claude can't see your drafts**
Quit Claude with **Cmd + Q** and open it again. Your Mac needs to be switched on, because this runs on your computer.

**It worked before, but stopped working**
You've probably been signed out of Substack, so your key has run out. Do Part 2, then Part 4 again. When it asks about your saved key, type `new` and press **Enter**, then carry on as before.

**"Too many requests"**
Substack wants you to slow down. Wait an hour and try again.

---

# Get your key by hand

Only use this if the browser step in Part 4 doesn't work. It works in Chrome and Microsoft Edge.

1. In Chrome or Edge, sign in to Substack.
2. Click the address bar, type `yourname.substack.com/publish/posts` (using your Substack name) and press **Enter**.
3. In the menu bar at the very top of your screen, click **View**, then **Developer**, then **Developer Tools**. A panel opens.
4. In the row of words at the top of that panel, click **Network**. If you can't see it, click **>>** or **+** at the end of the row, then **Network**.
5. Just below, click **Fetch/XHR**.
6. Press **Cmd + R**. A list of rows appears.
7. Click any row that shows **200** in the **Status** column.
8. On the right, click **Headers**, then scroll down to **Request Headers**.
9. Find the long line called **Cookie**. Look in it for `connect.sid=`. If it isn't there, look for `substack.sid=`.
10. Select only the part **after** the `=`, up to but not including the next `;`. It starts with `s%3A`.
11. Right-click what you selected and choose **Copy**.
12. Do Part 2 and the first two steps of Part 4. When Terminal asks **Open the browser now? [Y/n]**, type `n` and press **Enter**.
13. When it says **Key:**, press **Cmd + V**, then **Enter**. Nothing shows as you paste. That's normal.

Don't copy the whole Cookie line, only that one piece.

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

- Your key is stored in macOS Keychain (service `substack-mcp`), never in a file.
- Your Substack name is stored in `~/.config/substack-mcp/config.json`.
- The installer adds a `substack` entry to `~/.claude.json` and to Claude's desktop config, keeping a backup ending in `.bak-substack`.
- `npm run grab` re-runs only the browser key step.

## Remove it

1. Delete the `substack-mcp` folder in your home folder, and the folder `~/.config/substack-mcp`.
2. Paste this into Terminal and press **Enter**, to remove your key from Keychain:

   ```bash
   security delete-generic-password -s substack-mcp -a substack.sid
   ```

3. To disconnect Claude, remove the `substack` entry under `mcpServers` in `~/.claude.json` and in `~/Library/Application Support/Claude/claude_desktop_config.json`.
