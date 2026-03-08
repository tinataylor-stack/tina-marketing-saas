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
      customNextStep,
    } = body;

    if (
      !structuredAvatar ||
      !currentProblem ||
      !selectedBigProblem ||
      !section2 ||
      !section3 ||
      !section4 ||
      !customNextStep
    ) {
      return Response.json(
        { error: "กรุณากรอกข้อมูลให้ครบ" },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey });

    const prompt = `
You are a Lead Magnet Strategist.

You MUST write in Thai only.
You MUST produce clear, structured, strategic outputs.
Avoid hype language.
Avoid emojis.
Avoid motivational tone.

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

User's desired Next Step:
${customNextStep}

STRICT ALIGNMENT RULES

- You must preserve the user's intended next-step direction
- You may clarify and improve wording, but do NOT change the core direction
- The result must stay aligned with the avatar, current problem, Big Problem, Shift, Proof, and Gap
- Do NOT invent a different offer path
- Do NOT broaden into generic advice
- If there is any conflict between elegance and fidelity, choose fidelity

TASK

Turn the user's desired Next Step into one strong Section 5 object.

Return JSON only.

Schema:
{
  "section5": {
    "title": "...",
    "whyItFits": "...",
    "whatTheyDoNext": "...",
    "whatTheyGet": "...",
    "promise": "..."
  }
}
`;

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "lead_magnet_step_4_custom",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              section5: {
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
            required: ["section5"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.output_text);

    return Response.json({
      section5: parsed.section5,
    });
  } catch (error) {
    console.error("STEP 4 CUSTOM ROUTE ERROR:", error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}