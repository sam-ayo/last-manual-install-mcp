import { readMcpConfig, writeMcpConfig } from "./mcp-install-utils";
import { getServer } from "./registries/smithery/actions";
import {} from "@modelcontextprotocol/sdk/types.js";
import {
  createInstallCommand,
  getRequiredConfig,
} from "./registries/smithery/install";

interface Content {
  type: "text";
  text: string;
  [key: string]: unknown;
}

const pendingConfigs: Record<
  string,
  {
    fields: string[];
    config: Record<string, string>;
  }
> = {};

const isServerInstalled = (qualifiedName: string): boolean => {
  try {
    const config = readMcpConfig();
    return config.mcpServers && qualifiedName in config.mcpServers;
  } catch (error) {
    return false;
  }
};

const configureServer = async (
  qualifiedName: string,
  field: string,
  value: string
): Promise<{ content: Content[] }> => {
  if (!pendingConfigs[qualifiedName]) {
    // If no pending config, check if server needs configuration
    const server = await getServer(qualifiedName);
    const { required, fields } = getRequiredConfig(server);

    if (!required) {
      return {
        content: [
          {
            type: "text" as "text",
            text: `Server ${qualifiedName} does not require configuration.`,
          },
        ],
      };
    }

    // Initialize pending config
    pendingConfigs[qualifiedName] = {
      fields,
      config: {},
    };
  }

  const pending = pendingConfigs[qualifiedName];

  if (!pending.fields.includes(field)) {
    return {
      content: [
        {
          type: "text",
          text: `Invalid configuration field: ${field}. Required fields are: ${pending.fields.join(", ")}`,
        },
      ],
    };
  }

  // Store the configuration value
  pending.config[field] = value;

  // Check if all required fields are configured
  const remainingFields = pending.fields.filter((f) => !pending.config[f]);

  if (remainingFields.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: `Configuration complete for ${qualifiedName}. You can now run the install command.`,
        },
      ],
    };
  } else {
    return {
      content: [
        {
          type: "text",
          text: `Configuration value set. Remaining required fields: ${remainingFields.join(", ")}`,
        },
      ],
    };
  }
};

const installServer = async (
  qualifiedName: string
): Promise<{ content: Content[] }> => {
  try {
    // Check if server is already installed
    if (isServerInstalled(qualifiedName)) {
      return {
        content: [
          {
            type: "text",
            text: `Server ${qualifiedName} is already installed.`,
          },
        ],
      };
    }

    // Get server details
    const server = await getServer(qualifiedName);
    const { required, fields } = getRequiredConfig(server);

    if (required) {
      // Check for pending configuration
      const pendingConfig = pendingConfigs[qualifiedName];
      if (!pendingConfig) {
        return {
          content: [
            {
              type: "text",
              text: `Server ${qualifiedName} requires configuration for: ${fields.join(", ")}. Please use the configureServer command to set these values.`,
            },
          ],
        };
      }

      // Verify all required fields are configured
      const missingFields = fields.filter((f) => !pendingConfig.config[f]);
      if (missingFields.length > 0) {
        return {
          content: [
            {
              type: "text",
              text: `Missing required configuration fields: ${missingFields.join(", ")}. Please configure these using the configureServer command.`,
            },
          ],
        };
      }

      // Create install command with config
      const installCommand = createInstallCommand(
        qualifiedName,
        pendingConfig.config
      );

      // Merge with existing config
      const updatedConfig = {
        [qualifiedName]: installCommand.mcpServers[qualifiedName],
      };

      // Write updated config
      writeMcpConfig(updatedConfig);

      // Clear pending config
      delete pendingConfigs[qualifiedName];

      return {
        content: [
          {
            type: "text",
            text: `Successfully installed ${qualifiedName} with configuration`,
          },
        ],
      };
    } else {
      // Install without config
      const installCommand = createInstallCommand(qualifiedName);

      const updatedConfig = {
        [qualifiedName]: installCommand.mcpServers[qualifiedName],
      };

      writeMcpConfig(updatedConfig);

      return {
        content: [
          {
            type: "text",
            text: `Successfully installed ${qualifiedName}`,
          },
        ],
      };
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error installing server ${qualifiedName}: ${error.message}`,
        },
      ],
    };
  }
};

const removeServer = async (
  qualifiedName: string
): Promise<{ content: Content[] }> => {
  try {
    // Check if server is installed
    if (!isServerInstalled(qualifiedName)) {
      return {
        content: [
          {
            type: "text",
            text: `Server ${qualifiedName} is not installed.`,
          },
        ],
      };
    }

    // Read current config
    const config = readMcpConfig();

    // Remove the server from config
    if (config.mcpServers) {
      delete config.mcpServers[qualifiedName];
      writeMcpConfig(config);
    }

    // Clear any pending˙ configs if they exist
    if (pendingConfigs[qualifiedName]) {
      delete pendingConfigs[qualifiedName];
    }

    return {
      content: [
        {
          type: "text",
          text: `Successfully uninstalled ${qualifiedName}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error uninstalling server ${qualifiedName}: ${error.message}`,
        },
      ],
    };
  }
};

export { isServerInstalled, installServer, configureServer, removeServer };
