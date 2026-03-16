import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";

export const uploadFile: ToolDefinition = {
  name: "upload_file",
  description: "Upload one or more files to an input[type=file] element",
  async execute(ctx: ToolContext, args: Record<string, unknown>): Promise<ToolResult> {
    const selector = String(args.selector);
    const files = args.files as string | string[];
    const timeout = args.timeout ? Number(args.timeout) : undefined;

    await ctx.page.setInputFiles(selector, files, { timeout });

    return {
      status: "success",
      data: { selector, files, uploaded: true },
    };
  },
};