import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { assertTitleSchema } from "../schemas/toolSchemas";

export const assertTitle: ToolDefinition = {
  name: "assert_title",
  description: "Assert that the page title matches the expected value",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { expected, exact } = assertTitleSchema.parse(args);
    const actual = await ctx.page.title();
    const passed = exact ? actual === expected : actual.includes(expected);

    if (!passed) {
      return {
        status: "error",
        error: `Title assertion failed. Expected: "${expected}", Actual: "${actual}" (exact: ${exact})`,
      };
    }

    return {
      status: "success",
      data: { expected, actual, passed: true },
    };
  },
};
