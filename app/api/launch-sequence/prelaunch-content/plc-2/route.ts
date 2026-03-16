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
        { error: "ข้อมูลไม่ครบสำหรับสร้างเนื้อหา Prelaunch 2" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are a Thai launch content strategist and social content writer.

Your job is to turn a PLC 2 strategy into finished Thai Facebook post content.

Important:
- This is PLC 2 only.
- The content must follow the exact PLC 2 progression.
- You must create 2 separate outputs:
  1. 3 short Thai Line OA preview message options for PLC 2
  2. the full PLC 2 Facebook post
- Do not write PLC 1 or PLC 3.
- Do not pitch the product directly.
- The ending must create anticipation for the next content piece.

Rules:
1. Write in Thai only.
2. Keep the content aligned to the provided strategy.
3. Make both outputs feel natural, readable, and aligned to the platform.
4. Use short-to-medium paragraphs for easy reading on social media.
5. Focus on transformation, problem 2, authority, solution 2, objections, and the reveal of problem 3.
6. The Line OA preview options must be short, teaser-like, and make the user want to click to read the full PLC.
7. The 3 Line OA preview options must feel clearly different in phrasing or angle, while staying aligned to the same PLC 2 strategy.
8. The Line OA preview options must not try to include the full teaching.
9. The Facebook post must end with the provided CTA.
10. Do not format the Facebook post as bullets, outline notes, or section labels.
11. The Facebook post must feel like one long Facebook post from start to finish.
12. The headline should focus on problem 2 or clearly connect to the solution from PLC 1.
`;

    const userPrompt = `
Create both outputs for PLC 2 from the strategy below.

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

Output 1: Line OA preview options
- Write 3 short Thai message preview options for Line OA that tease the main idea of PLC 2 before the user clicks to read the full content.
- Keep them concise, high-curiosity, and natural for a Line OA message.
- The options should make the reader want to open and read PLC 2 itself.
- The options should hint at the transformation or problem 2 and create curiosity about the insight, explanation, or solution inside PLC 2.
- Make the 3 options feel distinct from one another.
- Do not write the full lesson.
- Do not hard-sell the offer.
- Do not position the preview as a teaser for PLC 3 or the next content piece.

Output 2: Full Facebook post
Write one continuous long Facebook post in Thai using this progression:
Start with the provided headline, and make sure that headline feels connected to problem 2 or refers back to the breakthrough from the first solution. Then show the transformation clearly so the reader sees what becomes possible once the first obstacle is solved and starts to believe that this progress could happen for them too. From there, raise problem 2 in a way that feels specific and relevant to what still blocks the transformation. Then establish authority naturally by showing why the creator understands this challenge and has real insight into it. After that, solve problem 2 with useful teaching, method, or strategic guidance that helps the reader move forward. Then raise and answer the most important objections in a natural way so the reader feels understood and less resistant. After that, foreshadow the third piece of content by showing that even with this progress, a deeper challenge still remains, and make this transition build clear curiosity for PLC 3. Finally, close with the provided CTA in a way that invites comments, questions, or objection-sharing.

Important writing rules:
- The Facebook post must read like one long Facebook post.
- Do not use bullet points.
- Do not use numbered sections.
- Do not use labels like “transformation”, “problem”, or “CTA”.
- Do not write like an outline.
- Do not jump ahead into fully solving problem 3.
- Do not hard-sell the offer.
- Keep the tone natural, engaging, and social-media friendly.
- Use paragraph spacing that feels easy to read in a Facebook post.
- The post should clearly feel like PLC 2, not a generic educational post.
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
          name: "plc_2_content_with_line_preview",
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
    console.error("PLC 2 CONTENT ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างเนื้อหา Prelaunch 2" },
      { status: 500 }
    );
  }
}
