import { NextResponse } from "next/server";
import { getAnthropic, hasAnthropicKey, SEARCH_MODEL } from "@/lib/claude";
import { parseSearchFilters } from "@/lib/contracts/search";
import { SEARCH_SYSTEM, SEARCH_TOOL } from "@/lib/prompts";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let query = "";
  try {
    const body = await req.json();
    if (typeof body?.query === "string") query = body.query;
  } catch {
    // ignore — handled by the length check below
  }

  if (query.trim().length < 3) return NextResponse.json({ filters: {} });

  if (!hasAnthropicKey()) {
    return NextResponse.json({ error: "AI search not configured" }, { status: 503 });
  }

  try {
    const message = await getAnthropic().messages.create({
      model: SEARCH_MODEL,
      max_tokens: 256,
      system: SEARCH_SYSTEM,
      tools: [SEARCH_TOOL],
      tool_choice: { type: "tool", name: SEARCH_TOOL.name },
      messages: [{ role: "user", content: query }],
    });

    const toolUse = message.content.find((block) => block.type === "tool_use");
    const filters = parseSearchFilters(toolUse?.input ?? {});
    return NextResponse.json({ filters });
  } catch (err) {
    console.error("[/api/search] Claude call failed", err);
    return NextResponse.json({ error: "AI search failed" }, { status: 502 });
  }
}
