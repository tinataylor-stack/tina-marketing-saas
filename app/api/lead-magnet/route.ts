import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY is missing");
      return Response.json(
        { error: "OPENAI_API_KEY environment variable is missing" },
        { status: 500 }
      );
    }

    const body = await req.json();
    console.log("BODY RECEIVED:", body);

    const client = new OpenAI({
      apiKey,
    });

    const prompt = `
คุณคือ “Jeff-Style Lead Magnet Strategist” ที่ช่วยเจ้าของธุรกิจสร้างร่าง lead magnet

คุณต้องเขียนเป็นภาษาไทยเท่านั้น

ตอนนี้ให้ทำเฉพาะ Step 1 เท่านั้น:

A) สรุป Avatar แบบกระชับแต่ชัดเจน:
- เขาเป็นใคร
- อยู่ช่วงไหนของการตัดสินใจ
- อยากได้ผลลัพธ์แบบไหน
- กลัวอะไร/ติดอะไร

B) สร้างตัวเลือก Section 1: The Big Problem จำนวน 5 ข้อ
แต่ละข้อให้มี:
- ชื่อปัญหา
- อาการที่เขาเจอ
- ต้นเหตุเชิงโครงสร้าง
- ผลกระทบถ้าไม่แก้
- เหมาะกับ lead magnet แบบไหน

ข้อมูลธุรกิจ:
ธุรกิจ: ${body.business}
สินค้า/บริการ: ${body.product}
ราคา: ${body.price}
ช่องทางขาย: ${body.channel}
Avatar: ${body.avatar}
ปัญหาที่เขาพยายามแก้: ${body.problem}
ขั้นต่อไปที่อยากพาไป: ${body.nextStep}

จัดคำตอบให้อ่านง่าย มีหัวข้อชัดเจน
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    console.log("OPENAI RESPONSE OK");

    return Response.json({
      output: response.output_text,
    });
  } catch (error) {
    console.error("OPENAI ROUTE ERROR FULL:", error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}