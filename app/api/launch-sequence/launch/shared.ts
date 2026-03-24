import OpenAI from "openai";
import { NextResponse } from "next/server";

export type FoundationSummary = {
  offerName: string;
  offerDescription: string;
  offerFormat: string;
  price: string;
  launchGoal: string;
  launchContext: string;
};

export type PlcSection = {
  headline: string;
  contentOutline: string;
  talkingPoints: string;
  cta: string;
};

export type PrelaunchPlan = {
  plc1: PlcSection;
  plc2: PlcSection;
  plc3: PlcSection;
};

export type LaunchSetup = {
  bonuses: string;
  urgencyMechanism: string;
  checkoutDirection: string;
  launchNotes: string;
  priorityObjections: string;
};

export type LaunchRequestBody = {
  avatarAnalysis: string;
  structuredAvatar: Record<string, unknown> | null;
  foundation: FoundationSummary;
  prelaunchPlan: PrelaunchPlan;
  launchSetup: LaunchSetup;
  priorMessages?: string[];
  previousMessages?: string[];
};

type DayPromptConfig = {
  schemaName: string;
  dayLabel: string;
  messageCount: number;
  dayGoal: string;
  extraRules: string[];
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export function validateLaunchRequest(body: LaunchRequestBody) {
  const {
    avatarAnalysis,
    structuredAvatar,
    foundation,
    prelaunchPlan,
    launchSetup,
  } = body;

  return Boolean(
    avatarAnalysis &&
      structuredAvatar &&
      foundation?.offerName &&
      foundation?.offerDescription &&
      foundation?.offerFormat &&
      foundation?.price &&
      foundation?.launchGoal &&
      prelaunchPlan?.plc1?.headline &&
      prelaunchPlan?.plc2?.headline &&
      prelaunchPlan?.plc3?.headline &&
      launchSetup?.urgencyMechanism &&
      launchSetup?.checkoutDirection &&
      launchSetup?.priorityObjections
  );
}

export async function createLaunchMessages(
  body: LaunchRequestBody,
  config: DayPromptConfig
) {
  const {
    avatarAnalysis,
    structuredAvatar,
    foundation,
    prelaunchPlan,
    launchSetup,
    priorMessages = [],
    previousMessages = [],
  } = body;

  const systemPrompt = `
You are a Thai direct response launch strategist and Line Broadcast copywriter.

Your job is to create LINE Broadcast messages for the paid offer launch window only.

Important:
- Write in Thai only.
- These are LINE Broadcast messages, not Facebook posts, not long-form sales pages, and not email.
- Messages must feel natural, specific, and usable immediately.
- Keep the copy concise enough for LINE, but rich enough to move the sale forward.
- Every message must align with the launch day objective provided.
- Keep continuity with the prelaunch sequence so the launch feels like the natural next step.
- Do not use emojis.
- Avoid hypey, spammy, or exaggerated claims.
- Avoid repeating the same opening, CTA, or objection framing across messages.
- The buyer action is to move toward the paid offer, not the free lead magnet.
- Do not mention the price, price range, discount amount, payment amount, installment amount, or any numeric pricing details anywhere in the message.

Return valid JSON only with this exact shape:
{
  "messages": ["..."]
}
`.trim();

  const userPrompt = `
Create ${config.messageCount} Thai LINE Broadcast message(s) for ${config.dayLabel}.

[LAUNCH DAY OBJECTIVE]
${config.dayGoal}

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

[PRELAUNCH CONTINUITY]
PLC 1 Headline: ${prelaunchPlan.plc1.headline}
PLC 2 Headline: ${prelaunchPlan.plc2.headline}
PLC 3 Headline: ${prelaunchPlan.plc3.headline}

[LAUNCH SETUP]
Bonuses: ${launchSetup.bonuses || "-"}
Urgency Mechanism: ${launchSetup.urgencyMechanism}
Checkout Direction: ${launchSetup.checkoutDirection}
Priority Objections: ${launchSetup.priorityObjections}
Launch Notes: ${launchSetup.launchNotes || "-"}

[MESSAGES TO AVOID REPEATING]
${priorMessages.length > 0 ? priorMessages.map((item, index) => `${index + 1}. ${item}`).join("\n\n") : "-"}

[PREVIOUS VERSION OF THIS DAY]
${previousMessages.length > 0 ? previousMessages.map((item, index) => `${index + 1}. ${item}`).join("\n\n") : "-"}

[RULES FOR THIS DAY]
${config.extraRules.map((rule, index) => `${index + 1}. ${rule}`).join("\n")}

[GLOBAL WRITING RULES]
- Make each message feel like a distinct send, not minor rewrites of the same text.
- Keep each message focused on one clear psychological job.
- Mention the offer naturally when needed, but do not over-explain everything in every message.
- Do not reveal or mention the offer price anywhere, even if the launch context includes pricing.
- CTA should fit LINE behavior and match the provided checkout direction.
- If urgency is relevant, make it concrete and believable.
- If objections are relevant, address them naturally instead of listing FAQ bullets.
- Do not use markdown bullets, numbering, or labels inside the messages.
- Do not sound robotic or templated.
- Return exactly ${config.messageCount} message(s).
`.trim();

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
    text: {
      format: {
        type: "json_schema",
        name: config.schemaName,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            messages: {
              type: "array",
              items: { type: "string" },
              minItems: config.messageCount,
              maxItems: config.messageCount,
            },
          },
          required: ["messages"],
        },
      },
    },
  });

  const parsed = JSON.parse(response.output_text || "{}");

  return NextResponse.json({
    messages: Array.isArray(parsed.messages) ? parsed.messages : [],
  });
}
