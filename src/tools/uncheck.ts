import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { uncheckSchema } from "../schemas/toolSchemas";

export const uncheck: ToolDefinition = {
  name: "uncheck",
  description: "Uncheck a checkbox",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, timeout } = uncheckSchema.parse(args);
    await ctx.page.uncheck(selector, { timeout });
    return {
      status: "success",
      data: { selector, unchecked: true },
    };
  },
};
