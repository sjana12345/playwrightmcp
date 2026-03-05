import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { assertAttributeSchema } from "../schemas/toolSchemas";

export const assertAttribute: ToolDefinition = {
  name: "assert_attribute",
  description: "Assert that an element's attribute matches the expected value",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, attribute, expected, timeout } = assertAttributeSchema.parse(args);
    const locator = ctx.page.locator(selector).first();
    if (timeout) await locator.waitFor({ state: "attached", timeout });

    const actual = await locator.getAttribute(attribute);
    const passed = actual === expected;

    if (!passed) {
      return {
        status: "error",
        error: `Attribute assertion failed. Attribute "${attribute}" on "${selector}": Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`,
      };
    }

    return {
      status: "success",
      data: { selector, attribute, expected, actual, passed: true },
    };
  },
};
