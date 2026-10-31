#!/bin/bash
# Saves a Substack key you copied by hand (see "Get your key by hand" in README.md) to Keychain.
# The key is checked with Substack first, so a bad paste never replaces a working key.
# Run it with:  npm run paste-key
set -euo pipefail

read -r -s -p "Paste your key, then press Enter (nothing will show): " key
echo
key="${key#connect.sid=}"
key="${key#substack.sid=}"
[ -n "$key" ] || { echo "Nothing was pasted. Nothing was saved."; exit 1; }
case "$key" in *[[:space:]]*) echo "That isn't the key, because it has spaces in it. Nothing was saved."; exit 1 ;; esac

# Send the key as a header on stdin, so it never appears in the process list.
code=$(printf 'Cookie: substack.sid=%s; connect.sid=%s\n' "$key" "$key" \
  | curl -s -m 15 -o /dev/null -w '%{http_code}' -H @- https://substack.com/api/v1/user/profile/self || true)
if [ "$code" != "200" ]; then
  unset key
  echo "Substack didn't accept that key. Nothing was saved. Copy it again and make sure it starts with s%3A."
  exit 1
fi

security add-generic-password -U -s substack-mcp -a substack.sid -w "$key"
unset key
echo "Saved. Substack accepted your key."
