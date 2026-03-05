import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { config } from "../config/config";
import { logger } from "../utils/logger";
import { errorResponse } from "../utils/errorHandler";
import { playwrightManager } from "../browser/playwrightManager";
import * as tools from "../tools";

class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool "${tool.name}" is already registered`);
    }
    this.tools.set(tool.name, tool);
    logger.info("Tool registered", { tool: tool.name });
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  list(): { name: string; description: string }[] {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
    }));
  }

  async execute(
    toolName: string,
    ctx: ToolContext,
    args: any
  ): Promise<ToolResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return { status: "error", error: `Unknown tool: ${toolName}` };
    }

    const { retryAttempts, retryDelay } = config.browser;

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        const result = await Promise.race([
          tool.execute(ctx, args),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Tool execution timed out")), config.request.timeout)
          ),
        ]);
        return result;
      } catch (error) {
        logger.warn("Tool execution failed", {
          tool: toolName,
          attempt,
          error: String(error),
        });

        if (attempt === retryAttempts) {
          const screenshot = await playwrightManager.screenshotOnFailure(ctx.sessionId);
          const result = errorResponse(error);
          if (screenshot) {
            result.screenshot = screenshot;
          }
          return result;
        }

        await new Promise((r) => setTimeout(r, retryDelay));
      }
    }

    return { status: "error", error: "Unexpected execution path" };
  }
}

export const toolRegistry = new ToolRegistry();

// Auto-register all tools
for (const tool of Object.values(tools)) {
  toolRegistry.register(tool as ToolDefinition);
}
