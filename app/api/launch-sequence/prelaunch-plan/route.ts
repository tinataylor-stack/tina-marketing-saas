import OpenAI from "openai";

type FoundationSummary = {
  offerName: string;
  offerDescription: string;
  offerFormat: string;
  price: string;
  launchGoal: string;
  launchContext: string;
};

type PlcSection = {
  headline: string;
  contentOutline: string;
  talkingPoints: string;
  cta: string;
};

type RequestBody = {
  avatarAnalysis: string;
  structuredAvatar: any;
  foundation: FoundationSummary;
  regenerate?: boolean;
  previousPlan?: {
    plc1: PlcSection;
    plc2: PlcSection;
    plc3: PlcSection;
  };
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "OPENAI_API_KEY environment variable is missing" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as RequestBody;
    const {
      avatarAnalysis,
      structuredAvatar,
      foundation,
      regenerate = false,
      previousPlan,
    } = body;

    if (
      !avatarAnalysis ||
      !structuredAvatar ||
      !foundation?.offerName ||
      !foundation?.offerDescription ||
      !foundation?.offerFormat ||
      !foundation?.price ||
      !foundation?.launchGoal
    ) {
      return Response.json(
        { error: "ข้อมูลไม่ครบสำหรับสร้าง Prelaunch Sequence" },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey });

    const variationInstruction =
      regenerate && previousPlan
        ? `
คำสั่งเพิ่มเติม:
ครั้งนี้ให้หลีกเลี่ยง headline, angle, framing และ CTA ที่ซ้ำกับคำตอบเดิม
แต่ยังต้องรักษา logic การไล่ปัญหา Problem 1 -> Problem 2 -> Problem 3 ให้ชัดเจน

คำตอบก่อนหน้าที่ควรหลีกเลี่ยงการซ้ำ:
${JSON.stringify(previousPlan, null, 2)}
`
        : "";

    const prompt = `
You are a Thai launch strategist using a Product Launch Formula style framework.

You MUST write in Thai only.
You MUST produce structured, strategic outputs for a business owner.
Avoid hype language.
Avoid emojis.
Avoid generic filler.

${variationInstruction}

TASK

Generate a 3-part Prelaunch Content (PLC) sequence.

Important narrative rule:
- PLC 1 introduces the opportunity, solves problem 1, and reveals problem 2
- PLC 2 solves problem 2, reveals problem 3, and builds anticipation
- PLC 3 solves problem 3, removes objections, and foreshadows the offer

Do NOT combine PLCs.
Each PLC must clearly lead into the next one.
Each PLC must end with anticipation for the next step.
Do NOT pitch the product before PLC 3.

OUTPUT SECTIONS
- PLC 1 - Opportunity
- PLC 2 - Transformation
- PLC 3 - Ownership

Each PLC must include:
- headline
- contentOutline
- talkingPoints
- cta

Headline guidance:
- PLC 1 should focus on the opportunity
- PLC 2 should focus on problem 2 or the transformation unlocked by solving problem 1
- PLC 3 should focus on the third solution and ownership

Content rules:
- contentOutline should be a readable Thai outline, not JSON fragments
- talkingPoints should be concise strategic bullets in one string separated by line breaks
- CTA should match the stage of the sequence
- Keep everything aligned to the avatar and offer

CONTEXT

[AVATAR ANALYSIS]
${avatarAnalysis}

[STRUCTURED AVATAR]
${JSON.stringify(structuredAvatar, null, 2)}

[LAUNCH FOUNDATION]
Offer: ${foundation.offerName}
Offer Description: ${foundation.offerDescription}
Offer Format: ${foundation.offerFormat}
Price: ${foundation.price}
Launch Goal: ${foundation.launchGoal}
Launch Context: ${foundation.launchContext || "-"}

FINAL OUTPUT LOGIC

PLC 1:
- show the opportunity
- raise problem 1
- establish authority
- solve problem 1
- introduce problem 2
- CTA that invites engagement and next-step curiosity

PLC 2:
- show the transformation
- raise problem 2
- establish authority
- solve problem 2
- raise and answer key objections
- introduce problem 3
- foreshadow PLC 3
- CTA that invites comments/questions

PLC 3:
- show ownership experience
- raise problem 3
- establish authority
- solve problem 3
- raise and answer common objections, especially "this won't work for me"
- foreshadow the offer as the complete solution
- CTA that invites them to watch for the launch
`;

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "launch_sequence_prelaunch_plan",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              plc1: {
                type: "object",
                additionalProperties: false,
                properties: {
                  headline: { type: "string" },
                  contentOutline: { type: "string" },
                  talkingPoints: { type: "string" },
                  cta: { type: "string" },
                },
                required: ["headline", "contentOutline", "talkingPoints", "cta"],
              },
              plc2: {
                type: "object",
                additionalProperties: false,
                properties: {
                  headline: { type: "string" },
                  contentOutline: { type: "string" },
                  talkingPoints: { type: "string" },
                  cta: { type: "string" },
                },
                required: ["headline", "contentOutline", "talkingPoints", "cta"],
              },
              plc3: {
                type: "object",
                additionalProperties: false,
                properties: {
                  headline: { type: "string" },
                  contentOutline: { type: "string" },
                  talkingPoints: { type: "string" },
                  cta: { type: "string" },
                },
                required: ["headline", "contentOutline", "talkingPoints", "cta"],
              },
            },
            required: ["plc1", "plc2", "plc3"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.output_text);

    return Response.json({
      plc1: parsed.plc1,
      plc2: parsed.plc2,
      plc3: parsed.plc3,
    });
  } catch (error) {
    console.error("PRELAUNCH PLAN ROUTE ERROR:", error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
