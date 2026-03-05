# Privacy Policy for Playwright MCP Server

Last Updated: March 5, 2026

This Privacy Policy describes how the Playwright MCP Server ("the Server") handles data when you use it locally or connect it to third-party AI platforms (such as OpenAI GPTs, Google Gemini, Perplexity, or Claude).

## 1. Data Collection and Storage

### Local Operation
The Server is designed to run on your local machine. 
- **Browser Data:** All browser sessions, cookies, and site data generated during automation are stored temporarily on your local machine within the Playwright environment.
- **No Persistence:** By default, the Server does not use a database. All session information is stored in-memory and is cleared when the Server process is restarted or a session is closed.

### Credentials and Secrets
- **Environment Variables:** API tokens for third-party services (e.g., Zephyr Scale, Perplexity AI) are loaded from your local `.env` file or environment.
- **Security:** These tokens are never logged, stored in plain text by the application, or transmitted to any server other than the intended API provider (SmartBear for Zephyr, Perplexity for Search).

## 2. Data Transmission

### AI Platform Integration
When you connect this Server to an AI platform (e.g., via ngrok and OpenAPI):
- **Request Data:** The AI platform sends instructions (tool names and arguments) to your local Server.
- **Response Data:** Your Server sends the results of those actions (text content, screenshots, status codes) back to the AI platform so the AI can process the result.
- **Screenshots:** If enabled, screenshots of the web pages you automate are transmitted to the AI platform to help the AI understand the page state.

### Third-Party APIs
If you use specific tools:
- **Zephyr Tools:** Data about test cases and statuses are sent to SmartBear's Zephyr Scale API.
- **Perplexity Tools:** Search queries are sent to Perplexity AI's API.

## 3. Data Security

- **Local Execution:** Because the code runs on your hardware, you have full control over the environment.
- **No Third-Party Analytics:** This Server does not contain any tracking, telemetry, or third-party analytics scripts.

## 4. User Responsibilities

- **Tunnel Security:** If you use a tool like ngrok to expose your Server to the internet, you are responsible for securing that tunnel (e.g., using ngrok's basic auth or IP whitelisting).
- **Sensitive Data:** Be aware that any data visible in the browser during an automated session may be captured in screenshots and sent to the AI platform you are using.

## 5. Contact

This is an open-source tool. For privacy concerns or questions, please refer to the project's repository or your system administrator.
