import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";

export const pause: ToolDefinition = {
  name: "pause",
  description: "Pause the script execution and open Playwright Inspector",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    await ctx.page.pause();
    return {
      status: "success",
      data: { paused: true },
    };
  },
};