import OpenAI from "openai";
import { NextResponse } from "next/server";
import type {
  SelectedPlannerDay,
  StructuredAvatar,
} from "../../../content-generator/types";

type FrameworkInput = {
  hookAngle: string;
  mostPeopleThink: string;
  realIssue: string;
  gameIsNot: string;
  gameIs: string;
  step1: string;
  step2: string;
  step3: string;
  proof: string;
  summaryLesson: string;
};

type RequestBody = {
  avatarAnalysis: string;
  structuredAvatar: StructuredAvatar | null;
  selectedDay?: SelectedPlannerDay | null;
  frameworkInput?: FrameworkInput | null;
  extraInstructions?: string;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const {
      avatarAnalysis,
      structuredAvatar,
      selectedDay,
      frameworkInput,
      extraInstructions = "",
    } = body;

    if (!avatarAnalysis || !structuredAvatar) {
      return NextResponse.json(
        { error: "ข้อมูล Avatar ไม่ครบสำหรับสร้าง Social Post" },
        { status: 400 }
      );
    }

    if (
      !selectedDay &&
      (!frameworkInput?.hookAngle?.trim() ||
        !frameworkInput?.realIssue?.trim() ||
        !frameworkInput?.gameIs?.trim() ||
        !frameworkInput?.summaryLesson?.trim())
    ) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลหลักของโหมดสร้างแบบอิสระให้ครบ" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are a Thai social media content strategist and writer.

Your job is to create one finished Thai Facebook post.

Important rules:
- Write in Thai only.
- Return only the finished post content.
- The output must read like a real publishable Facebook post, not an outline.
- Do not use bullet points unless the user's brief explicitly requires it.
- Keep paragraph spacing easy to read on Facebook.
- Match the content to the avatar and the brief provided.
- Keep the tone natural, useful, and engaging.
- Do not sound like generic AI writing.
- Do not tell the audience to go to another platform such as YouTube, TikTok, Instagram, LINE, website, or anywhere else unless the user's instructions explicitly require it.
- Do not tell the audience to wait for the next post, read the next post, or come back for another part.
- Do not force the post to tease another content piece.
- The post must feel complete and valuable as a standalone Facebook post.
- If the content direction is educational, make the post a bit longer and include genuinely useful explanation, teaching, examples, or reframes so the reader learns something substantial.
- Do not turn the post into a hard sell.
- Do not sell any product, offer, service, or paid program inside the post.
- Do not write the post like a promotion, sales post, or conversion post.
- Do not use the Thai word "เกม" unless the topic is literally about gaming, the game industry, or board games.
- In normal business, education, or marketing content, avoid "เกม" because it sounds unnatural in Thai.
`;

    const plannerContext = selectedDay
      ? `
[SELECTED PLANNER DAY]
Plan platform: ${selectedDay.planPlatform}
Avatar summary: ${selectedDay.avatarSummary}
Business context: ${selectedDay.businessContext}
Day: ${selectedDay.day.day}
Content type: ${selectedDay.day.contentType}
Title: ${selectedDay.day.title}
Theme: ${selectedDay.day.theme}
Format: ${selectedDay.day.format}
Hook idea: ${selectedDay.day.hookIdea}
Angle: ${selectedDay.day.angle}
Summary: ${selectedDay.day.summary}
CTA direction: ${selectedDay.day.ctaDirection}
`
      : "";

    const userPrompt = `
Create one finished Thai social post using the context below.

[AVATAR ANALYSIS]
${avatarAnalysis}

[STRUCTURED AVATAR]
${JSON.stringify(structuredAvatar, null, 2)}

${plannerContext}

[MANUAL BRIEF]
Hook angle: ${frameworkInput?.hookAngle || "-"}
Most people think: ${frameworkInput?.mostPeopleThink || "-"}
But the real issue is: ${frameworkInput?.realIssue || "-"}
The game is not: ${frameworkInput?.gameIsNot || "-"}
The game is: ${frameworkInput?.gameIs || "-"}
Step 1: ${frameworkInput?.step1 || "-"}
Step 2: ${frameworkInput?.step2 || "-"}
Step 3: ${frameworkInput?.step3 || "-"}
Proof: ${frameworkInput?.proof || "-"}
Summary lesson: ${frameworkInput?.summaryLesson || "-"}

[EXTRA INSTRUCTIONS]
${extraInstructions || "-"}

Writing guidance:
- If a planner day is provided, use that as the main direction.
- If no planner day is provided, use the freestyle framework input as the main direction.
- The post should feel specific to the business and audience, not generic.
- Use a strong opening hook that fits Facebook reading behavior.
- Build the post naturally toward the intended message without sounding scripted.
- The post must stand on its own and feel complete.
- Do not direct the reader to consume content on another platform.
- Do not say things like "wait for the next post", "go watch the video", or "read the next part".
- If the planner day or brief is educational, make the body longer and more teachable with clearer explanation and more practical value.
- Do not sell any product inside the post body or CTA.
- If freestyle framework input is provided, translate it into a smooth Facebook post without printing framework labels.
- If some optional freestyle fields are blank, infer the missing transitions naturally without making the post feel generic.
- End with a CTA that fits Facebook and stays within the same post context, such as inviting reflection, comments, or conversation when appropriate.
- Keep it as one complete finished Facebook post.
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
    console.error("SOCIAL POST GENERATOR ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้าง Social Post" },
      { status: 500 }
    );
  }
}
