import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "OPENAI_API_KEY is missing in .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const {
      structuredAvatar,
      currentProblem,
      selectedBigProblem,
      section2,
      section3,
      section4,
      section5,
      regenerate,
      previousFinalResult,
    } = body;

    if (
      !structuredAvatar ||
      !currentProblem ||
      !selectedBigProblem ||
      !section2 ||
      !section3 ||
      !section4 ||
      !section5
    ) {
      return Response.json(
        { error: "กรุณากรอกข้อมูลให้ครบ" },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey });

    const variationInstruction = regenerate
      ? `
คำสั่งเพิ่มเติม:
ครั้งนี้ให้หลีกเลี่ยงถ้อยคำหรือ framing ซ้ำกับคำตอบก่อนหน้า
และเสนอ draft, title และ CTA ที่ต่างออกไปชัดเจน

คำตอบก่อนหน้า:
${JSON.stringify(previousFinalResult || {}, null, 2)}
`
      : "";

    const prompt = `
You are a Lead Magnet Strategist.

You MUST write in Thai only.
You MUST produce clear, structured, strategic outputs.
Avoid hype language.
Avoid emojis.
Avoid motivational tone.

${variationInstruction}

FRAMEWORK

You are generating the final output only.

CONTEXT

Structured Avatar:
${JSON.stringify(structuredAvatar, null, 2)}

Current Problem:
${currentProblem}

Section 1:
${JSON.stringify(selectedBigProblem, null, 2)}

Section 2:
${JSON.stringify(section2, null, 2)}

Section 3:
${JSON.stringify(section3, null, 2)}

Section 4:
${JSON.stringify(section4, null, 2)}

Section 5:
${JSON.stringify(section5, null, 2)}

STRICT ALIGNMENT RULES

You are NOT allowed to invent a new strategic angle.

You must preserve the exact logic already approved in the earlier steps.

That means:

- Section 1 must stay anchored to the selectedBigProblem
- Section 2 must stay anchored to the approved Shift
- Section 3 must stay anchored to the approved Proof
- Section 4 must stay anchored to the approved Gap
- Section 5 must stay anchored to the approved Next Step

Do NOT:
- replace the chosen core problem with a broader topic
- turn the lead magnet into generic educational advice
- change the funnel direction
- invent a new mechanism or problem
- change the CTA direction

Your job is ONLY to:
- organize the approved sections
- clarify wording
- improve readability
- assemble them into a clean final lead magnet structure

If earlier sections are specific, keep them specific.

If there is any conflict between elegance and fidelity, choose fidelity.

The final draft must feel like an assembly of approved sections, not a rewritten strategy.

TASK

Generate:

1. leadMagnetDraft
- assemble Section 1–5 into one cohesive narrative
- preserve the exact logic of each section
- do NOT broaden the topic
- keep the same funnel direction
- ready to paste into a PDF outline or landing page outline
- use clear headings
- Thai only

2. titleOptions
- generate 5 options
- keep them specific
- align them to the chosen Big Problem and approved Shift
- do NOT turn the title into a broader or more generic topic

3. suggestedFormat
- choose one format only
- examples: PDF outline, checklist, quiz, prompt pack, mini training
- explain why it fits this specific lead magnet

4. ctaCopy
Create:
- socialPost
- lineWelcome
- landingHero

All CTA copy must follow the exact approved Section 5 direction.
Do NOT introduce a different next step.

Rules:
- no hype
- no fake claims
- keep CTA practical and clear
- do not add anything outside the requested structure

Return JSON only.

Schema:
{
  "leadMagnetDraft": "...",
  "titleOptions": ["...", "...", "...", "...", "..."],
  "suggestedFormat": {
    "format": "...",
    "reason": "..."
  },
  "ctaCopy": {
    "socialPost": "...",
    "lineWelcome": "...",
    "landingHero": "..."
  }
}
`;

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "lead_magnet_final",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              leadMagnetDraft: { type: "string" },
              titleOptions: {
                type: "array",
                minItems: 5,
                maxItems: 5,
                items: { type: "string" },
              },
              suggestedFormat: {
                type: "object",
                additionalProperties: false,
                properties: {
                  format: { type: "string" },
                  reason: { type: "string" },
                },
                required: ["format", "reason"],
              },
              ctaCopy: {
                type: "object",
                additionalProperties: false,
                properties: {
                  socialPost: { type: "string" },
                  lineWelcome: { type: "string" },
                  landingHero: { type: "string" },
                },
                required: ["socialPost", "lineWelcome", "landingHero"],
              },
            },
            required: [
              "leadMagnetDraft",
              "titleOptions",
              "suggestedFormat",
              "ctaCopy",
            ],
          },
        },
      },
    });

    const parsed = JSON.parse(response.output_text);

    return Response.json(parsed);
  } catch (error) {
    console.error("FINAL ROUTE ERROR:", error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}