import { createMockPage, createMockLocator } from "../helpers/mockPage";
import { ToolContext } from "../../src/types/toolTypes";
import { testLocator } from "../../src/tools/testLocator";
import { getByText } from "../../src/tools/getByText";
import { getByRole } from "../../src/tools/getByRole";
import { getByLabel } from "../../src/tools/getByLabel";
import { getByPlaceholder } from "../../src/tools/getByPlaceholder";
import { getByTestId } from "../../src/tools/getByTestId";
import { highlightLocator } from "../../src/tools/highlightLocator";

jest.mock("../../src/utils/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe("Locator Tools", () => {
  let ctx: ToolContext;
  let mockPage: ReturnType<typeof createMockPage>;

  beforeEach(() => {
    mockPage = createMockPage();
    ctx = { page: mockPage, sessionId: "test-session" };
  });

  describe("test_locator", () => {
    it("should return element details for a selector", async () => {
      const result = await testLocator.execute(ctx, { selector: "button" });
      expect(result.status).toBe("success");
      expect(result.data?.selector).toBe("button");
      expect(result.data?.locator).toBe("button");
      expect(result.data?.totalCount).toBe(1);
      expect(result.data?.elements).toBeInstanceOf(Array);
    });

    it("should include locator in each element", async () => {
      const result = await testLocator.execute(ctx, { selector: "button" });
      const elements = result.data?.elements as any[];
      expect(elements[0].locator).toBe("button");
    });

    it("should append nth for multiple elements", async () => {
      const multiLocator = createMockLocator({
        count: jest.fn().mockResolvedValue(3),
      });
      (mockPage.locator as jest.Mock).mockReturnValue(multiLocator);

      const result = await testLocator.execute(ctx, { selector: ".card", maxResults: 2 });
      expect(result.status).toBe("success");
      expect(result.data?.totalCount).toBe(3);
      expect(result.data?.showing).toBe(2);
    });

    it("should respect maxResults", async () => {
      const result = await testLocator.execute(ctx, { selector: "div", maxResults: 1 });
      expect(result.status).toBe("success");
      const elements = result.data?.elements as any[];
      expect(elements.length).toBeLessThanOrEqual(1);
    });
  });

  describe("get_by_text", () => {
    it("should find elements by text (contains)", async () => {
      const result = await getByText.execute(ctx, { text: "Sign In" });
      expect(result.status).toBe("success");
      expect(mockPage.getByText).toHaveBeenCalledWith("Sign In", { exact: false });
      expect(result.data?.locator).toBe("text=Sign In");
      expect(result.data?.totalCount).toBe(1);
    });

    it("should find elements by text (exact)", async () => {
      const result = await getByText.execute(ctx, { text: "Sign In", exact: true });
      expect(result.status).toBe("success");
      expect(mockPage.getByText).toHaveBeenCalledWith("Sign In", { exact: true });
      expect(result.data?.locator).toBe('text="Sign In"');
    });

    it("should include locator per element", async () => {
      const result = await getByText.execute(ctx, { text: "Link" });
      const elements = result.data?.elements as any[];
      expect(elements[0].locator).toBeDefined();
    });
  });

  describe("get_by_role", () => {
    it("should find elements by role", async () => {
      const result = await getByRole.execute(ctx, { role: "button" });
      expect(result.status).toBe("success");
      expect(mockPage.getByRole).toHaveBeenCalled();
      expect(result.data?.locator).toBe("role=button");
    });

    it("should find elements by role with name", async () => {
      const result = await getByRole.execute(ctx, { role: "button", name: "Submit" });
      expect(result.status).toBe("success");
      expect(result.data?.locator).toBe('role=button[name="Submit"]');
    });

    it("should pass filter options", async () => {
      const result = await getByRole.execute(ctx, {
        role: "checkbox",
        checked: false,
        disabled: true,
      });
      expect(result.status).toBe("success");
      expect(mockPage.getByRole).toHaveBeenCalledWith(
        "checkbox",
        expect.objectContaining({ checked: false, disabled: true })
      );
    });
  });

  describe("get_by_label", () => {
    it("should find elements by label", async () => {
      const result = await getByLabel.execute(ctx, { text: "Email" });
      expect(result.status).toBe("success");
      expect(mockPage.getByLabel).toHaveBeenCalledWith("Email", { exact: false });
      expect(result.data?.locator).toBe("label=Email");
    });

    it("should find by exact label", async () => {
      const result = await getByLabel.execute(ctx, { text: "Email Address", exact: true });
      expect(result.status).toBe("success");
      expect(result.data?.locator).toBe('label="Email Address"');
    });

    it("should return inputType for each element", async () => {
      const result = await getByLabel.execute(ctx, { text: "Email" });
      const elements = result.data?.elements as any[];
      expect(elements[0]).toHaveProperty("inputType");
    });
  });

  describe("get_by_placeholder", () => {
    it("should find elements by placeholder", async () => {
      const result = await getByPlaceholder.execute(ctx, { text: "Search" });
      expect(result.status).toBe("success");
      expect(mockPage.getByPlaceholder).toHaveBeenCalledWith("Search", { exact: false });
      expect(result.data?.locator).toBe('[placeholder*="Search"]');
    });

    it("should find by exact placeholder", async () => {
      const result = await getByPlaceholder.execute(ctx, {
        text: "Enter email",
        exact: true,
      });
      expect(result.status).toBe("success");
      expect(result.data?.locator).toBe('[placeholder="Enter email"]');
    });
  });

  describe("get_by_test_id", () => {
    it("should find elements by data-testid", async () => {
      const result = await getByTestId.execute(ctx, { testId: "login-btn" });
      expect(result.status).toBe("success");
      expect(mockPage.getByTestId).toHaveBeenCalledWith("login-btn");
      expect(result.data?.locator).toBe('[data-testid="login-btn"]');
    });

    it("should include locator per element", async () => {
      const result = await getByTestId.execute(ctx, { testId: "nav" });
      const elements = result.data?.elements as any[];
      expect(elements[0].locator).toBe('[data-testid="nav"]');
    });
  });

  describe("highlight_locator", () => {
    it("should highlight elements and return screenshot", async () => {
      const result = await highlightLocator.execute(ctx, { selector: "button" });
      expect(result.status).toBe("success");
      expect(result.data?.locator).toBe("button");
      expect(result.data?.matchCount).toBe(1);
      expect(result.data?.highlighted).toBe(true);
      expect(result.data?.screenshot).toBeDefined();
    });

    it("should return error when no elements found", async () => {
      const emptyLocator = createMockLocator({ count: jest.fn().mockResolvedValue(0) });
      (mockPage.locator as jest.Mock).mockReturnValue(emptyLocator);

      const result = await highlightLocator.execute(ctx, { selector: ".nonexistent" });
      expect(result.status).toBe("error");
      expect(result.error).toContain("No elements found");
    });

    it("should use custom color and duration", async () => {
      const result = await highlightLocator.execute(ctx, {
        selector: "a",
        color: "rgba(0,255,0,0.5)",
        duration: 5000,
      });
      expect(result.status).toBe("success");
      expect(mockPage.evaluate).toHaveBeenCalled();
    });
  });
});
