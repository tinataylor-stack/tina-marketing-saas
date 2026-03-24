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
      dayLabel: "Day 3: Objection Handling",
      messageCount: 1,
      dayGoal:
        "แก้ objection อีกมุมหนึ่งที่ต่างจาก Day 2 เพื่อพาคนที่ยังลังเลให้เห็นภาพว่าข้อเสนอนี้เหมาะกับเขาจริง",
      extraRules: [
        "Choose a different objection angle or psychological block from Day 2.",
        "The message should feel fresh, not like a rewritten version of the previous day's broadcast.",
        "The body should create clarity and confidence before asking for action.",
        "Keep the closing action pointed toward the offer and the provided checkout direction.",
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
