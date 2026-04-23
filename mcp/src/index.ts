#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { listSprints } from "./tools/list_sprints.js";
import { getSprint } from "./tools/get_sprint.js";
import { currentSprint } from "./tools/current_sprint.js";
import { listTasks } from "./tools/list_tasks.js";
import { getTask } from "./tools/get_task.js";
import { listTeam } from "./tools/list_team.js";
import { listDeliverables } from "./tools/list_deliverables.js";
import { getBurndown } from "./tools/get_burndown.js";
import type { ToolDefinition } from "./tools/types.js";

const tools: Array<ToolDefinition<any>> = [
  listSprints,
  getSprint,
  currentSprint,
  listTasks,
  getTask,
  listTeam,
  listDeliverables,
  getBurndown,
];

async function main() {
  const server = new McpServer({
    name: "tablex-pm-mcp",
    version: "0.1.0",
  });

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      async (args: any) => {
        try {
          return await tool.handler(args ?? {});
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return {
            isError: true,
            content: [{ type: "text" as const, text: `Error: ${message}` }],
          };
        }
      }
    );
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("tablex-pm-mcp failed to start:", err);
  process.exit(1);
});
