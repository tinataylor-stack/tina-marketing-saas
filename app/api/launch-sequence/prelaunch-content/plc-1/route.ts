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
- The final output must read like one continuous Facebook post.
- Do not write PLC 2 or PLC 3.
- Do not pitch the product.
- Do not skip the transition into the next problem.
- The ending must create anticipation for the next content piece.

Rules:
1. Write in Thai only.
2. Keep the content aligned to the provided strategy.
3. Make the content feel natural, readable, and suitable for Facebook.
4. Use short-to-medium paragraphs for easy reading on social media.
5. Focus on opportunity, problem 1, authority, solution 1, and the reveal of problem 2.
6. End with the provided CTA.
7. Do not format the post as bullets, outline notes, or section labels.
8. The output must feel like one long Facebook post from start to finish.
`;

    const userPrompt = `
Create finished PLC 1 Facebook post content from the strategy below.

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

Write one continuous long Facebook post in Thai using this progression:
Start with the provided headline, then show the opportunity clearly so the reader sees a new possibility or shift they may not have noticed before. From there, raise the first problem or struggle they are facing right now in a way that feels specific and relatable. Then establish authority naturally by showing why the creator understands this problem and has real insight into it. After that, solve the first problem with useful teaching, reframe, or method that gives the reader immediate value. Then naturally introduce problem 2 by showing that even after problem 1 is understood, a deeper challenge still remains, and make this part create curiosity for the next piece of content. Finally, close with the provided CTA.

Important writing rules:
- The entire output must read like one long Facebook post.
- Do not use bullet points.
- Do not use numbered sections.
- Do not use labels like “opportunity”, “problem”, or “CTA”.
- Do not write like an outline.
- Do not jump ahead into solving problem 2.
- Do not hard-sell the offer.
- Keep the tone natural, engaging, and social-media friendly.
- Use paragraph spacing that feels easy to read in a Facebook post.
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
    console.error("PLC 1 CONTENT ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างเนื้อหา Prelaunch 1" },
      { status: 500 }
    );
  }
}
