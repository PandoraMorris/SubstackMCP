#!/bin/bash
# Sets up substack-mcp on this Mac: builds it, saves your Substack key to Keychain, connects it to Claude.
# Run again at any time to replace an expired key. Pass --no-connect to skip changing Claude's settings.
set -euo pipefail
cd "$(dirname "$0")"

KEYCHAIN_SERVICE="substack-mcp"
KEYCHAIN_ACCOUNT="substack.sid"
CONFIG_DIR="$HOME/.config/substack-mcp"
SERVER="$PWD/dist/substack-mcp.mjs"

die() { echo; echo "Stopped: $1"; exit 1; }

[ "$(uname)" = "Darwin" ] || die "this installer only works on a Mac, because it keeps your key in Keychain."
command -v node >/dev/null || die "Node.js is missing. Install the LTS version from https://nodejs.org, then run this again."
[ "$(node -p 'process.versions.node.split(".")[0]')" -ge 20 ] || die "Node.js is too old. Install the LTS version from https://nodejs.org."
command -v python3 >/dev/null || die "Python 3 is missing. Run: xcode-select --install"

echo "1 of 4: Building..."
npm install --silent --no-fund --no-audit
npm run --silent build >/dev/null

echo
echo "2 of 4: Your Substack"
echo "Type the first part of your address: for example, type yourname for yourname.substack.com."
echo "If you use your own web address, type that instead."
read -r -p "Substack name: " publication
publication="${publication#@}"
publication="${publication#https://}"
publication="${publication%%/*}"
publication="${publication%.substack.com}"
[ -n "$publication" ] || die "no Substack name was entered."
case "$publication" in *.*) base="https://$publication" ;; *) base="https://$publication.substack.com" ;; esac
curl -fsS -m 15 -o /dev/null "$base/api/v1/archive?limit=1" 2>/dev/null || die "couldn't find a Substack at $base. Check the name."

mkdir -p "$CONFIG_DIR"
python3 - "$publication" "$CONFIG_DIR/config.json" <<'PY'
import json, sys
json.dump({"publication": sys.argv[1]}, open(sys.argv[2], "w"), indent=2)
PY

echo
echo "3 of 4: Your Substack key"
have_key() { security find-generic-password -s "$KEYCHAIN_SERVICE" -a "$KEYCHAIN_ACCOUNT" >/dev/null 2>&1; }

grabbed=""
if have_key; then
  echo "A key is already saved. Press Enter to keep it, or type new to replace it."
  read -r -p "> " choice
  [ "$choice" = "new" ] || grabbed="keep"
fi

if [ -z "$grabbed" ]; then
  echo "I can open a browser so you can sign in to Substack and grab your key automatically."
  read -r -p "Open the browser now? [Y/n] " auto
  case "$auto" in
    [Nn]*)
      echo "Fine. Follow 'Get your Substack key' in README.md, then paste it here."
      echo "Nothing appears as you paste. That's normal, and it keeps the key private."
      read -r -s -p "Key: " key
      echo
      if [ -n "$key" ]; then
        key="${key#connect.sid=}"; key="${key#substack.sid=}"
        case "$key" in *[[:space:]]*) die "that isn't the key, because it has spaces in it. Nothing was saved." ;; esac
        security add-generic-password -U -s "$KEYCHAIN_SERVICE" -a "$KEYCHAIN_ACCOUNT" -w "$key"
        unset key
      fi
      ;;
    *)
      command -v npx >/dev/null && npx --yes playwright install chromium >/dev/null 2>&1 || true
      node scripts/grab-key.mjs >/dev/null || die "didn't capture your key. Run ./install.sh again, or paste it by hand (README.md)."
      ;;
  esac
fi

result=$(printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_drafts","arguments":{"limit":1}}}' \
  | node "$SERVER" | python3 -c 'import json,sys; print("ERROR" if json.loads(sys.stdin.readline())["result"].get("isError") else "OK")')
[ "$result" = "OK" ] || die "Substack refused. Check the name '$publication' is your own Substack, then copy your key again from the Network tab, following README.md, and run this again."
echo "Substack accepted your key."

echo
echo "4 of 4: Connecting to Claude"
if [ "${1:-}" = "--no-connect" ]; then
  echo "Skipped, as requested."
else
  python3 - "$(command -v node)" "$SERVER" <<'PY'
import json, os, shutil, sys, tempfile

entry = {"type": "stdio", "command": sys.argv[1], "args": [sys.argv[2]], "env": {}}
targets = ["~/.claude.json", "~/Library/Application Support/Claude/claude_desktop_config.json"]
connected = 0
for target in targets:
    path = os.path.expanduser(target)
    if not os.path.exists(path):
        continue
    with open(path) as f:
        config = json.load(f)
    shutil.copy2(path, path + ".bak-substack")
    config.setdefault("mcpServers", {})["substack"] = entry
    with tempfile.NamedTemporaryFile("w", dir=os.path.dirname(path), delete=False) as f:
        json.dump(config, f, indent=2)
    os.chmod(f.name, 0o600)
    os.replace(f.name, path)
    connected += 1
if not connected:
    sys.exit("Claude isn't installed yet. Install it, open it once, then run this again.")
PY
  echo "Connected."
fi

echo
echo "All done. Quit Claude with Cmd + Q, reopen it, and ask: List my Substack drafts."
