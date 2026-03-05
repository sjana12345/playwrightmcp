import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { assertVisibleSchema } from "../schemas/toolSchemas";

export const assertVisible: ToolDefinition = {
  name: "assert_visible",
  description: "Assert that an element matching the selector is visible on the page",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, timeout } = assertVisibleSchema.parse(args);
    const locator = ctx.page.locator(selector).first();
    const visible = await locator.isVisible();

    if (!visible) {
      if (timeout) {
        try {
          await locator.waitFor({ state: "visible", timeout });
        } catch {
          return {
            status: "error",
            error: `Visibility assertion failed. Element "${selector}" is not visible`,
          };
        }
      } else {
        return {
          status: "error",
          error: `Visibility assertion failed. Element "${selector}" is not visible`,
        };
      }
    }

    return {
      status: "success",
      data: { selector, visible: true },
    };
  },
};
