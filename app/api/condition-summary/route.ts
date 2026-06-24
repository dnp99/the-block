import { NextResponse } from "next/server";
import { getAnthropic, hasAnthropicKey, SEARCH_MODEL } from "@/server/claude";
import { getVehicleById } from "@/lib/data/vehicles";
import {
  CONDITION_SUMMARY_SYSTEM,
  conditionSummaryUserMessage,
} from "@/server/prompts";
import { rateLimit } from "@/server/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let id = "";
  try {
    const body = await req.json();
    if (typeof body?.id === "string") id = body.id;
  } catch {
  }

  const vehicle = getVehicleById(id);
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

  if (!hasAnthropicKey()) {
    return NextResponse.json({ error: "AI summary not configured" }, { status: 503 });
  }

  try {
    const message = await getAnthropic().messages.create({
      model: SEARCH_MODEL,
      max_tokens: 200,
      system: CONDITION_SUMMARY_SYSTEM,
      messages: [{ role: "user", content: conditionSummaryUserMessage(vehicle) }],
    });

    const summary = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    if (!summary) return NextResponse.json({ error: "Empty summary" }, { status: 502 });
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("[/api/condition-summary] Claude call failed", err);
    return NextResponse.json({ error: "AI summary failed" }, { status: 502 });
  }
}
