// Grabs YOUR OWN Substack session key, on YOUR OWN Mac, and saves it to your Keychain.
//
// It opens a real browser window. You sign in to Substack yourself, in that window. The script
// then reads the session cookie from the browser you just used and stores it in macOS Keychain
// (service "substack-mcp", account "substack.sid"). The key never leaves your machine, and the
// script only ever sees the account you personally signed into.
//
// Run it with:  npm run grab   (the installer runs it for you)

import { execFileSync } from "node:child_process";

const SERVICE = "substack-mcp";
const ACCOUNT = "substack.sid";
const PROFILE_URL = "https://substack.com/api/v1/user/profile/self";
const TIMEOUT_MS = 5 * 60 * 1000; // five minutes to sign in

function log(msg) {
  process.stderr.write(msg + "\n");
}

async function launchBrowser() {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    log("Playwright isn't installed. Run:  npm install  then try again.");
    process.exit(1);
  }
  // Use a browser the user already has (Chrome, then Edge); fall back to Playwright's own.
  for (const opts of [{ channel: "chrome" }, { channel: "msedge" }, {}]) {
    try {
      return await chromium.launch({ headless: false, ...opts });
    } catch {
      /* try the next option */
    }
  }
  log('No browser found. Run once:  npx playwright install chromium   then try again.');
  process.exit(1);
}

// Confirm a cookie value really is a signed-in session before we save it.
async function sessionUserId(value) {
  try {
    const res = await fetch(PROFILE_URL, {
      headers: { Cookie: `substack.sid=${value}; connect.sid=${value}`, Accept: "application/json" },
    });
    if (!res.ok) return undefined;
    const body = await res.json();
    return body?.id;
  } catch {
    return undefined;
  }
}

function findSessionCookie(cookies) {
  const hit = cookies.find((c) => c.name === "substack.sid" || c.name === "connect.sid");
  return hit?.value;
}

async function main() {
  const browser = await launchBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("https://substack.com/sign-in").catch(() => {});

  log("");
  log("A browser window has opened. Sign in to Substack there, the way you normally do.");
  log("Once you reach your dashboard, come back here — this finishes on its own.");
  log("");

  const deadline = Date.now() + TIMEOUT_MS;
  let saved = false;

  while (Date.now() < deadline) {
    // Stop early if the person closed the window.
    if (!browser.isConnected() || context.pages().length === 0) break;

    const value = findSessionCookie(await context.cookies("https://substack.com").catch(() => []));
    if (value) {
      const userId = await sessionUserId(value);
      if (userId) {
        execFileSync("security", ["add-generic-password", "-U", "-s", SERVICE, "-a", ACCOUNT, "-w", value]);
        log("Got it. Your key is saved to Keychain.");
        // Hand the detected user id back to the installer, on stdout, for config.
        process.stdout.write(JSON.stringify({ ok: true, user_id: userId }) + "\n");
        saved = true;
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  await browser.close().catch(() => {});

  if (!saved) {
    log("");
    log("Didn't capture a signed-in session. Nothing was saved. You can run this again,");
    log("or paste your key by hand following README.md.");
    process.exit(1);
  }
}

main().catch((err) => {
  log("Something went wrong: " + err.message);
  process.exit(1);
});
