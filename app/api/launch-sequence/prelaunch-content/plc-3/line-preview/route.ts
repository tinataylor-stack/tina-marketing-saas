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
  plc3: PlcSection;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const { avatarAnalysis, structuredAvatar, foundation, plc3 } = body;

    if (
      !avatarAnalysis ||
      !structuredAvatar ||
      !foundation?.offerName ||
      !foundation?.offerDescription ||
      !plc3?.headline ||
      !plc3?.contentOutline ||
      !plc3?.talkingPoints ||
      !plc3?.cta
    ) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบสำหรับสร้างตัวอย่างข้อความ Line OA ของ Prelaunch 3" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are a Thai launch content strategist and Line OA copywriter.

Your job is to create short Thai Line OA preview messages for PLC 3 only.

Important:
- This is for PLC 3 only.
- Create exactly 3 short Line OA preview options.
- Each option should tease the full PLC 3 content before the user clicks to read more.
- Do not write PLC 1 or PLC 2.
- Do not hard-sell the offer.
- Do not write the full lesson.
- Do not mention, hint at, or reveal the product, program, offer details, or launch announcement.
- Do not use sales-like clues such as course, program, class, workshop, package, enrollment, bonus, support, coaching, mentor, group, community, or anything that sounds like what the buyer will get.
- Do not imply there is a ready-made system, training plan, or paid solution waiting behind the click.

Rules:
1. Write in Thai only.
2. Keep each option concise and natural for Line OA.
3. Make the 3 options feel distinct in phrasing or angle.
4. The options should hint at the ownership outcome, problem 3, or the final breakthrough.
5. The options should create curiosity toward the insight, explanation, or solution inside PLC 3.
6. Avoid emojis.
7. Keep the preview focused on the content itself, not on selling or revealing what is being launched.
8. Keep the preview focused only on the reader's internal problem, misunderstanding, hesitation, or insight inside PLC 3.
`;

    const userPrompt = `
Create 3 Line OA preview options for PLC 3 from the strategy below.

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

[PLC 3 STRATEGY]
Headline: ${plc3.headline}

Content Outline:
${plc3.contentOutline}

Talking Points:
${plc3.talkingPoints}

CTA:
${plc3.cta}

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
          name: "plc_3_line_preview_options",
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
    console.error("PLC 3 LINE PREVIEW ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างตัวอย่างข้อความ Line OA ของ Prelaunch 3" },
      { status: 500 }
    );
  }
}
