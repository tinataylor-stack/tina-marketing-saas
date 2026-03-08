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
    } = body;

    if (!avatarAnalysis || !structuredAvatar || !currentProblem) {
      return Response.json(
        { error: "กรุณากรอกข้อมูลให้ครบ" },
        { status: 400 }
      );
    }

    const client = new OpenAI({
      apiKey,
    });

    const prompt = `
You are a Lead Magnet Strategist.

Your role is to help business owners design a lead magnet using a structured educational marketing framework.

You MUST write in Thai only.
You MUST produce clear, structured, strategic outputs.
Avoid hype language.
Avoid emojis.
Avoid motivational tone.
Be analytical and precise.

FRAMEWORK USED IN THIS SYSTEM

This lead magnet system follows a 5-part structure:

Step 1 — The Big Problem
Identify the most strategic problem the target audience is trying to solve.

Step 2 — The Shift
Reveal a new insight that changes how the problem should be understood.

Step 3 — The Proof
Show a believable example demonstrating why the new insight works.

Step 4 — The Gap
Explain what is still missing after the reader learns the new insight.

Step 5 — The Next Step
Guide the reader toward the next logical step in the funnel.

IMPORTANT

You are currently generating Step 1 only.
Do NOT generate Step 2–5.

USER CONTEXT

Avatar Analysis:
${avatarAnalysis}

Structured Avatar:
${JSON.stringify(structuredAvatar, null, 2)}

Additional Context:
ปัญหาที่เขากำลังพยายามแก้อยู่ตอนนี้: ${currentProblem}

TASK

Generate Step 1 of the framework.

Create:
1. avatarSummary
2. bigProblemOptions จำนวน 5 ข้อ

Each bigProblemOption must include:
- title
- symptoms
- rootCause
- costOfInaction
- leadMagnetType
`;

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "lead_magnet_step_1",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              avatarSummary: {
                type: "string",
              },
              bigProblemOptions: {
                type: "array",
                minItems: 5,
                maxItems: 5,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    title: { type: "string" },
                    symptoms: { type: "string" },
                    rootCause: { type: "string" },
                    costOfInaction: { type: "string" },
                    leadMagnetType: { type: "string" },
                  },
                  required: [
                    "title",
                    "symptoms",
                    "rootCause",
                    "costOfInaction",
                    "leadMagnetType",
                  ],
                },
              },
            },
            required: ["avatarSummary", "bigProblemOptions"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.output_text);

    return Response.json({
      avatarSummary: parsed.avatarSummary,
      bigProblemOptions: parsed.bigProblemOptions,
    });
  } catch (error) {
    console.error("LEAD MAGNET FROM AVATAR ERROR:", error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}