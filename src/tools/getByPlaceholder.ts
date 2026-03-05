import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { getByPlaceholderSchema } from "../schemas/toolSchemas";

export const getByPlaceholder: ToolDefinition = {
  name: "get_by_placeholder",
  description: "Find input elements by their placeholder text using Playwright's getByPlaceholder locator",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { text, exact } = getByPlaceholderSchema.parse(args);
    const locator = ctx.page.getByPlaceholder(text, { exact });
    const count = await locator.count();

    const baseLocator = exact
      ? `[placeholder="${text}"]`
      : `[placeholder*="${text}"]`;
    const elements: Record<string, unknown>[] = [];
    const limit = Math.min(count, 5);

    for (let i = 0; i < limit; i++) {
      const el = locator.nth(i);
      const [tagName, visible, inputType] = await Promise.all([
        el.evaluate((e) => e.tagName.toLowerCase()),
        el.isVisible(),
        el.getAttribute("type"),
      ]);
      const elementLocator = count === 1 ? baseLocator : `${baseLocator} >> nth=${i}`;
      elements.push({ index: i, locator: elementLocator, tagName, inputType, visible });
    }

    return {
      status: "success",
      data: { placeholder: text, exact, locator: baseLocator, totalCount: count, elements },
    };
  },
};
