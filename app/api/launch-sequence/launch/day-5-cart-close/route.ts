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
