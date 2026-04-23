# tablex-pm-mcp

Read-only MCP server that wraps the TableX dashboard PM REST API (`/api/pm/*`) as MCP tools. Use it from Claude Desktop or Claude Code to query sprints, tasks, team, deliverables, and burndown data.

## Tools

All tools are read-only.

| Tool                | Args                                                                 | Description                                              |
| ------------------- | -------------------------------------------------------------------- | -------------------------------------------------------- |
| `list_sprints`      | —                                                                    | All sprints (id, name, status, dates).                   |
| `get_sprint`        | `id`                                                                 | One sprint by id, plus derived stats.                    |
| `current_sprint`    | —                                                                    | The active sprint (or null).                             |
| `list_tasks`        | `sprintId?`, `assignee?`, `deliverableId?`, `column?`, `priority?`   | Tasks with optional filters.                             |
| `get_task`          | `id`                                                                 | One task by id.                                          |
| `list_team`         | —                                                                    | Team members.                                            |
| `list_deliverables` | —                                                                    | Deliverables with status rollup.                         |
| `get_burndown`      | `sprintId`                                                           | Burndown data points for a sprint.                       |

## Install

```sh
cd mcp
npm install
npm run build
```

This produces `dist/index.js`, the executable stdio server.

## Configure (Claude Desktop)

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "tablex-pm": {
      "command": "node",
      "args": [
        "/Users/dannybreckenridge/Applications/tablex-quoting-dashboard/mcp/dist/index.js"
      ],
      "env": {
        "TABLEX_API_BASE_URL": "http://localhost:3000",
        "TABLEX_API_TOKEN": "<paste from .env.local>"
      }
    }
  }
}
```

Restart Claude Desktop. The `tablex-pm` server should appear in the MCP server list with the eight tools above.

## Configure (Claude Code)

```sh
claude mcp add tablex-pm \
  -e TABLEX_API_BASE_URL=http://localhost:3000 \
  -e TABLEX_API_TOKEN=<paste from .env.local> \
  -- node /Users/dannybreckenridge/Applications/tablex-quoting-dashboard/mcp/dist/index.js
```

## Environment

| Variable               | Default                  | Notes                                  |
| ---------------------- | ------------------------ | -------------------------------------- |
| `TABLEX_API_BASE_URL`  | `http://localhost:3000`  | Dashboard origin (no trailing slash).  |
| `TABLEX_API_TOKEN`     | `""`                     | Bearer token sent on every request.    |

The Next.js dev server (`npm run dev` in the repo root) must be running for the MCP server to reach `/api/pm/*`.

## Develop

```sh
npm run dev    # tsc --watch
npm run start  # node dist/index.js (for ad-hoc stdio testing)
```

Layout:

```
mcp/
├── src/
│   ├── index.ts        # stdio entry, registers tools
│   ├── api-client.ts   # fetch wrapper for /api/pm/*
│   └── tools/          # one tool per file
└── dist/               # built output (gitignored)
```
