#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { ZodRawShape } from "zod";

import { listSprints } from "./tools/list_sprints.js";
import { getSprint } from "./tools/get_sprint.js";
import { currentSprint } from "./tools/current_sprint.js";
import { listTasks } from "./tools/list_tasks.js";
import { getTask } from "./tools/get_task.js";
import { listTeam } from "./tools/list_team.js";
import { listDeliverables } from "./tools/list_deliverables.js";
import { getBurndown } from "./tools/get_burndown.js";

/**
 * Type-erased view of a ToolDefinition so tools with different input shapes
 * can live in one array. The `never` parameter makes every concrete handler
 * assignable here (function params are contravariant); the registration loop
 * casts back at the call site, where the SDK has already validated `args`
 * against the tool's own inputSchema.
 */
interface RegisteredToolDefinition {
  name: string;
  description: string;
  inputSchema: ZodRawShape;
  handler: (
    args: never
  ) => Promise<{ content: Array<{ type: "text"; text: string }> }>;
}

const tools: RegisteredToolDefinition[] = [
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
      async (args) => {
        try {
          return await tool.handler((args ?? {}) as never);
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
