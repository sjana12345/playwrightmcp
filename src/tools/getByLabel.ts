import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { getByLabelSchema } from "../schemas/toolSchemas";

export const getByLabel: ToolDefinition = {
  name: "get_by_label",
  description: "Find form elements by their associated label text using Playwright's getByLabel locator",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { text, exact } = getByLabelSchema.parse(args);
    const locator = ctx.page.getByLabel(text, { exact });
    const count = await locator.count();

    const baseLocator = exact ? `label="${text}"` : `label=${text}`;
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
      data: { label: text, exact, locator: baseLocator, totalCount: count, elements },
    };
  },
};
