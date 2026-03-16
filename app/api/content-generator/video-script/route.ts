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
        { error: "ข้อมูล Avatar ไม่ครบสำหรับสร้าง Video Script" },
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
You are a Thai video content strategist and script writer.

Your job is to create one finished Thai video script.

Important rules:
- Write in Thai only.
- Return only the finished script.
- The output must read like a natural spoken script, not an outline.
- Keep the wording easy to say out loud.
- Use short-to-medium spoken paragraphs and sentence rhythm that feels natural in video.
- Match the content to the avatar and the brief provided.
- Keep the tone natural, useful, and engaging.
- Do not sound like generic AI writing.
- Do not tell the audience to go to another platform such as YouTube, TikTok, Instagram, LINE, website, or anywhere else unless the user's instructions explicitly require it.
- Do not tell the audience to wait for the next video, read the next post, or come back for another part.
- The script must feel complete and valuable as a standalone piece.
- If the content direction is educational, make the script a bit longer and include genuinely useful explanation, teaching, examples, or reframes.
- Do not turn the script into a hard sell.
- Do not sell any product, offer, service, or paid program inside the script.
- Do not write the script like a promotion, sales script, or conversion script.
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
Create one finished Thai video script using the context below.

[AVATAR ANALYSIS]
${avatarAnalysis}

[STRUCTURED AVATAR]
${JSON.stringify(structuredAvatar, null, 2)}

${plannerContext}

[FREESTYLE FRAMEWORK]
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
- The script should feel specific to the business and audience, not generic.
- Open with a strong spoken hook.
- Build the script naturally toward the intended lesson or point.
- The script must stand on its own and feel complete.
- Do not direct the viewer to consume content on another platform.
- Do not say things like "รอคลิปหน้า", "ไปดูโพสต์ถัดไป", or "ไปดูต่อที่..."
- If the planner day or brief is educational, make the script longer and more teachable with clearer explanation and practical value.
- Do not sell any product inside the script body or closing.
- If freestyle framework input is provided, translate it into a smooth spoken script without printing framework labels.
- If some optional freestyle fields are blank, infer the missing transitions naturally without making the script feel generic.
- End in a way that feels natural for video, such as reflection, takeaway, or gentle engagement, without turning it into a sales pitch.
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
    console.error("VIDEO SCRIPT GENERATOR ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้าง Video Script" },
      { status: 500 }
    );
  }
}
