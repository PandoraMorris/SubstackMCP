# Substack Key Grabber (browser add-on)

Hands your Substack key to the substack-mcp setup on your Mac in one click. No Developer Tools, nothing to copy.

Works in **Google Chrome** and **Microsoft Edge**. The step-by-step install is **Part 4 of the main [README](../README.md)**.

## Why it exists

Claude needs the key that proves to Substack it's you. Substack keeps that key (the `substack.sid` cookie) in your browser's memory, locked away from web pages and not saved in any file on disk. A browser add-on is allowed to read it through the browser's official cookies API, so this one does exactly that, only when you click.

## What happens when you click

1. The add-on reads your Substack sign-in key from this browser.
2. It sends it to `127.0.0.1:8789`, which is your own Mac, where the setup is waiting (`./install.sh`, or `npm run grab:ext`).
3. The setup checks with Substack that the key really is a signed-in session, then saves it to your Mac's Keychain.

## Is it safe?

- It only reads Substack cookies, and it only sends them to your own Mac. Nothing goes to the internet except Substack itself.
- It does nothing until you click its button.
- The setup saves a key **only if** Substack confirms it's a real signed-in session, so nothing else can slip a bad key in. It stops listening as soon as it has your key, or after 5 minutes.
- The code is three short files in this folder: `manifest.json`, `popup.html` and `popup.js`. Anyone technical can read them in a couple of minutes.
