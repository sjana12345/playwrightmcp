import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { getByTestIdSchema } from "../schemas/toolSchemas";

export const getByTestId: ToolDefinition = {
  name: "get_by_test_id",
  description: "Find elements by their data-testid attribute using Playwright's getByTestId locator",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { testId } = getByTestIdSchema.parse(args);
    const locator = ctx.page.getByTestId(testId);
    const count = await locator.count();

    const baseLocator = `[data-testid="${testId}"]`;
    const elements: Record<string, unknown>[] = [];
    const limit = Math.min(count, 5);

    for (let i = 0; i < limit; i++) {
      const el = locator.nth(i);
      const [tagName, text, visible] = await Promise.all([
        el.evaluate((e) => e.tagName.toLowerCase()),
        el.innerText().catch(() => ""),
        el.isVisible(),
      ]);
      const elementLocator = count === 1 ? baseLocator : `${baseLocator} >> nth=${i}`;
      elements.push({
        index: i,
        locator: elementLocator,
        tagName,
        text: text.length > 200 ? text.slice(0, 200) + "..." : text,
        visible,
      });
    }

    return {
      status: "success",
      data: { testId, locator: baseLocator, totalCount: count, elements },
    };
  },
};
