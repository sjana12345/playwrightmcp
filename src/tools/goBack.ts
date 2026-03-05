import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";

export const goBack: ToolDefinition = {
  name: "go_back",
  description: "Navigate back in browser history",
  async execute(ctx: ToolContext): Promise<ToolResult> {
    const response = await ctx.page.goBack();
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
