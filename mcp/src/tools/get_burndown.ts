import { z } from "zod";
import { pmGet } from "../api-client.js";
import { jsonResult, type ToolDefinition } from "./types.js";

const shape = {
  sprintId: z.string().describe("Sprint id."),
};

export const getBurndown: ToolDefinition<typeof shape> = {
  name: "get_burndown",
  description: "Get burndown data points for a sprint (date, remaining hours/points).",
  inputSchema: shape,
  handler: async ({ sprintId }) =>
    jsonResult(await pmGet(`/burndown/${encodeURIComponent(sprintId)}`)),
};
