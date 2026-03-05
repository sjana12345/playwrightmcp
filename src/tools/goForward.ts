import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";

export const goForward: ToolDefinition = {
  name: "go_forward",
  description: "Navigate forward in browser history",
  async execute(ctx: ToolContext): Promise<ToolResult> {
    const response = await ctx.page.goForward();
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
