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
      avatarAnalysis,
      structuredAvatar,
      currentProblem,
      selectedBigProblem,
      regenerate,
      previousSection2,
      previousSection3,
    } = body;

    if (
      !avatarAnalysis ||
      !structuredAvatar ||
      !currentProblem ||
      !selectedBigProblem
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
และเสนอ The Shift กับ The Proof ในมุมที่ต่างออกไปชัดเจน

Section 2 ก่อนหน้า:
${JSON.stringify(previousSection2 || {}, null, 2)}

Section 3 ก่อนหน้า:
${JSON.stringify(previousSection3 || {}, null, 2)}
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
- Section 2: The Shift
- Section 3: The Proof

CONTEXT

Avatar Analysis:
${avatarAnalysis}

Structured Avatar:
${JSON.stringify(structuredAvatar, null, 2)}

Current Problem:
${currentProblem}


Selected Big Problem:
${JSON.stringify(selectedBigProblem, null, 2)}

STRICT ALIGNMENT RULES

- Section 2 must stay anchored to the selected Big Problem exactly
- Section 3 must demonstrate the same strategic angle as Section 2
- do NOT broaden the topic
- do NOT turn the output into generic educational advice
- do NOT invent a different problem than the selected Big Problem
- if there is any conflict between elegance and fidelity, choose fidelity

TASK

Generate:

Section 2: The Shift
Must include:
- oldBelief
- newBelief
- mechanism
- miniFramework (3 to 5 steps, high-level only)

Section 3: The Proof
Must include:
- format
- content

Rules for The Proof:
- realistic only
- no fake statistics
- if numbers are used, clearly label them as "ตัวอย่างสมมติ"
- do not generate Section 4 or 5
`;

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "lead_magnet_step_2",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              section2: {
                type: "object",
                additionalProperties: false,
                properties: {
                  oldBelief: { type: "string" },
                  newBelief: { type: "string" },
                  mechanism: { type: "string" },
                  miniFramework: {
                    type: "array",
                    minItems: 3,
                    maxItems: 5,
                    items: { type: "string" },
                  },
                },
                required: [
                  "oldBelief",
                  "newBelief",
                  "mechanism",
                  "miniFramework",
                ],
              },
              section3: {
                type: "object",
                additionalProperties: false,
                properties: {
                  format: { type: "string" },
                  content: { type: "string" },
                },
                required: ["format", "content"],
              },
            },
            required: ["section2", "section3"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.output_text);

    return Response.json({
      section2: parsed.section2,
      section3: parsed.section3,
    });
  } catch (error) {
    console.error("STEP 2 ROUTE ERROR:", error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}