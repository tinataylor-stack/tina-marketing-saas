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
  plc1: PlcSection;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const { avatarAnalysis, structuredAvatar, foundation, plc1 } = body;

    if (
      !avatarAnalysis ||
      !structuredAvatar ||
      !foundation?.offerName ||
      !foundation?.offerDescription ||
      !plc1?.headline ||
      !plc1?.contentOutline ||
      !plc1?.talkingPoints ||
      !plc1?.cta
    ) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบสำหรับสร้างเนื้อหา Prelaunch 1" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are a Thai launch content strategist and social content writer.

Your job is to turn a PLC 1 strategy into finished Thai Facebook post content.

Important:
- This is PLC 1 only.
- The content must follow the exact PLC 1 progression.
- You must create 2 separate outputs:
  1. 3 short Thai Line OA preview message options for PLC 1
  2. the full PLC 1 Facebook post
- Do not write PLC 2 or PLC 3.
- Do not pitch the product.
- Do not skip the transition into the next problem.
- The ending must create anticipation for the next content piece.

Rules:
1. Write in Thai only.
2. Keep the content aligned to the provided strategy.
3. Make both outputs feel natural, readable, and aligned to the platform.
4. Use short-to-medium paragraphs for easy reading on social media.
5. Focus on opportunity, problem 1, authority, solution 1, and the reveal of problem 2.
6. The Line OA preview options must be short, teaser-like, and make the user want to click to read the full PLC.
7. The 3 Line OA preview options must feel clearly different in phrasing or angle, while staying aligned to the same PLC 1 strategy.
8. The Line OA preview options must not try to include the full teaching.
9. The Facebook post must end with the provided CTA.
10. Do not format the Facebook post as bullets, outline notes, or section labels.
11. The Facebook post must feel like one long Facebook post from start to finish.
`;

    const userPrompt = `
Create both outputs for PLC 1 from the strategy below.

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

[PLC 1 STRATEGY]
Headline: ${plc1.headline}

Content Outline:
${plc1.contentOutline}

Talking Points:
${plc1.talkingPoints}

CTA:
${plc1.cta}

Output 1: Line OA preview options
- Write 3 short Thai message preview options for Line OA that tease the main idea of PLC 1 before the user clicks to read the full content.
- Keep them concise, high-curiosity, and natural for a Line OA message.
- The options should hint at the opportunity or problem 1 and lightly open the loop toward the full content.
- Make the 3 options feel distinct from one another.
- Do not write the full lesson.
- Do not hard-sell the offer.

Output 2: Full Facebook post
Write one continuous long Facebook post in Thai using this progression:
Start with the provided headline, then show the opportunity clearly so the reader sees a new possibility or shift they may not have noticed before. From there, raise the first problem or struggle they are facing right now in a way that feels specific and relatable. Then establish authority naturally by showing why the creator understands this problem and has real insight into it. After that, solve the first problem with useful teaching, reframe, or method that gives the reader immediate value. Then naturally introduce problem 2 by showing that even after problem 1 is understood, a deeper challenge still remains, and make this part create curiosity for the next piece of content. Finally, close with the provided CTA.

Important writing rules:
- The Facebook post must read like one long Facebook post.
- Do not use bullet points.
- Do not use numbered sections.
- Do not use labels like “opportunity”, “problem”, or “CTA”.
- Do not write like an outline.
- Do not jump ahead into solving problem 2.
- Do not hard-sell the offer.
- Keep the tone natural, engaging, and social-media friendly.
- Use paragraph spacing that feels easy to read in a Facebook post.
- Return valid JSON with exactly these keys:
  - "linePreviewOptions": string[]
  - "content": string
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
          name: "plc_1_content_with_line_preview",
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
              content: { type: "string" },
            },
            required: ["linePreviewOptions", "content"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.output_text || "{}");

    return NextResponse.json({
      linePreviewOptions: Array.isArray(parsed.linePreviewOptions)
        ? parsed.linePreviewOptions
        : [],
      content: parsed.content || "",
    });
  } catch (error) {
    console.error("PLC 1 CONTENT ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างเนื้อหา Prelaunch 1" },
      { status: 500 }
    );
  }
}
