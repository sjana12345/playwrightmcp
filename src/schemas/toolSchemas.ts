import { z } from "zod";

export const navigateSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  waitUntil: z
    .enum(["load", "domcontentloaded", "networkidle", "commit"])
    .optional()
    .default("load"),
});

export const clickSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  button: z.enum(["left", "right", "middle"]).optional().default("left"),
  clickCount: z.number().int().positive().optional().default(1),
  timeout: z.number().int().positive().optional(),
});

export const fillSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  value: z.string(),
  timeout: z.number().int().positive().optional(),
});

export const hoverSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  timeout: z.number().int().positive().optional(),
});

export const waitForSelectorSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  state: z
    .enum(["attached", "detached", "visible", "hidden"])
    .optional()
    .default("visible"),
  timeout: z.number().int().positive().optional(),
});

export const screenshotSchema = z.object({
  selector: z.string().optional(),
  fullPage: z.boolean().optional().default(false),
  type: z.enum(["png", "jpeg"]).optional().default("png"),
  quality: z.number().int().min(0).max(100).optional(),
});

export const extractTextSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  timeout: z.number().int().positive().optional(),
});

// Assertion schemas
export const assertTextSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  expected: z.string(),
  exact: z.boolean().optional().default(false),
  timeout: z.number().int().positive().optional(),
});

export const assertVisibleSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  timeout: z.number().int().positive().optional(),
});

export const assertHiddenSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  timeout: z.number().int().positive().optional(),
});

export const assertTitleSchema = z.object({
  expected: z.string(),
  exact: z.boolean().optional().default(false),
});

export const assertURLSchema = z.object({
  expected: z.string(),
  exact: z.boolean().optional().default(true),
});

export const assertElementCountSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  count: z.number().int().nonnegative(),
  timeout: z.number().int().positive().optional(),
});

export const assertAttributeSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  attribute: z.string().min(1, "Attribute name is required"),
  expected: z.string().nullable(),
  timeout: z.number().int().positive().optional(),
});

export const assertCheckedSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  checked: z.boolean().optional().default(true),
  timeout: z.number().int().positive().optional(),
});

export const assertEnabledSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  enabled: z.boolean().optional().default(true),
  timeout: z.number().int().positive().optional(),
});

export const assertValueSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  expected: z.string(),
  timeout: z.number().int().positive().optional(),
});

// Additional Playwright tool schemas
export const selectOptionSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  values: z.union([z.string(), z.array(z.string())]),
  timeout: z.number().int().positive().optional(),
});

export const checkSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  timeout: z.number().int().positive().optional(),
});

export const uncheckSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  timeout: z.number().int().positive().optional(),
});

export const pressSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  key: z.string().min(1, "Key is required"),
  timeout: z.number().int().positive().optional(),
});

export const typeSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  text: z.string(),
  delay: z.number().int().nonnegative().optional(),
  timeout: z.number().int().positive().optional(),
});

export const focusSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  timeout: z.number().int().positive().optional(),
});

export const getAttributeSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  attribute: z.string().min(1, "Attribute name is required"),
  timeout: z.number().int().positive().optional(),
});

export const evaluateSchema = z.object({
  expression: z.string().min(1, "JavaScript expression is required"),
});

export const dragAndDropSchema = z.object({
  source: z.string().min(1, "Source selector is required"),
  target: z.string().min(1, "Target selector is required"),
  timeout: z.number().int().positive().optional(),
});

export const waitForLoadStateSchema = z.object({
  state: z
    .enum(["load", "domcontentloaded", "networkidle"])
    .optional()
    .default("load"),
  timeout: z.number().int().positive().optional(),
});

export const reloadSchema = z.object({
  waitUntil: z
    .enum(["load", "domcontentloaded", "networkidle", "commit"])
    .optional()
    .default("load"),
  timeout: z.number().int().positive().optional(),
});

// Locator schemas
export const testLocatorSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  maxResults: z.number().int().positive().optional().default(5),
  timeout: z.number().int().positive().optional(),
});

export const getByTextSchema = z.object({
  text: z.string().min(1, "Text is required"),
  exact: z.boolean().optional().default(false),
});

export const getByRoleSchema = z.object({
  role: z.string().min(1, "Role is required"),
  name: z.string().optional(),
  checked: z.boolean().optional(),
  disabled: z.boolean().optional(),
  expanded: z.boolean().optional(),
  pressed: z.boolean().optional(),
  selected: z.boolean().optional(),
});

export const getByLabelSchema = z.object({
  text: z.string().min(1, "Label text is required"),
  exact: z.boolean().optional().default(false),
});

export const getByPlaceholderSchema = z.object({
  text: z.string().min(1, "Placeholder text is required"),
  exact: z.boolean().optional().default(false),
});

export const getByTestIdSchema = z.object({
  testId: z.string().min(1, "Test ID is required"),
});

export const highlightLocatorSchema = z.object({
  selector: z.string().min(1, "Selector is required"),
  color: z.string().optional().default("rgba(255, 0, 0, 0.3)"),
  duration: z.number().int().positive().optional().default(3000),
});

export const zephyrTestExecutionSchema = z.object({
  projectKey: z.string().min(1, "Project key is required"),
  testCaseKey: z.string().min(1, "Test case key is required"),
  statusName: z.enum(["Pass", "Fail", "Blocked", "WIP", "Unexecuted"]),
  testCycleKey: z.string().optional(),
  comment: z.string().optional(),
  executionTime: z.number().int().nonnegative().optional(),
  environmentName: z.string().optional(),
  actualEndDate: z.string().datetime().optional(),
});

export const zephyrUpdateTestSchema = z.union([
  zephyrTestExecutionSchema,
  z.array(zephyrTestExecutionSchema),
]);

export const toolRequestSchema = z.object({
  tool: z.string().min(1, "Tool name is required"),
  sessionId: z.string().min(1, "Session ID is required"),
  args: z.union([z.record(z.unknown()), z.array(z.unknown())]).optional().default({}),
});

export const sessionStartSchema = z.object({
  viewport: z
    .object({
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .optional(),
  userAgent: z.string().optional(),
});

export const workflowStepSchema = z.object({
  tool: z.string().min(1, "Tool name is required"),
  args: z.record(z.unknown()).optional().default({}),
});

export const workflowRequestSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  steps: z.array(workflowStepSchema).min(1, "At least one step is required"),
  stopOnFailure: z.boolean().optional().default(true),
});
