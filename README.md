# Playwright MCP Server - API Documentation

Base URL: `http://localhost:3002` (configurable via `PORT` and `HOST` env vars)

All request/response bodies are JSON. Set `Content-Type: application/json` for all POST requests.

---

## Table of Contents

- [Server Endpoints](#server-endpoints)
  - [Health Check](#health-check)
  - [List Tools](#list-tools)
  - [Start Session](#start-session)
  - [Close Session](#close-session)
  - [List Sessions](#list-sessions)
  - [Execute Tool](#execute-tool)
  - [Execute Workflow](#execute-workflow)
- [Environment Variables](#environment-variables)
- [Tool Reference](#tool-reference)
  - [Core Interaction Tools](#core-interaction-tools)
  - [Additional Interaction Tools](#additional-interaction-tools)
  - [Navigation Tools](#navigation-tools)
  - [Page Info Tools](#page-info-tools)
  - [Locator Tools](#locator-tools)
  - [Assertion Tools](#assertion-tools)
  - [Zephyr Tools](#zephyr-tools)
  - [Database Tools (OTP)](#database-tools-otp)
- [Error Handling](#error-handling)

---

## Server Endpoints

### Health Check

```
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "sessions": 2
}
```

---

### List Tools

```
GET /tools
```

**Response:**

```json
{
  "tools": [
    { "name": "navigate", "description": "Navigate to a URL" },
    { "name": "click", "description": "Click an element matching the given selector" }
  ]
}
```

---

### Start Session

```
POST /session/start
```

Creates a new browser context and page.

**Request Body:**

| Field               | Type        | Required          | Default         | Description               |
| ------------------- | ----------- | ----------------- | --------------- | ------------------------- |
| `viewport`        | `object`  | No                | Browser default | Custom viewport size      |
| `viewport.width`  | `integer` | Yes (if viewport) | -               | Viewport width in pixels  |
| `viewport.height` | `integer` | Yes (if viewport) | -               | Viewport height in pixels |
| `userAgent`       | `string`  | No                | Browser default | Custom user agent string  |

**Payload Examples:**

```json
{}
```

```json
{
  "viewport": { "width": 1920, "height": 1080 }
}
```

```json
{
  "viewport": { "width": 375, "height": 812 },
  "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "createdAt": "2026-03-05T10:00:00.000Z",
    "lastUsed": "2026-03-05T10:00:00.000Z"
  }
}
```

---

### Close Session

```
POST /session/close
```

**Request Body:**

| Field         | Type       | Required | Description             |
| ------------- | ---------- | -------- | ----------------------- |
| `sessionId` | `string` | Yes      | The session ID to close |

**Payload:**

```json
{
  "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "closed": true }
}
```

---

### List Sessions

```
GET /sessions
```

**Response:**

```json
{
  "sessions": [
    {
      "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "createdAt": "2026-03-05T10:00:00.000Z",
      "lastUsed": "2026-03-05T10:05:00.000Z"
    }
  ]
}
```

---

### Execute Tool

```
POST /tool
```

This is the primary endpoint for all browser automation actions.

**Request Body:**

| Field         | Type       | Required | Default | Description             |
| ------------- | ---------- | -------- | ------- | ----------------------- |
| `tool`      | `string` | Yes      | -       | Tool name to execute    |
| `sessionId` | `string` | Yes      | -       | Target session ID       |
| `args`      | `object` | No       | `{}`  | Tool-specific arguments |

**Generic Payload Structure:**

```json
{
  "tool": "<tool_name>",
  "sessionId": "<session_id>",
  "args": { }
}
```

**Success Response (200):**

```json
{
  "status": "success",
  "data": { }
}
```

**Error Response (422):**

```json
{
  "status": "error",
  "error": "Error description",
  "screenshot": "<base64_png_on_failure>"
}
```

---

### Execute Workflow

```
POST /workflow
```

Execute multiple tools in a single sequence.

**Request Body:**

| Field             | Type        | Required | Default  | Description                     |
| ----------------- | ----------- | -------- | -------- | ------------------------------- |
| `sessionId`     | `string`  | Yes      | -        | Target session ID               |
| `steps`         | `array`   | Yes      | -        | Array of tool execution steps   |
| `steps[].tool`  | `string`  | Yes      | -        | Tool name to execute            |
| `steps[].args`  | `object`  | No       | `{}`   | Tool-specific arguments         |
| `stopOnFailure` | `boolean` | No       | `true` | Whether to stop if a step fails |

**Payload Example:**

```json
{
  "sessionId": "abc-123",
  "steps": [
    { "tool": "navigate", "args": { "url": "https://example.com" } },
    { "tool": "assert_text", "args": { "selector": "h1", "expected": "Example Domain" } },
    { "tool": "screenshot", "args": { "fullPage": true } }
  ],
  "stopOnFailure": true
}
```

**Success Response (200):**

```json
{
  "status": "success",
  "data": {
    "results": [
      { "tool": "navigate", "status": "success", "data": { ... } },
      { "tool": "assert_text", "status": "success", "data": { ... } },
      { "tool": "screenshot", "status": "success", "data": { ... } }
    ]
  }
}
```

**Error Response (422):**

Returns 422 if any step fails.

```json
{
  "status": "error",
  "data": {
    "results": [
      { "tool": "navigate", "status": "success", "data": { ... } },
      { "tool": "assert_text", "status": "error", "error": "Assertion failed..." }
    ]
  }
}
```

---

## Environment Variables

| Variable                    | Default     | Description                         |
| --------------------------- | ----------- | ----------------------------------- |
| `PORT`                    | `3002`    | Server port                         |
| `HOST`                    | `0.0.0.0` | Server host                         |
| `BROWSER_HEADLESS`        | `true`    | Set to `"false"` for headed mode  |
| `DEFAULT_TIMEOUT`         | `30000`   | Default Playwright timeout (ms)     |
| `RETRY_ATTEMPTS`          | `3`       | Tool execution retry attempts       |
| `RETRY_DELAY`             | `1000`    | Delay between retries (ms)          |
| `SCREENSHOT_ON_FAILURE`   | `true`    | Capture screenshot on tool failure  |
| `TRACING_ENABLED`         | `false`   | Enable Playwright tracing           |
| `VIDEO_RECORDING`         | `false`   | Enable video recording              |
| `MAX_CONCURRENT_SESSIONS` | `10`      | Max simultaneous sessions           |
| `SESSION_IDLE_TIMEOUT`    | `300000`  | Auto-close idle sessions after (ms) |
| `REQUEST_TIMEOUT`         | `60000`   | Tool execution timeout (ms)         |
| `SELF_HEALING_ENABLED`    | `false`   | Enable AI-powered self-healing      |
| `AI_API_KEY`              | -         | OpenAI (or compatible) API key      |
| `AI_BASE_URL`             | `https://api.openai.com/v1` | URL for AI endpoint                 |
| `AI_MODEL`                | `gpt-4o-mini` | AI Model to use for healing         |

---

## AI Self-Healing

The server includes an experimental AI-powered **Self-Healing** feature. When enabled, if a tool that relies on a `selector` (like `click` or `fill`) fails due to a `TimeoutError`, the server will:
1. Capture a snapshot of the current DOM (interactive elements).
2. Send the snapshot and the failed selector to the configured AI model.
3. The AI will analyze the DOM and suggest a corrected selector.
4. The server will immediately retry the action using the new, healed selector.

To use this feature, set `SELF_HEALING_ENABLED=true` and provide an `AI_API_KEY`. You can use any OpenAI-compatible API by changing the `AI_BASE_URL` and `AI_MODEL` variables.

---

## Tool Reference

All tools are called via `POST /tool` with the tool name in the `tool` field and arguments in the `args` field.

---

### Core Interaction Tools

#### `navigate`

Navigate to a URL.

| Arg           | Type       | Required | Default    | Description                                                               |
| ------------- | ---------- | -------- | ---------- | ------------------------------------------------------------------------- |
| `url`       | `string` | Yes      | -          | Valid URL to navigate to                                                  |
| `waitUntil` | `string` | No       | `"load"` | `"load"` \| `"domcontentloaded"` \| `"networkidle"` \| `"commit"` |

**Payload Examples:**

```json
{
  "tool": "navigate",
  "sessionId": "abc-123",
  "args": { "url": "https://example.com" }
}
```

```json
{
  "tool": "navigate",
  "sessionId": "abc-123",
  "args": { "url": "https://example.com", "waitUntil": "networkidle" }
}
```

```json
{
  "tool": "navigate",
  "sessionId": "abc-123",
  "args": { "url": "https://example.com", "waitUntil": "domcontentloaded" }
}
```

```json
{
  "tool": "navigate",
  "sessionId": "abc-123",
  "args": { "url": "https://example.com", "waitUntil": "commit" }
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "url": "https://example.com/", "title": "Example Domain", "statusCode": 200 }
}
```

---

#### `click`

Click an element matching the given selector.

| Arg            | Type        | Required | Default    | Description                               |
| -------------- | ----------- | -------- | ---------- | ----------------------------------------- |
| `selector`   | `string`  | Yes      | -          | CSS/XPath selector                        |
| `button`     | `string`  | No       | `"left"` | `"left"` \| `"right"` \| `"middle"` |
| `clickCount` | `integer` | No       | `1`      | Number of clicks (2 for double-click)     |
| `timeout`    | `integer` | No       | -          | Timeout in ms                             |

**Payload Examples:**

```json
{
  "tool": "click",
  "sessionId": "abc-123",
  "args": { "selector": "#submit-btn" }
}
```

```json
{
  "tool": "click",
  "sessionId": "abc-123",
  "args": { "selector": ".item", "button": "right" }
}
```

```json
{
  "tool": "click",
  "sessionId": "abc-123",
  "args": { "selector": "text=Edit", "clickCount": 2 }
}
```

```json
{
  "tool": "click",
  "sessionId": "abc-123",
  "args": { "selector": "button.save", "button": "left", "clickCount": 1, "timeout": 5000 }
}
```

```json
{
  "tool": "click",
  "sessionId": "abc-123",
  "args": { "selector": "a >> text=Login", "button": "middle" }
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "selector": "#submit-btn", "clicked": true }
}
```

---

#### `fill`

Fill an input element with a value (clears existing content first).

| Arg          | Type        | Required | Default | Description        |
| ------------ | ----------- | -------- | ------- | ------------------ |
| `selector` | `string`  | Yes      | -       | CSS/XPath selector |
| `value`    | `string`  | Yes      | -       | Value to fill      |
| `timeout`  | `integer` | No       | -       | Timeout in ms      |

**Payload Examples:**

```json
{
  "tool": "fill",
  "sessionId": "abc-123",
  "args": { "selector": "#email", "value": "user@example.com" }
}
```

```json
{
  "tool": "fill",
  "sessionId": "abc-123",
  "args": { "selector": "input[name='password']", "value": "secret123", "timeout": 3000 }
}
```

```json
{
  "tool": "fill",
  "sessionId": "abc-123",
  "args": { "selector": "textarea.comment", "value": "" }
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "selector": "#email", "filled": true }
}
```

---

#### `hover`

Hover over an element.

| Arg          | Type        | Required | Default | Description        |
| ------------ | ----------- | -------- | ------- | ------------------ |
| `selector` | `string`  | Yes      | -       | CSS/XPath selector |
| `timeout`  | `integer` | No       | -       | Timeout in ms      |

**Payload Examples:**

```json
{
  "tool": "hover",
  "sessionId": "abc-123",
  "args": { "selector": ".dropdown-trigger" }
}
```

```json
{
  "tool": "hover",
  "sessionId": "abc-123",
  "args": { "selector": "nav >> text=Products", "timeout": 5000 }
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "selector": ".dropdown-trigger", "hovered": true }
}
```

---

#### `wait_for_selector`

Wait for an element to reach a desired state.

| Arg          | Type        | Required | Default       | Description                                                       |
| ------------ | ----------- | -------- | ------------- | ----------------------------------------------------------------- |
| `selector` | `string`  | Yes      | -             | CSS/XPath selector                                                |
| `state`    | `string`  | No       | `"visible"` | `"attached"` \| `"detached"` \| `"visible"` \| `"hidden"` |
| `timeout`  | `integer` | No       | -             | Timeout in ms                                                     |

**Payload Examples:**

```json
{
  "tool": "wait_for_selector",
  "sessionId": "abc-123",
  "args": { "selector": ".loading-spinner", "state": "hidden" }
}
```

```json
{
  "tool": "wait_for_selector",
  "sessionId": "abc-123",
  "args": { "selector": "#results", "state": "visible", "timeout": 10000 }
}
```

```json
{
  "tool": "wait_for_selector",
  "sessionId": "abc-123",
  "args": { "selector": ".modal", "state": "attached" }
}
```

```json
{
  "tool": "wait_for_selector",
  "sessionId": "abc-123",
  "args": { "selector": ".notification", "state": "detached", "timeout": 5000 }
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "selector": ".loading-spinner", "state": "hidden", "found": true }
}
```

---

#### `screenshot`

Take a screenshot of the page or a specific element.

| Arg          | Type        | Required | Default   | Description                           |
| ------------ | ----------- | -------- | --------- | ------------------------------------- |
| `selector` | `string`  | No       | -         | Element selector (omit for full page) |
| `fullPage` | `boolean` | No       | `false` | Capture full scrollable page          |
| `type`     | `string`  | No       | `"png"` | `"png"` \| `"jpeg"`               |
| `quality`  | `integer` | No       | -         | JPEG quality 0-100 (only for jpeg)    |

**Payload Examples:**

```json
{
  "tool": "screenshot",
  "sessionId": "abc-123",
  "args": {}
}
```

```json
{
  "tool": "screenshot",
  "sessionId": "abc-123",
  "args": { "fullPage": true }
}
```

```json
{
  "tool": "screenshot",
  "sessionId": "abc-123",
  "args": { "selector": "#chart-container" }
}
```

```json
{
  "tool": "screenshot",
  "sessionId": "abc-123",
  "args": { "type": "jpeg", "quality": 80 }
}
```

```json
{
  "tool": "screenshot",
  "sessionId": "abc-123",
  "args": { "selector": ".hero-banner", "type": "jpeg", "quality": 50 }
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "base64": "iVBORw0KGgo...", "type": "png", "size": 54321 }
}
```

---

#### `extract_text`

Extract text content from an element.

| Arg          | Type        | Required | Default | Description        |
| ------------ | ----------- | -------- | ------- | ------------------ |
| `selector` | `string`  | Yes      | -       | CSS/XPath selector |
| `timeout`  | `integer` | No       | -       | Timeout in ms      |

**Payload Examples:**

```json
{
  "tool": "extract_text",
  "sessionId": "abc-123",
  "args": { "selector": "h1" }
}
```

```json
{
  "tool": "extract_text",
  "sessionId": "abc-123",
  "args": { "selector": ".price-display", "timeout": 5000 }
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "selector": "h1", "text": "Welcome to My App" }
}
```

---

### Additional Interaction Tools

#### `select_option`

Select one or more options in a `<select>` element.

| Arg          | Type                       | Required | Default | Description                         |
| ------------ | -------------------------- | -------- | ------- | ----------------------------------- |
| `selector` | `string`                 | Yes      | -       | CSS/XPath selector for `<select>` |
| `values`   | `string` or `string[]` | Yes      | -       | Option value(s) to select           |
| `timeout`  | `integer`                | No       | -       | Timeout in ms                       |

**Payload Examples:**

```json
{
  "tool": "select_option",
  "sessionId": "abc-123",
  "args": { "selector": "#country", "values": "us" }
}
```

```json
{
  "tool": "select_option",
  "sessionId": "abc-123",
  "args": { "selector": "select[name='colors']", "values": ["red", "blue", "green"] }
}
```

```json
{
  "tool": "select_option",
  "sessionId": "abc-123",
  "args": { "selector": "#category", "values": "electronics", "timeout": 3000 }
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "selector": "#country", "selected": ["us"] }
}
```

---

#### `check`

Check a checkbox or radio button.

| Arg          | Type        | Required | Default | Description        |
| ------------ | ----------- | -------- | ------- | ------------------ |
| `selector` | `string`  | Yes      | -       | CSS/XPath selector |
| `timeout`  | `integer` | No       | -       | Timeout in ms      |

**Payload Examples:**

```json
{
  "tool": "check",
  "sessionId": "abc-123",
  "args": { "selector": "#agree-terms" }
}
```

```json
{
  "tool": "check",
  "sessionId": "abc-123",
  "args": { "selector": "input[type='radio'][value='premium']", "timeout": 3000 }
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "selector": "#agree-terms", "checked": true }
}
```

---

#### `uncheck`

Uncheck a checkbox.

| Arg          | Type        | Required | Default | Description        |
| ------------ | ----------- | -------- | ------- | ------------------ |
| `selector` | `string`  | Yes      | -       | CSS/XPath selector |
| `timeout`  | `integer` | No       | -       | Timeout in ms      |

**Payload Examples:**

```json
{
  "tool": "uncheck",
  "sessionId": "abc-123",
  "args": { "selector": "#newsletter-opt-in" }
}
```

```json
{
  "tool": "uncheck",
  "sessionId": "abc-123",
  "args": { "selector": ".feature-toggle", "timeout": 2000 }
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "selector": "#newsletter-opt-in", "unchecked": true }
}
```

---

#### `press`

Press a keyboard key on a focused element.

| Arg          | Type        | Required | Default | Description                                                                                |
| ------------ | ----------- | -------- | ------- | ------------------------------------------------------------------------------------------ |
| `selector` | `string`  | Yes      | -       | CSS/XPath selector to target                                                               |
| `key`      | `string`  | Yes      | -       | Key to press (e.g.,`"Enter"`, `"Tab"`, `"ArrowDown"`, `"Control+a"`, `"Meta+c"`) |
| `timeout`  | `integer` | No       | -       | Timeout in ms                                                                              |

**Payload Examples:**

```json
{
  "tool": "press",
  "sessionId": "abc-123",
  "args": { "selector": "#search-input", "key": "Enter" }
}
```

```json
{
  "tool": "press",
  "sessionId": "abc-123",
  "args": { "selector": "input.email", "key": "Tab" }
}
```

```json
{
  "tool": "press",
  "sessionId": "abc-123",
  "args": { "selector": "#editor", "key": "Control+a" }
}
```

```json
{
  "tool": "press",
  "sessionId": "abc-123",
  "args": { "selector": "#editor", "key": "Meta+c", "timeout": 2000 }
}
```

```json
{
  "tool": "press",
  "sessionId": "abc-123",
  "args": { "selector": ".dropdown", "key": "ArrowDown" }
}
```

```json
{
  "tool": "press",
  "sessionId": "abc-123",
  "args": { "selector": "body", "key": "Escape" }
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "selector": "#search-input", "key": "Enter", "pressed": true }
}
```

---

#### `type`

Type text character by character (simulates real keystrokes, unlike `fill`).

| Arg          | Type        | Required | Default | Description                    |
| ------------ | ----------- | -------- | ------- | ------------------------------ |
| `selector` | `string`  | Yes      | -       | CSS/XPath selector             |
| `text`     | `string`  | Yes      | -       | Text to type                   |
| `delay`    | `integer` | No       | -       | Delay between keystrokes in ms |
| `timeout`  | `integer` | No       | -       | Timeout to find element in ms  |

**Payload Examples:**

```json
{
  "tool": "type",
  "sessionId": "abc-123",
  "args": { "selector": "#search", "text": "playwright automation" }
}
```

```json
{
  "tool": "type",
  "sessionId": "abc-123",
  "args": { "selector": "#search", "text": "slow typing", "delay": 100 }
}
```

```json
{
  "tool": "type",
  "sessionId": "abc-123",
  "args": { "selector": ".autocomplete", "text": "New York", "delay": 50, "timeout": 5000 }
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "selector": "#search", "typed": true, "length": 22 }
}
```

---

#### `focus`

Focus an element.

| Arg          | Type        | Required | Default | Description        |
| ------------ | ----------- | -------- | ------- | ------------------ |
| `selector` | `string`  | Yes      | -       | CSS/XPath selector |
| `timeout`  | `integer` | No       | -       | Timeout in ms      |

**Payload Examples:**

```json
{
  "tool": "focus",
  "sessionId": "abc-123",
  "args": { "selector": "#username" }
}
```

```json
{
  "tool": "focus",
  "sessionId": "abc-123",
  "args": { "selector": "textarea.notes", "timeout": 3000 }
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "selector": "#username", "focused": true }
}
```

---

#### `get_attribute`

Get the value of an element's attribute.

| Arg           | Type        | Required | Default | Description        |
| ------------- | ----------- | -------- | ------- | ------------------ |
| `selector`  | `string`  | Yes      | -       | CSS/XPath selector |
| `attribute` | `string`  | Yes      | -       | Attribute name     |
| `timeout`   | `integer` | No       | -       | Timeout in ms      |

**Payload Examples:**

```json
{
  "tool": "get_attribute",
  "sessionId": "abc-123",
  "args": { "selector": "a.download", "attribute": "href" }
}
```

```json
{
  "tool": "get_attribute",
  "sessionId": "abc-123",
  "args": { "selector": "img.logo", "attribute": "src" }
}
```

```json
{
  "tool": "get_attribute",
  "sessionId": "abc-123",
  "args": { "selector": "#main", "attribute": "data-version", "timeout": 2000 }
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "selector": "a.download", "attribute": "href", "value": "/files/report.pdf" }
}
```

---

#### `evaluate`

Execute JavaScript in the browser page context.

| Arg            | Type       | Required | Default | Description                       |
| -------------- | ---------- | -------- | ------- | --------------------------------- |
| `expression` | `string` | Yes      | -       | JavaScript expression to evaluate |

**Payload Examples:**

```json
{
  "tool": "evaluate",
  "sessionId": "abc-123",
  "args": { "expression": "document.title" }
}
```

```json
{
  "tool": "evaluate",
  "sessionId": "abc-123",
  "args": { "expression": "window.innerWidth" }
}
```

```json
{
  "tool": "evaluate",
  "sessionId": "abc-123",
  "args": { "expression": "JSON.parse(localStorage.getItem('user'))" }
}
```

```json
{
  "tool": "evaluate",
  "sessionId": "abc-123",
  "args": { "expression": "document.querySelectorAll('a').length" }
}
```

```json
{
  "tool": "evaluate",
  "sessionId": "abc-123",
  "args": { "expression": "window.scrollTo(0, document.body.scrollHeight)" }
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "result": "My Page Title" }
}
```

---

#### `drag_and_drop`

Drag an element and drop it onto another element.

| Arg         | Type        | Required | Default | Description             |
| ----------- | ----------- | -------- | ------- | ----------------------- |
| `source`  | `string`  | Yes      | -       | Source element selector |
| `target`  | `string`  | Yes      | -       | Target element selector |
| `timeout` | `integer` | No       | -       | Timeout in ms           |

**Payload Examples:**

```json
{
  "tool": "drag_and_drop",
  "sessionId": "abc-123",
  "args": { "source": "#draggable-item", "target": "#drop-zone" }
}
```

```json
{
  "tool": "drag_and_drop",
  "sessionId": "abc-123",
  "args": { "source": ".card:first-child", "target": ".column-done", "timeout": 5000 }
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "source": "#draggable-item", "target": "#drop-zone", "dropped": true }
}
```

---

### Navigation Tools

#### `go_back`

Navigate back in browser history.

| Arg        | Type | Required | Default | Description         |
| ---------- | ---- | -------- | ------- | ------------------- |
| *(none)* | -    | -        | -       | No arguments needed |

**Payload:**

```json
{
  "tool": "go_back",
  "sessionId": "abc-123",
  "args": {}
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "url": "https://example.com/previous", "title": "Previous Page", "statusCode": 200 }
}
```

---

#### `go_forward`

Navigate forward in browser history.

| Arg        | Type | Required | Default | Description         |
| ---------- | ---- | -------- | ------- | ------------------- |
| *(none)* | -    | -        | -       | No arguments needed |

**Payload:**

```json
{
  "tool": "go_forward",
  "sessionId": "abc-123",
  "args": {}
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "url": "https://example.com/next", "title": "Next Page", "statusCode": 200 }
}
```

---

#### `reload`

Reload the current page.

| Arg           | Type        | Required | Default    | Description                                                               |
| ------------- | ----------- | -------- | ---------- | ------------------------------------------------------------------------- |
| `waitUntil` | `string`  | No       | `"load"` | `"load"` \| `"domcontentloaded"` \| `"networkidle"` \| `"commit"` |
| `timeout`   | `integer` | No       | -          | Timeout in ms                                                             |

**Payload Examples:**

```json
{
  "tool": "reload",
  "sessionId": "abc-123",
  "args": {}
}
```

```json
{
  "tool": "reload",
  "sessionId": "abc-123",
  "args": { "waitUntil": "networkidle" }
}
```

```json
{
  "tool": "reload",
  "sessionId": "abc-123",
  "args": { "waitUntil": "domcontentloaded", "timeout": 10000 }
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "url": "https://example.com/", "title": "Example", "statusCode": 200 }
}
```

---

### Page Info Tools

#### `get_title`

Get the current page title.

| Arg        | Type | Required | Default | Description         |
| ---------- | ---- | -------- | ------- | ------------------- |
| *(none)* | -    | -        | -       | No arguments needed |

**Payload:**

```json
{
  "tool": "get_title",
  "sessionId": "abc-123",
  "args": {}
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "title": "Dashboard - My App" }
}
```

---

#### `get_url`

Get the current page URL.

| Arg        | Type | Required | Default | Description         |
| ---------- | ---- | -------- | ------- | ------------------- |
| *(none)* | -    | -        | -       | No arguments needed |

**Payload:**

```json
{
  "tool": "get_url",
  "sessionId": "abc-123",
  "args": {}
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "url": "https://example.com/dashboard" }
}
```

---

#### `wait_for_load_state`

Wait for the page to reach a specific load state.

| Arg         | Type        | Required | Default    | Description                                               |
| ----------- | ----------- | -------- | ---------- | --------------------------------------------------------- |
| `state`   | `string`  | No       | `"load"` | `"load"` \| `"domcontentloaded"` \| `"networkidle"` |
| `timeout` | `integer` | No       | -          | Timeout in ms                                             |

**Payload Examples:**

```json
{
  "tool": "wait_for_load_state",
  "sessionId": "abc-123",
  "args": {}
}
```

```json
{
  "tool": "wait_for_load_state",
  "sessionId": "abc-123",
  "args": { "state": "networkidle" }
}
```

```json
{
  "tool": "wait_for_load_state",
  "sessionId": "abc-123",
  "args": { "state": "domcontentloaded", "timeout": 15000 }
}
```

**Response:**

```json
{
  "status": "success",
  "data": { "state": "networkidle", "url": "https://example.com/" }
}
```

---

### Locator Tools

#### `test_locator`

Test a CSS/XPath selector and get detailed info about matched elements.

| Arg            | Type        | Required | Default | Description                                 |
| -------------- | ----------- | -------- | ------- | ------------------------------------------- |
| `selector`   | `string`  | Yes      | -       | CSS or XPath selector to test               |
| `maxResults` | `integer` | No       | `5`   | Maximum number of element details to return |
| `timeout`    | `integer` | No       | -       | Timeout to wait for selector                |

**Payload Examples:**

```json
{
  "tool": "test_locator",
  "sessionId": "abc-123",
  "args": { "selector": "button" }
}
```

```json
{
  "tool": "test_locator",
  "sessionId": "abc-123",
  "args": { "selector": ".card", "maxResults": 10 }
}
```

```json
{
  "tool": "test_locator",
  "sessionId": "abc-123",
  "args": { "selector": "//div[@class='item']", "maxResults": 3, "timeout": 5000 }
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "selector": "button",
    "totalCount": 12,
    "showing": 5,
    "elements": [
      {
        "index": 0,
        "tagName": "button",
        "text": "Submit",
        "visible": true,
        "boundingBox": { "x": 100, "y": 200, "width": 80, "height": 36 },
        "attributes": { "type": "submit", "class": "btn btn-primary", "id": "submit-btn" }
      },
      {
        "index": 1,
        "tagName": "button",
        "text": "Cancel",
        "visible": true,
        "boundingBox": { "x": 200, "y": 200, "width": 80, "height": 36 },
        "attributes": { "type": "button", "class": "btn btn-secondary" }
      }
    ]
  }
}
```

---

#### `get_by_text`

Find elements by their text content.

| Arg       | Type        | Required | Default   | Description             |
| --------- | ----------- | -------- | --------- | ----------------------- |
| `text`  | `string`  | Yes      | -         | Text to search for      |
| `exact` | `boolean` | No       | `false` | Exact match vs contains |

**Payload Examples:**

```json
{
  "tool": "get_by_text",
  "sessionId": "abc-123",
  "args": { "text": "Sign In" }
}
```

```json
{
  "tool": "get_by_text",
  "sessionId": "abc-123",
  "args": { "text": "Sign In", "exact": true }
}
```

```json
{
  "tool": "get_by_text",
  "sessionId": "abc-123",
  "args": { "text": "Welcome" }
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "text": "Sign In",
    "exact": true,
    "totalCount": 1,
    "elements": [
      { "index": 0, "tagName": "button", "text": "Sign In", "visible": true }
    ]
  }
}
```

---

#### `get_by_role`

Find elements by their ARIA role.

| Arg          | Type        | Required | Default | Description                                                                                                                                                        |
| ------------ | ----------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `role`     | `string`  | Yes      | -       | ARIA role (e.g.,`"button"`, `"link"`, `"heading"`, `"textbox"`, `"checkbox"`, `"tab"`, `"menuitem"`, `"dialog"`, `"navigation"`, `"listitem"`) |
| `name`     | `string`  | No       | -       | Accessible name filter                                                                                                                                             |
| `checked`  | `boolean` | No       | -       | Filter by checked state                                                                                                                                            |
| `disabled` | `boolean` | No       | -       | Filter by disabled state                                                                                                                                           |
| `expanded` | `boolean` | No       | -       | Filter by expanded state                                                                                                                                           |
| `pressed`  | `boolean` | No       | -       | Filter by pressed state                                                                                                                                            |
| `selected` | `boolean` | No       | -       | Filter by selected state                                                                                                                                           |

**Payload Examples:**

```json
{
  "tool": "get_by_role",
  "sessionId": "abc-123",
  "args": { "role": "button" }
}
```

```json
{
  "tool": "get_by_role",
  "sessionId": "abc-123",
  "args": { "role": "button", "name": "Submit" }
}
```

```json
{
  "tool": "get_by_role",
  "sessionId": "abc-123",
  "args": { "role": "heading", "name": "Dashboard" }
}
```

```json
{
  "tool": "get_by_role",
  "sessionId": "abc-123",
  "args": { "role": "link", "name": "About Us" }
}
```

```json
{
  "tool": "get_by_role",
  "sessionId": "abc-123",
  "args": { "role": "checkbox", "checked": false }
}
```

```json
{
  "tool": "get_by_role",
  "sessionId": "abc-123",
  "args": { "role": "button", "disabled": true }
}
```

```json
{
  "tool": "get_by_role",
  "sessionId": "abc-123",
  "args": { "role": "tab", "selected": true }
}
```

```json
{
  "tool": "get_by_role",
  "sessionId": "abc-123",
  "args": { "role": "button", "expanded": false, "name": "Menu" }
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "role": "button",
    "options": { "name": "Submit" },
    "totalCount": 1,
    "elements": [
      { "index": 0, "tagName": "button", "text": "Submit", "visible": true }
    ]
  }
}
```

---

#### `get_by_label`

Find form elements by their associated label text.

| Arg       | Type        | Required | Default   | Description              |
| --------- | ----------- | -------- | --------- | ------------------------ |
| `text`  | `string`  | Yes      | -         | Label text to search for |
| `exact` | `boolean` | No       | `false` | Exact match vs contains  |

**Payload Examples:**

```json
{
  "tool": "get_by_label",
  "sessionId": "abc-123",
  "args": { "text": "Email" }
}
```

```json
{
  "tool": "get_by_label",
  "sessionId": "abc-123",
  "args": { "text": "Email Address", "exact": true }
}
```

```json
{
  "tool": "get_by_label",
  "sessionId": "abc-123",
  "args": { "text": "Password" }
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "label": "Email",
    "exact": false,
    "totalCount": 1,
    "elements": [
      { "index": 0, "tagName": "input", "inputType": "email", "visible": true }
    ]
  }
}
```

---

#### `get_by_placeholder`

Find input elements by their placeholder text.

| Arg       | Type        | Required | Default   | Description                    |
| --------- | ----------- | -------- | --------- | ------------------------------ |
| `text`  | `string`  | Yes      | -         | Placeholder text to search for |
| `exact` | `boolean` | No       | `false` | Exact match vs contains        |

**Payload Examples:**

```json
{
  "tool": "get_by_placeholder",
  "sessionId": "abc-123",
  "args": { "text": "Search" }
}
```

```json
{
  "tool": "get_by_placeholder",
  "sessionId": "abc-123",
  "args": { "text": "Enter your email", "exact": true }
}
```

```json
{
  "tool": "get_by_placeholder",
  "sessionId": "abc-123",
  "args": { "text": "password" }
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "placeholder": "Search",
    "exact": false,
    "totalCount": 1,
    "elements": [
      { "index": 0, "tagName": "input", "inputType": "text", "visible": true }
    ]
  }
}
```

---

#### `get_by_test_id`

Find elements by their `data-testid` attribute.

| Arg        | Type       | Required | Default | Description   |
| ---------- | ---------- | -------- | ------- | ------------- |
| `testId` | `string` | Yes      | -       | Test ID value |

**Payload Examples:**

```json
{
  "tool": "get_by_test_id",
  "sessionId": "abc-123",
  "args": { "testId": "login-button" }
}
```

```json
{
  "tool": "get_by_test_id",
  "sessionId": "abc-123",
  "args": { "testId": "user-profile-card" }
}
```

```json
{
  "tool": "get_by_test_id",
  "sessionId": "abc-123",
  "args": { "testId": "nav-menu" }
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "testId": "login-button",
    "totalCount": 1,
    "elements": [
      { "index": 0, "tagName": "button", "text": "Log In", "visible": true }
    ]
  }
}
```

---

#### `highlight_locator`

Visually highlight all elements matching a selector on the page (useful for debugging). Returns a screenshot with highlights visible.

| Arg          | Type        | Required | Default                    | Description                             |
| ------------ | ----------- | -------- | -------------------------- | --------------------------------------- |
| `selector` | `string`  | Yes      | -                          | CSS selector to highlight               |
| `color`    | `string`  | No       | `"rgba(255, 0, 0, 0.3)"` | Highlight overlay color (any CSS color) |
| `duration` | `integer` | No       | `3000`                   | How long highlights stay visible (ms)   |

**Payload Examples:**

```json
{
  "tool": "highlight_locator",
  "sessionId": "abc-123",
  "args": { "selector": "button" }
}
```

```json
{
  "tool": "highlight_locator",
  "sessionId": "abc-123",
  "args": { "selector": ".nav-link", "color": "rgba(0, 255, 0, 0.4)" }
}
```

```json
{
  "tool": "highlight_locator",
  "sessionId": "abc-123",
  "args": { "selector": "input", "color": "rgba(0, 0, 255, 0.3)", "duration": 5000 }
}
```

**Success Response:**

```json
{
  "status": "success",
  "data": {
    "selector": "button",
    "locator": "button",
    "matchCount": 5,
    "highlighted": true,
    "screenshot": "iVBORw0KGgo..."
  }
}
```

**Failure Response (no elements found):**

```json
{
  "status": "error",
  "error": "No elements found matching selector \"button.nonexistent\""
}
```

---

### Assertion Tools

All assertion tools return `"status": "success"` with `"passed": true` when the assertion passes, or `"status": "error"` with a descriptive error message when the assertion fails.

#### `assert_text`

Assert that an element's text content matches the expected value.

| Arg          | Type        | Required | Default   | Description                                  |
| ------------ | ----------- | -------- | --------- | -------------------------------------------- |
| `selector` | `string`  | Yes      | -         | CSS/XPath selector                           |
| `expected` | `string`  | Yes      | -         | Expected text                                |
| `exact`    | `boolean` | No       | `false` | `true` = exact match, `false` = contains |
| `timeout`  | `integer` | No       | -         | Timeout to wait for element visibility       |

**Payload Examples:**

```json
{
  "tool": "assert_text",
  "sessionId": "abc-123",
  "args": { "selector": "h1", "expected": "Welcome" }
}
```

```json
{
  "tool": "assert_text",
  "sessionId": "abc-123",
  "args": { "selector": "h1", "expected": "Welcome to Dashboard", "exact": true }
}
```

```json
{
  "tool": "assert_text",
  "sessionId": "abc-123",
  "args": { "selector": ".status-badge", "expected": "Active", "timeout": 5000 }
}
```

```json
{
  "tool": "assert_text",
  "sessionId": "abc-123",
  "args": { "selector": ".error-message", "expected": "Invalid email", "exact": false, "timeout": 3000 }
}
```

**Success Response:**

```json
{
  "status": "success",
  "data": { "selector": "h1", "expected": "Welcome", "actual": "Welcome to Dashboard", "passed": true }
}
```

**Failure Response:**

```json
{
  "status": "error",
  "error": "Text assertion failed. Expected: \"Goodbye\", Actual: \"Welcome to Dashboard\" (exact: false)"
}
```

---

#### `assert_visible`

Assert that an element is visible on the page.

| Arg          | Type        | Required | Default | Description                    |
| ------------ | ----------- | -------- | ------- | ------------------------------ |
| `selector` | `string`  | Yes      | -       | CSS/XPath selector             |
| `timeout`  | `integer` | No       | -       | Timeout to wait for visibility |

**Payload Examples:**

```json
{
  "tool": "assert_visible",
  "sessionId": "abc-123",
  "args": { "selector": "#main-content" }
}
```

```json
{
  "tool": "assert_visible",
  "sessionId": "abc-123",
  "args": { "selector": ".modal-dialog", "timeout": 5000 }
}
```

**Success Response:**

```json
{
  "status": "success",
  "data": { "selector": "#main-content", "visible": true }
}
```

**Failure Response:**

```json
{
  "status": "error",
  "error": "Visibility assertion failed. Element \"#main-content\" is not visible"
}
```

---

#### `assert_hidden`

Assert that an element is hidden or not present.

| Arg          | Type        | Required | Default | Description                         |
| ------------ | ----------- | -------- | ------- | ----------------------------------- |
| `selector` | `string`  | Yes      | -       | CSS/XPath selector                  |
| `timeout`  | `integer` | No       | -       | Timeout to wait for element to hide |

**Payload Examples:**

```json
{
  "tool": "assert_hidden",
  "sessionId": "abc-123",
  "args": { "selector": ".loading-spinner" }
}
```

```json
{
  "tool": "assert_hidden",
  "sessionId": "abc-123",
  "args": { "selector": ".toast-notification", "timeout": 5000 }
}
```

**Success Response:**

```json
{
  "status": "success",
  "data": { "selector": ".loading-spinner", "hidden": true }
}
```

**Failure Response:**

```json
{
  "status": "error",
  "error": "Hidden assertion failed. Element \".loading-spinner\" is still visible"
}
```

---

#### `assert_title`

Assert that the page title matches.

| Arg          | Type        | Required | Default   | Description                                  |
| ------------ | ----------- | -------- | --------- | -------------------------------------------- |
| `expected` | `string`  | Yes      | -         | Expected title                               |
| `exact`    | `boolean` | No       | `false` | `true` = exact match, `false` = contains |

**Payload Examples:**

```json
{
  "tool": "assert_title",
  "sessionId": "abc-123",
  "args": { "expected": "Dashboard" }
}
```

```json
{
  "tool": "assert_title",
  "sessionId": "abc-123",
  "args": { "expected": "Dashboard - My Application", "exact": true }
}
```

**Success Response:**

```json
{
  "status": "success",
  "data": { "expected": "Dashboard", "actual": "Dashboard - My Application", "passed": true }
}
```

**Failure Response:**

```json
{
  "status": "error",
  "error": "Title assertion failed. Expected: \"Settings\", Actual: \"Dashboard - My Application\" (exact: false)"
}
```

---

#### `assert_url`

Assert that the current URL matches.

| Arg          | Type        | Required | Default  | Description                                  |
| ------------ | ----------- | -------- | -------- | -------------------------------------------- |
| `expected` | `string`  | Yes      | -        | Expected URL (full or partial)               |
| `exact`    | `boolean` | No       | `true` | `true` = exact match, `false` = contains |

**Payload Examples:**

```json
{
  "tool": "assert_url",
  "sessionId": "abc-123",
  "args": { "expected": "https://example.com/dashboard" }
}
```

```json
{
  "tool": "assert_url",
  "sessionId": "abc-123",
  "args": { "expected": "/dashboard", "exact": false }
}
```

```json
{
  "tool": "assert_url",
  "sessionId": "abc-123",
  "args": { "expected": "example.com", "exact": false }
}
```

**Success Response:**

```json
{
  "status": "success",
  "data": { "expected": "/dashboard", "actual": "https://example.com/dashboard", "passed": true }
}
```

**Failure Response:**

```json
{
  "status": "error",
  "error": "URL assertion failed. Expected: \"https://example.com/settings\", Actual: \"https://example.com/dashboard\" (exact: true)"
}
```

---

#### `assert_element_count`

Assert the number of elements matching a selector.

| Arg          | Type        | Required | Default | Description                  |
| ------------ | ----------- | -------- | ------- | ---------------------------- |
| `selector` | `string`  | Yes      | -       | CSS/XPath selector           |
| `count`    | `integer` | Yes      | -       | Expected count (>= 0)        |
| `timeout`  | `integer` | No       | -       | Timeout to wait for selector |

**Payload Examples:**

```json
{
  "tool": "assert_element_count",
  "sessionId": "abc-123",
  "args": { "selector": ".list-item", "count": 5 }
}
```

```json
{
  "tool": "assert_element_count",
  "sessionId": "abc-123",
  "args": { "selector": ".error", "count": 0 }
}
```

```json
{
  "tool": "assert_element_count",
  "sessionId": "abc-123",
  "args": { "selector": "tr.data-row", "count": 10, "timeout": 5000 }
}
```

**Success Response:**

```json
{
  "status": "success",
  "data": { "selector": ".list-item", "expected": 5, "actual": 5, "passed": true }
}
```

**Failure Response:**

```json
{
  "status": "error",
  "error": "Element count assertion failed. Expected: 5, Actual: 3 for selector \".list-item\""
}
```

---

#### `assert_attribute`

Assert an element's attribute value.

| Arg           | Type                   | Required | Default | Description                                            |
| ------------- | ---------------------- | -------- | ------- | ------------------------------------------------------ |
| `selector`  | `string`             | Yes      | -       | CSS/XPath selector                                     |
| `attribute` | `string`             | Yes      | -       | Attribute name                                         |
| `expected`  | `string` or `null` | Yes      | -       | Expected value (`null` = attribute should not exist) |
| `timeout`   | `integer`            | No       | -       | Timeout in ms                                          |

**Payload Examples:**

```json
{
  "tool": "assert_attribute",
  "sessionId": "abc-123",
  "args": { "selector": "a.cta", "attribute": "href", "expected": "/signup" }
}
```

```json
{
  "tool": "assert_attribute",
  "sessionId": "abc-123",
  "args": { "selector": "#submit", "attribute": "disabled", "expected": null }
}
```

```json
{
  "tool": "assert_attribute",
  "sessionId": "abc-123",
  "args": { "selector": "input.email", "attribute": "type", "expected": "email", "timeout": 3000 }
}
```

```json
{
  "tool": "assert_attribute",
  "sessionId": "abc-123",
  "args": { "selector": "img.avatar", "attribute": "alt", "expected": "User avatar" }
}
```

**Success Response:**

```json
{
  "status": "success",
  "data": { "selector": "a.cta", "attribute": "href", "expected": "/signup", "actual": "/signup", "passed": true }
}
```

**Failure Response:**

```json
{
  "status": "error",
  "error": "Attribute assertion failed. Attribute \"href\" on \"a.cta\": Expected: \"/signup\", Actual: \"/login\""
}
```

---

#### `assert_checked`

Assert that a checkbox or radio button is checked or unchecked.

| Arg          | Type        | Required | Default  | Description            |
| ------------ | ----------- | -------- | -------- | ---------------------- |
| `selector` | `string`  | Yes      | -        | CSS/XPath selector     |
| `checked`  | `boolean` | No       | `true` | Expected checked state |
| `timeout`  | `integer` | No       | -        | Timeout in ms          |

**Payload Examples:**

```json
{
  "tool": "assert_checked",
  "sessionId": "abc-123",
  "args": { "selector": "#agree-terms" }
}
```

```json
{
  "tool": "assert_checked",
  "sessionId": "abc-123",
  "args": { "selector": "#agree-terms", "checked": true }
}
```

```json
{
  "tool": "assert_checked",
  "sessionId": "abc-123",
  "args": { "selector": "#newsletter", "checked": false }
}
```

```json
{
  "tool": "assert_checked",
  "sessionId": "abc-123",
  "args": { "selector": "input[name='plan'][value='pro']", "checked": true, "timeout": 3000 }
}
```

**Success Response:**

```json
{
  "status": "success",
  "data": { "selector": "#agree-terms", "expected": true, "actual": true, "passed": true }
}
```

**Failure Response:**

```json
{
  "status": "error",
  "error": "Checked assertion failed. Element \"#agree-terms\": Expected checked=true, Actual checked=false"
}
```

---

#### `assert_enabled`

Assert that an element is enabled or disabled.

| Arg          | Type        | Required | Default  | Description            |
| ------------ | ----------- | -------- | -------- | ---------------------- |
| `selector` | `string`  | Yes      | -        | CSS/XPath selector     |
| `enabled`  | `boolean` | No       | `true` | Expected enabled state |
| `timeout`  | `integer` | No       | -        | Timeout in ms          |

**Payload Examples:**

```json
{
  "tool": "assert_enabled",
  "sessionId": "abc-123",
  "args": { "selector": "#submit-btn" }
}
```

```json
{
  "tool": "assert_enabled",
  "sessionId": "abc-123",
  "args": { "selector": "#submit-btn", "enabled": true }
}
```

```json
{
  "tool": "assert_enabled",
  "sessionId": "abc-123",
  "args": { "selector": "#delete-btn", "enabled": false }
}
```

```json
{
  "tool": "assert_enabled",
  "sessionId": "abc-123",
  "args": { "selector": "button.save", "enabled": true, "timeout": 5000 }
}
```

**Success Response:**

```json
{
  "status": "success",
  "data": { "selector": "#submit-btn", "expected": true, "actual": true, "passed": true }
}
```

**Failure Response:**

```json
{
  "status": "error",
  "error": "Enabled assertion failed. Element \"#submit-btn\": Expected enabled=true, Actual enabled=false"
}
```

---

#### `assert_value`

Assert that an input element's value matches.

| Arg          | Type        | Required | Default | Description          |
| ------------ | ----------- | -------- | ------- | -------------------- |
| `selector` | `string`  | Yes      | -       | CSS/XPath selector   |
| `expected` | `string`  | Yes      | -       | Expected input value |
| `timeout`  | `integer` | No       | -       | Timeout in ms        |

**Payload Examples:**

```json
{
  "tool": "assert_value",
  "sessionId": "abc-123",
  "args": { "selector": "#email", "expected": "user@example.com" }
}
```

```json
{
  "tool": "assert_value",
  "sessionId": "abc-123",
  "args": { "selector": "#quantity", "expected": "5" }
}
```

```json
{
  "tool": "assert_value",
  "sessionId": "abc-123",
  "args": { "selector": "input[name='search']", "expected": "", "timeout": 3000 }
}
```

**Success Response:**

```json
{
  "status": "success",
  "data": { "selector": "#email", "expected": "user@example.com", "actual": "user@example.com", "passed": true }
}
```

**Failure Response:**

```json
{
  "status": "error",
  "error": "Value assertion failed. Element \"#email\": Expected: \"user@example.com\", Actual: \"admin@example.com\""
}
```

---

### Zephyr Tools

#### `zephyr_update_test`

Update test execution result in Zephyr Scale Cloud.

| Arg                 | Type        | Required | Default | Description                                                                |
| ------------------- | ----------- | -------- | ------- | -------------------------------------------------------------------------- |
| `projectKey`      | `string`  | Yes      | -       | Jira project key (e.g.,`"UZ2"`)                                          |
| `testCaseKey`     | `string`  | Yes      | -       | Zephyr test case key (e.g.,`"UZ2-T123"`)                                 |
| `statusName`      | `string`  | Yes      | -       | `"Pass"` \| `"Fail"` \| `"Blocked"` \| `"WIP"` \| `"Unexecuted"` |
| `testCycleKey`    | `string`  | No       | -       | Zephyr test cycle key (e.g.,`"UZ2-R5"`)                                  |
| `comment`         | `string`  | No       | -       | Optional execution comment                                                 |
| `executionTime`   | `integer` | No       | -       | Execution time in milliseconds                                             |
| `environmentName` | `string`  | No       | -       | Environment name (e.g.,`"Production"`)                                   |
| `actualEndDate`   | `string`  | No       | -       | ISO 8601 date string                                                       |

**Payload Examples:**

```json
{
  "tool": "zephyr_update_test",
  "sessionId": "abc-123",
  "args": {
    "projectKey": "UZ2",
    "testCaseKey": "UZ2-T123",
    "statusName": "Pass",
    "testCycleKey": "UZ2-R5",
    "comment": "Automation test passed"
  }
}
```

```json
{
  "tool": "zephyr_update_test",
  "sessionId": "abc-123",
  "args": {
    "projectKey": "UZ2",
    "testCaseKey": "UZ2-T456",
    "statusName": "Fail",
    "testCycleKey": "UZ2-R5",
    "environmentName": "Staging",
    "executionTime": 4500
  }
}
```

**Bulk Update Example:**

```json
{
  "tool": "zephyr_update_test",
  "sessionId": "abc-123",
  "args": [
    {
      "projectKey": "UZ2",
      "testCaseKey": "UZ2-T5340",
      "statusName": "Pass",
      "testCycleKey": "UZ2-R6",
      "environmentName": "dev",
      "executionTime": 1200,
      "comment": "Executed via Playwright MCP Server"
    },
    {
      "projectKey": "UZ2",
      "testCaseKey": "UZ2-T5341",
      "statusName": "Fail",
      "testCycleKey": "UZ2-R6",
      "environmentName": "dev",
      "executionTime": 1500,
      "comment": "Element not found"
    }
  ]
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": 1234567,
    "key": "UZ2-E123",
    "self": "https://api.zephyrscale.smartbear.com/v2/testexecutions/1234567"
  }
}
```

---

### Database Tools (OTP)

#### `db_query`

Execute a custom SQL query on the PostgreSQL database (e.g., to fetch an OTP).

| Arg        | Type       | Required | Default | Description                        |
| ---------- | ---------- | -------- | ------- | ---------------------------------- |
| `query`  | `string` | Yes      | -       | SQL query to execute               |
| `values` | `array`  | No       | -       | Parameterized values for the query |

**Payload Example (Get OTP):**

```json
{
  "tool": "db_query",
  "sessionId": "abc-123",
  "args": {
    "query": "SELECT otp FROM users WHERE email = $1 ORDER BY created_at DESC LIMIT 1",
    "values": ["user@example.com"]
  }
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "rowCount": 1,
    "rows": [
      { "otp": "123456" }
    ]
  }
}
```

#### `get_otp`

Simplified tool to fetch the latest OTP for a user.

| Arg | Type | Required | Default | Description |
|-----|------|----------|---------|-------------|
| `email` | `string` | No* | - | User's email address |
| `phone` | `string` | No* | - | User's phone number |
| `table` | `string` | No | `"otps"` | Table name to search in |
| `otpColumn` | `string` | No | `"otp"` | Column name containing the OTP |
| `identifierColumn` | `string` | No | `"email"` | Column name for the identifier |

*\*Either email or phone is required.*

**Payload Example:**

```json
{
  "tool": "get_otp",
  "sessionId": "abc-123",
  "args": {
    "email": "user@example.com"
  }
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "otp": "123456",
    "identifier": "user@example.com",
    "fetchedAt": "2026-03-05T19:30:00Z"
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code    | Meaning                                                            |
| ------- | ------------------------------------------------------------------ |
| `200` | Tool executed successfully                                         |
| `400` | Bad request (invalid input, unknown tool, missing session ID)      |
| `404` | Session not found                                                  |
| `422` | Tool execution failed (assertion failure, element not found, etc.) |
| `429` | Max concurrent sessions reached                                    |
| `500` | Internal server error                                              |

### Error Response Format

```json
{
  "status": "error",
  "error": "Description of what went wrong",
  "screenshot": "<optional_base64_png_screenshot_on_failure>"
}
```

The `screenshot` field is included when `SCREENSHOT_ON_FAILURE` is enabled (default) and a tool execution fails after all retry attempts. This helps debug what was on the page when the error occurred.

### Retry Behavior

Tool executions are automatically retried up to `RETRY_ATTEMPTS` (default: 3) times with a `RETRY_DELAY` (default: 1000ms) between attempts. If all attempts fail, the error response includes a failure screenshot.

---

## Complete Workflow Example

```bash
# 1. Start a session
curl -X POST http://localhost:3002/session/start \
  -H "Content-Type: application/json" \
  -d '{"viewport": {"width": 1280, "height": 720}}'
# Response: {"status":"success","data":{"sessionId":"abc-123",...}}

# 2. Navigate to a page
curl -X POST http://localhost:3002/tool \
  -H "Content-Type: application/json" \
  -d '{"tool":"navigate","sessionId":"abc-123","args":{"url":"https://example.com"}}'

# 3. Test a locator to find the right selector
curl -X POST http://localhost:3002/tool \
  -H "Content-Type: application/json" \
  -d '{"tool":"test_locator","sessionId":"abc-123","args":{"selector":"input[type=text]"}}'

# 4. Fill in a form
curl -X POST http://localhost:3002/tool \
  -H "Content-Type: application/json" \
  -d '{"tool":"fill","sessionId":"abc-123","args":{"selector":"#email","value":"test@example.com"}}'

# 5. Click submit
curl -X POST http://localhost:3002/tool \
  -H "Content-Type: application/json" \
  -d '{"tool":"click","sessionId":"abc-123","args":{"selector":"#submit"}}'

# 6. Assert the result
curl -X POST http://localhost:3002/tool \
  -H "Content-Type: application/json" \
  -d '{"tool":"assert_text","sessionId":"abc-123","args":{"selector":".success-message","expected":"Thank you"}}'

# 7. Take a screenshot
curl -X POST http://localhost:3002/tool \
  -H "Content-Type: application/json" \
  -d '{"tool":"screenshot","sessionId":"abc-123","args":{"fullPage":true}}'

# 8. Close the session
curl -X POST http://localhost:3002/session/close \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"abc-123"}'
```
