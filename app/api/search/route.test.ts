// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/rateLimit", () => ({ rateLimit: vi.fn(() => true) }));
vi.mock("@/server/claude", () => ({
  hasAnthropicKey: vi.fn(() => true),
  getAnthropic: vi.fn(),
  SEARCH_MODEL: "claude-test",
}));

import { POST } from "@/app/api/search/route";
import { getAnthropic, hasAnthropicKey } from "@/server/claude";
import { rateLimit } from "@/server/rateLimit";

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

const mockClaude = (input: unknown) =>
  vi.mocked(getAnthropic).mockReturnValue({
    messages: {
      create: vi.fn().mockResolvedValue({ content: [{ type: "tool_use", input }] }),
    },
  } as never);

beforeEach(() => {
  vi.mocked(rateLimit).mockReturnValue(true);
  vi.mocked(hasAnthropicKey).mockReturnValue(true);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("POST /api/search", () => {
  it("429 when rate-limited", async () => {
    vi.mocked(rateLimit).mockReturnValue(false);
    expect((await post({ query: "awd suv" })).status).toBe(429);
  });

  it("returns empty filters for a too-short query without calling Claude", async () => {
    const res = await post({ query: "ab" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ filters: {} });
    expect(getAnthropic).not.toHaveBeenCalled();
  });

  it("503 when the API key is missing", async () => {
    vi.mocked(hasAnthropicKey).mockReturnValue(false);
    expect((await post({ query: "awd suv under 20k" })).status).toBe(503);
  });

  it("returns validated filters and drops unknown fields", async () => {
    mockClaude({ body_style: "SUV", drivetrain: "AWD", price_max: 20000, junk: "x" });
    const res = await post({ query: "awd suv under 20k clean title" });
    expect(res.status).toBe(200);
    const { filters } = await res.json();
    expect(filters).toMatchObject({ body_style: "SUV", drivetrain: "AWD", price_max: 20000 });
    expect(filters).not.toHaveProperty("junk");
  });

  it("502 when the Claude call throws", async () => {
    vi.mocked(getAnthropic).mockReturnValue({
      messages: { create: vi.fn().mockRejectedValue(new Error("boom")) },
    } as never);
    expect((await post({ query: "awd suv under 20k" })).status).toBe(502);
  });
});
