import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { focusSchema } from "../schemas/toolSchemas";

export const focus: ToolDefinition = {
  name: "focus",
  description: "Focus an element matching the given selector",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, timeout } = focusSchema.parse(args);
    if (timeout) await ctx.page.waitForSelector(selector, { timeout });
    await ctx.page.focus(selector);
    return {
      status: "success",
      data: { selector, focused: true },
    };
  },
};
