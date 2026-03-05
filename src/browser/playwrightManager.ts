import { chromium, Browser, BrowserContext, Page } from "playwright";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/config";
import { logger } from "../utils/logger";
import { AppError } from "../utils/errorHandler";
import { SessionInfo } from "../types/toolTypes";

interface Session {
  context: BrowserContext;
  page: Page;
  info: SessionInfo;
}

class PlaywrightManager {
  private browser: Browser | null = null;
  private sessions = new Map<string, Session>();
  private idleTimers = new Map<string, NodeJS.Timeout>();

  async launch(): Promise<void> {
    if (this.browser) return;
    logger.info("Launching browser", { headless: config.browser.headless });
    this.browser = await chromium.launch({
      headless: config.browser.headless,
    });
    logger.info("Browser launched");
  }

  async createSession(options?: {
    viewport?: { width: number; height: number };
    userAgent?: string;
  }): Promise<SessionInfo> {
    if (!this.browser) {
      await this.launch();
    }

    if (this.sessions.size >= config.session.maxConcurrent) {
      throw new AppError(429, `Max concurrent sessions (${config.session.maxConcurrent}) reached`);
    }

    const sessionId = uuidv4();
    const contextOptions: Record<string, unknown> = {};

    if (options?.viewport) {
      contextOptions.viewport = options.viewport;
    }
    if (options?.userAgent) {
      contextOptions.userAgent = options.userAgent;
    }
    if (config.browser.videoRecording) {
      contextOptions.recordVideo = { dir: "./recordings" };
    }

    const context = await this.browser!.newContext(contextOptions);
    context.setDefaultTimeout(config.browser.defaultTimeout);

    if (config.browser.tracingEnabled) {
      await context.tracing.start({ screenshots: true, snapshots: true });
    }

    const page = await context.newPage();
    const now = new Date();
    const info: SessionInfo = { sessionId, createdAt: now, lastUsed: now };

    this.sessions.set(sessionId, { context, page, info });
    this.resetIdleTimer(sessionId);

    logger.info("Session created", { sessionId });
    return info;
  }

  getPage(sessionId: string): Page {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new AppError(404, `Session ${sessionId} not found`);
    }
    session.info.lastUsed = new Date();
    this.resetIdleTimer(sessionId);
    return session.page;
  }

  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new AppError(404, `Session ${sessionId} not found`);
    }

    const timer = this.idleTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.idleTimers.delete(sessionId);
    }

    if (config.browser.tracingEnabled) {
      await session.context.tracing
        .stop({ path: `./traces/trace-${sessionId}.zip` })
        .catch((e) => logger.warn("Failed to save trace", { sessionId, error: String(e) }));
    }

    await session.context.close();
    this.sessions.delete(sessionId);
    logger.info("Session closed", { sessionId });
  }

  async screenshotOnFailure(sessionId: string): Promise<string | undefined> {
    if (!config.browser.screenshotOnFailure) return undefined;
    try {
      const page = this.getPage(sessionId);
      const buffer = await page.screenshot({ type: "png" });
      return buffer.toString("base64");
    } catch {
      return undefined;
    }
  }

  listSessions(): SessionInfo[] {
    return Array.from(this.sessions.values()).map((s) => s.info);
  }

  async shutdown(): Promise<void> {
    logger.info("Shutting down browser manager");
    for (const [id] of this.sessions) {
      await this.closeSession(id).catch(() => {});
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    logger.info("Browser manager shut down");
  }

  private resetIdleTimer(sessionId: string): void {
    const existing = this.idleTimers.get(sessionId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      logger.warn("Session idle timeout", { sessionId });
      await this.closeSession(sessionId).catch(() => {});
    }, config.session.idleTimeout);

    this.idleTimers.set(sessionId, timer);
  }
}

export const playwrightManager = new PlaywrightManager();
