import { z } from "zod";
import { buildQuery, pmGet } from "../api-client.js";
import { jsonResult, type ToolDefinition } from "./types.js";

const shape = {
  sprintId: z.string().optional().describe("Filter by sprint id."),
  assignee: z.string().optional().describe("Filter by assignee (team member id)."),
  deliverableId: z.string().optional().describe("Filter by deliverable id."),
  column: z.string().optional().describe("Filter by board column / status."),
  priority: z.string().optional().describe("Filter by priority."),
};

export const listTasks: ToolDefinition<typeof shape> = {
  name: "list_tasks",
  description: "List tasks with optional filters (sprint, assignee, deliverable, column, priority).",
  inputSchema: shape,
  handler: async (args) => {
    const qs = buildQuery({
      sprintId: args.sprintId,
      assignee: args.assignee,
      deliverableId: args.deliverableId,
      column: args.column,
      priority: args.priority,
    });
    return jsonResult(await pmGet(`/tasks${qs}`));
  },
};
