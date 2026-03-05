import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";

export const getURL: ToolDefinition = {
  name: "get_url",
  description: "Get the current page URL",
  async execute(ctx: ToolContext): Promise<ToolResult> {
    return {
      status: "success",
      data: { url: ctx.page.url() },
    };
  },
};
