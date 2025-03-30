import axios from "axios";
import type { Server } from "./types/server";
import { config } from "dotenv";

config();

const BASE_URL = "https://registry.smithery.ai";
const API_KEY = "b066c4b6-fd1d-4af0-85f7-d1b34b99a13e";

if (!API_KEY) {
  throw new Error("SMITHERY_API_KEY environment variable is not set");
}

const smitheryApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
});

export const listServers = async (query?: string): Promise<Server[]> => {
  try {
    const response = await smitheryApi.get(
      "/servers",
      query !== undefined
        ? {
            params: { q: query },
          }
        : undefined
    );

    return response.data.servers;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch servers: ${error.message}`);
    }
    throw error;
  }
};

export const getServer = async (qualifiedName: string): Promise<Server> => {
  try {
    const response = await smitheryApi.get(`/servers/${qualifiedName}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch server ${qualifiedName}: ${error.message}`
      );
    }
    throw error;
  }
};
