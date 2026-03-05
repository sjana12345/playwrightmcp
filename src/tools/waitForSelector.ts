import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { waitForSelectorSchema } from "../schemas/toolSchemas";

export const waitForSelector: ToolDefinition = {
  name: "wait_for_selector",
  description: "Wait for an element matching the selector to reach the desired state",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, state, timeout } = waitForSelectorSchema.parse(args);
    const element = await ctx.page.waitForSelector(selector, { state, timeout });
    return {
      status: "success",
      data: {
        selector,
        state,
        found: element !== null,
      },
    };
  },
};
