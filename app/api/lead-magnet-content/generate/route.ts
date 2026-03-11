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

type Section5 = {
  title?: string;
  whyItFits?: string;
  whatTheyDoNext?: string;
  whatTheyGet?: string;
  promise?: string;
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
  section5?: Section5 | null;
};

const formatInstructions: Record<RequestBody["selectedFormat"], string> = {
  article: `
Write a complete article-style lead magnet.
Use a strong headline, intro, useful sections, and a clear closing.
End with a final next-step section that naturally guides the reader forward.
`,
  "pdf-guide": `
Write a complete PDF Guide style lead magnet.
Use a polished structure with a title, intro, section headings, and clear teaching.
End with a final next-step section that naturally guides the reader forward.
`,
  checklist: `
Write a complete Checklist style lead magnet.
Keep it practical, clear, and easy to scan.
Use checklist items and short explanations when helpful.
End with a final next-step section after the checklist.
`,
  workbook: `
Write a complete Workbook style lead magnet.
Include short teaching, reflection prompts, and exercises.
End with a final next-step section that tells the reader what to do after finishing the workbook.
`,
  "email-course": `
Write a complete Email Course lead magnet.
Break it into multiple emails with subject lines and body content.
Each email should build naturally from the previous one.
In the final email, include a clear next-step section.
`,
  "video-script": `
Write a complete Video Script lead magnet.
Make it natural to speak aloud.
Use clear sections, smooth transitions, and teaching-friendly wording.
End with a clear spoken next-step section.
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
      section5,
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
9. ALWAYS include a final next-step section.
10. The final next-step section must be based on the approved next-step strategy when provided.
11. The ending should feel natural, helpful, and aligned with the lead magnet, not abrupt.
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

Approved next-step strategy:
${JSON.stringify(section5 ?? {}, null, 2)}

Important ending instruction:

The lead magnet must end with a natural "Next Step" section.

However, do NOT present this section as bullet points or subheadings.

Instead:

• Write it as a smooth narrative paragraph that flows naturally from the previous section.
• It should feel like the natural continuation of the teaching.
• The reader should feel guided forward, not pitched to.

The ending should naturally incorporate:

- what they should do next
- why that step makes sense now
- what they will gain from it
- the outcome or promise

But these elements must be woven into the text organically.

Do NOT structure it like this:
- bullet lists
- subheadings
- checklist items

Write it like a short persuasive closing paragraph that leads the reader into the next step.
- Keep this section helpful and natural, not like a hard sales pitch.
- Do not end abruptly without this section.

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