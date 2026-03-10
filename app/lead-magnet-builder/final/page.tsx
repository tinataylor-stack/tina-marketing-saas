"use client";

import { useEffect, useRef, useState } from "react";

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

type SuggestedFormat = {
  format: string;
  reason: string;
};

type CtaCopy = {
  socialPost: string;
  lineWelcome: string;
  landingHero: string;
};

export default function LeadMagnetFinalPage() {
  const [hasAccess, setHasAccess] = useState(false);

  const [structuredAvatar, setStructuredAvatar] = useState<any>(null);
  const [currentProblem, setCurrentProblem] = useState("");
  const [selectedBigProblem, setSelectedBigProblem] =
    useState<BigProblemOption | null>(null);
  const [section2, setSection2] = useState<Section2 | null>(null);
  const [section3, setSection3] = useState<Section3 | null>(null);
  const [section4, setSection4] = useState<Section4 | null>(null);
  const [section5, setSection5] = useState<Section5 | null>(null);

  const [leadMagnetDraft, setLeadMagnetDraft] = useState("");
  const [titleOptions, setTitleOptions] = useState<string[]>([]);
  const [suggestedFormat, setSuggestedFormat] = useState<SuggestedFormat | null>(
    null
  );
  const [ctaCopy, setCtaCopy] = useState<CtaCopy | null>(null);

  const [loadingDraft, setLoadingDraft] = useState(false);
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [loadingFormat, setLoadingFormat] = useState(false);
  const [loadingCta, setLoadingCta] = useState(false);

  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);

  const [error, setError] = useState("");
  const [hasAttemptedDraft, setHasAttemptedDraft] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  const loadingRef = useRef<HTMLDivElement | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showCopyMessage = (message: string) => {
    setCopyMessage(message);

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    copyTimeoutRef.current = setTimeout(() => {
      setCopyMessage("");
    }, 1800);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showCopyMessage("คัดลอกเรียบร้อยแล้ว");
    } catch {
      showCopyMessage("ไม่สามารถคัดลอกได้");
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const savedAccess = localStorage.getItem("appAccessGranted");

    if (savedAccess !== "yes") {
      window.location.href = "/";
      return;
    }

    setHasAccess(true);

    const savedStructured = localStorage.getItem("confirmedStructuredAvatar");
    const savedProblem = localStorage.getItem("leadMagnetCurrentProblem");
    const savedSelectedProblem = localStorage.getItem("selectedBigProblem");
    const savedSection2 = localStorage.getItem("leadMagnetSection2");
    const savedSection3 = localStorage.getItem("leadMagnetSection3");
    const savedSection4 = localStorage.getItem("leadMagnetSection4");
    const savedSection5 = localStorage.getItem("leadMagnetSection5");

    if (
      !savedStructured ||
      !savedProblem ||
      !savedSelectedProblem ||
      !savedSection2 ||
      !savedSection3 ||
      !savedSection4 ||
      !savedSection5
    ) {
      setError("ข้อมูลไม่ครบ กรุณากลับไป Step ก่อนหน้า");
      return;
    }

    setCurrentProblem(savedProblem);

    try {
      setStructuredAvatar(JSON.parse(savedStructured));
      setSelectedBigProblem(JSON.parse(savedSelectedProblem));
      setSection2(JSON.parse(savedSection2));
      setSection3(JSON.parse(savedSection3));
      setSection4(JSON.parse(savedSection4));
      setSection5(JSON.parse(savedSection5));
    } catch {
      setError("อ่านข้อมูลไม่สำเร็จ กรุณากลับไปเริ่มใหม่");
    }
  }, []);

  useEffect(() => {
    if (loadingDraft && loadingRef.current) {
      loadingRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [loadingDraft]);

  const runDraftLoadingSequence = () => {
    const timers = [
      setTimeout(() => {
        setLoadingStep(1);
        setLoadingMessage("กำลังรวมข้อมูลจากทุก Step...");
      }, 0),
      setTimeout(() => {
        setLoadingStep(2);
        setLoadingMessage("กำลังเขียน Lead Magnet Draft...");
      }, 1200),
      setTimeout(() => {
        setLoadingStep(3);
        setLoadingMessage("กำลังเรียบเรียง Draft ให้อ่านลื่นและนำไปใช้ต่อได้...");
      }, 2800),
    ];

    return timers;
  };

  const generateDraft = async (regenerate = false) => {
    if (
      !structuredAvatar ||
      !currentProblem ||
      !selectedBigProblem ||
      !section2 ||
      !section3 ||
      !section4 ||
      !section5
    ) {
      setError("ข้อมูลไม่ครบ กรุณากลับไป Step ก่อนหน้า");
      return;
    }

    setLoadingDraft(true);
    setError("");
    setLoadingMessage("");
    setLoadingStep(0);
    setHasAttemptedDraft(true);

    const timers = runDraftLoadingSequence();

    try {
      const res = await fetch("/api/lead-magnet/final-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          structuredAvatar,
          currentProblem,
          selectedBigProblem,
          section2,
          section3,
          section4,
          section5,
          regenerate,
          previousLeadMagnetDraft: leadMagnetDraft,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการสร้าง Final Draft");
      }

      setLeadMagnetDraft(data.leadMagnetDraft || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      timers.forEach(clearTimeout);
      setLoadingDraft(false);
      setLoadingMessage("");
      setLoadingStep(0);
    }
  };

  const generateTitles = async () => {
    if (!leadMagnetDraft) {
      setError("ยังไม่มี Draft สำหรับสร้าง Title Options");
      return;
    }

    setLoadingTitles(true);
    setError("");

    try {
      const res = await fetch("/api/lead-magnet/title-options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadMagnetDraft,
          currentProblem,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "สร้าง Title Options ไม่สำเร็จ");
      }

      setTitleOptions(Array.isArray(data.titleOptions) ? data.titleOptions : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoadingTitles(false);
    }
  };

  const generateFormat = async () => {
    if (!leadMagnetDraft) {
      setError("ยังไม่มี Draft สำหรับสร้าง Suggested Format");
      return;
    }

    setLoadingFormat(true);
    setError("");

    try {
      const res = await fetch("/api/lead-magnet/suggested-format", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadMagnetDraft,
          currentProblem,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "สร้าง Suggested Format ไม่สำเร็จ");
      }

      setSuggestedFormat(data.suggestedFormat || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoadingFormat(false);
    }
  };

  const generateCta = async () => {
    if (!leadMagnetDraft) {
      setError("ยังไม่มี Draft สำหรับสร้าง CTA");
      return;
    }

    setLoadingCta(true);
    setError("");

    try {
      const res = await fetch("/api/lead-magnet/cta-copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadMagnetDraft,
          currentProblem,
          section5,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "สร้าง CTA ไม่สำเร็จ");
      }

      setCtaCopy(data.ctaCopy || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoadingCta(false);
    }
  };

  useEffect(() => {
    if (
      hasAccess &&
      structuredAvatar &&
      currentProblem &&
      selectedBigProblem &&
      section2 &&
      section3 &&
      section4 &&
      section5 &&
      !leadMagnetDraft &&
      !hasAttemptedDraft
    ) {
      void generateDraft(false);
    }
  }, [
    hasAccess,
    structuredAvatar,
    currentProblem,
    selectedBigProblem,
    section2,
    section3,
    section4,
    section5,
    leadMagnetDraft,
    hasAttemptedDraft,
  ]);

  if (!hasAccess) return null;

  return (
    <main className="min-h-screen bg-white text-black p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Lead Magnet Builder - Final</h1>
        <p className="text-lg mb-8">
          สรุปผลลัพธ์สุดท้าย และสร้าง Draft หลักก่อน จากนั้นค่อยสร้างส่วนเสริมเพิ่มเติมตามต้องการ
        </p>

        {error && (
          <div className="mb-6 border border-red-300 bg-red-50 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {selectedBigProblem &&
          section2 &&
          section3 &&
          section4 &&
          section5 && (
            <div className="border rounded-xl p-6 bg-gray-50 space-y-3 text-sm leading-7 mb-8">
              <h2 className="text-2xl font-semibold mb-2">ข้อมูลที่ใช้สร้าง Final</h2>

              <div>
                <strong>ปัญหาที่กำลังพยายามแก้:</strong> {currentProblem}
              </div>
              <div>
                <strong>Section 1:</strong> {selectedBigProblem.title}
              </div>
              <div>
                <strong>Section 2:</strong> {section2.newBelief}
              </div>
              <div>
                <strong>Section 3:</strong> {section3.format}
              </div>
              <div>
                <strong>Section 4:</strong> {section4.gapSummary}
              </div>
              <div>
                <strong>Section 5:</strong> {section5.title}
              </div>
            </div>
          )}

        {loadingDraft && (
          <div
            ref={loadingRef}
            className="mt-8 border rounded-xl p-6 bg-gray-50 mb-8"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-3 w-3 rounded-full bg-black animate-pulse" />
              <h2 className="text-xl font-semibold flex items-center gap-2">
                กำลังสร้าง Draft
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
              </h2>
            </div>

            <p className="text-sm text-gray-700 mb-4">{loadingMessage}</p>

            <div className="space-y-3 text-sm mt-4">
              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 1 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 1 ? "✓" : "○"} รวมข้อมูลจากทุก Step
              </div>

              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 2 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 2 ? "✓" : "○"} เขียน Lead Magnet Draft
              </div>

              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 3 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 3 ? "✓" : "○"} เรียบเรียง Draft ให้พร้อมนำไปใช้ต่อ
              </div>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded bg-gray-200">
              <div
                className="h-full rounded bg-black transition-all duration-700"
                style={{
                  width:
                    loadingStep === 0
                      ? "10%"
                      : loadingStep === 1
                      ? "30%"
                      : loadingStep === 2
                      ? "55%"
                      : "90%",
                }}
              />
            </div>
          </div>
        )}

        <div className={loadingDraft ? "opacity-60 pointer-events-none" : ""}>
          <div className="space-y-8">
            <div className="border rounded-xl p-6 bg-gray-50">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">Lead Magnet Draft</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    ร่างหลักที่รวมทุกส่วนของ Lead Magnet เข้าด้วยกัน
                  </p>
                </div>

                <div className="flex gap-2">
                  {leadMagnetDraft && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(leadMagnetDraft)}
                      className="border px-4 py-2 rounded-lg"
                    >
                      Copy
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => generateDraft(true)}
                    disabled={loadingDraft}
                    className="border px-4 py-2 rounded-lg disabled:opacity-60"
                  >
                    {loadingDraft ? "กำลังสร้าง..." : "สร้าง Draft ใหม่"}
                  </button>
                </div>
              </div>

              {leadMagnetDraft ? (
                <div className="whitespace-pre-wrap text-sm leading-7">
                  {leadMagnetDraft}
                </div>
              ) : (
                <div className="text-sm text-gray-500">ยังไม่มี Draft</div>
              )}
            </div>

            <div className="border rounded-xl p-6 bg-gray-50">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">Title Options</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    ตัวเลือกชื่อสำหรับใช้ตั้งชื่อ Lead Magnet
                  </p>
                </div>

                <div className="flex gap-2">
                  {titleOptions.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          titleOptions
                            .map((title, index) => `${index + 1}. ${title}`)
                            .join("\n")
                        )
                      }
                      className="border px-4 py-2 rounded-lg"
                    >
                      Copy
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={generateTitles}
                    disabled={loadingTitles || !leadMagnetDraft}
                    className="border px-4 py-2 rounded-lg disabled:opacity-60"
                  >
                    {loadingTitles ? "กำลังสร้าง..." : "สร้าง Title Options"}
                  </button>
                </div>
              </div>

              {titleOptions.length > 0 ? (
                <ol className="list-decimal pl-6 text-sm leading-7">
                  {titleOptions.map((title, index) => (
                    <li key={index}>{title}</li>
                  ))}
                </ol>
              ) : (
                <div className="text-sm text-gray-500">
                  ยังไม่ได้สร้าง Title Options
                </div>
              )}
            </div>

            <div className="border rounded-xl p-6 bg-gray-50">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">Suggested Format</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    รูปแบบที่เหมาะกับ Lead Magnet ชิ้นนี้
                  </p>
                </div>

                <div className="flex gap-2">
                  {suggestedFormat && (
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `Format: ${suggestedFormat.format}\n\nReason: ${suggestedFormat.reason}`
                        )
                      }
                      className="border px-4 py-2 rounded-lg"
                    >
                      Copy
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={generateFormat}
                    disabled={loadingFormat || !leadMagnetDraft}
                    className="border px-4 py-2 rounded-lg disabled:opacity-60"
                  >
                    {loadingFormat ? "กำลังสร้าง..." : "สร้าง Suggested Format"}
                  </button>
                </div>
              </div>

              {suggestedFormat ? (
                <div className="space-y-3 text-sm leading-7">
                  <div>
                    <strong>Format:</strong> {suggestedFormat.format}
                  </div>
                  <div>
                    <strong>Reason:</strong> {suggestedFormat.reason}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  ยังไม่ได้สร้าง Suggested Format
                </div>
              )}
            </div>

            <div className="border rounded-xl p-6 bg-gray-50">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">CTA</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    ข้อความตัวอย่างสำหรับใช้โปรโมท Lead Magnet
                  </p>
                </div>

                <div className="flex gap-2">
                  {ctaCopy && (
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `SOCIAL POST:\n${ctaCopy.socialPost}\n\nLINE WELCOME:\n${ctaCopy.lineWelcome}\n\nLANDING HERO:\n${ctaCopy.landingHero}`
                        )
                      }
                      className="border px-4 py-2 rounded-lg"
                    >
                      Copy
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={generateCta}
                    disabled={loadingCta || !leadMagnetDraft}
                    className="border px-4 py-2 rounded-lg disabled:opacity-60"
                  >
                    {loadingCta ? "กำลังสร้าง..." : "สร้าง CTA"}
                  </button>
                </div>
              </div>

              {ctaCopy ? (
                <div className="space-y-4 text-sm leading-7">
                  <div>
                    <strong>Social Post:</strong>
                    <div className="whitespace-pre-wrap">{ctaCopy.socialPost}</div>
                  </div>

                  <div>
                    <strong>LINE Welcome:</strong>
                    <div className="whitespace-pre-wrap">{ctaCopy.lineWelcome}</div>
                  </div>

                  <div>
                    <strong>Landing Page Hero:</strong>
                    <div className="whitespace-pre-wrap">{ctaCopy.landingHero}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  ยังไม่ได้สร้าง CTA
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  (window.location.href = "/lead-magnet-builder/step-4")
                }
                className="border px-6 py-3 rounded-lg"
              >
                กลับไป Step 4
              </button>
            </div>
          </div>
        </div>

        {copyMessage && (
          <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-gray-200 bg-white text-black px-4 py-3 shadow-lg text-sm">
            {copyMessage}
          </div>
        )}
      </div>
    </main>
  );
}