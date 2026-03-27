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
  testimonials: string;
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
  dayLeadAngles: string[];
  messageAnatomy: string[];
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
You are a Thai LINE Broadcast launch copywriter for paid offers.

Your job is to write launch messages that are ready to send as-is in a real launch.

Important:
- Write in Thai only.
- Write for LINE Broadcast, not email, not Facebook, and not long-form sales page copy.
- Every message must be ready to send as-is in a real launch.
- Every message must feel specific to this offer, this audience, and this launch moment.
- If a message could be used for many different offers with only the offer name swapped out, it is wrong.
- Keep the copy concise enough for LINE, but strong enough to persuade.
- These messages must do more than reduce objections.
- They must actively help the audience:
  - want the offer
  - understand the value of the offer
  - believe this can work for someone like them
  - feel ready to take the next step
- Every message must align with the launch day objective provided.
- Keep continuity with the prelaunch sequence so the launch feels like the natural next step.
- Do not use emojis.
- Avoid hype, fake urgency, fake claims, and generic praise.
- Avoid repeating the same opening, CTA, or objection framing across messages.
- The buyer action is to move toward the paid offer, not the free lead magnet.
- Do not mention the price, price range, discount amount, payment amount, installment amount, or any numeric pricing details anywhere in the message.
- Do not sound like a template, webinar slide, FAQ, or coaching notes.
- Do not rely only on objection handling.
- Strong launch messages should balance these persuasion levers:
 - Strong launch messages should balance these persuasion levers:
  1. buyer pain or stuck point
  2. offer value or จุดขาย
  3. proof / belief / "คนแบบฉันก็ทำได้"
  4. urgency or action
- Use objection handling when needed, but do not let the whole message become only an objection answer.
- Use proof-driven language only when proof is one of the primary persuasion levers for this day, or when it clearly strengthens the message without taking over.
- If no exact testimonial is provided, use believable proof framing, transformation logic, or reader-belief language.
- Never invent fake statistics, fake testimonials, or named case studies.
- Priority Objections are an important supporting input, especially on hesitation-heavy days.
- Before writing each message, mentally decide:
  - who this message is for
  - what they are feeling right now
  - which persuasion lever should lead this message
  - what specific point about the offer matters most here
  - what will help them believe they can do it too
  - which priority objection matters most for this day if hesitation needs to be addressed
  - what action they should take next

Return valid JSON only:
{
  "messages": ["..."]
}
`.trim();

  const userPrompt = `
Create ${config.messageCount} Thai LINE Broadcast message(s) for ${config.dayLabel}.

[LAUNCH DAY OBJECTIVE]
${config.dayGoal}

[PRIMARY PERSUASION LEVERS FOR THIS DAY]
${config.dayLeadAngles.map((rule, index) => `${index + 1}. ${rule}`).join("\n")}

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
PLC 1 Content Outline: ${prelaunchPlan.plc1.contentOutline}
PLC 1 Talking Points: ${prelaunchPlan.plc1.talkingPoints}
PLC 1 CTA Direction: ${prelaunchPlan.plc1.cta}

PLC 2 Headline: ${prelaunchPlan.plc2.headline}
PLC 2 Content Outline: ${prelaunchPlan.plc2.contentOutline}
PLC 2 Talking Points: ${prelaunchPlan.plc2.talkingPoints}
PLC 2 CTA Direction: ${prelaunchPlan.plc2.cta}

PLC 3 Headline: ${prelaunchPlan.plc3.headline}
PLC 3 Content Outline: ${prelaunchPlan.plc3.contentOutline}
PLC 3 Talking Points: ${prelaunchPlan.plc3.talkingPoints}
PLC 3 CTA Direction: ${prelaunchPlan.plc3.cta}

[LAUNCH SETUP]
Bonuses: ${launchSetup.bonuses || "-"}
Urgency Mechanism: ${launchSetup.urgencyMechanism}
Checkout Direction: ${launchSetup.checkoutDirection}
Priority Objections: ${launchSetup.priorityObjections}
Testimonials / Proof Notes: ${launchSetup.testimonials || "-"}
Launch Notes: ${launchSetup.launchNotes || "-"}

[PRIORITY OBJECTION INSTRUCTION]
Treat "Priority Objections" as the first source of buyer hesitation when a message needs to handle doubt, resistance, delay, or uncertainty.
- If the day involves objection handling, choose the objection from this field first.
- If multiple objections are listed, choose the one that best fits the psychology of this specific day.
- If the objection is emotional, keep that emotional language alive in the copy instead of flattening it into generic marketing language.
- Only fall back to a broader inferred objection if the Priority Objections field is clearly unusable for the day.

[OFFER VALUE RULE]
Actively communicate what makes this offer worth attention.
Show why this is a strong next step after prelaunch, not just that the offer exists.

[PROOF / BELIEF RULE]
When useful, include language that helps the reader feel:
- this can work for someone like me
- I am not the only person with this problem
- the result is believable and reachable
If "Testimonials / Proof Notes" is provided, use it mainly on proof-led days.
On non-proof-led days, only use it lightly if it clearly strengthens the day's main objective.
Convert that input into believable Thai proof framing naturally.
Use believable proof framing only. Do not invent fake claims.

[MESSAGE ANATOMY]
${config.messageAnatomy.map((rule, index) => `${index + 1}. ${rule}`).join("\n")}

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
- If a message is meant to handle hesitation, resistance, uncertainty, or delay, anchor it to the Priority Objections input before using any inferred objection.
- CTA should fit LINE behavior and match the provided checkout direction.
- If urgency is relevant, make it concrete and believable.
- If objections are relevant, address them naturally instead of listing FAQ bullets.
- Do not use markdown bullets, numbering, or labels inside the messages.
- Do not sound robotic or templated.
- Do not use vague launch phrases unless they are supported by specific context from this offer and audience.
- Avoid empty phrases such as:
  - โอกาสดี
  - อย่าพลาด
  - คุ้มมาก
  - รีบเลย
  - พร้อมหรือยัง
  - ดีมากสำหรับคุณ
  unless the surrounding wording makes them specific and credible.
- Do not rely on generic praise for the offer.
- Do not use broad motivational language when concrete buyer language would be stronger.
- Do not make the copy sound like a template, webinar slide, FAQ answer, or coaching notes.
- Use details from the offer description, audience pain, prelaunch progression, objections, launch notes, and urgency mechanism so the message feels grounded in this actual launch.
- Do not let the message become only an objection answer if value, proof, or urgency should be leading this day.
- Do not repeat the same testimonial angle, proof pattern, transformation example, or "คนแบบคุณก็ทำได้" claim across multiple days unless the new message uses it in a clearly different way.
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
