interface Server {
  qualifiedName: string;
  displayName: string;
  description: string;
  useCount: number;
  connections: Array<{
    type: string;
    deploymentUrl: string;
    configSchema?: {
      type: string;
      required?: string[];
      properties: Record<
        string,
        {
          type: string;
          description: string;
        }
      >;
    };
  }>;
}

export type { Server };
