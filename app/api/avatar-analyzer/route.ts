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
      business,
      product,
      roughAvatar,
      price,
      country,
      regenerate,
      previousDraft,
    } = body;

    if (!business || !product || !roughAvatar || !price || !country) {
      return Response.json(
        { error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" },
        { status: 400 }
      );
    }

    const client = new OpenAI({
      apiKey,
    });

    const variationInstruction = regenerate
      ? `
คำสั่งเพิ่มเติมสำหรับการสร้างคำตอบครั้งนี้:

ครั้งนี้ให้หลีกเลี่ยงการใช้ถ้อยคำหรือมุมวิเคราะห์ซ้ำกับคำตอบก่อนหน้า
และเสนอ framing หรือมุมมองที่แตกต่างออกไปอย่างชัดเจน

คำตอบก่อนหน้าที่ต้องหลีกเลี่ยงการซ้ำ:
${previousDraft || ""}
`
      : "";

    const prompt = `
You are a Strategic Customer Avatar Analyst.

Your role is to help business owners clearly identify and refine their target audience (Customer Avatar) in any industry.

You MUST operate in Thai language only.
You MUST produce detailed, strategic, psychologically deep answers.
You do NOT give short answers.

${variationInstruction}

ข้อมูลจากผู้ใช้:
ธุรกิจ: ${business}
สินค้า/บริการ: ${product}
กลุ่มเป้าหมายที่คิดว่าใช่ตอนนี้: ${roughAvatar}
ราคาสินค้าหรือช่วงราคา: ${price}
ขายที่ประเทศ: ${country}

สำคัญมาก:
- field "output" ต้องเป็นภาษาไทยล้วนแบบอ่านง่ายสำหรับมนุษย์
- ห้ามใส่ JSON
- ห้ามใส่ชื่อ field เช่น shortSummary, goals, challenges, objections, whereTheyAre, nonAvatar
- ห้ามใส่เครื่องหมายวงเล็บปีกกา {}
- ห้ามใส่เครื่องหมาย quote แบบ JSON
- ห้ามเขียนโค้ด
- ให้เขียนเป็นบทวิเคราะห์ภาษาไทยล้วนเท่านั้น

field "output" ต้องใช้หัวข้อแบบนี้เท่านั้น:

วิเคราะห์ Avatar เชิงกลยุทธ์

1. เป้าหมาย คุณค่า และโอกาส
2. ปัญหาและความท้าทาย
3. ข้อโต้แย้งและอุปสรรค
4. เขาอยู่ที่ไหน
5. ใครไม่ใช่ Avatar นี้
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "avatar_analysis_response",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              output: {
                type: "string",
                description:
                  "คำอธิบายภาษาไทยล้วนสำหรับผู้ใช้ ห้ามมี JSON field names ห้ามมีโค้ด ห้ามมีวงเล็บปีกกา",
              },
              structuredAvatar: {
                type: "object",
                additionalProperties: false,
                properties: {
                  shortSummary: { type: "string" },
                  goals: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      shortTerm: { type: "string" },
                      longTerm: { type: "string" },
                      unspokenGoals: { type: "string" },
                      values: { type: "string" },
                      hiddenAmbition: { type: "string" },
                      visibleOpportunities: { type: "string" },
                      hiddenOpportunities: { type: "string" },
                      identityDreams: { type: "string" },
                    },
                    required: [
                      "shortTerm",
                      "longTerm",
                      "unspokenGoals",
                      "values",
                      "hiddenAmbition",
                      "visibleOpportunities",
                      "hiddenOpportunities",
                      "identityDreams",
                    ],
                  },
                  challenges: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      externalProblems: { type: "string" },
                      internalFrustration: { type: "string" },
                      deepFears: { type: "string" },
                      unspokenWorries: { type: "string" },
                      strategicConfusion: { type: "string" },
                      failurePatterns: { type: "string" },
                      failedAttempts: { type: "string" },
                    },
                    required: [
                      "externalProblems",
                      "internalFrustration",
                      "deepFears",
                      "unspokenWorries",
                      "strategicConfusion",
                      "failurePatterns",
                      "failedAttempts",
                    ],
                  },
                  objections: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      money: { type: "string" },
                      time: { type: "string" },
                      selfDoubt: { type: "string" },
                      marketDoubt: { type: "string" },
                      productDoubt: { type: "string" },
                      selfTalkBeforeBuying: { type: "string" },
                      socialTalkBeforeBuying: { type: "string" },
                    },
                    required: [
                      "money",
                      "time",
                      "selfDoubt",
                      "marketDoubt",
                      "productDoubt",
                      "selfTalkBeforeBuying",
                      "socialTalkBeforeBuying",
                    ],
                  },
                  whereTheyAre: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      platforms: { type: "string" },
                      contentTypes: { type: "string" },
                      influencerStyle: { type: "string" },
                      media: { type: "string" },
                      communities: { type: "string" },
                      buyingBehavior: { type: "string" },
                      activeTime: { type: "string" },
                    },
                    required: [
                      "platforms",
                      "contentTypes",
                      "influencerStyle",
                      "media",
                      "communities",
                      "buyingBehavior",
                      "activeTime",
                    ],
                  },
                  nonAvatar: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      notIdealCustomer: { type: "string" },
                      wrongMindset: { type: "string" },
                      notReadyToBuy: { type: "string" },
                      highMaintenance: { type: "string" },
                      looksRightButWrong: { type: "string" },
                    },
                    required: [
                      "notIdealCustomer",
                      "wrongMindset",
                      "notReadyToBuy",
                      "highMaintenance",
                      "looksRightButWrong",
                    ],
                  },
                },
                required: [
                  "shortSummary",
                  "goals",
                  "challenges",
                  "objections",
                  "whereTheyAre",
                  "nonAvatar",
                ],
              },
            },
            required: ["output", "structuredAvatar"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.output_text);

    return Response.json({
      output: parsed.output,
      structuredAvatar: parsed.structuredAvatar,
    });
  } catch (error) {
    console.error("AVATAR ANALYZER ERROR:", error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}