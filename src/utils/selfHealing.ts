import { Page } from "playwright";
import { config } from "../config/config";
import { logger } from "./logger";
import dns from "dns";
import { promisify } from "util";

const lookup = promisify(dns.lookup);

export async function attemptSelfHealing(page: Page, failedSelector: string, toolName: string): Promise<string | null> {
  if (!config.ai.enabled || !config.ai.apiKey) {
    return null;
  }

  try {
    // Basic connectivity test
    const host = new URL(config.ai.baseUrl).hostname;
    await lookup(host).catch(err => {
      logger.error("DNS Lookup failed for AI host", { host, error: String(err) });
      throw new Error(`DNS Lookup failed for ${host}`);
    });

    logger.info("Initiating self-healing for selector", { failedSelector, tool: toolName });

    // Extract a simplified representation of the DOM (interactive elements + structural context)
    const domSnapshot = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, a, input, textarea, select, [role="button"], [role="link"], label, h1, h2, h3, p')) as HTMLElement[];
      
      return elements.map((el: HTMLElement) => {
        // Clone to avoid modifying the actual page
        const clone = el.cloneNode(false) as HTMLElement;
        // Keep essential attributes
        const attributesToKeep = ['id', 'class', 'name', 'type', 'placeholder', 'role', 'aria-label', 'href', 'value'];
        Array.from(clone.attributes).forEach(attr => {
          if (!attributesToKeep.includes(attr.name)) {
            clone.removeAttribute(attr.name);
          }
        });
        // Add truncated text content
        const text = el.textContent?.trim();
        if (text) {
          clone.innerHTML = text.length > 50 ? text.substring(0, 50) + '...' : text;
        }
        return clone.outerHTML;
      }).join('\n').substring(0, 8000); // Limit to ~8k chars to fit context window
    });

    const prompt = `
You are an expert in Playwright and CSS selectors.
A Playwright automation script failed to find an element using the following selector:
FAILED SELECTOR: "${failedSelector}"
ACTION ATTEMPTED: "${toolName}"

Here is a simplified snapshot of the current DOM elements on the page:
\`\`\`html
${domSnapshot}
\`\`\`

Based on the failed selector's intent and the current DOM snapshot, determine the most robust and accurate new CSS selector or Playwright text locator (e.g., 'text="Login"' or 'button:has-text("Submit")') to target the intended element.

Respond ONLY with the raw selector string. Do NOT include markdown formatting (like \`\`\`css), explanations, or quotes around the selector. If you cannot determine a valid selector, respond with the exact word: UNKNOWN
`;

    const url = `${config.ai.baseUrl}/chat/completions`;
    logger.info("Sending self-healing request", { url, model: config.ai.model });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.ai.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: config.ai.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1
      })
    }).catch(err => {
      logger.error("Fetch call physically failed", { error: String(err), url });
      throw err;
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Could not read error body");
      logger.warn("Self-healing AI request failed", { status: response.status, body: errorBody });
      return null;
    }

    const data: any = await response.json();
    let newSelector = data.choices?.[0]?.message?.content?.trim();

    if (newSelector && newSelector !== "UNKNOWN" && newSelector !== failedSelector) {
      // Remove any accidental markdown formatting the LLM might have included despite instructions
      newSelector = newSelector.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();
      
      logger.info("Self-healing successful, generated new selector", { old: failedSelector, new: newSelector });
      return newSelector;
    }

  } catch (error) {
    logger.error("Self-healing encountered an error", { error: String(error) });
  }

  return null;
}
