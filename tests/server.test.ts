import request from "supertest";
import { createMockPage } from "./helpers/mockPage";

// Mock playwrightManager before importing the app
const mockSession = {
  sessionId: "test-session-id",
  createdAt: new Date("2026-01-01"),
  lastUsed: new Date("2026-01-01"),
};

const mockPage = createMockPage();

jest.mock("../src/browser/playwrightManager", () => ({
  playwrightManager: {
    listSessions: jest.fn().mockReturnValue([mockSession]),
    createSession: jest.fn().mockResolvedValue(mockSession),
    closeSession: jest.fn().mockResolvedValue(undefined),
    getPage: jest.fn().mockReturnValue(mockPage),
    screenshotOnFailure: jest.fn().mockResolvedValue(undefined),
    launch: jest.fn().mockResolvedValue(undefined),
    shutdown: jest.fn().mockResolvedValue(undefined),
  },
}));

import { createApp } from "../src/server/mcpServer";

const app = createApp();

describe("Server Endpoints", () => {
  describe("GET /health", () => {
    it("should return ok status with session count", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok", sessions: 1 });
    });
  });

  describe("GET /tools", () => {
    it("should return list of all registered tools", async () => {
      const res = await request(app).get("/tools");
      expect(res.status).toBe(200);
      expect(res.body.tools).toBeInstanceOf(Array);
      expect(res.body.tools.length).toBeGreaterThan(0);

      const toolNames = res.body.tools.map((t: any) => t.name);
      expect(toolNames).toContain("navigate");
      expect(toolNames).toContain("click");
      expect(toolNames).toContain("assert_text");
      expect(toolNames).toContain("get_by_role");
      expect(toolNames).toContain("test_locator");
    });

    it("should return tools with name and description", async () => {
      const res = await request(app).get("/tools");
      for (const tool of res.body.tools) {
        expect(tool).toHaveProperty("name");
        expect(tool).toHaveProperty("description");
        expect(typeof tool.name).toBe("string");
        expect(typeof tool.description).toBe("string");
      }
    });
  });

  describe("GET /sessions", () => {
    it("should return list of active sessions", async () => {
      const res = await request(app).get("/sessions");
      expect(res.status).toBe(200);
      expect(res.body.sessions).toBeInstanceOf(Array);
      expect(res.body.sessions).toHaveLength(1);
      expect(res.body.sessions[0].sessionId).toBe("test-session-id");
    });
  });

  describe("POST /session/start", () => {
    it("should start a session with no options", async () => {
      const res = await request(app).post("/session/start").send({});
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.sessionId).toBe("test-session-id");
    });

    it("should start a session with viewport", async () => {
      const res = await request(app)
        .post("/session/start")
        .send({ viewport: { width: 1920, height: 1080 } });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
    });

    it("should start a session with userAgent", async () => {
      const res = await request(app)
        .post("/session/start")
        .send({ userAgent: "Custom Agent" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
    });

    it("should reject invalid viewport", async () => {
      const res = await request(app)
        .post("/session/start")
        .send({ viewport: { width: -1, height: 100 } });
      expect(res.status).toBe(400);
      expect(res.body.status).toBe("error");
    });
  });

  describe("POST /session/close", () => {
    it("should close a session", async () => {
      const res = await request(app)
        .post("/session/close")
        .send({ sessionId: "test-session-id" });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.closed).toBe(true);
    });

    it("should return 400 if sessionId is missing", async () => {
      const res = await request(app).post("/session/close").send({});
      expect(res.status).toBe(400);
      expect(res.body.status).toBe("error");
      expect(res.body.error).toBe("sessionId is required");
    });

    it("should return 400 if sessionId is not a string", async () => {
      const res = await request(app)
        .post("/session/close")
        .send({ sessionId: 123 });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /tool", () => {
    it("should execute a known tool", async () => {
      const res = await request(app).post("/tool").send({
        tool: "navigate",
        sessionId: "test-session-id",
        args: { url: "https://example.com" },
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
    });

    it("should return 400 for unknown tool", async () => {
      const res = await request(app).post("/tool").send({
        tool: "nonexistent_tool",
        sessionId: "test-session-id",
        args: {},
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Unknown tool");
    });

    it("should return 400 if tool name is missing", async () => {
      const res = await request(app).post("/tool").send({
        sessionId: "test-session-id",
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 if sessionId is missing", async () => {
      const res = await request(app).post("/tool").send({
        tool: "navigate",
      });
      expect(res.status).toBe(400);
    });

    it("should default args to empty object", async () => {
      const res = await request(app).post("/tool").send({
        tool: "get_title",
        sessionId: "test-session-id",
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
    });
  });
});
