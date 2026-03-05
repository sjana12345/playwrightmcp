import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { dragAndDropSchema } from "../schemas/toolSchemas";

export const dragAndDrop: ToolDefinition = {
  name: "drag_and_drop",
  description: "Drag an element and drop it onto another element",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { source, target, timeout } = dragAndDropSchema.parse(args);
    if (timeout) {
      await ctx.page.waitForSelector(source, { timeout });
      await ctx.page.waitForSelector(target, { timeout });
    }
    await ctx.page.dragAndDrop(source, target);
    return {
      status: "success",
      data: { source, target, dropped: true },
    };
  },
};
