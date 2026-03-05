import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { clickSchema } from "../schemas/toolSchemas";

export const click: ToolDefinition = {
  name: "click",
  description: "Click an element matching the given selector",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, button, clickCount, timeout } = clickSchema.parse(args);
    await ctx.page.click(selector, { button, clickCount, timeout });
    return {
      status: "success",
      data: { selector, clicked: true },
    };
  },
};
