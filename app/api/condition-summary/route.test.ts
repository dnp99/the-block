
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeVehicle } from "@/test/fixtures";

vi.mock("@/server/rateLimit", () => ({ isWithinRateLimit: vi.fn(() => true) }));
vi.mock("@/server/claude", () => ({
  hasAnthropicKey: vi.fn(() => true),
  getAnthropic: vi.fn(),
  SEARCH_MODEL: "claude-test",
}));
vi.mock("@/lib/data/vehicles", () => ({ getVehicleById: vi.fn() }));

import { POST } from "@/app/api/condition-summary/route";
import { getVehicleById } from "@/lib/data/vehicles";
import { getAnthropic, hasAnthropicKey } from "@/server/claude";
import { isWithinRateLimit } from "@/server/rateLimit";

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/condition-summary", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

const mockSummary = (text: string) =>
  vi.mocked(getAnthropic).mockReturnValue({
    messages: {
      create: vi.fn().mockResolvedValue({ content: [{ type: "text", text }] }),
    },
  } as never);

beforeEach(() => {
  vi.mocked(isWithinRateLimit).mockReturnValue(true);
  vi.mocked(hasAnthropicKey).mockReturnValue(true);
  vi.mocked(getVehicleById).mockReturnValue(makeVehicle());
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("POST /api/condition-summary", () => {
  it("429 when rate-limited", async () => {
    vi.mocked(isWithinRateLimit).mockReturnValue(false);
    expect((await post({ id: "v1" })).status).toBe(429);
  });

  it("404 when the vehicle is unknown", async () => {
    vi.mocked(getVehicleById).mockReturnValue(undefined);
    expect((await post({ id: "nope" })).status).toBe(404);
  });

  it("503 when the API key is missing", async () => {
    vi.mocked(hasAnthropicKey).mockReturnValue(false);
    expect((await post({ id: "v1" })).status).toBe(503);
  });

  it("returns the trimmed summary on success", async () => {
    mockSummary("  This is a solid daily driver.  ");
    const res = await post({ id: "v1" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ summary: "This is a solid daily driver." });
  });

  it("502 on an empty summary", async () => {
    mockSummary("   ");
    expect((await post({ id: "v1" })).status).toBe(502);
  });
});
