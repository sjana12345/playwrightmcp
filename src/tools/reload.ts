import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { reloadSchema } from "../schemas/toolSchemas";

export const reload: ToolDefinition = {
  name: "reload",
  description: "Reload the current page",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { waitUntil, timeout } = reloadSchema.parse(args);
    const response = await ctx.page.reload({ waitUntil, timeout });
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
