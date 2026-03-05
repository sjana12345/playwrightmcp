import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { zephyrUpdateTestSchema } from "../schemas/toolSchemas";
import { config } from "../config/config";
import { logger } from "../utils/logger";

export const zephyrUpdateTest: ToolDefinition = {
  name: "zephyr_update_test",
  description: "Update test execution result in Zephyr Scale Cloud (supports single or array of results)",
  async execute(ctx: ToolContext, args: any): Promise<ToolResult> {
    try {
      const validatedArgs = zephyrUpdateTestSchema.parse(args);
      
      if (!config.zephyr.apiToken) {
        return {
          status: "error",
          error: "Zephyr API token not configured. Set ZEPHYR_API_TOKEN environment variable.",
        };
      }

      const executions = Array.isArray(validatedArgs) ? validatedArgs : [validatedArgs];
      const results = [];
      const errors = [];

      for (const execution of executions) {
        try {
          const url = `${config.zephyr.baseUrl}/testexecutions`;
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${config.zephyr.apiToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(execution),
          });

          if (!response.ok) {
            const errorText = await response.text();
            logger.error("Zephyr API error", { 
              testCaseKey: execution.testCaseKey, 
              status: response.status, 
              error: errorText 
            });
            errors.push({ testCaseKey: execution.testCaseKey, error: `Status ${response.status}: ${errorText}` });
            continue;
          }

          const data = await response.json();
          logger.info("Zephyr test result updated", { 
            testCaseKey: execution.testCaseKey, 
            status: execution.statusName 
          });
          results.push({ testCaseKey: execution.testCaseKey, data });
        } catch (err) {
          logger.error("Failed to update Zephyr test result", { 
            testCaseKey: execution.testCaseKey, 
            error: String(err) 
          });
          errors.push({ testCaseKey: execution.testCaseKey, error: String(err) });
        }
      }

      if (errors.length > 0 && results.length === 0) {
        return {
          status: "error",
          error: `Failed to update all test results: ${JSON.stringify(errors)}`,
        };
      }

      return {
        status: errors.length > 0 ? "error" : "success",
        data: {
          updatedCount: results.length,
          results,
          errors: errors.length > 0 ? errors : undefined,
        },
      };
    } catch (error) {
      logger.error("Failed to execute Zephyr update tool", { error: String(error) });
      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
