import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { screenshotSchema } from "../schemas/toolSchemas";

export const screenshot: ToolDefinition = {
  name: "screenshot",
  description: "Take a screenshot of the current page or a specific element",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, fullPage, type, quality } = screenshotSchema.parse(args);

    let buffer: Buffer;
    const opts: Record<string, unknown> = { type };
    if (type === "jpeg" && quality !== undefined) {
      opts.quality = quality;
    }

    if (selector) {
      const element = await ctx.page.locator(selector).first();
      buffer = await element.screenshot(opts) as Buffer;
    } else {
      opts.fullPage = fullPage;
      buffer = await ctx.page.screenshot(opts) as Buffer;
    }

    return {
      status: "success",
      data: {
        base64: buffer.toString("base64"),
        type,
        size: buffer.length,
      },
    };
  },
};
