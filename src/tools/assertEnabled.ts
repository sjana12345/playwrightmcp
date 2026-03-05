import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { assertEnabledSchema } from "../schemas/toolSchemas";

export const assertEnabled: ToolDefinition = {
  name: "assert_enabled",
  description: "Assert that an element is enabled or disabled",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, enabled, timeout } = assertEnabledSchema.parse(args);
    const locator = ctx.page.locator(selector).first();
    if (timeout) await locator.waitFor({ state: "attached", timeout });

    const actual = await locator.isEnabled();
    const passed = actual === enabled;

    if (!passed) {
      return {
        status: "error",
        error: `Enabled assertion failed. Element "${selector}": Expected enabled=${enabled}, Actual enabled=${actual}`,
      };
    }

    return {
      status: "success",
      data: { selector, expected: enabled, actual, passed: true },
    };
  },
};
