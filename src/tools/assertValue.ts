import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { assertValueSchema } from "../schemas/toolSchemas";

export const assertValue: ToolDefinition = {
  name: "assert_value",
  description: "Assert that an input element's value matches the expected value",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, expected, timeout } = assertValueSchema.parse(args);
    const locator = ctx.page.locator(selector).first();
    if (timeout) await locator.waitFor({ state: "attached", timeout });

    const actual = await locator.inputValue();
    const passed = actual === expected;

    if (!passed) {
      return {
        status: "error",
        error: `Value assertion failed. Element "${selector}": Expected: "${expected}", Actual: "${actual}"`,
      };
    }

    return {
      status: "success",
      data: { selector, expected, actual, passed: true },
    };
  },
};
