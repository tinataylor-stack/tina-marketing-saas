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
        { error: "ข้อมูลไม่ครบสำหรับสร้างข้อความ Launch Day 1" },
        { status: 400 }
      );
    }

    return await createLaunchMessages(body, {
      schemaName: "launch_day_1_cart_open_messages",
      dayLabel: "Day 1: Cart Open",
      messageCount: 2,
      dayGoal:
        "เปิดขายอย่างชัดเจน ทำให้คนรู้ว่า offer เปิดแล้ว พร้อมอธิบายว่าเหมาะกับใครและทำไมควรขยับตอนนี้",
      extraRules: [
        "Message 1 should announce that the cart is open and make the offer feel clear and relevant.",
        "Message 2 should deepen desire or clarity so the audience sees why this offer matters now.",
        "Do not use heavy scarcity pressure too early, but it is okay to mention launch timing lightly.",
        "The two messages should not feel repetitive or use the same opening structure.",
      ],
    });
  } catch (error) {
    console.error("LAUNCH DAY 1 ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างข้อความ Launch Day 1" },
      { status: 500 }
    );
  }
}
