import { pmGet } from "../api-client.js";
import { jsonResult, type ToolDefinition } from "./types.js";

export const currentSprint: ToolDefinition<Record<string, never>> = {
  name: "current_sprint",
  description: "Get the active sprint (status = 'active'), or null if none.",
  inputSchema: {},
  handler: async () => jsonResult(await pmGet("/sprints/current")),
};
