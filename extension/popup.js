// Reads the Substack session cookie from THIS browser (where you're signed in) and sends it to the
// substack-mcp listener running on your Mac (started by `npm run grab:ext`). The listener checks the
// key, saves it to your Keychain, and the key never leaves your machine.

const PORT = 8789;
const msg = document.getElementById("msg");
const go = document.getElementById("go");

function show(text) {
  msg.textContent = text;
}

// The cookies API can read httpOnly cookies, including ones the browser only holds in memory.
// We cast a wide net: every substack.com subdomain, plus the "partitioned" drawer that newer
// browsers file some cookies into (which a plain lookup skips).
async function substackCookies() {
  const queries = [
    { domain: "substack.com" },
    { domain: "substack.com", partitionKey: { topLevelSite: "https://substack.com" } },
    { url: "https://substack.com/", partitionKey: { topLevelSite: "https://substack.com" } },
  ];
  const seen = new Map();
  for (const q of queries) {
    let list = [];
    try {
      list = await chrome.cookies.getAll(q);
    } catch {
      /* some browsers reject partitionKey; just skip that query */
    }
    for (const c of list) {
      if (c && c.value) seen.set(c.domain + "|" + c.name + "|" + (c.partitionKey ? "p" : ""), c);
    }
  }
  return [...seen.values()];
}

async function readSessionCookie() {
  const all = await substackCookies();
  for (const name of ["substack.sid", "connect.sid"]) {
    const hit = all.find((c) => c.name === name);
    if (hit) return hit.value;
  }
  return null;
}

go.addEventListener("click", async () => {
  go.disabled = true;
  show("Reading your Substack sign-in...");

  let value;
  try {
    value = await readSessionCookie();
  } catch (e) {
    show("Couldn't read cookies: " + e.message);
    go.disabled = false;
    return;
  }

  if (!value) {
    // Show what we can see, so a naming/domain surprise is obvious rather than a dead end.
    let seen = [];
    try {
      seen = (await substackCookies()).map((c) => c.name);
    } catch {}
    const detail = seen.length ? "\nCookies I can see: " + seen.join(", ") : "";
    show("Couldn't find your Substack sign-in key in this browser." + detail + "\nMake sure you're signed in, then click again.");
    go.disabled = false;
    return;
  }

  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.ok) {
      show("Saved! Your key is in Keychain.\nYou can close this and go back to Terminal.");
    } else {
      show("The setup didn't accept the key:\n" + (body.error || ("status " + res.status)) + "\nMake sure you're signed in to your own Substack.");
      go.disabled = false;
    }
  } catch (e) {
    show("Couldn't reach the setup on your Mac.\nRun  npm run grab:ext  in Terminal first, then click again.");
    go.disabled = false;
  }
});
