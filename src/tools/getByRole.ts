import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { getByRoleSchema } from "../schemas/toolSchemas";

export const getByRole: ToolDefinition = {
  name: "get_by_role",
  description:
    "Find elements by their ARIA role using Playwright's getByRole locator (e.g., button, link, heading, textbox)",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { role, name, checked, disabled, expanded, pressed, selected } =
      getByRoleSchema.parse(args);

    const options: Record<string, unknown> = {};
    if (name !== undefined) options.name = name;
    if (checked !== undefined) options.checked = checked;
    if (disabled !== undefined) options.disabled = disabled;
    if (expanded !== undefined) options.expanded = expanded;
    if (pressed !== undefined) options.pressed = pressed;
    if (selected !== undefined) options.selected = selected;

    const locator = ctx.page.getByRole(role as Parameters<typeof ctx.page.getByRole>[0], options);
    const count = await locator.count();

    const namePart = name ? `[name=${JSON.stringify(name)}]` : "";
    const baseLocator = `role=${role}${namePart}`;

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
      data: { role, options, locator: baseLocator, totalCount: count, elements },
    };
  },
};
