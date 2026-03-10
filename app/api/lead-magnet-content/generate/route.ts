import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ContentSettings = {
  length?: "short" | "medium" | "long";
  tone?: "practical" | "friendly" | "expert" | "premium";
  checklistStyle?: "concise" | "detailed";
  includeExplanations?: "yes" | "no";
  numberOfExercises?: "3" | "5" | "7";
  workbookStyle?: "reflective" | "action-driven";
  numberOfEmails?: "3" | "5" | "7";
  emailStyle?: "educational" | "relationship-building" | "action-focused";
  videoLength?: "short" | "long";
};

type RequestBody = {
  leadMagnetDraft: string;
  avatarAnalysis: string;
  structuredAvatar?: Record<string, unknown> | null;
  currentProblem?: string;
  selectedFormat:
    | "article"
    | "pdf-guide"
    | "checklist"
    | "workbook"
    | "email-course"
    | "video-script";
  settings?: ContentSettings;
};

const formatInstructions: Record<RequestBody["selectedFormat"], string> = {
  article: `
Write a complete article-style lead magnet.
Use a strong headline, intro, useful sections, and a clear closing.
Make it practical, readable, and specific.
`,
  "pdf-guide": `
Write a complete PDF Guide style lead magnet.
Use a polished structure with a title, intro, section headings, and clear teaching.
Make it feel useful and premium.
`,
  checklist: `
Write a complete Checklist style lead magnet.
Keep it practical, clear, and easy to scan.
Use checklist items and short explanations when helpful.
`,
  workbook: `
Write a complete Workbook style lead magnet.
Include short teaching, reflection prompts, and exercises.
Make it interactive and practical.
`,
  "email-course": `
Write a complete Email Course lead magnet.
Break it into multiple emails with subject lines and body content.
Each email should build naturally from the previous one.
`,
  "video-script": `
Write a complete Video Script lead magnet.
Make it natural to speak aloud.
Use clear sections, smooth transitions, and teaching-friendly wording.
`,
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;

    const {
      leadMagnetDraft,
      avatarAnalysis,
      structuredAvatar,
      currentProblem,
      selectedFormat,
      settings,
    } = body;

    if (!leadMagnetDraft || !avatarAnalysis || !selectedFormat) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are a senior lead magnet content strategist.

Your job is to turn a lead magnet strategy draft into finished lead magnet content.

Rules:
1. Stay faithful to the strategy draft.
2. Write useful, concrete, readable content.
3. Do not drift into generic motivational writing.
4. Do not aggressively sell a paid offer inside the lead magnet.
5. Match the selected format exactly.
6. Use clear headings and logical structure.
7. Avoid fluff and repetition.
8. Make the content feel specific to the target customer.
`;

    const userPrompt = `
Create a finished lead magnet in this format: ${selectedFormat}

Format instructions:
${formatInstructions[selectedFormat]}

Customer avatar analysis:
${avatarAnalysis}

Structured avatar:
${JSON.stringify(structuredAvatar ?? {}, null, 2)}

Main problem:
${currentProblem ?? ""}

Lead magnet strategy draft:
${leadMagnetDraft}

Generation settings:
${JSON.stringify(settings ?? {}, null, 2)}

Return only the finished lead magnet content.
`;

    const response = await openai.responses.create({
      model: "gpt-5",
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
    console.error("Lead magnet content generation error:", error);

    return NextResponse.json(
      { error: "Failed to generate lead magnet content." },
      { status: 500 }
    );
  }
}