import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { hoverSchema } from "../schemas/toolSchemas";

export const hover: ToolDefinition = {
  name: "hover",
  description: "Hover over an element matching the given selector",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, timeout } = hoverSchema.parse(args);
    await ctx.page.hover(selector, { timeout });
    return {
      status: "success",
      data: { selector, hovered: true },
    };
  },
};
