import OpenAI from "openai";
import { NextResponse } from "next/server";

type FoundationSummary = {
  offerName: string;
  offerDescription: string;
  offerFormat: string;
  price: string;
  launchGoal: string;
  launchContext: string;
};

type PlcSection = {
  headline: string;
  contentOutline: string;
  talkingPoints: string;
  cta: string;
};

type RequestBody = {
  avatarAnalysis: string;
  structuredAvatar: Record<string, unknown> | null;
  foundation: FoundationSummary;
  plc2: PlcSection;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const { avatarAnalysis, structuredAvatar, foundation, plc2 } = body;

    if (
      !avatarAnalysis ||
      !structuredAvatar ||
      !foundation?.offerName ||
      !foundation?.offerDescription ||
      !plc2?.headline ||
      !plc2?.contentOutline ||
      !plc2?.talkingPoints ||
      !plc2?.cta
    ) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบสำหรับสร้างตัวอย่างข้อความ Line OA ของ Prelaunch 2" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are a Thai launch content strategist and Line OA copywriter.

Your job is to create short Thai Line OA preview messages for PLC 2 only.

Important:
- This is for PLC 2 only.
- Create exactly 3 short Line OA preview options.
- Each option should make the reader want to open and read the full PLC 2 content.
- Do not write PLC 1 or PLC 3.
- Do not hard-sell the offer.
- Do not write the full lesson.

Rules:
1. Write in Thai only.
2. Keep each option concise and natural for Line OA.
3. Make the 3 options feel distinct in phrasing or angle.
4. The options should hint at the transformation or problem 2.
5. The options should create curiosity toward the insight, explanation, or solution inside PLC 2.
6. Avoid emojis.
7. Do not frame the message as a lead-in to PLC 3 or the next step.
`;

    const userPrompt = `
Create 3 Line OA preview options for PLC 2 from the strategy below.

[AVATAR ANALYSIS]
${avatarAnalysis}

[STRUCTURED AVATAR]
${JSON.stringify(structuredAvatar, null, 2)}

[LAUNCH FOUNDATION]
Offer: ${foundation.offerName}
Offer Description: ${foundation.offerDescription}
Offer Format: ${foundation.offerFormat}
Price: ${foundation.price}
Launch Goal: ${foundation.launchGoal}
Launch Context: ${foundation.launchContext || "-"}

[PLC 2 STRATEGY]
Headline: ${plc2.headline}

Content Outline:
${plc2.contentOutline}

Talking Points:
${plc2.talkingPoints}

CTA:
${plc2.cta}

Return valid JSON with exactly this key:
- "linePreviewOptions": string[]
`;

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "plc_2_line_preview_options",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              linePreviewOptions: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ["linePreviewOptions"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.output_text || "{}");

    return NextResponse.json({
      linePreviewOptions: Array.isArray(parsed.linePreviewOptions)
        ? parsed.linePreviewOptions
        : [],
    });
  } catch (error) {
    console.error("PLC 2 LINE PREVIEW ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างตัวอย่างข้อความ Line OA ของ Prelaunch 2" },
      { status: 500 }
    );
  }
}
