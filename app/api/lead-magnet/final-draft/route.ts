import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type BigProblemOption = {
  title: string;
  symptoms: string;
  rootCause: string;
  costOfInaction: string;
  leadMagnetType: string;
};

type Section2 = {
  oldBelief: string;
  newBelief: string;
  mechanism: string;
  miniFramework: string[];
};

type Section3 = {
  format: string;
  content: string;
};

type Section4 = {
  gapSummary: string;
  deeperLayers: string[];
  bridgeToNextStep: string;
};

type Section5 = {
  title: string;
  whyItFits: string;
  whatTheyDoNext: string;
  whatTheyGet: string;
  promise: string;
};

type RequestBody = {
  structuredAvatar: any;
  currentProblem: string;
  selectedBigProblem: BigProblemOption;
  section2: Section2;
  section3: Section3;
  section4: Section4;
  section5: Section5;
  regenerate?: boolean;
  previousLeadMagnetDraft?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;

    const {
      structuredAvatar,
      currentProblem,
      selectedBigProblem,
      section2,
      section3,
      section4,
      section5,
      regenerate = false,
      previousLeadMagnetDraft = "",
    } = body;

    if (
      !structuredAvatar ||
      !currentProblem ||
      !selectedBigProblem ||
      !section2 ||
      !section3 ||
      !section4 ||
      !section5
    ) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบสำหรับสร้าง Final Draft" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are a Thai lead magnet strategist.

Your job is to produce a STRATEGIC LEAD MAGNET BLUEPRINT in Thai.

This is NOT a finished consumer-facing article.
This is NOT a sales page.
This is NOT a polished lead magnet written directly to the end reader.

You must write the output for the BUSINESS OWNER to use as a framework.

Strict rules:
- Return ONLY valid JSON
- Do not include markdown code fences
- Do not include any explanation before or after JSON
- Write in Thai
- Follow the exact 5-part framework below
- Keep the output strategic, structured, and implementation-ready
- Do NOT turn it into narrative content for the customer
- Do NOT write in second person to the customer like "คุณ..."
- Do NOT write it like an article, ad, or sales letter
- Each section must clearly match the framework logic already approved in previous steps

The output should feel like:
- strategic
- clear
- structured
- easy for a business owner to turn into a real lead magnet later

Output JSON shape:
{
  "leadMagnetDraft": "..."
}
`.trim();

   const userPrompt = `
สร้าง Strategic Lead Magnet Blueprint จากข้อมูลด้านล่าง

สิ่งสำคัญ:
- ผลลัพธ์ต้องเป็น "โครงเชิงกลยุทธ์" ไม่ใช่ lead magnet content ฉบับเต็ม
- ห้ามเขียนเป็นบทความหรือข้อความขายตรงถึงลูกค้า
- ห้ามเปิดด้วยภาษาลักษณะ "คุณกำลัง..." หรือเขียนเหมือนคุยกับผู้บริโภค
- ให้เขียนเป็นคำตอบสำหรับเจ้าของธุรกิจที่ต้องการเอาโครงนี้ไปพัฒนาต่อ
- ต้องเรียงตาม framework 5 ส่วนด้านล่างเท่านั้น

[AVATAR]
${JSON.stringify(structuredAvatar, null, 2)}

[CURRENT PROBLEM]
${currentProblem}

[SECTION 1 - BIG PROBLEM]
ชื่อปัญหา: ${selectedBigProblem.title}
อาการที่เขาเจอ: ${selectedBigProblem.symptoms}
ต้นเหตุเชิงโครงสร้าง: ${selectedBigProblem.rootCause}
ผลกระทบถ้าไม่แก้: ${selectedBigProblem.costOfInaction}
Lead Magnet Type ที่เหมาะ: ${selectedBigProblem.leadMagnetType}

[SECTION 2 - THE SHIFT]
ความเชื่อเดิม: ${section2.oldBelief}
มุมมองใหม่: ${section2.newBelief}
กลไก: ${section2.mechanism}
Mini Framework:
${section2.miniFramework.map((item, index) => `${index + 1}. ${item}`).join("\n")}

[SECTION 3 - THE PROOF]
รูปแบบ: ${section3.format}
เนื้อหา:
${section3.content}

[SECTION 4 - THE GAP]
สิ่งที่ยังขาดอยู่: ${section4.gapSummary}
ชั้นที่ลึกกว่าที่ต้องมี:
${section4.deeperLayers.map((item, index) => `${index + 1}. ${item}`).join("\n")}
สะพานไปสู่ขั้นตอนถัดไป: ${section4.bridgeToNextStep}

[SECTION 5 - THE NEXT STEP]
ชื่อ: ${section5.title}
ทำไมถึงเหมาะ: ${section5.whyItFits}
ผู้ใช้ต้องทำอะไรต่อ: ${section5.whatTheyDoNext}
เขาจะได้อะไร: ${section5.whatTheyGet}
Promise: ${section5.promise}

[REQUIRED OUTPUT FORMAT]
เขียนผลลัพธ์ให้อยู่ในโครงนี้เท่านั้น:

1. ปัญหาหลัก: [ชื่อปัญหา]
[อธิบายปัญหาหลักเชิงกลยุทธ์ โดยสรุปอาการ ต้นเหตุ และผลกระทบ]

2. เปลี่ยนวิธีคิด: จาก [ความเชื่อเดิม] สู่ [มุมมองใหม่]
[อธิบาย shift เชิงกลยุทธ์]
Mini Framework:
1. ...
2. ...
3. ...

3. ตัวอย่าง: [ชื่อหรือประเภทตัวอย่าง]
[สรุปตัวอย่างเชิงกลยุทธ์ ไม่ต้องเขียนเวิ่นเว้อ ไม่ต้องเล่าแบบบทความ]

4. ช่องว่างและโอกาสต่อยอด
[อธิบายสิ่งที่ lead magnet นี้ช่วยได้ และสิ่งที่ยังขาดอยู่]
- ...
- ...
- ...

[สรุปว่าทำไมผู้ใช้จึงควรไปขั้นตอนถัดไป]

5. ขั้นตอนถัดไป: [ชื่อ next step]
[อธิบายว่า next step นี้เหมาะกับใครและเชื่อมจาก lead magnet อย่างไร]
- สิ่งที่จะได้รับ: ...
- จุดมุ่งหมาย: ...

[IMPORTANT WRITING RULES]
- ต้องเขียนแบบโครงเชิงกลยุทธ์
- ห้ามเขียนเป็นบทความสำเร็จรูป
- ห้ามใช้ภาษาพูดกับลูกค้าโดยตรงแบบ sales copy
- ห้ามเขียนเกริ่นนำหรือสรุปปิดท้ายแบบบทความ
- ต้องจัดตามเลข 1-5 ชัดเจน
- ต้องสะท้อน framework เดิมให้ครบ
- ต้องอ่านแล้วเหมือน "blueprint" ไม่ใช่ "content asset"

${
  regenerate && previousLeadMagnetDraft
    ? `
[REGENERATE]
นี่คือ draft เดิม:
${previousLeadMagnetDraft}

กรุณาเขียนใหม่โดยยังคงโครง 1-5 แบบเดิม แต่ทำให้ชัดขึ้น คมขึ้น และเป็น strategic blueprint มากขึ้น
`
    : ""
}
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

    let parsed: { leadMagnetDraft?: string };

    try {
      parsed = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        {
          error: "ไม่สามารถอ่านผลลัพธ์จาก OpenAI เป็น JSON ได้",
          raw: rawText,
        },
        { status: 500 }
      );
    }

    if (!parsed.leadMagnetDraft) {
      return NextResponse.json(
        { error: "ผลลัพธ์ไม่มี leadMagnetDraft" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      leadMagnetDraft: parsed.leadMagnetDraft,
    });
  } catch (error) {
    console.error("final-draft route error:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้าง Final Draft" },
      { status: 500 }
    );
  }
}