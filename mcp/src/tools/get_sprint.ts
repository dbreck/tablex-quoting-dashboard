import { z } from "zod";
import { pmGet } from "../api-client.js";
import { jsonResult, type ToolDefinition } from "./types.js";

const shape = {
  id: z.string().describe("Sprint id."),
};

export const getSprint: ToolDefinition<typeof shape> = {
  name: "get_sprint",
  description: "Get a single sprint by id, including derived stats.",
  inputSchema: shape,
  handler: async ({ id }) => jsonResult(await pmGet(`/sprints/${encodeURIComponent(id)}`)),
};
