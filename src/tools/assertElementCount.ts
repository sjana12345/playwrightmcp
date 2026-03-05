import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { assertElementCountSchema } from "../schemas/toolSchemas";

export const assertElementCount: ToolDefinition = {
  name: "assert_element_count",
  description: "Assert that the number of elements matching the selector equals the expected count",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, count, timeout } = assertElementCountSchema.parse(args);

    if (timeout) {
      await ctx.page.waitForSelector(selector, { timeout }).catch(() => {});
    }

    const actual = await ctx.page.locator(selector).count();
    const passed = actual === count;

    if (!passed) {
      return {
        status: "error",
        error: `Element count assertion failed. Expected: ${count}, Actual: ${actual} for selector "${selector}"`,
      };
    }

    return {
      status: "success",
      data: { selector, expected: count, actual, passed: true },
    };
  },
};
