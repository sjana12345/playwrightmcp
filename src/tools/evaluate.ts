import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { evaluateSchema } from "../schemas/toolSchemas";

export const evaluate: ToolDefinition = {
  name: "evaluate",
  description: "Execute JavaScript in the browser page context and return the result",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { expression } = evaluateSchema.parse(args);
    const result = await ctx.page.evaluate(expression);
    return {
      status: "success",
      data: { result },
    };
  },
};
