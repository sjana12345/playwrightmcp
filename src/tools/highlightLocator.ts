import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { highlightLocatorSchema } from "../schemas/toolSchemas";

export const highlightLocator: ToolDefinition = {
  name: "highlight_locator",
  description:
    "Visually highlight all elements matching a selector on the page with a colored overlay (useful for debugging locators)",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const { selector, color, duration } = highlightLocatorSchema.parse(args);

    const count = await ctx.page.locator(selector).count();

    if (count === 0) {
      return {
        status: "error",
        error: `No elements found matching selector "${selector}"`,
      };
    }

    const highlightScript = `
      (([sel, col, dur]) => {
        const elements = document.querySelectorAll(sel);
        const overlays = [];
        elements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const overlay = document.createElement("div");
          overlay.style.position = "fixed";
          overlay.style.left = rect.left + "px";
          overlay.style.top = rect.top + "px";
          overlay.style.width = rect.width + "px";
          overlay.style.height = rect.height + "px";
          overlay.style.backgroundColor = col;
          overlay.style.border = "2px solid red";
          overlay.style.pointerEvents = "none";
          overlay.style.zIndex = "999999";
          overlay.style.transition = "opacity 0.3s";
          overlay.dataset.mcpHighlight = "true";
          document.body.appendChild(overlay);
          overlays.push(overlay);
        });
        setTimeout(() => {
          overlays.forEach((o) => {
            o.style.opacity = "0";
            setTimeout(() => o.remove(), 300);
          });
        }, dur);
      })(arguments[0])
    `;
    await ctx.page.evaluate(highlightScript, [selector, color, duration]);

    // Take a screenshot while highlights are visible
    await new Promise((r) => setTimeout(r, 200));
    const buffer = await ctx.page.screenshot({ type: "png" });

    return {
      status: "success",
      data: {
        selector,
        locator: selector,
        matchCount: count,
        highlighted: true,
        screenshot: buffer.toString("base64"),
      },
    };
  },
};
