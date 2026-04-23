import { pmGet } from "../api-client.js";
import { jsonResult, type ToolDefinition } from "./types.js";

export const listSprints: ToolDefinition<{}> = {
  name: "list_sprints",
  description: "List all sprints (id, name, status, dates).",
  inputSchema: {},
  handler: async () => jsonResult(await pmGet("/sprints")),
};
