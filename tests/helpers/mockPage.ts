import { Page } from "playwright";

export function createMockLocator(overrides: Record<string, unknown> = {}) {
  const locator: any = {
    first: jest.fn().mockReturnThis(),
    nth: jest.fn().mockReturnThis(),
    count: jest.fn().mockResolvedValue(1),
    innerText: jest.fn().mockResolvedValue("mock text"),
    isVisible: jest.fn().mockResolvedValue(true),
    isChecked: jest.fn().mockResolvedValue(true),
    isEnabled: jest.fn().mockResolvedValue(true),
    inputValue: jest.fn().mockResolvedValue("mock value"),
    getAttribute: jest.fn().mockResolvedValue("mock-attr"),
    boundingBox: jest.fn().mockResolvedValue({ x: 0, y: 0, width: 100, height: 50 }),
    waitFor: jest.fn().mockResolvedValue(undefined),
    screenshot: jest.fn().mockResolvedValue(Buffer.from("fake-screenshot")),
    evaluate: jest.fn().mockImplementation((fn: Function) => {
      if (typeof fn === "function") {
        const mockEl = {
          tagName: "DIV",
          attributes: [{ name: "class", value: "mock" }],
        };
        return Promise.resolve(fn(mockEl));
      }
      return Promise.resolve("div");
    }),
    pressSequentially: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  return locator;
}

export function createMockPage(overrides: Record<string, unknown> = {}): Page {
  const mockLocator = createMockLocator();

  const page: any = {
    goto: jest.fn().mockResolvedValue({ status: () => 200 }),
    url: jest.fn().mockReturnValue("https://example.com"),
    title: jest.fn().mockResolvedValue("Example Page"),
    click: jest.fn().mockResolvedValue(undefined),
    fill: jest.fn().mockResolvedValue(undefined),
    hover: jest.fn().mockResolvedValue(undefined),
    focus: jest.fn().mockResolvedValue(undefined),
    press: jest.fn().mockResolvedValue(undefined),
    check: jest.fn().mockResolvedValue(undefined),
    uncheck: jest.fn().mockResolvedValue(undefined),
    selectOption: jest.fn().mockResolvedValue(["option1"]),
    dragAndDrop: jest.fn().mockResolvedValue(undefined),
    waitForSelector: jest.fn().mockResolvedValue({}),
    waitForLoadState: jest.fn().mockResolvedValue(undefined),
    waitForTimeout: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn().mockResolvedValue(undefined),
    goBack: jest.fn().mockResolvedValue({ status: () => 200 }),
    goForward: jest.fn().mockResolvedValue({ status: () => 200 }),
    reload: jest.fn().mockResolvedValue({ status: () => 200 }),
    screenshot: jest.fn().mockResolvedValue(Buffer.from("fake-screenshot")),
    evaluate: jest.fn().mockResolvedValue("eval-result"),
    locator: jest.fn().mockReturnValue(mockLocator),
    getByText: jest.fn().mockReturnValue(mockLocator),
    getByRole: jest.fn().mockReturnValue(mockLocator),
    getByLabel: jest.fn().mockReturnValue(mockLocator),
    getByPlaceholder: jest.fn().mockReturnValue(mockLocator),
    getByTestId: jest.fn().mockReturnValue(mockLocator),
    ...overrides,
  };

  return page as Page;
}
