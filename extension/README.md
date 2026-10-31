# Substack Key Grabber (browser extension)

One-click way to save your Substack key, with no DevTools and nothing to copy.

Your Substack sign-in is held in your browser's memory, so files on disk can't read it. A browser
extension can — through the official cookies API — so this reads it and hands it to the setup running
on your Mac, which saves it to Keychain. The key never leaves your machine.

Works in **Microsoft Edge** and **Google Chrome**.

## Install it (once)

1. Open your browser and go to the extensions page:
   - Edge: type `edge://extensions` in the address bar and press Enter.
   - Chrome: type `chrome://extensions` and press Enter.
2. Turn on **Developer mode** (a switch, top-right in Chrome, left side in Edge).
3. Click **Load unpacked**.
4. Choose this `extension` folder (inside the `substack-mcp` folder).
5. The "Substack Key Grabber" appears in your list. Pin it if you like (puzzle-piece icon in the toolbar).

## Use it (each time your key expires)

1. Make sure you're signed in to Substack in this browser.
2. In Terminal, in the `substack-mcp` folder, run:

   ```bash
   npm run grab:ext
   ```

   It prints **Ready. Now click the Substack Key Grabber button in your browser.**
3. Click the extension's icon, then **Grab my Substack key**.
4. The popup says **Saved!** and Terminal says **Got it. Your key is saved to Keychain.**

That's it. You only sign in to Substack the normal way, in your normal browser — the extension does the rest.

## Is this safe?

- The extension only reads Substack cookies, and only sends them to `127.0.0.1` (your own Mac).
- The listener saves a key **only if** it's a real, signed-in Substack session, so nothing else can slip a bad key in.
- Nothing is sent to the internet, and the listener closes as soon as it has your key.
