import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { assertURLSchema } from "../schemas/toolSchemas";

export const assertURL: ToolDefinition = {
  name: "assert_url",
  description: "Assert that the current page URL matches the expected value",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { expected, exact } = assertURLSchema.parse(args);
    const actual = ctx.page.url();
    const passed = exact ? actual === expected : actual.includes(expected);

    if (!passed) {
      return {
        status: "error",
        error: `URL assertion failed. Expected: "${expected}", Actual: "${actual}" (exact: ${exact})`,
      };
    }

    return {
      status: "success",
      data: { expected, actual, passed: true },
    };
  },
};
