import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { fillSchema } from "../schemas/toolSchemas";

export const fill: ToolDefinition = {
  name: "fill",
  description: "Fill an input element with the given value",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, value, timeout } = fillSchema.parse(args);
    await ctx.page.fill(selector, value, { timeout });
    return {
      status: "success",
      data: { selector, filled: true },
    };
  },
};
