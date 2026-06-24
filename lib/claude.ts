/*
  Server-only Anthropic client. The API key is read from the environment and
  NEVER leaves the server (this module is only imported by API route handlers).
*/
import Anthropic from "@anthropic-ai/sdk";

export const SEARCH_MODEL = "claude-haiku-4-5";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
  if (!client) client = new Anthropic({ apiKey });
  return client;
}

export function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
