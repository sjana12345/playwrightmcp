import { Client } from "pg";
import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { dbQuerySchema } from "../schemas/toolSchemas";
import { config } from "../config/config";
import { logger } from "../utils/logger";

export const dbQuery: ToolDefinition = {
  name: "db_query",
  description: "Execute a custom SQL query on the unizap_users database (e.g., to fetch OTP)",
  async execute(ctx: ToolContext, args: any): Promise<ToolResult> {
    try {
      const { query, values } = dbQuerySchema.parse(args);
      
      const client = new Client({
        host: config.db.host,
        port: config.db.port,
        database: config.db.database,
        user: config.db.user,
        password: config.db.password,
      });

      console.log("DEBUG: Database Config", {
        host: config.db.host,
        user: config.db.user,
        passwordDefined: !!config.db.password,
        passwordLength: config.db.password?.length
      });

      logger.info("Attempting database connection", { 
        host: config.db.host,
        user: config.db.user,
        passwordDefined: !!config.db.password,
        passwordLength: config.db.password?.length 
      });

      await client.connect();

      try {
        const result = await client.query(query, values);
        return {
          status: "success",
          data: {
            rowCount: result.rowCount,
            rows: result.rows,
          },
        };
      } finally {
        await client.end();
      }
    } catch (error) {
      logger.error("Database query failed", { error: String(error) });
      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
