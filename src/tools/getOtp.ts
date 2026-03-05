import { Client } from "pg";
import { ToolDefinition, ToolContext, ToolResult } from "../types/toolTypes";
import { getOtpSchema } from "../schemas/toolSchemas";
import { config } from "../config/config";
import { logger } from "../utils/logger";

export const getOtp: ToolDefinition = {
  name: "get_otp",
  description: "A specialized tool to fetch the latest OTP from the database for a user.",
  async execute(ctx: ToolContext, args: any): Promise<ToolResult> {
    try {
      const { email, phone, table, otpColumn, identifierColumn } = getOtpSchema.parse(args);
      
      const identifier = email || phone;
      if (!identifier) {
        return { status: "error", error: "Either email or phone is required" };
      }

      const client = new Client({
        host: config.db.host,
        port: config.db.port,
        database: config.db.database,
        user: config.db.user,
        password: config.db.password,
      });

      await client.connect();

      try {
        const query = `
          SELECT ${otpColumn} as otp 
          FROM ${table} 
          WHERE ${identifierColumn} = $1 
          ORDER BY created_at DESC 
          LIMIT 1
        `;
        
        const result = await client.query(query, [identifier]);
        
        if (result.rows.length === 0) {
          return {
            status: "error",
            error: `No OTP found for ${identifier} in table ${table}.`,
          };
        }

        const otp = result.rows[0].otp;
        logger.info("OTP fetched successfully", { identifier });

        return {
          status: "success",
          data: {
            otp,
            identifier,
            fetchedAt: new Date().toISOString(),
          },
        };
      } finally {
        await client.end();
      }
    } catch (error) {
      logger.error("Failed to fetch OTP", { error: String(error) });
      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
