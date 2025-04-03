import { readFileSync, writeFileSync } from "fs";
import clientPaths from "./client-paths";

const readMcpConfig = () => {
  const configPath = clientPaths.cursor;
  try {
    const configContent = readFileSync(configPath, "utf-8");
    return JSON.parse(configContent);
  } catch (error) {
    throw new Error(
      `Failed to read mcp config: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

const writeMcpConfig = (config: any) => {
  const configPath = clientPaths.cursor;
  const existingConfig = readMcpConfig();

  const mcpServers = existingConfig.mcpServers;
  try {
    writeFileSync(
      configPath,
      JSON.stringify({ mcpServers: { ...mcpServers, ...config } }, null, 2)
    );
  } catch (error) {
    throw new Error(
      `Failed to write mcp config: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

export { readMcpConfig, writeMcpConfig };
