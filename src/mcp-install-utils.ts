import { homedir } from "os";
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";

// Get the platform-independent path to mcp.json
const getMcpConfigPath = () => {
  return join(homedir(), ".cursor", "mcp.json");
};

// Read and parse mcp.json
const readMcpConfig = () => {
  const configPath = getMcpConfigPath();
  try {
    const configContent = readFileSync(configPath, "utf-8");
    return JSON.parse(configContent);
  } catch (error) {
    throw new Error(
      `Failed to read mcp config: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

// Write to mcp.json
const writeMcpConfig = (config: any) => {
  const configPath = getMcpConfigPath();
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
