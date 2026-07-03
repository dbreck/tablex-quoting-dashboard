import { pmGet } from "../api-client.js";
import { jsonResult, type ToolDefinition } from "./types.js";

export const listDeliverables: ToolDefinition<Record<string, never>> = {
  name: "list_deliverables",
  description: "List deliverables (id, name, workstream, status rollup).",
  inputSchema: {},
  handler: async () => jsonResult(await pmGet("/deliverables")),
};
