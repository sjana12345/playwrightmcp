import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { navigateSchema } from "../schemas/toolSchemas";

export const navigate: ToolDefinition = {
  name: "navigate",
  description: "Navigate to a URL",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { url, waitUntil } = navigateSchema.parse(args);
    const response = await ctx.page.goto(url, { waitUntil });
    return {
      status: "success",
      data: {
        url: ctx.page.url(),
        title: await ctx.page.title(),
        statusCode: response?.status() ?? null,
      },
    };
  },
};
