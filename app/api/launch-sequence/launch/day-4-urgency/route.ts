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
        { error: "ข้อมูลไม่ครบสำหรับสร้างข้อความ Launch Day 4" },
        { status: 400 }
      );
    }

    return await createLaunchMessages(body, {
      schemaName: "launch_day_4_urgency_messages",
      dayLabel: "Day 4: Objection + Scarcity + Urgency",
      messageCount: 2,
      dayGoal:
        "เพิ่มแรงตัดสินใจด้วย urgency ที่น่าเชื่อถือ ทำให้เห็นว่าทำไมควรขยับตอนนี้ โดยยังเชื่อมกับคุณค่าของ offer และ hesitation ที่เหลืออยู่",
      dayLeadAngles: [
        "Primary: urgency / timing",
        "Secondary: offer value",
        "Supporting: one remaining hesitation",
      ],
      messageAnatomy: [
        "Message 1 anatomy: open from delay, hesitation, or the idea of deciding later, show why waiting is costly in this specific situation, re-anchor the value of the offer, briefly address one remaining hesitation, and end with a clear CTA.",
        "Message 2 anatomy: open with the closing window or urgency mechanism, make the urgency concrete and believable, reinforce what the reader stands to gain if they move now, make the consequence of missing this window feel real, and end with a stronger CTA than Message 1.",
        "Both messages should escalate naturally from persuasion to pressure without sounding panicked or generic.",
      ],
      extraRules: [
        "Message 1 should still feel persuasive, not just pressure-heavy.",
        "Message 2 should feel more urgent, but not desperate or spammy.",
        "Use the provided urgency mechanism specifically, not vaguely.",
        "Keep value and urgency connected so the message still sells, not just pushes.",
      ],
    });
  } catch (error) {
    console.error("LAUNCH DAY 4 ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างข้อความ Launch Day 4" },
      { status: 500 }
    );
  }
}
