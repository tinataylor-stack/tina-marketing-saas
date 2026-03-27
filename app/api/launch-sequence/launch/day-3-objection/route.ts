import { NextResponse } from "next/server";
import {
  createLaunchMessages,
  type LaunchRequestBody,
  validateLaunchRequest,
} from "../shared";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LaunchRequestBody;

    if (!validateLaunchRequest(body)) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบสำหรับสร้างข้อความ Launch Day 3" },
        { status: 400 }
      );
    }

    return await createLaunchMessages(body, {
      schemaName: "launch_day_3_objection_message",
      dayLabel: "Day 3: Proof / Belief",
      messageCount: 1,
      dayGoal:
        "ใช้ proof, testimonial energy, หรือ transformation pattern เพื่อทำให้คนอ่านรู้สึกว่าคนแบบเขาก็ทำได้จริง และข้อเสนอนี้เหมาะกับเขา",
      dayLeadAngles: [
        "Primary: proof / testimonial / belief-transfer",
        "Secondary: offer fit",
        "Supporting: one different priority objection",
      ],
      messageAnatomy: [
        "Open with a proof-led or testimonial-style headline angle that immediately makes the reader curious and hopeful.",
        "Use the provided testimonial or proof notes when available; otherwise use believable transformation framing or pattern recognition.",
        "Show why the result feels believable for someone like the reader, not just for a perfect or already-ready customer.",
        "Reconnect that proof to why this offer is designed to help that kind of person.",
        "Address one different hesitation from Priority Objections, but keep it inside the selling flow.",
        "Make the message feel more confidence-building than defensive, and more headline-led than explanatory.",
        "Close with a direct CTA.",
      ],
      extraRules: [
        "This message should feel different from Day 2 by leading with belief, not value-first explanation.",
        "Use 'คนแบบคุณก็ทำได้' energy without sounding cheesy or making fake claims.",
        "If testimonial or proof notes are provided, use them before fallback belief language.",
        "Do not invent named testimonials if none were provided.",
        "The message should increase self-belief and offer-fit at the same time.",
      ],
    });
  } catch (error) {
    console.error("LAUNCH DAY 3 ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างข้อความ Launch Day 3" },
      { status: 500 }
    );
  }
}
