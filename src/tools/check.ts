import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { checkSchema } from "../schemas/toolSchemas";

export const check: ToolDefinition = {
  name: "check",
  description: "Check a checkbox or radio button",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, timeout } = checkSchema.parse(args);
    await ctx.page.check(selector, { timeout });
    return {
      status: "success",
      data: { selector, checked: true },
    };
  },
};
