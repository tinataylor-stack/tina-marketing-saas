import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Section5 = {
  title: string;
  whyItFits: string;
  whatTheyDoNext: string;
  whatTheyGet: string;
  promise: string;
};

type RequestBody = {
  leadMagnetDraft: string;
  currentProblem?: string;
  section5?: Section5;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const { leadMagnetDraft, currentProblem, section5 } = body;

    if (!leadMagnetDraft) {
      return NextResponse.json(
        { error: "ไม่พบ leadMagnetDraft สำหรับสร้าง CTA" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are a Thai direct response copywriter.

Your job is to write CTA copy to PROMOTE a lead magnet.

Important:
- The CTA must invite people to receive, download, request, or get the lead magnet
- The CTA is NOT for selling the paid product, course, workshop, or next step offer
- Do NOT write copy that tells people to buy, enroll, join, register for, or purchase the next step
- The next step offer exists only as background context, not as the action you are asking the reader to take

Rules:
- Write in Thai
- Make the copy clear, practical, and natural
- Keep it persuasive but not spammy or exaggerated
- Make the copy usable right away
- Every CTA should clearly point to getting the lead magnet itself
- Do not drift into conversion copy for the next step offer

Return ONLY valid JSON.

JSON format:
{
  "ctaCopy": {
    "socialPost": "...",
    "lineWelcome": "...",
    "landingHero": "..."
  }
}
`.trim();

    const userPrompt = `
สร้าง CTA สำหรับโปรโมท lead magnet ด้านล่าง

Lead Magnet Draft:
${leadMagnetDraft}

${currentProblem ? `Problem the customer is trying to solve: ${currentProblem}` : ""}

${
  section5
    ? `
Next Step Information (บริบทเท่านั้น ห้ามใช้เป็น CTA หลัก):
Title: ${section5.title}
Why it fits: ${section5.whyItFits}
What they do next: ${section5.whatTheyDoNext}
What they get: ${section5.whatTheyGet}
Promise: ${section5.promise}
`
    : ""
}

คำสั่งสำคัญ:
- CTA ทั้งหมดต้องชวนให้คน "รับ lead magnet"
- ห้ามชวนให้ซื้อคอร์ส สมัครเวิร์กช็อป เข้าร่วมโปรแกรม หรือไปที่ next step โดยตรง
- ให้เขียนเหมือน top-of-funnel CTA ที่ใช้ดึงคนเข้ามารับ lead magnet ก่อน
- ถ้าจะพูดถึง next step ให้พูดได้แค่ในเชิงบริบท ห้ามใช้เป็น action หลัก
- ต้องชัดเจนว่าคนจะได้ "lead magnet" ไม่ใช่ข้อเสนอขาย

Desired actions ที่ใช้ได้:
- ดาวน์โหลด lead magnet
- รับ guide / checklist / mini guide
- คอมเมนต์เพื่อรับ lead magnet
- แอด LINE เพื่อรับ lead magnet
- คลิกลิงก์เพื่อรับ lead magnet

Desired actions ที่ห้ามใช้:
- ซื้อคอร์ส
- สมัครโปรแกรม
- ลงทะเบียนเวิร์กช็อป
- เข้าร่วม next step offer
- ชำระเงินเพื่อไปต่อ

เขียนผลลัพธ์ 3 ส่วน:
1. socialPost = ข้อความโพสต์สั้นเพื่อชวนคนมารับ lead magnet
2. lineWelcome = ข้อความต้อนรับใน LINE หลังจากคนเข้ามาเพื่อรับ lead magnet
3. landingHero = headline + subheadline สำหรับหน้า landing page เพื่อให้คนดาวน์โหลด lead magnet

คำแนะนำเพิ่มเติม:
- socialPost ควรชัดเจนว่าโพสต์นี้ชวนมารับ lead magnet
- lineWelcome ควรต้อนรับและบอกว่าคนจะได้รับ lead magnet อะไร
- landingHero ควรเน้นคุณค่าของ lead magnet และกระตุ้นให้ดาวน์โหลด
- หลีกเลี่ยงภาษาที่ดูโอเวอร์หรือขายเกินจริง
- เขียนให้สอดคล้องกับ leadMagnetDraft
`.trim();

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1",
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: userPrompt }],
        },
      ],
    });

    const rawText = response.output_text?.trim();

    if (!rawText) {
      return NextResponse.json(
        { error: "OpenAI ไม่ได้ส่งผลลัพธ์กลับมา" },
        { status: 500 }
      );
    }

    let parsed: {
      ctaCopy?: {
        socialPost?: string;
        lineWelcome?: string;
        landingHero?: string;
      };
    };

    try {
      parsed = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        {
          error: "ไม่สามารถอ่าน JSON จาก OpenAI ได้",
          raw: rawText,
        },
        { status: 500 }
      );
    }

    if (
      !parsed.ctaCopy ||
      !parsed.ctaCopy.socialPost ||
      !parsed.ctaCopy.lineWelcome ||
      !parsed.ctaCopy.landingHero
    ) {
      return NextResponse.json(
        { error: "ผลลัพธ์ไม่มี ctaCopy ที่สมบูรณ์" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ctaCopy: {
        socialPost: parsed.ctaCopy.socialPost,
        lineWelcome: parsed.ctaCopy.lineWelcome,
        landingHero: parsed.ctaCopy.landingHero,
      },
    });
  } catch (error) {
    console.error("cta-copy route error:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้าง CTA" },
      { status: 500 }
    );
  }
}