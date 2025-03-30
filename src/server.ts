import { z } from "zod";
import {
  configureServer,
  installServer,
  isServerInstalled,
  removeServer,
} from "./tools";
import { listServers } from "./registries/smithery/actions";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "Install Mcps",
  version: "1.0.0",
});

server.tool(
  "is_server_installed",
  { serverName: z.string() },
  ({ serverName }) => {
    const isInstalled = isServerInstalled(serverName);
    return {
      content: [
        {
          type: "text",
          text: isInstalled
            ? `Server ${serverName} is installed`
            : `Server ${serverName} is not installed`,
        },
      ],
    };
  }
);

server.tool("list_servers", { query: z.string() }, async ({ query }) => {
  const servers = await listServers(query);
  return {
    content: [
      {
        type: "text",
        text: servers.map((server) => server.qualifiedName).join("\n"),
      },
    ],
  };
});

server.tool(
  "configure_server",
  {
    qualifiedName: z.string(),
    field: z.string(),
    value: z.string(),
  },
  async ({ qualifiedName, field, value }) => {
    const result = await configureServer(qualifiedName, field, value);
    return result;
  }
);

server.tool(
  "install_server",
  {
    qualifiedName: z.string(),
  },
  async ({ qualifiedName }) => {
    const result = await installServer(qualifiedName);
    return result;
  }
);

server.tool(
  "uninstall_server",
  { qualifiedName: z.string() },
  async ({ qualifiedName }) => {
    const result = await removeServer(qualifiedName);
    return result;
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
