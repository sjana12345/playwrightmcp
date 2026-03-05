import { createMockPage, createMockLocator } from "../helpers/mockPage";
import { ToolContext } from "../../src/types/toolTypes";
import { assertText } from "../../src/tools/assertText";
import { assertVisible } from "../../src/tools/assertVisible";
import { assertHidden } from "../../src/tools/assertHidden";
import { assertTitle } from "../../src/tools/assertTitle";
import { assertURL } from "../../src/tools/assertURL";
import { assertElementCount } from "../../src/tools/assertElementCount";
import { assertAttribute } from "../../src/tools/assertAttribute";
import { assertChecked } from "../../src/tools/assertChecked";
import { assertEnabled } from "../../src/tools/assertEnabled";
import { assertValue } from "../../src/tools/assertValue";

jest.mock("../../src/utils/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe("Assertion Tools", () => {
  let ctx: ToolContext;
  let mockPage: ReturnType<typeof createMockPage>;

  beforeEach(() => {
    mockPage = createMockPage();
    ctx = { page: mockPage, sessionId: "test-session" };
  });

  describe("assert_text", () => {
    it("should pass when text contains expected (default)", async () => {
      const result = await assertText.execute(ctx, {
        selector: "h1",
        expected: "mock",
      });
      expect(result.status).toBe("success");
      expect(result.data?.passed).toBe(true);
    });

    it("should pass when text exactly matches", async () => {
      const result = await assertText.execute(ctx, {
        selector: "h1",
        expected: "mock text",
        exact: true,
      });
      expect(result.status).toBe("success");
      expect(result.data?.passed).toBe(true);
    });

    it("should fail when text does not contain expected", async () => {
      const result = await assertText.execute(ctx, {
        selector: "h1",
        expected: "nonexistent",
      });
      expect(result.status).toBe("error");
      expect(result.error).toContain("Text assertion failed");
    });

    it("should fail on exact mismatch", async () => {
      const result = await assertText.execute(ctx, {
        selector: "h1",
        expected: "mock",
        exact: true,
      });
      expect(result.status).toBe("error");
    });
  });

  describe("assert_visible", () => {
    it("should pass when element is visible", async () => {
      const result = await assertVisible.execute(ctx, { selector: "#main" });
      expect(result.status).toBe("success");
      expect(result.data?.visible).toBe(true);
    });

    it("should fail when element is not visible", async () => {
      const hiddenLocator = createMockLocator({ isVisible: jest.fn().mockResolvedValue(false) });
      (mockPage.locator as jest.Mock).mockReturnValue(hiddenLocator);

      const result = await assertVisible.execute(ctx, { selector: "#hidden" });
      expect(result.status).toBe("error");
      expect(result.error).toContain("not visible");
    });
  });

  describe("assert_hidden", () => {
    it("should pass when element is hidden", async () => {
      const hiddenLocator = createMockLocator({ isVisible: jest.fn().mockResolvedValue(false) });
      (mockPage.locator as jest.Mock).mockReturnValue(hiddenLocator);

      const result = await assertHidden.execute(ctx, { selector: ".spinner" });
      expect(result.status).toBe("success");
      expect(result.data?.hidden).toBe(true);
    });

    it("should fail when element is still visible", async () => {
      const result = await assertHidden.execute(ctx, { selector: ".spinner" });
      expect(result.status).toBe("error");
      expect(result.error).toContain("still visible");
    });
  });

  describe("assert_title", () => {
    it("should pass when title contains expected", async () => {
      const result = await assertTitle.execute(ctx, { expected: "Example" });
      expect(result.status).toBe("success");
      expect(result.data?.passed).toBe(true);
    });

    it("should pass on exact title match", async () => {
      const result = await assertTitle.execute(ctx, {
        expected: "Example Page",
        exact: true,
      });
      expect(result.status).toBe("success");
    });

    it("should fail when title does not match", async () => {
      const result = await assertTitle.execute(ctx, { expected: "Wrong Title", exact: true });
      expect(result.status).toBe("error");
      expect(result.error).toContain("Title assertion failed");
    });
  });

  describe("assert_url", () => {
    it("should pass on exact URL match (default exact=true)", async () => {
      const result = await assertURL.execute(ctx, { expected: "https://example.com" });
      expect(result.status).toBe("success");
    });

    it("should pass on partial URL match", async () => {
      const result = await assertURL.execute(ctx, {
        expected: "example",
        exact: false,
      });
      expect(result.status).toBe("success");
    });

    it("should fail on URL mismatch", async () => {
      const result = await assertURL.execute(ctx, { expected: "https://other.com" });
      expect(result.status).toBe("error");
      expect(result.error).toContain("URL assertion failed");
    });
  });

  describe("assert_element_count", () => {
    it("should pass when count matches", async () => {
      const result = await assertElementCount.execute(ctx, {
        selector: ".item",
        count: 1,
      });
      expect(result.status).toBe("success");
      expect(result.data?.passed).toBe(true);
    });

    it("should fail when count does not match", async () => {
      const result = await assertElementCount.execute(ctx, {
        selector: ".item",
        count: 5,
      });
      expect(result.status).toBe("error");
      expect(result.error).toContain("Element count assertion failed");
    });

    it("should assert zero elements", async () => {
      const zeroLocator = createMockLocator({ count: jest.fn().mockResolvedValue(0) });
      (mockPage.locator as jest.Mock).mockReturnValue(zeroLocator);

      const result = await assertElementCount.execute(ctx, {
        selector: ".error",
        count: 0,
      });
      expect(result.status).toBe("success");
    });
  });

  describe("assert_attribute", () => {
    it("should pass when attribute matches", async () => {
      const result = await assertAttribute.execute(ctx, {
        selector: "a",
        attribute: "href",
        expected: "mock-attr",
      });
      expect(result.status).toBe("success");
      expect(result.data?.passed).toBe(true);
    });

    it("should fail when attribute does not match", async () => {
      const result = await assertAttribute.execute(ctx, {
        selector: "a",
        attribute: "href",
        expected: "wrong-value",
      });
      expect(result.status).toBe("error");
    });

    it("should check for null (attribute not present)", async () => {
      const nullLocator = createMockLocator({ getAttribute: jest.fn().mockResolvedValue(null) });
      (mockPage.locator as jest.Mock).mockReturnValue(nullLocator);

      const result = await assertAttribute.execute(ctx, {
        selector: "#btn",
        attribute: "disabled",
        expected: null,
      });
      expect(result.status).toBe("success");
    });
  });

  describe("assert_checked", () => {
    it("should pass when checked matches expected (default true)", async () => {
      const result = await assertChecked.execute(ctx, { selector: "#terms" });
      expect(result.status).toBe("success");
      expect(result.data?.passed).toBe(true);
    });

    it("should fail when checked state mismatches", async () => {
      const result = await assertChecked.execute(ctx, {
        selector: "#terms",
        checked: false,
      });
      expect(result.status).toBe("error");
      expect(result.error).toContain("Checked assertion failed");
    });
  });

  describe("assert_enabled", () => {
    it("should pass when enabled matches expected (default true)", async () => {
      const result = await assertEnabled.execute(ctx, { selector: "#submit" });
      expect(result.status).toBe("success");
      expect(result.data?.passed).toBe(true);
    });

    it("should fail when enabled state mismatches", async () => {
      const result = await assertEnabled.execute(ctx, {
        selector: "#submit",
        enabled: false,
      });
      expect(result.status).toBe("error");
      expect(result.error).toContain("Enabled assertion failed");
    });
  });

  describe("assert_value", () => {
    it("should pass when input value matches", async () => {
      const result = await assertValue.execute(ctx, {
        selector: "#email",
        expected: "mock value",
      });
      expect(result.status).toBe("success");
      expect(result.data?.passed).toBe(true);
    });

    it("should fail when input value does not match", async () => {
      const result = await assertValue.execute(ctx, {
        selector: "#email",
        expected: "wrong",
      });
      expect(result.status).toBe("error");
      expect(result.error).toContain("Value assertion failed");
    });
  });
});
