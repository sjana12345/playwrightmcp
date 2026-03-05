import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { getByTextSchema } from "../schemas/toolSchemas";

export const getByText: ToolDefinition = {
  name: "get_by_text",
  description: "Find elements by their text content using Playwright's getByText locator",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { text, exact } = getByTextSchema.parse(args);
    const locator = ctx.page.getByText(text, { exact });
    const count = await locator.count();

    const baseLocator = exact ? `text="${text}"` : `text=${text}`;
    const elements: Record<string, unknown>[] = [];
    const limit = Math.min(count, 5);

    for (let i = 0; i < limit; i++) {
      const el = locator.nth(i);
      const [tagName, innerText, visible] = await Promise.all([
        el.evaluate((e) => e.tagName.toLowerCase()),
        el.innerText().catch(() => ""),
        el.isVisible(),
      ]);
      const elementLocator = count === 1 ? baseLocator : `${baseLocator} >> nth=${i}`;
      elements.push({
        index: i,
        locator: elementLocator,
        tagName,
        text: innerText.length > 200 ? innerText.slice(0, 200) + "..." : innerText,
        visible,
      });
    }

    return {
      status: "success",
      data: { text, exact, locator: baseLocator, totalCount: count, elements },
    };
  },
};
