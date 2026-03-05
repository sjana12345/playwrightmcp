import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { waitForLoadStateSchema } from "../schemas/toolSchemas";

export const waitForLoadState: ToolDefinition = {
  name: "wait_for_load_state",
  description: "Wait for the page to reach a specific load state (load, domcontentloaded, networkidle)",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { state, timeout } = waitForLoadStateSchema.parse(args);
    await ctx.page.waitForLoadState(state, { timeout });
    return {
      status: "success",
      data: { state, url: ctx.page.url() },
    };
  },
};
