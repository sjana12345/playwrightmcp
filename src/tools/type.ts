import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { typeSchema } from "../schemas/toolSchemas";

export const type: ToolDefinition = {
  name: "type",
  description: "Type text character by character into an element (simulates real keystrokes, unlike fill)",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, text, delay, timeout } = typeSchema.parse(args);
    if (timeout) await ctx.page.waitForSelector(selector, { timeout });
    await ctx.page.locator(selector).first().pressSequentially(text, { delay });
    return {
      status: "success",
      data: { selector, typed: true, length: text.length },
    };
  },
};
