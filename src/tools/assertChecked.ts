import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { assertCheckedSchema } from "../schemas/toolSchemas";

export const assertChecked: ToolDefinition = {
  name: "assert_checked",
  description: "Assert that a checkbox or radio button is checked or unchecked",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, checked, timeout } = assertCheckedSchema.parse(args);
    const locator = ctx.page.locator(selector).first();
    if (timeout) await locator.waitFor({ state: "attached", timeout });

    const actual = await locator.isChecked();
    const passed = actual === checked;

    if (!passed) {
      return {
        status: "error",
        error: `Checked assertion failed. Element "${selector}": Expected checked=${checked}, Actual checked=${actual}`,
      };
    }

    return {
      status: "success",
      data: { selector, expected: checked, actual, passed: true },
    };
  },
};
