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
      regenerate,
      previousSection5Options,
    } = body;

    if (
      !structuredAvatar ||
      !currentProblem ||
      !selectedBigProblem ||
      !section2 ||
      !section3 ||
      !section4
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
และเสนอทางเลือก The Next Step ที่ต่างออกไปชัดเจน

Section 5 ก่อนหน้า:
${JSON.stringify(previousSection5Options || [], null, 2)}
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
- Section 5: The Next Step

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

Section 4:
${JSON.stringify(section4, null, 2)}

STRICT ALIGNMENT RULES

- Section 5 must logically follow the approved Section 4
- Section 5 must stay aligned to the selected Big Problem
- Section 5 must fit the avatar and current problem
- do NOT invent a different core problem
- do NOT broaden the topic into generic advice
- do NOT generate the final combined draft yet
- if there is any conflict between elegance and fidelity, choose fidelity

TASK

Generate 3 next-step options for Section 5.

Each option must include:
- title
- whyItFits
- whatTheyDoNext
- whatTheyGet
- promise

Rules:
- align to the avatar
- align to the current problem
- logically follow the gap identified in Section 4
- avoid hype
- avoid fear-mongering
- do not generate final combined draft yet

Return JSON only.

Schema:
{
  "section5Options": [
    {
      "title": "...",
      "whyItFits": "...",
      "whatTheyDoNext": "...",
      "whatTheyGet": "...",
      "promise": "..."
    }
  ]
}
`;

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "lead_magnet_step_4",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              section5Options: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    title: { type: "string" },
                    whyItFits: { type: "string" },
                    whatTheyDoNext: { type: "string" },
                    whatTheyGet: { type: "string" },
                    promise: { type: "string" },
                  },
                  required: [
                    "title",
                    "whyItFits",
                    "whatTheyDoNext",
                    "whatTheyGet",
                    "promise",
                  ],
                },
              },
            },
            required: ["section5Options"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.output_text);

    return Response.json({
      section5Options: parsed.section5Options,
    });
  } catch (error) {
    console.error("STEP 4 ROUTE ERROR:", error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}