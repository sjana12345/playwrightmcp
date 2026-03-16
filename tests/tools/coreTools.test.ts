import { createMockPage } from "../helpers/mockPage";
import { ToolContext } from "../../src/types/toolTypes";
import { navigate } from "../../src/tools/navigate";
import { click } from "../../src/tools/click";
import { fill } from "../../src/tools/fill";
import { hover } from "../../src/tools/hover";
import { waitForSelector } from "../../src/tools/waitForSelector";
import { screenshot } from "../../src/tools/screenshot";
import { extractText } from "../../src/tools/extractText";
import { waitForTimeout } from "../../src/tools/waitForTimeout";
import { pause } from "../../src/tools/pause";

jest.mock("../../src/utils/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe("Core Interaction Tools", () => {
  let ctx: ToolContext;
  let mockPage: ReturnType<typeof createMockPage>;

  beforeEach(() => {
    mockPage = createMockPage();
    ctx = { page: mockPage, sessionId: "test-session" };
  });

  describe("navigate", () => {
    it("should navigate to a URL with default waitUntil", async () => {
      const result = await navigate.execute(ctx, { url: "https://example.com" });
      expect(result.status).toBe("success");
      expect(mockPage.goto).toHaveBeenCalledWith("https://example.com", { waitUntil: "load" });
      expect(result.data?.url).toBe("https://example.com");
      expect(result.data?.title).toBe("Example Page");
      expect(result.data?.statusCode).toBe(200);
    });

    it("should navigate with custom waitUntil", async () => {
      const result = await navigate.execute(ctx, {
        url: "https://example.com",
        waitUntil: "networkidle",
      });
      expect(result.status).toBe("success");
      expect(mockPage.goto).toHaveBeenCalledWith("https://example.com", { waitUntil: "networkidle" });
    });

    it("should reject invalid URL", async () => {
      await expect(navigate.execute(ctx, { url: "not-a-url" })).rejects.toThrow();
    });
  });

  describe("click", () => {
    it("should click with default options", async () => {
      const result = await click.execute(ctx, { selector: "#btn" });
      expect(result.status).toBe("success");
      expect(mockPage.click).toHaveBeenCalledWith("#btn", { button: "left", clickCount: 1, timeout: undefined });
      expect(result.data?.clicked).toBe(true);
    });

    it("should click with right button", async () => {
      const result = await click.execute(ctx, { selector: "#btn", button: "right" });
      expect(result.status).toBe("success");
      expect(mockPage.click).toHaveBeenCalledWith("#btn", expect.objectContaining({ button: "right" }));
    });

    it("should double-click", async () => {
      const result = await click.execute(ctx, { selector: "#btn", clickCount: 2 });
      expect(result.status).toBe("success");
      expect(mockPage.click).toHaveBeenCalledWith("#btn", expect.objectContaining({ clickCount: 2 }));
    });

    it("should reject empty selector", async () => {
      await expect(click.execute(ctx, { selector: "" })).rejects.toThrow();
    });
  });

  describe("fill", () => {
    it("should fill an input", async () => {
      const result = await fill.execute(ctx, { selector: "#email", value: "test@test.com" });
      expect(result.status).toBe("success");
      expect(mockPage.fill).toHaveBeenCalledWith("#email", "test@test.com", { timeout: undefined });
      expect(result.data?.filled).toBe(true);
    });

    it("should fill with timeout", async () => {
      const result = await fill.execute(ctx, { selector: "#email", value: "test", timeout: 5000 });
      expect(mockPage.fill).toHaveBeenCalledWith("#email", "test", { timeout: 5000 });
      expect(result.status).toBe("success");
    });

    it("should fill with empty value", async () => {
      const result = await fill.execute(ctx, { selector: "#email", value: "" });
      expect(result.status).toBe("success");
    });
  });

  describe("hover", () => {
    it("should hover over an element", async () => {
      const result = await hover.execute(ctx, { selector: ".menu" });
      expect(result.status).toBe("success");
      expect(mockPage.hover).toHaveBeenCalledWith(".menu", { timeout: undefined });
      expect(result.data?.hovered).toBe(true);
    });
  });

  describe("wait_for_selector", () => {
    it("should wait for visible state by default", async () => {
      const result = await waitForSelector.execute(ctx, { selector: ".loading" });
      expect(result.status).toBe("success");
      expect(mockPage.waitForSelector).toHaveBeenCalledWith(".loading", { state: "visible", timeout: undefined });
    });

    it("should wait for hidden state", async () => {
      const result = await waitForSelector.execute(ctx, { selector: ".spinner", state: "hidden" });
      expect(result.status).toBe("success");
      expect(mockPage.waitForSelector).toHaveBeenCalledWith(".spinner", { state: "hidden", timeout: undefined });
    });

    it("should wait for detached state with timeout", async () => {
      const result = await waitForSelector.execute(ctx, {
        selector: ".modal",
        state: "detached",
        timeout: 10000,
      });
      expect(result.status).toBe("success");
      expect(mockPage.waitForSelector).toHaveBeenCalledWith(".modal", { state: "detached", timeout: 10000 });
    });
  });

  describe("screenshot", () => {
    it("should take viewport screenshot by default", async () => {
      const result = await screenshot.execute(ctx, {});
      expect(result.status).toBe("success");
      expect(mockPage.screenshot).toHaveBeenCalled();
      expect(result.data?.base64).toBeDefined();
      expect(result.data?.type).toBe("png");
    });

    it("should take full page screenshot", async () => {
      const result = await screenshot.execute(ctx, { fullPage: true });
      expect(result.status).toBe("success");
      expect(mockPage.screenshot).toHaveBeenCalledWith(expect.objectContaining({ fullPage: true }));
    });

    it("should take element screenshot", async () => {
      const result = await screenshot.execute(ctx, { selector: "#chart" });
      expect(result.status).toBe("success");
      expect(mockPage.locator).toHaveBeenCalledWith("#chart");
    });

    it("should take jpeg screenshot with quality", async () => {
      const result = await screenshot.execute(ctx, { type: "jpeg", quality: 80 });
      expect(result.status).toBe("success");
      expect(result.data?.type).toBe("jpeg");
    });
  });

  describe("extract_text", () => {
    it("should extract text from an element", async () => {
      const result = await extractText.execute(ctx, { selector: "h1" });
      expect(result.status).toBe("success");
      expect(mockPage.waitForSelector).toHaveBeenCalledWith("h1", { state: "visible", timeout: undefined });
      expect(result.data?.text).toBeDefined();
    });
  });

  describe("wait_for_timeout", () => {
    it("should wait for the specified timeout", async () => {
      const result = await waitForTimeout.execute(ctx, { timeout: 1000 });
      expect(result.status).toBe("success");
      expect(mockPage.waitForTimeout).toHaveBeenCalledWith(1000);
      expect(result.data?.timeout).toBe(1000);
    });
  });

  describe("pause", () => {
    it("should pause execution", async () => {
      const result = await pause.execute(ctx, {});
      expect(result.status).toBe("success");
      expect(mockPage.pause).toHaveBeenCalled();
      expect(result.data?.paused).toBe(true);
    });
  });
});
