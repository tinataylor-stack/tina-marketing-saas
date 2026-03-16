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
        { error: "ข้อมูลไม่ครบสำหรับสร้างเนื้อหา Prelaunch 3" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are a Thai launch content strategist and social content writer.

Your job is to turn a PLC 3 strategy into finished Thai Facebook post content.

Important:
- This is PLC 3 only.
- The content must follow the exact PLC 3 progression.
- You must create 2 separate outputs:
  1. 3 short Thai Line OA preview message options for PLC 3
  2. the full PLC 3 Facebook post
- Do not write PLC 1 or PLC 2.
- PLC 3 may foreshadow the offer, but should not feel like a hard sell.

Rules:
1. Write in Thai only.
2. Keep the content aligned to the provided strategy.
3. Make both outputs feel natural, readable, and aligned to the platform.
4. Use short-to-medium paragraphs for easy reading on social media.
5. Focus on ownership, problem 3, authority, solution 3, objections, and the natural foreshadowing of the offer.
6. The Line OA preview options must be short, teaser-like, and make the user want to click to read the full PLC.
7. The 3 Line OA preview options must feel clearly different in phrasing or angle, while staying aligned to the same PLC 3 strategy.
8. The Line OA preview options must not try to include the full teaching.
9. The Facebook post must end with the provided CTA.
10. Do not format the Facebook post as bullets, outline notes, or section labels.
11. The Facebook post must feel like one long Facebook post from start to finish.
12. The headline should focus on the third solution and may include curiosity, story, or a “try this next” feeling.
`;

    const userPrompt = `
Create both outputs for PLC 3 from the strategy below.

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

Output 1: Line OA preview options
- Write 3 short Thai message preview options for Line OA that tease the main idea of PLC 3 before the user clicks to read the full content.
- Keep them concise, high-curiosity, and natural for a Line OA message.
- The options should hint at the ownership outcome, problem 3, or the final breakthrough and lightly open the loop toward the full content.
- Make the 3 options feel distinct from one another.
- Do not write the full lesson.
- Do not hard-sell the offer.
- Do not mention, hint at, or reveal the product, program, offer details, or launch announcement.
- Do not use sales-like clues such as course, program, class, workshop, package, enrollment, bonus, support, coaching, mentor, group, community, or anything that sounds like what the buyer will get.
- Do not imply there is a ready-made system, training plan, or paid solution waiting behind the click.
- Keep the preview focused only on the reader's internal problem, misunderstanding, hesitation, or insight inside PLC 3.

Output 2: Full Facebook post
Write one continuous long Facebook post in Thai using this progression:
Start with the provided headline, and make sure that headline feels centered on the third solution with a little curiosity, story, or “try this next” energy. Then show the ownership experience clearly by painting the reader’s desired future in a believable way so they can imagine what success looks like for them. From there, raise problem 3 by surfacing the deeper challenge, hesitation, or belief that is still holding them back. This part can sound like “your biggest challenge may be…”, “you may be thinking…”, or “these doubts may be what’s holding you back” as long as it feels natural. Then establish authority naturally by showing why the creator understands this challenge and has real insight into solving it. After that, solve problem 3 with useful teaching, method, or reframe that helps the reader visualize success and weakens the “this won’t work for me” objection. Then raise and answer the most common objections in a natural way, especially the belief that this may not work for them personally. After that, foreshadow the offer as the next complete solution in a way that feels natural and aligned with the content, without turning the post into a hard sales pitch. Finally, close with the provided CTA.

Important writing rules:
- The Facebook post must read like one long Facebook post.
- Do not use bullet points.
- Do not use numbered sections.
- Do not use labels like “ownership”, “problem”, or “CTA”.
- Do not write like an outline.
- Do not turn the post into a sales page.
- Keep the tone natural, engaging, and social-media friendly.
- Use paragraph spacing that feels easy to read in a Facebook post.
- The post should clearly feel like PLC 3, not a generic motivational post.
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
          name: "plc_3_content_with_line_preview",
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
    console.error("PLC 3 CONTENT ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างเนื้อหา Prelaunch 3" },
      { status: 500 }
    );
  }
}
