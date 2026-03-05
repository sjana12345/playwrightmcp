import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { assertTextSchema } from "../schemas/toolSchemas";

export const assertText: ToolDefinition = {
  name: "assert_text",
  description: "Assert that an element's text content matches the expected value",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, expected, exact, timeout } = assertTextSchema.parse(args);
    const locator = ctx.page.locator(selector).first();
    if (timeout) await locator.waitFor({ state: "visible", timeout });

    const actual = await locator.innerText();
    const passed = exact ? actual === expected : actual.includes(expected);

    if (!passed) {
      return {
        status: "error",
        error: `Text assertion failed. Expected: "${expected}", Actual: "${actual}" (exact: ${exact})`,
      };
    }

    return {
      status: "success",
      data: { selector, expected, actual, passed: true },
    };
  },
};
