import { z } from "zod";
import { pmGet } from "../api-client.js";
import { jsonResult, type ToolDefinition } from "./types.js";

const shape = {
  id: z.string().describe("Task id."),
};

export const getTask: ToolDefinition<typeof shape> = {
  name: "get_task",
  description: "Get a single task by id.",
  inputSchema: shape,
  handler: async ({ id }) => jsonResult(await pmGet(`/tasks/${encodeURIComponent(id)}`)),
};
