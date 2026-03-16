import { createMockPage } from "../helpers/mockPage";
import { ToolContext } from "../../src/types/toolTypes";
import { selectOption } from "../../src/tools/selectOption";
import { check } from "../../src/tools/check";
import { uncheck } from "../../src/tools/uncheck";
import { press } from "../../src/tools/press";
import { type } from "../../src/tools/type";
import { focus } from "../../src/tools/focus";
import { getAttribute } from "../../src/tools/getAttribute";
import { evaluate } from "../../src/tools/evaluate";
import { dragAndDrop } from "../../src/tools/dragAndDrop";
import { uploadFile } from "../../src/tools/uploadFile";

jest.mock("../../src/utils/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe("Additional Interaction Tools", () => {
  let ctx: ToolContext;
  let mockPage: ReturnType<typeof createMockPage>;

  beforeEach(() => {
    mockPage = createMockPage();
    ctx = { page: mockPage, sessionId: "test-session" };
  });

  describe("select_option", () => {
    it("should select a single option", async () => {
      const result = await selectOption.execute(ctx, { selector: "#country", values: "us" });
      expect(result.status).toBe("success");
      expect(mockPage.selectOption).toHaveBeenCalledWith("#country", "us");
      expect(result.data?.selected).toBeDefined();
    });

    it("should select multiple options", async () => {
      const result = await selectOption.execute(ctx, {
        selector: "#colors",
        values: ["red", "blue"],
      });
      expect(result.status).toBe("success");
      expect(mockPage.selectOption).toHaveBeenCalledWith("#colors", ["red", "blue"]);
    });

    it("should wait for selector with timeout", async () => {
      const result = await selectOption.execute(ctx, {
        selector: "#lang",
        values: "en",
        timeout: 3000,
      });
      expect(result.status).toBe("success");
      expect(mockPage.waitForSelector).toHaveBeenCalledWith("#lang", { timeout: 3000 });
    });
  });

  describe("check", () => {
    it("should check a checkbox", async () => {
      const result = await check.execute(ctx, { selector: "#terms" });
      expect(result.status).toBe("success");
      expect(mockPage.check).toHaveBeenCalledWith("#terms", { timeout: undefined });
      expect(result.data?.checked).toBe(true);
    });
  });

  describe("uncheck", () => {
    it("should uncheck a checkbox", async () => {
      const result = await uncheck.execute(ctx, { selector: "#newsletter" });
      expect(result.status).toBe("success");
      expect(mockPage.uncheck).toHaveBeenCalledWith("#newsletter", { timeout: undefined });
      expect(result.data?.unchecked).toBe(true);
    });
  });

  describe("press", () => {
    it("should press Enter", async () => {
      const result = await press.execute(ctx, { selector: "#search", key: "Enter" });
      expect(result.status).toBe("success");
      expect(mockPage.press).toHaveBeenCalledWith("#search", "Enter", { timeout: undefined });
      expect(result.data?.key).toBe("Enter");
    });

    it("should press key combo", async () => {
      const result = await press.execute(ctx, { selector: "#editor", key: "Control+a" });
      expect(result.status).toBe("success");
      expect(mockPage.press).toHaveBeenCalledWith("#editor", "Control+a", { timeout: undefined });
    });
  });

  describe("type", () => {
    it("should type text character by character", async () => {
      const result = await type.execute(ctx, { selector: "#search", text: "hello" });
      expect(result.status).toBe("success");
      expect(result.data?.typed).toBe(true);
      expect(result.data?.length).toBe(5);
    });

    it("should type with delay", async () => {
      const locator = mockPage.locator("#input").first();
      const result = await type.execute(ctx, {
        selector: "#input",
        text: "slow",
        delay: 100,
      });
      expect(result.status).toBe("success");
    });
  });

  describe("focus", () => {
    it("should focus an element", async () => {
      const result = await focus.execute(ctx, { selector: "#username" });
      expect(result.status).toBe("success");
      expect(mockPage.focus).toHaveBeenCalledWith("#username");
      expect(result.data?.focused).toBe(true);
    });
  });

  describe("get_attribute", () => {
    it("should get an attribute value", async () => {
      const result = await getAttribute.execute(ctx, {
        selector: "a.link",
        attribute: "href",
      });
      expect(result.status).toBe("success");
      expect(result.data?.attribute).toBe("href");
      expect(result.data?.value).toBeDefined();
    });
  });

  describe("evaluate", () => {
    it("should execute JavaScript expression", async () => {
      const result = await evaluate.execute(ctx, { expression: "document.title" });
      expect(result.status).toBe("success");
      expect(mockPage.evaluate).toHaveBeenCalledWith("document.title");
      expect(result.data?.result).toBe("eval-result");
    });
  });

  describe("drag_and_drop", () => {
    it("should drag and drop between elements", async () => {
      const result = await dragAndDrop.execute(ctx, {
        source: "#draggable",
        target: "#dropzone",
      });
      expect(result.status).toBe("success");
      expect(mockPage.dragAndDrop).toHaveBeenCalledWith("#draggable", "#dropzone");
      expect(result.data?.dropped).toBe(true);
    });

    it("should wait for elements with timeout", async () => {
      const result = await dragAndDrop.execute(ctx, {
        source: "#src",
        target: "#tgt",
        timeout: 5000,
      });
      expect(result.status).toBe("success");
      expect(mockPage.waitForSelector).toHaveBeenCalledWith("#src", { timeout: 5000 });
      expect(mockPage.waitForSelector).toHaveBeenCalledWith("#tgt", { timeout: 5000 });
    });
  });

  describe("upload_file", () => {
    it("should upload a single file", async () => {
      const result = await uploadFile.execute(ctx, {
        selector: "input[type='file']",
        files: "/path/to/file.txt",
      });
      expect(result.status).toBe("success");
      expect(mockPage.setInputFiles).toHaveBeenCalledWith("input[type='file']", "/path/to/file.txt", { timeout: undefined });
      expect(result.data?.uploaded).toBe(true);
    });

    it("should upload multiple files with timeout", async () => {
      const result = await uploadFile.execute(ctx, {
        selector: "#upload",
        files: ["file1.png", "file2.png"],
        timeout: 5000,
      });
      expect(result.status).toBe("success");
      expect(mockPage.setInputFiles).toHaveBeenCalledWith("#upload", ["file1.png", "file2.png"], { timeout: 5000 });
    });
  });
});
