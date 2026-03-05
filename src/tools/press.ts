import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { pressSchema } from "../schemas/toolSchemas";

export const press: ToolDefinition = {
  name: "press",
  description: "Press a keyboard key on a focused element (e.g., Enter, Tab, ArrowDown, Control+a)",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, key, timeout } = pressSchema.parse(args);
    await ctx.page.press(selector, key, { timeout });
    return {
      status: "success",
      data: { selector, key, pressed: true },
    };
  },
};
