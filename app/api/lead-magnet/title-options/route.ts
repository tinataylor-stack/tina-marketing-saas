import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type RequestBody = {
  leadMagnetDraft: string;
  currentProblem?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const { leadMagnetDraft, currentProblem } = body;

    if (!leadMagnetDraft) {
      return NextResponse.json(
        { error: "ไม่พบ leadMagnetDraft สำหรับสร้าง Title Options" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are a Thai lead magnet naming strategist.

Your job is to generate title options for the LEAD MAGNET itself.

Important:
- You are naming the free lead magnet resource
- You are NOT naming the paid next step, course, workshop, service, or offer
- If the draft mentions a next step, treat it as background context only
- Do NOT generate titles that sound like course names, workshop names, or paid program names

Rules:
- Write in Thai
- Titles should be clear, benefit-driven, and easy to understand
- Titles should feel suitable for a free lead magnet such as a PDF guide, checklist, mini guide, cheat sheet, workbook, or article
- Avoid vague titles
- Avoid titles that sound like product names for the next offer
- Keep them concise but meaningful
- Make them attractive for business owners
- Return title options only

Return ONLY valid JSON.

JSON format:
{
  "titleOptions": [
    "title1",
    "title2",
    "title3",
    "title4",
    "title5"
  ]
}
`.trim();

    const userPrompt = `
สร้าง Title Options สำหรับ LEAD MAGNET ด้านล่าง

Lead Magnet Draft:
${leadMagnetDraft}

${currentProblem ? `Problem the customer is trying to solve: ${currentProblem}` : ""}

คำสั่งสำคัญ:
- ตั้งชื่อให้ "lead magnet" เท่านั้น
- ห้ามตั้งชื่อให้ next step offer
- ห้ามตั้งชื่อให้คอร์ส เวิร์กช็อป โปรแกรม หรือข้อเสนอขาย
- ถ้าใน draft มี section ขั้นตอนถัดไป ให้มองส่วนนั้นเป็นแค่บริบท ไม่ใช่สิ่งที่ต้องตั้งชื่อ
- ชื่อต้องสะท้อนเนื้อหาของ free resource ที่คนจะได้รับก่อน

แนวทาง:
- Generate 5 title options
- แต่ละชื่อควรสะท้อนประโยชน์หลักหรือ transformation ของ lead magnet
- ชื่อควรเหมาะกับ resource ฟรี เช่น PDF guide, checklist, mini guide, workbook, article
- หลีกเลี่ยงชื่อที่ฟังเหมือนชื่อคอร์สหรือชื่อโปรแกรม
- หลีกเลี่ยงคำที่ชวนให้รู้สึกว่าเป็น offer แบบเสียเงิน
`.trim();

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1",
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: userPrompt }],
        },
      ],
    });

    const rawText = response.output_text?.trim();

    if (!rawText) {
      return NextResponse.json(
        { error: "OpenAI ไม่ได้ส่งผลลัพธ์กลับมา" },
        { status: 500 }
      );
    }

    let parsed: { titleOptions?: string[] };

    try {
      parsed = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        {
          error: "ไม่สามารถอ่าน JSON จาก OpenAI ได้",
          raw: rawText,
        },
        { status: 500 }
      );
    }

    if (!Array.isArray(parsed.titleOptions)) {
      return NextResponse.json(
        { error: "ผลลัพธ์ไม่มี titleOptions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      titleOptions: parsed.titleOptions,
    });
  } catch (error) {
    console.error("title-options route error:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้าง Title Options" },
      { status: 500 }
    );
  }
}