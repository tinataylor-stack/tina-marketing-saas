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
        { error: "ไม่พบ leadMagnetDraft สำหรับสร้าง Suggested Format" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are a Thai lead magnet strategist.

Your job is to recommend the best format for a lead magnet draft.

Rules:
- Write in Thai
- Choose ONE best format only
- The format must be practical and realistic for a business owner to create
- The reason must be clear, strategic, and easy to understand
- Do not return multiple formats

Return ONLY valid JSON.

JSON format:
{
  "suggestedFormat": {
    "format": "...",
    "reason": "..."
  }
}
`.trim();

    const userPrompt = `
วิเคราะห์ lead magnet draft ด้านล่าง แล้วแนะนำรูปแบบที่เหมาะที่สุดเพียง 1 รูปแบบ

Lead Magnet Draft:
${leadMagnetDraft}

${currentProblem ? `Problem the customer is trying to solve: ${currentProblem}` : ""}

คำแนะนำ:
- เลือกเพียง 1 format ที่เหมาะที่สุด
- format ควรเป็นสิ่งที่เจ้าของธุรกิจนำไปทำต่อได้จริง
- ตัวอย่าง format เช่น PDF guide, checklist, article, workbook, cheat sheet
- อธิบายเหตุผลให้ชัด ว่าทำไม format นี้เหมาะกับ draft นี้
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

    let parsed: {
      suggestedFormat?: {
        format?: string;
        reason?: string;
      };
    };

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

    if (
      !parsed.suggestedFormat ||
      !parsed.suggestedFormat.format ||
      !parsed.suggestedFormat.reason
    ) {
      return NextResponse.json(
        { error: "ผลลัพธ์ไม่มี suggestedFormat ที่สมบูรณ์" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      suggestedFormat: {
        format: parsed.suggestedFormat.format,
        reason: parsed.suggestedFormat.reason,
      },
    });
  } catch (error) {
    console.error("suggested-format route error:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้าง Suggested Format" },
      { status: 500 }
    );
  }
}