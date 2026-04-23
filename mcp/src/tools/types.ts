import { z, type ZodRawShape } from "zod";

export interface ToolDefinition<Shape extends ZodRawShape = ZodRawShape> {
  name: string;
  description: string;
  inputSchema: Shape;
  handler: (
    args: z.objectOutputType<Shape, z.ZodTypeAny>
  ) => Promise<{ content: Array<{ type: "text"; text: string }> }>;
}

export function jsonResult(value: unknown): {
  content: Array<{ type: "text"; text: string }>;
} {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
  };
}
