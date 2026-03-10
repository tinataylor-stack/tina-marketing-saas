import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type RewriteStyle =
  | "shorter"
  | "longer"
  | "more-practical"
  | "beginner-friendly"
  | "more-premium";

type RequestBody = {
  originalContent: string;
  selectedFormat:
    | "article"
    | "pdf-guide"
    | "checklist"
    | "workbook"
    | "email-course"
    | "video-script";
  rewriteStyle: RewriteStyle;
};

const rewriteInstructions: Record<RewriteStyle, string> = {
  shorter: "Make it significantly shorter and tighter.",
  longer: "Make it significantly longer and more developed.",
  "more-practical": "Make it significantly more practical and actionable.",
  "beginner-friendly": "Make it significantly easier for a beginner to understand.",
  "more-premium": "Make it significantly more polished and premium.",
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const { originalContent, selectedFormat, rewriteStyle } = body;

    if (!originalContent || !selectedFormat || !rewriteStyle) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const extractResponse = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: `
You extract the core meaning from content.

Rules:
1. Detect the language of the original content.
2. Preserve the original language in your output.
3. If the original content is in Thai, output Thai.
4. If the original content is in English, output English.
5. Return only a clean bullet list of the essential ideas, structure, and teaching points.
6. Do not preserve original wording.
7. Do not write full paragraphs.
`,
        },
        {
          role: "user",
          content: `
Extract the core ideas from this lead magnet content.

Format:
${selectedFormat}

Content:
${originalContent}
`,
        },
      ],
    });

    const extractedOutline = extractResponse.output_text || "";

    const rewriteResponse = await openai.responses.create({
      model: "gpt-5",
      input: [
        {
          role: "system",
          content: `
You are a senior direct-response editor.

Rewrite content from extracted core ideas, not from the original wording.

Rules:
1. Rebuild the content from scratch.
2. Keep the same format family and core purpose.
3. Keep the same language as the original content.
4. If the original content is Thai, output Thai only.
5. If the original content is English, output English only.
6. Do not translate unless explicitly asked.
7. Make the requested rewrite style obvious.
8. Do not sound like a lightly edited copy.
9. Return only the rewritten content.
`,
        },
        {
          role: "user",
          content: `
Original content:
${originalContent}

Lead magnet format:
${selectedFormat}

Rewrite goal:
${rewriteInstructions[rewriteStyle]}

Core ideas to preserve:
${extractedOutline}

Important:
- Keep the rewritten version in the SAME LANGUAGE as the original content.
- If the original content is Thai, the rewritten version must be fully in Thai.
- Write a distinctly new version from these ideas.
- Do not reuse original phrasing.
`,
        },
      ],
    });

    return NextResponse.json({
      rewrittenContent: rewriteResponse.output_text || "",
    });
  } catch (error) {
    console.error("Lead magnet rewrite error:", error);

    return NextResponse.json(
      { error: "Failed to rewrite content." },
      { status: 500 }
    );
  }
}