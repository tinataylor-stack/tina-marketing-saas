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
You are a lead magnet copywriting expert.

Your job is to generate strong title options for a lead magnet.

Rules:
- Write in Thai
- Titles should be clear and benefit-driven
- Avoid vague titles
- Make them attractive for business owners
- Keep them concise but powerful
- Each title should feel like a real lead magnet title

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
Create title options for the following lead magnet.

Lead Magnet Draft:
${leadMagnetDraft}

${currentProblem ? `Problem the customer is trying to solve: ${currentProblem}` : ""}

Instructions:

- Generate 5 strong title options
- Each title should focus on the main transformation
- Titles should feel suitable for a PDF guide, article, or checklist
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