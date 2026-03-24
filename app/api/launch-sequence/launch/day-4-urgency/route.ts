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
        "เร่งการตัดสินใจอย่างจริงจังขึ้น โดยผสาน objection handling เข้ากับ scarcity และ urgency แบบน่าเชื่อถือ",
      extraRules: [
        "Message 1 should still help with hesitation while increasing seriousness about acting now.",
        "Message 2 should lean more clearly into urgency or scarcity without sounding desperate.",
        "Use the provided urgency mechanism concretely.",
        "The two messages should escalate naturally from each other and prepare the audience for Day 5.",
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
