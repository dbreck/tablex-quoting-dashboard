import { pmGet } from "../api-client.js";
import { jsonResult, type ToolDefinition } from "./types.js";

export const listTeam: ToolDefinition<{}> = {
  name: "list_team",
  description: "List team members.",
  inputSchema: {},
  handler: async () => jsonResult(await pmGet("/team")),
};
