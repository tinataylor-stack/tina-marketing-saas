import OpenAI from "openai";
import { NextResponse } from "next/server";
import type {
  ContentPlanner30Input,
  ContentPlanner30Plan,
  PlannerPlatform,
  StructuredAvatar,
} from "../../../content-generator/types";

type RequestBody = {
  avatarAnalysis: string;
  structuredAvatar: StructuredAvatar | null;
  input: ContentPlanner30Input;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getPlatformLabel(platform: PlannerPlatform) {
  if (platform === "line") return "LINE";
  if (platform === "general") return "General";
  return "Facebook";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const { avatarAnalysis, structuredAvatar, input } = body;

    if (!avatarAnalysis || !structuredAvatar || !input?.platform) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบสำหรับสร้างแผนคอนเทนต์ 30 วัน" },
        { status: 400 }
      );
    }

    const platformLabel = getPlatformLabel(input.platform);

    const prompt = `
You are a Thai content strategist.

Your job is to create a 30-day content planner in Thai for a business owner.

Important:
- This is a planner, not finished content.
- Write in Thai only.
- Use the saved Avatar context as the main source of business and audience direction.
- The calendar must feel varied and usable, not repetitive.
- Mix these content types across the month:
  1. ให้ความรู้
  2. สร้างความน่าสนใจ
  3. สร้างความบันเทิง
  4. สร้างความไว้วางใจ
  5. กระตุ้นการมีส่วนร่วม
- Balance the 30 days naturally. Do not cluster only one type together for too many consecutive days.
- Recommend one generator type for each day using only:
  - social-post
  - line-broadcast
  - video-script
- Keep the outputs strategic and execution-ready.
- Do not write full finished posts or scripts.

[PRIMARY PLATFORM]
${platformLabel}

[OPTIONAL TONE / STYLE DIRECTION]
${input.tone || "-"}

[OPTIONAL EXTRA CONTEXT]
${input.extraContext || "-"}

[AVATAR ANALYSIS]
${avatarAnalysis}

[STRUCTURED AVATAR]
${JSON.stringify(structuredAvatar, null, 2)}

Return JSON only with this exact shape:
{
  "avatarSummary": "short Thai summary of the avatar/business context",
  "businessContext": "short Thai explanation of the business/topic context used for planning",
  "days": [
    {
      "day": 1,
      "contentType": "...",
      "title": "...",
      "theme": "...",
      "format": "...",
      "recommendedGeneratorType": "...",
      "hookIdea": "...",
      "angle": "...",
      "summary": "...",
      "ctaDirection": "..."
    }
  ]
}
`;

    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "content_planner_30_days",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              avatarSummary: { type: "string" },
              businessContext: { type: "string" },
              days: {
                type: "array",
                minItems: 30,
                maxItems: 30,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    day: { type: "integer" },
                    contentType: {
                      type: "string",
                      enum: [
                        "ให้ความรู้",
                        "สร้างความน่าสนใจ",
                        "สร้างความบันเทิง",
                        "สร้างความไว้วางใจ",
                        "กระตุ้นการมีส่วนร่วม",
                      ],
                    },
                    title: { type: "string" },
                    theme: { type: "string" },
                    format: { type: "string" },
                    recommendedGeneratorType: {
                      type: "string",
                      enum: ["social-post", "line-broadcast", "video-script"],
                    },
                    hookIdea: { type: "string" },
                    angle: { type: "string" },
                    summary: { type: "string" },
                    ctaDirection: { type: "string" },
                  },
                  required: [
                    "day",
                    "contentType",
                    "title",
                    "theme",
                    "format",
                    "recommendedGeneratorType",
                    "hookIdea",
                    "angle",
                    "summary",
                    "ctaDirection",
                  ],
                },
              },
            },
            required: ["avatarSummary", "businessContext", "days"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.output_text) as {
      avatarSummary: string;
      businessContext: string;
      days: ContentPlanner30Plan["days"];
    };

    const plan: ContentPlanner30Plan = {
      platform: input.platform,
      tone: input.tone || "",
      extraContext: input.extraContext || "",
      avatarSummary: parsed.avatarSummary,
      businessContext: parsed.businessContext,
      days: parsed.days,
    };

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("CONTENT PLANNER 30 DAYS ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างแผนคอนเทนต์ 30 วัน" },
      { status: 500 }
    );
  }
}
