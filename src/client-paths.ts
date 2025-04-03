import { homedir, platform } from "node:os";
import { join } from "node:path";

const isWindows = platform() === "win32";
const appData = process.env.APPDATA;

const getClaudePath = () => {
  const home = homedir();
  if (isWindows) {
    if (!appData) {
      console.warn(
        "APPDATA environment variable not found. Using fallback path for Claude config."
      );
      return join(
        home,
        "AppData",
        "Roaming",
        "Claude",
        "claude_desktop_config.json"
      );
    }
    return join(appData, "Claude", "claude_desktop_config.json");
  } else {
    return join(
      home,
      "Library",
      "Application Support",
      "Claude",
      "claude_desktop_config.json"
    );
  }
};

const clientPaths = {
  cursor: join(homedir(), ".cursor", "mcp.json"),
  claude: getClaudePath(),
};

export default clientPaths;
