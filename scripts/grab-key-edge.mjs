// Grabs YOUR OWN Substack session key from the Microsoft Edge you already use, on YOUR OWN Mac.
//
// It does NOT open a browser. It reads the cookie Edge already saved (so you must be signed in to
// Substack in Edge first), unlocks it with Edge's own key from your Keychain, and stores the result
// in macOS Keychain (service "substack-mcp", account "substack.sid"). Nothing leaves your machine,
// and it only ever reads the account you personally signed into.
//
// Because it doesn't launch Edge, you do NOT need to quit Edge. The first time you run it, macOS may
// pop up a box asking to use the "Microsoft Edge Safe Storage" key — click Allow (or Always Allow).
//
// Run it with:  npm run grab:edge

import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SERVICE = "substack-mcp";
const ACCOUNT = "substack.sid";
const PROFILE_URL = "https://substack.com/api/v1/user/profile/self";
const COOKIES_DB = path.join(
  os.homedir(),
  "Library",
  "Application Support",
  "Microsoft Edge",
  "Default",
  "Cookies",
);

function log(msg) {
  process.stderr.write(msg + "\n");
}

// Pull the encrypted substack.sid (or connect.sid) out of Edge's cookie store, as raw bytes.
// We copy the file first so it can be read even while Edge is running.
function readEncryptedCookie() {
  if (!fs.existsSync(COOKIES_DB)) {
    log("Couldn't find Edge's saved cookies. Open Microsoft Edge and sign in to Substack first.");
    process.exit(1);
  }
  const tmp = path.join(os.tmpdir(), "substack-mcp-edge-cookies");
  // Copy the database AND its pending-writes files, so a sign-in made moments ago is included.
  fs.copyFileSync(COOKIES_DB, tmp);
  for (const ext of ["-wal", "-shm"]) {
    if (fs.existsSync(COOKIES_DB + ext)) fs.copyFileSync(COOKIES_DB + ext, tmp + ext);
  }
  let hex = "";
  try {
    hex = execFileSync(
      "sqlite3",
      [
        tmp,
        "SELECT hex(encrypted_value) FROM cookies " +
          "WHERE host_key LIKE '%substack%' AND name IN ('substack.sid','connect.sid') " +
          "ORDER BY name LIMIT 1;",
      ],
      { encoding: "utf8" },
    ).trim();
  } catch (err) {
    log("Couldn't read Edge's cookie store: " + (err.message || "").split("\n")[0]);
    process.exit(1);
  } finally {
    for (const ext of ["", "-wal", "-shm"]) fs.rmSync(tmp + ext, { force: true });
  }
  if (!hex) {
    log("You're not signed in to Substack in Edge. Open Edge, sign in to Substack, then run this again.");
    process.exit(1);
  }
  return Buffer.from(hex, "hex");
}

// Edge encrypts cookies with a key kept in your login Keychain. Reuse Edge's own recipe to rebuild it.
function edgeStorageKey() {
  let password;
  try {
    password = execFileSync(
      "security",
      ["find-generic-password", "-w", "-s", "Microsoft Edge Safe Storage"],
      { encoding: "utf8" },
    ).trim();
  } catch {
    log("Couldn't get Edge's key from Keychain. If a box asked for permission, click Allow, then run this again.");
    process.exit(1);
  }
  return crypto.pbkdf2Sync(password, "saltysalt", 1003, 16, "sha1");
}

function decryptCookie(encrypted, key) {
  const ciphertext = encrypted.subarray(3); // drop the "v10" version tag
  const iv = Buffer.alloc(16, 0x20); // sixteen spaces
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  const text = plain.toString("utf8");
  // A Substack session value starts with "s%3A". Newer Edge prepends a 32-byte hash; skip to the value.
  const start = text.indexOf("s%3A");
  if (start >= 0) return text.slice(start);
  return plain.length > 32 ? plain.subarray(32).toString("utf8") : text;
}

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

async function main() {
  const encrypted = readEncryptedCookie();
  const key = edgeStorageKey();

  let value;
  try {
    value = decryptCookie(encrypted, key);
  } catch (err) {
    log("Couldn't unlock the Edge cookie: " + (err.message || "").split("\n")[0]);
    log("Sign in to Substack in Edge again, then run this once more.");
    process.exit(1);
  }

  const userId = await sessionUserId(value);
  if (!userId) {
    log("Found a Substack cookie in Edge, but it isn't a signed-in session.");
    log("Open Edge, sign in to Substack, then run this again.");
    process.exit(1);
  }

  execFileSync("security", ["add-generic-password", "-U", "-s", SERVICE, "-a", ACCOUNT, "-w", value]);
  log("Got it. Your key is saved to Keychain.");
  process.stdout.write(JSON.stringify({ ok: true, user_id: userId }) + "\n");
}

main().catch((err) => {
  log("Something went wrong: " + err.message);
  process.exit(1);
});
