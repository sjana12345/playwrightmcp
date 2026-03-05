import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { selectOptionSchema } from "../schemas/toolSchemas";

export const selectOption: ToolDefinition = {
  name: "select_option",
  description: "Select one or more options in a <select> element",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, values, timeout } = selectOptionSchema.parse(args);
    if (timeout) await ctx.page.waitForSelector(selector, { timeout });
    const selected = await ctx.page.selectOption(selector, values);
    return {
      status: "success",
      data: { selector, selected },
    };
  },
};
