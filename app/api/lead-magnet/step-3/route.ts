import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "OPENAI_API_KEY environment variable is missing" },
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
      regenerate,
      previousSection4,
    } = body;

    if (
      !structuredAvatar ||
      !currentProblem ||
      !selectedBigProblem ||
      !section2 ||
      !section3
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
และเสนอ The Gap ในมุมที่ต่างออกไปชัดเจน

Section 4 ก่อนหน้า:
${JSON.stringify(previousSection4 || {}, null, 2)}
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

You are generating only:
- Section 4: The Gap

CONTEXT

Structured Avatar:
${JSON.stringify(structuredAvatar, null, 2)}

Current Problem:
${currentProblem}

Selected Big Problem:
${JSON.stringify(selectedBigProblem, null, 2)}

Section 2:
${JSON.stringify(section2, null, 2)}

Section 3:
${JSON.stringify(section3, null, 2)}

STRICT ALIGNMENT RULES

- Section 4 must stay anchored to the selected Big Problem
- Section 4 must logically follow the approved Section 2 and Section 3
- do NOT invent a different problem
- do NOT broaden the topic into generic advice
- do NOT generate Section 5 yet
- if there is any conflict between elegance and fidelity, choose fidelity

TASK

Generate Section 4: The Gap

It must:
- show what is still missing after the lead magnet
- name 2–4 deeper layers the person will still need
- create a logical bridge to the next step without deciding the final next-step offer yet
- avoid fear-mongering

Return JSON only.

Schema:
{
  "section4": {
    "gapSummary": "...",
    "deeperLayers": ["...", "...", "..."],
    "bridgeToNextStep": "..."
  }
}
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "lead_magnet_step_3",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              section4: {
                type: "object",
                additionalProperties: false,
                properties: {
                  gapSummary: { type: "string" },
                  deeperLayers: {
                    type: "array",
                    minItems: 2,
                    maxItems: 4,
                    items: { type: "string" },
                  },
                  bridgeToNextStep: { type: "string" },
                },
                required: ["gapSummary", "deeperLayers", "bridgeToNextStep"],
              },
            },
            required: ["section4"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.output_text);

    return Response.json({
      section4: parsed.section4,
    });
  } catch (error) {
    console.error("STEP 3 ROUTE ERROR:", error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}