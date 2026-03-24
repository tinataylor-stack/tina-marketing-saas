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
        { error: "ข้อมูลไม่ครบสำหรับสร้างข้อความ Launch Day 2" },
        { status: 400 }
      );
    }

    return await createLaunchMessages(body, {
      schemaName: "launch_day_2_objection_message",
      dayLabel: "Day 2: Objection Handling",
      messageCount: 1,
      dayGoal:
        "คลาย objection สำคัญหนึ่งข้อในแบบที่ช่วยให้คนรู้สึกเข้าใจตัวเองมากขึ้นและขยับใกล้การตัดสินใจ",
      extraRules: [
        "Focus on one core objection only and answer it naturally inside the message.",
        "Do not make the message sound defensive or like a FAQ list.",
        "The message should still move the sale forward, not just explain.",
        "Keep the CTA clear and actionable for LINE.",
      ],
    });
  } catch (error) {
    console.error("LAUNCH DAY 2 ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างข้อความ Launch Day 2" },
      { status: 500 }
    );
  }
}
