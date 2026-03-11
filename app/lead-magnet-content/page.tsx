"use client";

import { useEffect, useState } from "react";

type StructuredAvatar = {
  business?: string;
  product?: string;
  roughAvatar?: string;
  price?: string;
  country?: string;
  [key: string]: unknown;
};

type Section5 = {
  title?: string;
  whyItFits?: string;
  whatTheyDoNext?: string;
  whatTheyGet?: string;
  promise?: string;
};

type LeadMagnetFormat =
  | "article"
  | "pdf-guide"
  | "checklist"
  | "workbook"
  | "email-course"
  | "video-script";

type RewriteStyle =
  | "shorter"
  | "longer"
  | "more-practical"
  | "beginner-friendly"
  | "more-premium";

type FormatOption = {
  id: LeadMagnetFormat;
  title: string;
  description: string;
};

type ContentSettings = {
  length?: "short" | "medium" | "long";
  tone?: "practical" | "friendly" | "expert" | "premium";
  checklistStyle?: "concise" | "detailed";
  includeExplanations?: "yes" | "no";
  numberOfExercises?: "3" | "5" | "7";
  workbookStyle?: "reflective" | "action-driven";
  numberOfEmails?: "3" | "5" | "7";
  emailStyle?: "educational" | "relationship-building" | "action-focused";
  videoLength?: "short" | "long";
};

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: "article",
    title: "บทความ",
    description:
      "เหมาะสำหรับ Lead Magnet ที่สอนผ่านเนื้อหาแบบอ่านง่าย คล้ายบทความหรือบทความบล็อก",
  },
  {
    id: "pdf-guide",
    title: "PDF Guide",
    description:
      "เหมาะสำหรับคู่มือที่จัดโครงสร้างชัดเจน สามารถดาวน์โหลดไปอ่านหรือแจกเป็นไฟล์ได้",
  },
  {
    id: "checklist",
    title: "Checklist",
    description:
      "เหมาะสำหรับ Lead Magnet ที่เน้นขั้นตอนสั้น ๆ ทำตามได้ทันที เข้าใจง่าย ใช้ได้เร็ว",
  },
  {
    id: "workbook",
    title: "Workbook",
    description:
      "เหมาะสำหรับ Lead Magnet แบบมีแบบฝึกหัด คำถาม หรือกิจกรรมให้ผู้อ่านลงมือทำ",
  },
  {
    id: "email-course",
    title: "คอร์สผ่านอีเมล",
    description:
      "เหมาะสำหรับ Lead Magnet ที่ส่งเนื้อหาเป็นบทเรียนหลายตอนผ่านอีเมล",
  },
  {
    id: "video-script",
    title: "สคริปต์วิดีโอ",
    description:
      "เหมาะสำหรับ Lead Magnet ที่จะนำไปใช้เป็นวิดีโอสอน หรือวิดีโอเทรนนิ่ง",
  },
];

export default function LeadMagnetContentPage() {
  const [leadMagnetDraft, setLeadMagnetDraft] = useState("");
  const [confirmedAvatarAnalysis, setConfirmedAvatarAnalysis] = useState("");
  const [confirmedStructuredAvatar, setConfirmedStructuredAvatar] =
    useState<StructuredAvatar | null>(null);
  const [currentProblem, setCurrentProblem] = useState("");
  const [section5, setSection5] = useState<Section5 | null>(null);

  const [selectedFormat, setSelectedFormat] =
    useState<LeadMagnetFormat | null>(null);
  const [settings, setSettings] = useState<ContentSettings>({});
  const [generatedContent, setGeneratedContent] = useState("");
  const [loadingContent, setLoadingContent] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);

  const [rewriteStyle, setRewriteStyle] = useState<RewriteStyle | "">("");
  const [rewrittenContent, setRewrittenContent] = useState("");
  const [loadingRewrite, setLoadingRewrite] = useState(false);
  const [rewriteLoadingMessage, setRewriteLoadingMessage] = useState("");
  const [rewriteLoadingStep, setRewriteLoadingStep] = useState(0);

  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  useEffect(() => {
    try {
      const savedLeadMagnetDraft =
        localStorage.getItem("leadMagnetDraft") || "";
      const savedAvatarAnalysis =
        localStorage.getItem("confirmedAvatarAnalysis") || "";
      const savedCurrentProblem =
        localStorage.getItem("leadMagnetCurrentProblem") || "";
      const savedSelectedFormat =
        localStorage.getItem("selectedLeadMagnetFormat") || "";
      const savedSettingsRaw =
        localStorage.getItem("leadMagnetContentSettings") || "";
      const savedGeneratedContent =
        localStorage.getItem("generatedLeadMagnetContent") || "";
      const savedRewriteStyle =
        localStorage.getItem("leadMagnetRewriteStyle") || "";
      const savedRewrittenContent =
        localStorage.getItem("rewrittenLeadMagnetContent") || "";
      const savedStructuredAvatarRaw =
        localStorage.getItem("confirmedStructuredAvatar");
      const savedSection5Raw = localStorage.getItem("leadMagnetSection5");

      let parsedStructuredAvatar: StructuredAvatar | null = null;
      if (savedStructuredAvatarRaw) {
        try {
          parsedStructuredAvatar = JSON.parse(savedStructuredAvatarRaw);
        } catch (error) {
          console.error("Failed to parse confirmedStructuredAvatar:", error);
        }
      }

      let parsedSection5: Section5 | null = null;
      if (savedSection5Raw) {
        try {
          parsedSection5 = JSON.parse(savedSection5Raw);
        } catch (error) {
          console.error("Failed to parse leadMagnetSection5:", error);
        }
      }

      let parsedSettings: ContentSettings = {};
      if (savedSettingsRaw) {
        try {
          parsedSettings = JSON.parse(savedSettingsRaw);
        } catch (error) {
          console.error("Failed to parse leadMagnetContentSettings:", error);
        }
      }

      setLeadMagnetDraft(savedLeadMagnetDraft);
      setConfirmedAvatarAnalysis(savedAvatarAnalysis);
      setConfirmedStructuredAvatar(parsedStructuredAvatar);
      setCurrentProblem(savedCurrentProblem);
      setSection5(parsedSection5);
      setSettings(parsedSettings);
      setGeneratedContent(savedGeneratedContent);
      setRewrittenContent(savedRewrittenContent);

      if (isValidFormat(savedSelectedFormat)) {
        setSelectedFormat(savedSelectedFormat);
      }

      if (isValidRewriteStyle(savedRewriteStyle)) {
        setRewriteStyle(savedRewriteStyle);
      }
    } catch (error) {
      console.error("Failed to read localStorage:", error);
    } finally {
      setHasCheckedStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!copyMessage) return;

    const timer = setTimeout(() => {
      setCopyMessage("");
    }, 1800);

    return () => clearTimeout(timer);
  }, [copyMessage]);

  const handleSelectFormat = (formatId: LeadMagnetFormat) => {
    setSelectedFormat(formatId);
    localStorage.setItem("selectedLeadMagnetFormat", formatId);
  };

  const updateSettings = (newValues: Partial<ContentSettings>) => {
    const nextSettings = { ...settings, ...newValues };
    setSettings(nextSettings);
    localStorage.setItem(
      "leadMagnetContentSettings",
      JSON.stringify(nextSettings)
    );
  };

  const runContentLoadingSequence = () => {
    const timers = [
      setTimeout(() => {
        setLoadingStep(1);
        setLoadingMessage("กำลังวิเคราะห์ Draft...");
      }, 0),
      setTimeout(() => {
        setLoadingStep(2);
        setLoadingMessage("กำลังจัดโครงสร้างเนื้อหา...");
      }, 1200),
      setTimeout(() => {
        setLoadingStep(3);
        setLoadingMessage("กำลังเขียน Lead Magnet Content...");
      }, 2600),
      setTimeout(() => {
        setLoadingStep(4);
        setLoadingMessage("กำลังเรียบเรียงให้อ่านลื่น...");
      }, 4300),
    ];

    return timers;
  };

  const runRewriteLoadingSequence = () => {
    const timers = [
      setTimeout(() => {
        setRewriteLoadingStep(1);
        setRewriteLoadingMessage("กำลังวิเคราะห์เนื้อหาเดิม...");
      }, 0),
      setTimeout(() => {
        setRewriteLoadingStep(2);
        setRewriteLoadingMessage("กำลังสกัดโครงสร้างสำคัญ...");
      }, 1200),
      setTimeout(() => {
        setRewriteLoadingStep(3);
        setRewriteLoadingMessage("กำลังสร้างเวอร์ชันใหม่...");
      }, 2600),
    ];

    return timers;
  };

  const generateContent = async () => {
    if (!leadMagnetDraft || !confirmedAvatarAnalysis || !selectedFormat) {
      setError("ข้อมูลไม่ครบสำหรับการสร้างเนื้อหา");
      return;
    }

    setLoadingContent(true);
    setError("");
    setLoadingStep(0);
    setLoadingMessage("");

    const timers = runContentLoadingSequence();

    try {
      const res = await fetch("/api/lead-magnet-content/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadMagnetDraft,
          avatarAnalysis: confirmedAvatarAnalysis,
          structuredAvatar: confirmedStructuredAvatar,
          currentProblem,
          selectedFormat,
          settings,
          section5,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "สร้างเนื้อหาไม่สำเร็จ");
      }

      const content = data.content || "";
      setGeneratedContent(content);
      localStorage.setItem("generatedLeadMagnetContent", content);

      setRewrittenContent("");
      localStorage.removeItem("rewrittenLeadMagnetContent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      timers.forEach(clearTimeout);
      setLoadingContent(false);
      setLoadingStep(0);
      setLoadingMessage("");
    }
  };

  const rewriteContent = async () => {
    if (!generatedContent || !selectedFormat || !rewriteStyle) {
      setError("กรุณาสร้างเนื้อหาหลักและเลือกสไตล์ Rewrite ก่อน");
      return;
    }

    setLoadingRewrite(true);
    setError("");
    setRewriteLoadingStep(0);
    setRewriteLoadingMessage("");

    const timers = runRewriteLoadingSequence();

    try {
      const res = await fetch("/api/lead-magnet-content/rewrite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalContent: generatedContent,
          selectedFormat,
          rewriteStyle,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Rewrite ไม่สำเร็จ");
      }

      const rewritten = data.rewrittenContent || "";
      setRewrittenContent(rewritten);
      localStorage.setItem("rewrittenLeadMagnetContent", rewritten);
      localStorage.setItem("leadMagnetRewriteStyle", rewriteStyle);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      timers.forEach(clearTimeout);
      setLoadingRewrite(false);
      setRewriteLoadingStep(0);
      setRewriteLoadingMessage("");
    }
  };

  const clearGeneratedContent = () => {
    setGeneratedContent("");
    setRewrittenContent("");
    localStorage.removeItem("generatedLeadMagnetContent");
    localStorage.removeItem("rewrittenLeadMagnetContent");
  };

  const clearRewrittenContent = () => {
    setRewrittenContent("");
    localStorage.removeItem("rewrittenLeadMagnetContent");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("คัดลอกเรียบร้อยแล้ว");
    } catch {
      setCopyMessage("ไม่สามารถคัดลอกได้");
    }
  };

  const hasRequiredData =
    !!leadMagnetDraft.trim() &&
    !!confirmedAvatarAnalysis.trim() &&
    !!currentProblem.trim() &&
    !!confirmedStructuredAvatar;

  if (!hasCheckedStorage) {
    return (
      <main className="min-h-screen bg-white text-black px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Lead Magnet Content Tool</h1>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Lead Magnet Content Tool</h1>
          <p className="text-gray-600 mt-2">
            เปลี่ยน Lead Magnet Strategy ของคุณให้กลายเป็นเนื้อหาจริง
          </p>
        </div>

        {error && (
          <div className="border border-red-300 bg-red-50 text-red-700 rounded-xl p-4">
            {error}
          </div>
        )}

        {!hasRequiredData && (
          <div className="border border-red-200 bg-red-50 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-red-700 mb-2">
              ข้อมูลยังไม่ครบ
            </h2>
            <p className="text-sm text-red-700">
              กรุณากลับไปสร้าง Avatar และ Lead Magnet Draft ให้ครบก่อน
            </p>
          </div>
        )}

        <section className="border rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">เลือกรูปแบบ Lead Magnet</h2>
            <p className="text-sm text-gray-600 mt-1">
              เลือกรูปแบบที่ต้องการให้ AI สร้างเนื้อหาให้
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FORMAT_OPTIONS.map((option) => {
              const isSelected = selectedFormat === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectFormat(option.id)}
                  disabled={!hasRequiredData}
                  className={`text-left border rounded-xl p-4 transition ${
                    isSelected
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-black"
                  }`}
                >
                  <h3 className="text-lg font-semibold">{option.title}</h3>

                  <p
                    className={`text-sm mt-2 ${
                      isSelected ? "text-gray-200" : "text-gray-600"
                    }`}
                  >
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          {selectedFormat && (
            <div className="rounded-lg border bg-gray-50 p-4 text-sm">
              <strong>รูปแบบที่เลือก:</strong> {formatLabel(selectedFormat)}
            </div>
          )}
        </section>

        {selectedFormat && (
          <section className="border rounded-xl p-5 space-y-5">
            <div>
              <h2 className="text-xl font-semibold">ตั้งค่าการสร้างเนื้อหา</h2>
              <p className="text-sm text-gray-600 mt-1">
                เลือกค่าที่ต้องการก่อนสร้างเนื้อหาจริง
              </p>
            </div>

            {(selectedFormat === "article" ||
              selectedFormat === "pdf-guide") && (
              <div className="space-y-5">
                <SelectField
                  label="ความยาว"
                  value={settings.length || ""}
                  onChange={(value) =>
                    updateSettings({
                      length: value as "short" | "medium" | "long",
                    })
                  }
                  options={[
                    { value: "short", label: "สั้น" },
                    { value: "medium", label: "กลาง" },
                    { value: "long", label: "ยาว" },
                  ]}
                />

                <SelectField
                  label="โทน"
                  value={settings.tone || ""}
                  onChange={(value) =>
                    updateSettings({
                      tone: value as
                        | "practical"
                        | "friendly"
                        | "expert"
                        | "premium",
                    })
                  }
                  options={[
                    { value: "practical", label: "ใช้งานได้จริง" },
                    { value: "friendly", label: "เป็นกันเอง" },
                    { value: "expert", label: "ผู้เชี่ยวชาญ" },
                    { value: "premium", label: "พรีเมียม" },
                  ]}
                />
              </div>
            )}

            {selectedFormat === "checklist" && (
              <div className="space-y-5">
                <SelectField
                  label="สไตล์ Checklist"
                  value={settings.checklistStyle || ""}
                  onChange={(value) =>
                    updateSettings({
                      checklistStyle: value as "concise" | "detailed",
                    })
                  }
                  options={[
                    { value: "concise", label: "กระชับ" },
                    { value: "detailed", label: "ละเอียด" },
                  ]}
                />

                <SelectField
                  label="เพิ่มคำอธิบายสั้น ๆ"
                  value={settings.includeExplanations || ""}
                  onChange={(value) =>
                    updateSettings({
                      includeExplanations: value as "yes" | "no",
                    })
                  }
                  options={[
                    { value: "yes", label: "ใช่" },
                    { value: "no", label: "ไม่" },
                  ]}
                />
              </div>
            )}

            {selectedFormat === "workbook" && (
              <div className="space-y-5">
                <SelectField
                  label="จำนวนแบบฝึกหัด"
                  value={settings.numberOfExercises || ""}
                  onChange={(value) =>
                    updateSettings({
                      numberOfExercises: value as "3" | "5" | "7",
                    })
                  }
                  options={[
                    { value: "3", label: "3 ข้อ" },
                    { value: "5", label: "5 ข้อ" },
                    { value: "7", label: "7 ข้อ" },
                  ]}
                />

                <SelectField
                  label="สไตล์ Workbook"
                  value={settings.workbookStyle || ""}
                  onChange={(value) =>
                    updateSettings({
                      workbookStyle: value as
                        | "reflective"
                        | "action-driven",
                    })
                  }
                  options={[
                    { value: "reflective", label: "ชวนคิด" },
                    { value: "action-driven", label: "เน้นลงมือทำ" },
                  ]}
                />
              </div>
            )}

            {selectedFormat === "email-course" && (
              <div className="space-y-5">
                <SelectField
                  label="จำนวนอีเมล"
                  value={settings.numberOfEmails || ""}
                  onChange={(value) =>
                    updateSettings({
                      numberOfEmails: value as "3" | "5" | "7",
                    })
                  }
                  options={[
                    { value: "3", label: "3 อีเมล" },
                    { value: "5", label: "5 อีเมล" },
                    { value: "7", label: "7 อีเมล" },
                  ]}
                />

                <SelectField
                  label="สไตล์อีเมล"
                  value={settings.emailStyle || ""}
                  onChange={(value) =>
                    updateSettings({
                      emailStyle: value as
                        | "educational"
                        | "relationship-building"
                        | "action-focused",
                    })
                  }
                  options={[
                    { value: "educational", label: "ให้ความรู้" },
                    {
                      value: "relationship-building",
                      label: "สร้างความสัมพันธ์",
                    },
                    { value: "action-focused", label: "เน้นให้ลงมือทำ" },
                  ]}
                />
              </div>
            )}

            {selectedFormat === "video-script" && (
              <div className="space-y-5">
                <SelectField
                  label="ความยาววิดีโอ"
                  value={settings.videoLength || ""}
                  onChange={(value) =>
                    updateSettings({
                      videoLength: value as "short" | "long",
                    })
                  }
                  options={[
                    { value: "short", label: "สั้น" },
                    { value: "long", label: "ยาว" },
                  ]}
                />

                <SelectField
                  label="โทน"
                  value={settings.tone || ""}
                  onChange={(value) =>
                    updateSettings({
                      tone: value as
                        | "practical"
                        | "friendly"
                        | "expert"
                        | "premium",
                    })
                  }
                  options={[
                    { value: "practical", label: "ใช้งานได้จริง" },
                    { value: "friendly", label: "เป็นกันเอง" },
                    { value: "expert", label: "ผู้เชี่ยวชาญ" },
                    { value: "premium", label: "พรีเมียม" },
                  ]}
                />
              </div>
            )}
          </section>
        )}

        <section className="border rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">สร้างเนื้อหา Lead Magnet</h2>
              <p className="text-sm text-gray-600 mt-1">
                เมื่อเลือก Format และตั้งค่าแล้ว กดปุ่มนี้เพื่อให้ AI เขียนเนื้อหาจริง
              </p>
            </div>

            <button
              type="button"
              onClick={generateContent}
              disabled={!selectedFormat || loadingContent}
              className="border px-5 py-3 rounded-lg disabled:opacity-60"
            >
              {loadingContent ? "กำลังสร้าง..." : "สร้างเนื้อหา"}
            </button>
          </div>
        </section>

        {loadingContent && (
          <section className="border rounded-xl p-5 bg-gray-50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-black animate-pulse" />
              <h2 className="text-xl font-semibold flex items-center gap-2">
                กำลังสร้างเนื้อหา
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
              </h2>
            </div>

            <p className="text-sm text-gray-700">{loadingMessage}</p>

            <div className="space-y-2 text-sm">
              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 1 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 1 ? "✓" : "○"} วิเคราะห์ Draft
              </div>

              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 2 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 2 ? "✓" : "○"} จัดโครงสร้างเนื้อหา
              </div>

              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 3 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 3 ? "✓" : "○"} เขียนเนื้อหาหลัก
              </div>

              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 4 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 4 ? "✓" : "○"} เรียบเรียงให้อ่านลื่น
              </div>
            </div>

            <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
              <div
                className="h-full rounded bg-black transition-all duration-700"
                style={{
                  width:
                    loadingStep === 0
                      ? "10%"
                      : loadingStep === 1
                      ? "25%"
                      : loadingStep === 2
                      ? "50%"
                      : loadingStep === 3
                      ? "75%"
                      : "92%",
                }}
              />
            </div>
          </section>
        )}

        {generatedContent && (
          <section className="border rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">ผลลัพธ์เนื้อหา</h2>
                <p className="text-sm text-gray-600 mt-1">
                  เนื้อหา Lead Magnet ที่ AI สร้างจาก Strategy Draft ของคุณ
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedContent)}
                  className="border px-4 py-2 rounded-lg"
                >
                  คัดลอก
                </button>

                <button
                  type="button"
                  onClick={generateContent}
                  disabled={loadingContent}
                  className="border px-4 py-2 rounded-lg disabled:opacity-60"
                >
                  {loadingContent ? "กำลังสร้าง..." : "สร้างใหม่"}
                </button>

                <button
                  type="button"
                  onClick={clearGeneratedContent}
                  className="border px-4 py-2 rounded-lg"
                >
                  ล้างผลลัพธ์
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 border p-4 text-sm whitespace-pre-wrap max-h-[600px] overflow-y-auto">
              {generatedContent}
            </div>
          </section>
        )}

        {generatedContent && (
          <section className="border rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Rewrite Content</h2>
              <p className="text-sm text-gray-600 mt-1">
                สร้างอีกเวอร์ชันของเนื้อหาเดิม โดยไม่ต้องสร้างใหม่ทั้งหมด
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                เลือกสไตล์ Rewrite
              </label>
              <select
                value={rewriteStyle}
                onChange={(e) => {
                  const value = e.target.value;
                  setRewriteStyle(value as RewriteStyle | "");
                  if (value) {
                    localStorage.setItem("leadMagnetRewriteStyle", value);
                  } else {
                    localStorage.removeItem("leadMagnetRewriteStyle");
                  }
                }}
                className="w-full border rounded-lg px-4 py-3 bg-white"
              >
                <option value="">เลือก</option>
                <option value="shorter">สั้นลง</option>
                <option value="longer">ยาวขึ้น</option>
                <option value="more-practical">ใช้งานได้จริงขึ้น</option>
                <option value="beginner-friendly">
                  เหมาะกับมือใหม่มากขึ้น
                </option>
                <option value="more-premium">พรีเมียมขึ้น</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={rewriteContent}
                disabled={!rewriteStyle || loadingRewrite}
                className="border px-5 py-3 rounded-lg disabled:opacity-60"
              >
                {loadingRewrite ? "กำลัง Rewrite..." : "Rewrite เนื้อหา"}
              </button>

              {rewrittenContent && (
                <>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(rewrittenContent)}
                    className="border px-4 py-2 rounded-lg"
                  >
                    คัดลอก Rewrite
                  </button>

                  <button
                    type="button"
                    onClick={clearRewrittenContent}
                    className="border px-4 py-2 rounded-lg"
                  >
                    ล้าง Rewrite
                  </button>
                </>
              )}
            </div>

            {loadingRewrite && (
              <div className="border rounded-xl p-5 bg-gray-50 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-black animate-pulse" />
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    กำลัง Rewrite เนื้อหา
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </span>
                  </h3>
                </div>

                <p className="text-sm text-gray-700">{rewriteLoadingMessage}</p>

                <div className="space-y-2 text-sm">
                  <div
                    className={`flex items-center gap-2 ${
                      rewriteLoadingStep >= 1
                        ? "text-black font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {rewriteLoadingStep >= 1 ? "✓" : "○"} วิเคราะห์เนื้อหาเดิม
                  </div>

                  <div
                    className={`flex items-center gap-2 ${
                      rewriteLoadingStep >= 2
                        ? "text-black font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {rewriteLoadingStep >= 2 ? "✓" : "○"} สกัดโครงสร้างสำคัญ
                  </div>

                  <div
                    className={`flex items-center gap-2 ${
                      rewriteLoadingStep >= 3
                        ? "text-black font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {rewriteLoadingStep >= 3 ? "✓" : "○"} สร้างเวอร์ชันใหม่
                  </div>
                </div>

                <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
                  <div
                    className="h-full rounded bg-black transition-all duration-700"
                    style={{
                      width:
                        rewriteLoadingStep === 0
                          ? "15%"
                          : rewriteLoadingStep === 1
                          ? "40%"
                          : rewriteLoadingStep === 2
                          ? "70%"
                          : "92%",
                    }}
                  />
                </div>
              </div>
            )}

            {rewrittenContent ? (
              <div className="rounded-lg bg-gray-50 border p-4 text-sm whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                {rewrittenContent}
              </div>
            ) : (
              !loadingRewrite && (
                <p className="text-sm text-gray-500">ยังไม่มี Rewrite Version</p>
              )
            )}
          </section>
        )}

        {copyMessage && (
          <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-gray-200 bg-white text-black px-4 py-3 shadow-lg text-sm">
            {copyMessage}
          </div>
        )}
      </div>
    </main>
  );
}

function isValidFormat(value: string): value is LeadMagnetFormat {
  return [
    "article",
    "pdf-guide",
    "checklist",
    "workbook",
    "email-course",
    "video-script",
  ].includes(value);
}

function isValidRewriteStyle(value: string): value is RewriteStyle {
  return [
    "shorter",
    "longer",
    "more-practical",
    "beginner-friendly",
    "more-premium",
  ].includes(value);
}

function formatLabel(format: LeadMagnetFormat) {
  switch (format) {
    case "article":
      return "บทความ";
    case "pdf-guide":
      return "PDF Guide";
    case "checklist":
      return "Checklist";
    case "workbook":
      return "Workbook";
    case "email-course":
      return "คอร์สผ่านอีเมล";
    case "video-script":
      return "สคริปต์วิดีโอ";
  }
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-4 py-3 bg-white"
      >
        <option value="">เลือก</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}