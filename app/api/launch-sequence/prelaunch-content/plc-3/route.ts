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
- The final output must read like one continuous Facebook post.
- Do not write PLC 1 or PLC 2.
- PLC 3 may foreshadow the offer, but should not feel like a hard sell.

Rules:
1. Write in Thai only.
2. Keep the content aligned to the provided strategy.
3. Make the content feel natural, readable, and suitable for Facebook.
4. Use short-to-medium paragraphs for easy reading on social media.
5. Focus on ownership, problem 3, authority, solution 3, objections, and the natural foreshadowing of the offer.
6. End with the provided CTA.
7. Do not format the post as bullets, outline notes, or section labels.
8. The output must feel like one long Facebook post from start to finish.
9. The headline should focus on the third solution and may include curiosity, story, or a “try this next” feeling.
`;

    const userPrompt = `
Create finished PLC 3 Facebook post content from the strategy below.

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

Write one continuous long Facebook post in Thai using this progression:
Start with the provided headline, and make sure that headline feels centered on the third solution with a little curiosity, story, or “try this next” energy. Then show the ownership experience clearly by painting the reader’s desired future in a believable way so they can imagine what success looks like for them. From there, raise problem 3 by surfacing the deeper challenge, hesitation, or belief that is still holding them back. This part can sound like “your biggest challenge may be…”, “you may be thinking…”, or “these doubts may be what’s holding you back” as long as it feels natural. Then establish authority naturally by showing why the creator understands this challenge and has real insight into solving it. After that, solve problem 3 with useful teaching, method, or reframe that helps the reader visualize success and weakens the “this won’t work for me” objection. Then raise and answer the most common objections in a natural way, especially the belief that this may not work for them personally. After that, foreshadow the offer as the next complete solution in a way that feels natural and aligned with the content, without turning the post into a hard sales pitch. Finally, close with the provided CTA.

Important writing rules:
- The entire output must read like one long Facebook post.
- Do not use bullet points.
- Do not use numbered sections.
- Do not use labels like “ownership”, “problem”, or “CTA”.
- Do not write like an outline.
- Do not turn the post into a sales page.
- Keep the tone natural, engaging, and social-media friendly.
- Use paragraph spacing that feels easy to read in a Facebook post.
- The post should clearly feel like PLC 3, not a generic motivational post.
- Return only the finished Facebook post content.
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
    });

    return NextResponse.json({
      content: response.output_text || "",
    });
  } catch (error) {
    console.error("PLC 3 CONTENT ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างเนื้อหา Prelaunch 3" },
      { status: 500 }
    );
  }
}
