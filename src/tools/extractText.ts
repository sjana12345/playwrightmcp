import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { extractTextSchema } from "../schemas/toolSchemas";

export const extractText: ToolDefinition = {
  name: "extract_text",
  description: "Extract text content from an element matching the selector",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, timeout } = extractTextSchema.parse(args);
    await ctx.page.waitForSelector(selector, { state: "visible", timeout });
    const text = await ctx.page.locator(selector).first().innerText();
    return {
      status: "success",
      data: { selector, text },
    };
  },
};
