import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { getAttributeSchema } from "../schemas/toolSchemas";

export const getAttribute: ToolDefinition = {
  name: "get_attribute",
  description: "Get the value of an attribute from an element",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, attribute, timeout } = getAttributeSchema.parse(args);
    const locator = ctx.page.locator(selector).first();
    if (timeout) await locator.waitFor({ state: "attached", timeout });
    const value = await locator.getAttribute(attribute);
    return {
      status: "success",
      data: { selector, attribute, value },
    };
  },
};
