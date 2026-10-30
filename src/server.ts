// MCP protocol handling: turns one JSON-RPC message into one reply.

import { tools } from "./tools";
import type { Env } from "./substack";

const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];
const SERVER_INFO = { name: "substack-mcp", version: "0.2.0" };

export type JsonRpcRequest = { jsonrpc: "2.0"; id?: string | number | null; method: string; params?: any };

export async function handle(msg: JsonRpcRequest, env: Env): Promise<object | null> {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    // Responses from the client (no method) need no reply.
    return msg && "id" in msg && !("method" in msg) ? null : rpcError(null, -32600, "Invalid Request");
  }
  const isNotification = msg.id === undefined;
  if (isNotification) return null;

  try {
    switch (msg.method) {
      case "initialize": {
        const requested = msg.params?.protocolVersion;
        return rpcResult(msg.id, {
          protocolVersion: PROTOCOL_VERSIONS.includes(requested) ? requested : PROTOCOL_VERSIONS[0],
          capabilities: { tools: { listChanged: false } },
          serverInfo: SERVER_INFO,
          instructions:
            `Tools for the Substack publication ${env.SUBSTACK_PUBLICATION}. ` +
            "Read tools use public endpoints. Draft tools create and edit drafts only; publishing is done by a human in Substack.",
        });
      }
      case "ping":
        return rpcResult(msg.id, {});
      case "tools/list":
        return rpcResult(msg.id, {
          tools: tools.map(({ name, description, inputSchema, annotations }) => ({
            name,
            description,
            inputSchema,
            annotations,
          })),
        });
      case "tools/call": {
        const tool = tools.find((t) => t.name === msg.params?.name);
        if (!tool) return rpcError(msg.id, -32602, `Unknown tool: ${msg.params?.name}`);
        try {
          const result = await tool.run(msg.params?.arguments ?? {}, env);
          return rpcResult(msg.id, {
            content: [{ type: "text", text: typeof result === "string" ? result : JSON.stringify(result, null, 2) }],
          });
        } catch (err) {
          // Tool failures go back to the model as results, not protocol errors.
          return rpcResult(msg.id, {
            content: [{ type: "text", text: `Error: ${(err as Error).message}` }],
            isError: true,
          });
        }
      }
      default:
        return rpcError(msg.id, -32601, `Method not found: ${msg.method}`);
    }
  } catch (err) {
    return rpcError(msg.id, -32603, (err as Error).message);
  }
}

function rpcResult(id: JsonRpcRequest["id"], result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function rpcError(id: JsonRpcRequest["id"], code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}
