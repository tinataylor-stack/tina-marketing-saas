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
- The final output must read like one continuous Facebook post.
- Do not write PLC 1 or PLC 3.
- Do not pitch the product directly.
- The ending must create anticipation for the next content piece.

Rules:
1. Write in Thai only.
2. Keep the content aligned to the provided strategy.
3. Make the content feel natural, readable, and suitable for Facebook.
4. Use short-to-medium paragraphs for easy reading on social media.
5. Focus on transformation, problem 2, authority, solution 2, objections, and the reveal of problem 3.
6. End with the provided CTA.
7. Do not format the post as bullets, outline notes, or section labels.
8. The output must feel like one long Facebook post from start to finish.
9. The headline should focus on problem 2 or clearly connect to the solution from PLC 1.
`;

    const userPrompt = `
Create finished PLC 2 Facebook post content from the strategy below.

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

Write one continuous long Facebook post in Thai using this progression:
Start with the provided headline, and make sure that headline feels connected to problem 2 or refers back to the breakthrough from the first solution. Then show the transformation clearly so the reader sees what becomes possible once the first obstacle is solved and starts to believe that this progress could happen for them too. From there, raise problem 2 in a way that feels specific and relevant to what still blocks the transformation. Then establish authority naturally by showing why the creator understands this challenge and has real insight into it. After that, solve problem 2 with useful teaching, method, or strategic guidance that helps the reader move forward. Then raise and answer the most important objections in a natural way so the reader feels understood and less resistant. After that, foreshadow the third piece of content by showing that even with this progress, a deeper challenge still remains, and make this transition build clear curiosity for PLC 3. Finally, close with the provided CTA in a way that invites comments, questions, or objection-sharing.

Important writing rules:
- The entire output must read like one long Facebook post.
- Do not use bullet points.
- Do not use numbered sections.
- Do not use labels like “transformation”, “problem”, or “CTA”.
- Do not write like an outline.
- Do not jump ahead into fully solving problem 3.
- Do not hard-sell the offer.
- Keep the tone natural, engaging, and social-media friendly.
- Use paragraph spacing that feels easy to read in a Facebook post.
- The post should clearly feel like PLC 2, not a generic educational post.
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
    console.error("PLC 2 CONTENT ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างเนื้อหา Prelaunch 2" },
      { status: 500 }
    );
  }
}
