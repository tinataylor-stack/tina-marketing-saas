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
        { error: "ข้อมูลไม่ครบสำหรับสร้างข้อความ Launch Day 5" },
        { status: 400 }
      );
    }

    return await createLaunchMessages(body, {
      schemaName: "launch_day_5_cart_close_messages",
      dayLabel: "Day 5: Last Call / Cart Close",
      messageCount: 3,
      dayGoal:
        "สร้างลำดับข้อความวันปิด cart ตั้งแต่เตือนรอบสุดท้าย ไปจนถึงแรงผลักขั้นสุดท้าย และข้อความปิดการขาย",
      dayLeadAngles: [
        "Primary: deadline and decision",
        "Secondary: consequence of waiting",
        "Supporting: final reminder of offer value when useful",
      ],
      messageAnatomy: [
        "Message 1 anatomy: remind the reader that this is the last day, reconnect them to who the offer is for and what problem it solves, then invite action before time runs out.",
        "Message 2 anatomy: intensify urgency by naming the consequence of waiting, make the deadline feel close and real, and drive a stronger CTA.",
        "Message 3 anatomy: final close only; state that the window is closing or about to close, keep the message tighter than the earlier ones, and make the CTA immediate and direct.",
      ],
      extraRules: [
        "Message 1 should feel like a believable last-day reminder, not the absolute final push yet.",
        "Message 2 should raise urgency more strongly and make the cost of waiting feel real.",
        "Message 3 should feel like the final close or last chance message.",
        "The three messages should escalate in intensity from one send to the next.",
        "Use the urgency mechanism clearly and make the deadline feel concrete.",
      ],
    });
  } catch (error) {
    console.error("LAUNCH DAY 5 ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างข้อความ Launch Day 5" },
      { status: 500 }
    );
  }
}
