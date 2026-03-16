import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";

export const waitForTimeout: ToolDefinition = {
  name: "wait_for_timeout",
  description: "Wait for a specific amount of time in milliseconds",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const timeout = typeof args.timeout === 'number' ? args.timeout : parseInt(String(args.timeout), 10);
    if (isNaN(timeout)) {
      throw new Error("Invalid timeout value. Expected a number in milliseconds.");
    }
    await ctx.page.waitForTimeout(timeout);
    return {
      status: "success",
      data: { timeout },
    };
  },
};