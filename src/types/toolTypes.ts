import { Page } from "playwright";

export interface ToolResult {
  status: "success" | "error";
  data?: Record<string, unknown>;
  error?: string;
  screenshot?: string;
}

export interface ToolContext {
  page: Page;
  sessionId: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  execute: (ctx: ToolContext, args: Record<string, unknown>) => Promise<ToolResult>;
}

export interface SessionInfo {
  sessionId: string;
  createdAt: Date;
  lastUsed: Date;
}

export interface ToolRequest {
  tool: string;
  sessionId: string;
  args: Record<string, unknown>;
}
