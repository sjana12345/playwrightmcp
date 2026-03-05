import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { config } from "../config/config";
import { logger } from "../utils/logger";
import { AppError, errorMiddleware } from "../utils/errorHandler";
import { playwrightManager } from "../browser/playwrightManager";
import { toolRegistry } from "./toolRegistry";
import { toolRequestSchema, sessionStartSchema, workflowRequestSchema } from "../schemas/toolSchemas";

export function createApp() {
  const app = express();
  app.use(express.json());

  // Privacy Policy
  app.get("/privacy", (_req, res) => {
    try {
      const privacyPath = path.join(process.cwd(), "PRIVACY.md");
      const content = fs.readFileSync(privacyPath, "utf-8");
      res.header("Content-Type", "text/markdown");
      res.send(content);
    } catch (err) {
      res.status(500).send("Privacy Policy not found.");
    }
  });

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", sessions: playwrightManager.listSessions().length });
  });

  // List available tools
  app.get("/tools", (_req, res) => {
    res.json({ tools: toolRegistry.list() });
  });

  // Start a new browser session
  app.post("/session/start", async (req, res, next) => {
    try {
      const options = sessionStartSchema.parse(req.body);
      const session = await playwrightManager.createSession(options);
      res.json({ status: "success", data: session });
    } catch (err) {
      next(err);
    }
  });

  // Close a browser session
  app.post("/session/close", async (req, res, next) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId || typeof sessionId !== "string") {
        throw new AppError(400, "sessionId is required");
      }
      await playwrightManager.closeSession(sessionId);
      res.json({ status: "success", data: { sessionId, closed: true } });
    } catch (err) {
      next(err);
    }
  });

  // List active sessions
  app.get("/sessions", (_req, res) => {
    res.json({ sessions: playwrightManager.listSessions() });
  });

  // Execute a tool
  app.post("/tool", async (req, res, next) => {
    try {
      const { tool, sessionId, args } = toolRequestSchema.parse(req.body);

      if (!toolRegistry.get(tool)) {
        throw new AppError(400, `Unknown tool: ${tool}`);
      }

      const page = playwrightManager.getPage(sessionId);
      const result = await toolRegistry.execute(tool, { page, sessionId }, args);

      const statusCode = result.status === "success" ? 200 : 422;
      res.status(statusCode).json(result);
    } catch (err) {
      next(err);
    }
  });

  // Execute a workflow (multiple tools in sequence)
  app.post("/workflow", async (req, res, next) => {
    try {
      const { sessionId, steps, stopOnFailure } = workflowRequestSchema.parse(req.body);
      const results = [];
      const page = playwrightManager.getPage(sessionId);

      for (const step of steps) {
        if (!toolRegistry.get(step.tool)) {
          const error = `Unknown tool: ${step.tool}`;
          results.push({ tool: step.tool, status: "error", error });
          if (stopOnFailure) break;
          continue;
        }

        const result = await toolRegistry.execute(step.tool, { page, sessionId }, step.args);
        results.push({ tool: step.tool, ...result });

        if (stopOnFailure && result.status === "error") {
          break;
        }
      }

      const anyError = results.some((r) => r.status === "error");
      const statusCode = anyError ? 422 : 200;
      res.status(statusCode).json({
        status: anyError ? "error" : "success",
        data: { results },
      });
    } catch (err) {
      next(err);
    }
  });

  app.use(errorMiddleware);

  return app;
}

// Graceful shutdown
async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down gracefully`);
  await playwrightManager.shutdown();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

async function start(): Promise<void> {
  await playwrightManager.launch();
  const app = createApp();
  app.listen(config.port, config.host, () => {
    logger.info(`MCP Server listening on http://${config.host}:${config.port}`);
  });
}

start().catch((err) => {
  logger.error("Failed to start server", { error: String(err) });
  process.exit(1);
});
