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
        "ชูจุดขายสำคัญของ offer ทำให้คุณค่ารู้สึกจับต้องได้ สร้างความเชื่อว่าผลลัพธ์นี้เป็นไปได้ และคลาย objection ที่เกี่ยวข้องอย่างเป็นธรรมชาติ",
      dayLeadAngles: [
        "Primary: offer value / จุดขาย",
        "Secondary: belief / proof / this can work for someone like me",
        "Supporting: one relevant priority objection",
      ],
      messageAnatomy: [
        "Open with a sharp pain point, stuck situation, or missed result the audience still relates to.",
        "Introduce one specific selling point of the offer that directly answers that problem.",
        "Explain why this point matters in practical terms, not vague marketing language.",
        "Add belief-building language that helps the reader feel this can work for someone like them.",
        "Address one relevant objection from Priority Objections naturally inside the flow.",
        "Close with a direct LINE-friendly CTA.",
      ],
      extraRules: [
        "The selling point should be specific, not generic praise.",
        "The proof or belief section should reduce the feeling of 'ฉันคงทำไม่ได้'.",
        "The message should sell through clarity and credibility, not through pressure.",
        "Do not let the message become only an objection explanation.",
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
