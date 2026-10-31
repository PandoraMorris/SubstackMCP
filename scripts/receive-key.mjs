// Waits for the "Substack Key Grabber" browser extension to hand over your Substack session key,
// checks it's a real signed-in session, and saves it to macOS Keychain (service "substack-mcp",
// account "substack.sid"). Listens only on 127.0.0.1, accepts one key, then exits.
//
// Nothing is saved unless the value is a genuine signed-in Substack session, so a stray request
// from some other program or web page can't put a bad key in your Keychain.
//
// Run it with:  npm run grab:ext   (then click the extension's button in your browser)

import http from "node:http";
import { execFileSync } from "node:child_process";

const SERVICE = "substack-mcp";
const ACCOUNT = "substack.sid";
const PORT = 8789;
const PROFILE_URL = "https://substack.com/api/v1/user/profile/self";
const TIMEOUT_MS = 5 * 60 * 1000; // five minutes, then give up

function log(msg) {
  process.stderr.write(msg + "\n");
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

const server = http.createServer((req, res) => {
  // The extension posts from its own origin, so allow the cross-origin request.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method !== "POST" || !req.url.startsWith("/key")) {
    res.writeHead(404);
    res.end();
    return;
  }

  let data = "";
  req.on("data", (chunk) => {
    data += chunk;
    if (data.length > 1_000_000) req.destroy(); // no reason for a key to be this big
  });
  req.on("end", async () => {
    let value;
    try {
      value = JSON.parse(data).value;
    } catch {
      value = undefined;
    }
    if (typeof value === "string") {
      value = value.replace(/^substack\.sid=/, "").replace(/^connect\.sid=/, "").trim();
    } else {
      value = "";
    }

    const userId = value ? await sessionUserId(value) : undefined;
    if (!userId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "that isn't a signed-in Substack session" }));
      return;
    }

    try {
      execFileSync("security", ["add-generic-password", "-U", "-s", SERVICE, "-a", ACCOUNT, "-w", value]);
    } catch {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "couldn't save to Keychain" }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, user_id: userId }));

    log("Got it. Your key is saved to Keychain.");
    process.stdout.write(JSON.stringify({ ok: true, user_id: userId }) + "\n");
    setTimeout(() => {
      server.close();
      process.exit(0);
    }, 200);
  });
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    log(`Something is already using port ${PORT}. Close the other grabber window, then run this again.`);
  } else {
    log("Couldn't start the listener: " + err.message);
  }
  process.exit(1);
});

server.listen(PORT, "127.0.0.1", () => {
  log("");
  log("Ready. Now click the Substack Key Grabber button in your browser.");
  log("This finishes on its own once the key arrives. Press Control + C to cancel.");
  log("");
});

setTimeout(() => {
  log("Timed out after 5 minutes. Nothing was saved. Run it again when you're ready to click.");
  process.exit(1);
}, TIMEOUT_MS);
