import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";

export const getTitle: ToolDefinition = {
  name: "get_title",
  description: "Get the current page title",
  async execute(ctx: ToolContext): Promise<ToolResult> {
    const title = await ctx.page.title();
    return {
      status: "success",
      data: { title },
    };
  },
};
