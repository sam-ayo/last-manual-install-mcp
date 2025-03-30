import type { Server } from "./types/server";

const getRequiredConfig = (
  server: Server
): { required: boolean; fields: string[] } => {
  const wsConnection = server.connections.find((conn) => conn.type === "ws");
  if (!wsConnection?.configSchema?.required) {
    return { required: false, fields: [] };
  }
  return {
    required: true,
    fields: wsConnection.configSchema.required,
  };
};

const createInstallCommand = (
  qualifiedName: string,
  config?: Record<string, any>
) => {
  const baseCommand = {
    command: "npx",
    args: ["-y", "@smithery/cli@latest", "run", qualifiedName],
  };

  if (config) {
    baseCommand.args.push("--config", JSON.stringify(config));
  }

  return {
    mcpServers: {
      [qualifiedName]: baseCommand,
    },
  };
};

export { createInstallCommand, getRequiredConfig };
