export const config = {
  port: parseInt(process.env.PORT ?? "3002", 10),
  host: process.env.HOST ?? "0.0.0.0",
  browser: {
    headless: process.env.BROWSER_HEADLESS !== "false",
    defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT ?? "30000", 10),
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS ?? "3", 10),
    retryDelay: parseInt(process.env.RETRY_DELAY ?? "1000", 10),
    screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE !== "false",
    tracingEnabled: process.env.TRACING_ENABLED === "true",
    videoRecording: process.env.VIDEO_RECORDING === "true",
  },
  session: {
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_SESSIONS ?? "10", 10),
    idleTimeout: parseInt(process.env.SESSION_IDLE_TIMEOUT ?? "300000", 10),
  },
  request: {
    timeout: parseInt(process.env.REQUEST_TIMEOUT ?? "60000", 10),
  },
  zephyr: {
    baseUrl: process.env.ZEPHYR_BASE_URL ?? "https://api.zephyrscale.smartbear.com/v2",
    apiToken: process.env.ZEPHYR_API_TOKEN,
  },
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? "5432", 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  ai: {
    enabled: process.env.SELF_HEALING_ENABLED === "true",
    apiKey: process.env.AI_API_KEY,
    baseUrl: process.env.AI_BASE_URL ?? "https://api.openai.com/v1",
    model: process.env.AI_MODEL ?? "minimax-m2.5",
  },
} as const;
