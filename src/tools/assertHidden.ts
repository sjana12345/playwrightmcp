import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { assertHiddenSchema } from "../schemas/toolSchemas";

export const assertHidden: ToolDefinition = {
  name: "assert_hidden",
  description: "Assert that an element matching the selector is hidden or not present on the page",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, timeout } = assertHiddenSchema.parse(args);
    const locator = ctx.page.locator(selector).first();
    const visible = await locator.isVisible();

    if (visible) {
      if (timeout) {
        try {
          await locator.waitFor({ state: "hidden", timeout });
        } catch {
          return {
            status: "error",
            error: `Hidden assertion failed. Element "${selector}" is still visible`,
          };
        }
      } else {
        return {
          status: "error",
          error: `Hidden assertion failed. Element "${selector}" is still visible`,
        };
      }
    }

    return {
      status: "success",
      data: { selector, hidden: true },
    };
  },
};
