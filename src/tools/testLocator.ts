import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { testLocatorSchema } from "../schemas/toolSchemas";

export const testLocator: ToolDefinition = {
  name: "test_locator",
  description:
    "Test a CSS/XPath selector and return detailed info about matched elements (count, tag, text, visibility, bounding box)",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, maxResults, timeout } = testLocatorSchema.parse(args);

    if (timeout) {
      await ctx.page.waitForSelector(selector, { timeout }).catch(() => {});
    }

    const locator = ctx.page.locator(selector);
    const totalCount = await locator.count();

    const limit = Math.min(totalCount, maxResults);
    const elements: Record<string, unknown>[] = [];

    for (let i = 0; i < limit; i++) {
      const el = locator.nth(i);
      const [tagName, text, visible, boundingBox, attributes] = await Promise.all([
        el.evaluate((e) => e.tagName.toLowerCase()),
        el.innerText().catch(() => ""),
        el.isVisible(),
        el.boundingBox(),
        el.evaluate((e) => {
          const attrs: Record<string, string> = {};
          Array.from(e.attributes).forEach((attr) => {
            attrs[attr.name] = attr.value;
          });
          return attrs;
        }),
      ]);

      const elementLocator = totalCount === 1 ? selector : `${selector} >> nth=${i}`;
      elements.push({
        index: i,
        locator: elementLocator,
        tagName,
        text: text.length > 200 ? text.slice(0, 200) + "..." : text,
        visible,
        boundingBox,
        attributes,
      });
    }

    return {
      status: "success",
      data: {
        selector,
        locator: selector,
        totalCount,
        showing: limit,
        elements,
      },
    };
  },
};
