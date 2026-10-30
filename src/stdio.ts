// Local MCP server for Claude: newline-delimited JSON-RPC over stdin/stdout.
// Runs on your own Mac so Substack sees your own connection. Which publication to use comes from
// ~/.config/substack-mcp/config.json; the session key comes from the macOS Keychain, never a file.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { handle, type JsonRpcRequest } from "./server";
import type { Env } from "./substack";

function keychainCookie(): string | undefined {
  try {
    return execFileSync("security", ["find-generic-password", "-s", "substack-mcp", "-a", "substack.sid", "-w"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined; // read tools still work without it
  }
}

function loadPublication(): string {
  const fromEnv = process.env.SUBSTACK_PUBLICATION;
  if (fromEnv) return fromEnv;
  try {
    const path = join(homedir(), ".config", "substack-mcp", "config.json");
    return JSON.parse(readFileSync(path, "utf8")).publication;
  } catch {
    process.stderr.write("substack-mcp: no publication configured. Run ./install.sh first.\n");
    process.exit(1);
  }
}

const env: Env = {
  SUBSTACK_PUBLICATION: loadPublication(),
  SUBSTACK_USER_ID: process.env.SUBSTACK_USER_ID,
  SUBSTACK_COOKIE: keychainCookie(),
};

const pending = new Set<Promise<void>>();

createInterface({ input: process.stdin }).on("line", (line) => {
  if (!line.trim()) return;
  const task = (async () => {
    let reply: object | null;
    try {
      reply = await handle(JSON.parse(line) as JsonRpcRequest, env);
    } catch {
      reply = { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } };
    }
    if (reply) process.stdout.write(JSON.stringify(reply) + "\n");
  })().finally(() => pending.delete(task));
  pending.add(task);
});
