import { createMockPage } from "../helpers/mockPage";
import { ToolContext } from "../../src/types/toolTypes";
import { goBack } from "../../src/tools/goBack";
import { goForward } from "../../src/tools/goForward";
import { reload } from "../../src/tools/reload";
import { getTitle } from "../../src/tools/getTitle";
import { getURL } from "../../src/tools/getURL";
import { waitForLoadState } from "../../src/tools/waitForLoadState";

jest.mock("../../src/utils/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe("Navigation & Page Info Tools", () => {
  let ctx: ToolContext;
  let mockPage: ReturnType<typeof createMockPage>;

  beforeEach(() => {
    mockPage = createMockPage();
    ctx = { page: mockPage, sessionId: "test-session" };
  });

  describe("go_back", () => {
    it("should navigate back", async () => {
      const result = await goBack.execute(ctx, {});
      expect(result.status).toBe("success");
      expect(mockPage.goBack).toHaveBeenCalled();
      expect(result.data?.url).toBe("https://example.com");
      expect(result.data?.title).toBe("Example Page");
    });
  });

  describe("go_forward", () => {
    it("should navigate forward", async () => {
      const result = await goForward.execute(ctx, {});
      expect(result.status).toBe("success");
      expect(mockPage.goForward).toHaveBeenCalled();
      expect(result.data?.url).toBe("https://example.com");
    });
  });

  describe("reload", () => {
    it("should reload with default waitUntil", async () => {
      const result = await reload.execute(ctx, {});
      expect(result.status).toBe("success");
      expect(mockPage.reload).toHaveBeenCalledWith({ waitUntil: "load", timeout: undefined });
    });

    it("should reload with networkidle", async () => {
      const result = await reload.execute(ctx, { waitUntil: "networkidle" });
      expect(result.status).toBe("success");
      expect(mockPage.reload).toHaveBeenCalledWith({ waitUntil: "networkidle", timeout: undefined });
    });

    it("should reload with timeout", async () => {
      const result = await reload.execute(ctx, { waitUntil: "load", timeout: 10000 });
      expect(result.status).toBe("success");
      expect(mockPage.reload).toHaveBeenCalledWith({ waitUntil: "load", timeout: 10000 });
    });
  });

  describe("get_title", () => {
    it("should return page title", async () => {
      const result = await getTitle.execute(ctx, {});
      expect(result.status).toBe("success");
      expect(result.data?.title).toBe("Example Page");
    });
  });

  describe("get_url", () => {
    it("should return current URL", async () => {
      const result = await getURL.execute(ctx, {});
      expect(result.status).toBe("success");
      expect(result.data?.url).toBe("https://example.com");
    });
  });

  describe("wait_for_load_state", () => {
    it("should wait for load state with default", async () => {
      const result = await waitForLoadState.execute(ctx, {});
      expect(result.status).toBe("success");
      expect(mockPage.waitForLoadState).toHaveBeenCalledWith("load", { timeout: undefined });
    });

    it("should wait for networkidle", async () => {
      const result = await waitForLoadState.execute(ctx, { state: "networkidle" });
      expect(result.status).toBe("success");
      expect(mockPage.waitForLoadState).toHaveBeenCalledWith("networkidle", { timeout: undefined });
    });

    it("should wait with timeout", async () => {
      const result = await waitForLoadState.execute(ctx, {
        state: "domcontentloaded",
        timeout: 15000,
      });
      expect(result.status).toBe("success");
      expect(mockPage.waitForLoadState).toHaveBeenCalledWith("domcontentloaded", { timeout: 15000 });
    });
  });
});
