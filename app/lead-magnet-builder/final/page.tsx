"use client";

import { useEffect, useState } from "react";

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

type FinalResult = {
  leadMagnetDraft: string;
  titleOptions: string[];
  suggestedFormat: {
    format: string;
    reason: string;
  };
  ctaCopy: {
    socialPost: string;
    lineWelcome: string;
    landingHero: string;
  };
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

  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);

  const [error, setError] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

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

  const runLoadingSequence = () => {
    const timers = [
      setTimeout(() => {
        setLoadingStep(1);
        setLoadingMessage("กำลังรวมข้อมูลจากทุก Step...");
      }, 0),
      setTimeout(() => {
        setLoadingStep(2);
        setLoadingMessage("กำลังเขียน Lead Magnet Draft และคิดชื่อที่เหมาะ...");
      }, 1200),
      setTimeout(() => {
        setLoadingStep(3);
        setLoadingMessage("กำลังสร้าง CTA และเรียบเรียงหน้าสรุปให้นำไปใช้ได้...");
      }, 2800),
    ];

    return timers;
  };

  const generateFinal = async (regenerate = false) => {
    setLoading(true);
    setError("");
    setLoadingMessage("");
    setLoadingStep(0);

    const timers = runLoadingSequence();

    try {
      const res = await fetch("/api/lead-magnet/final", {
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
          previousFinalResult: finalResult,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการสร้างหน้าสรุป");
      }

      setFinalResult(data);
      setHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      timers.forEach(clearTimeout);
      setLoading(false);
      setLoadingMessage("");
      setLoadingStep(0);
    }
  };

  if (!hasAccess) return null;

  return (
    <main className="min-h-screen bg-white text-black p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Lead Magnet Builder - Final</h1>
        <p className="text-lg mb-8">
          รวมทุกส่วนให้เป็น Lead Magnet Draft พร้อมชื่อและ CTA
        </p>

        {error && (
          <div className="mb-6 border border-red-300 bg-red-50 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        <div className={loading ? "opacity-60 pointer-events-none" : ""}>
          {!hasGenerated &&
            selectedBigProblem &&
            section2 &&
            section3 &&
            section4 &&
            section5 && (
              <div className="space-y-6">
                <div className="border rounded-xl p-6 bg-gray-50 space-y-3 text-sm leading-7">
                  <h2 className="text-2xl font-semibold mb-2">
                    ข้อมูลที่ใช้สร้างหน้าสรุป
                  </h2>

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

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      (window.location.href = "/lead-magnet-builder/step-4")
                    }
                    className="border px-6 py-3 rounded-lg"
                  >
                    กลับไป Step 4
                  </button>

                  <button
                    type="button"
                    onClick={() => generateFinal(false)}
                    disabled={loading}
                    className="bg-black text-white px-6 py-3 rounded-lg disabled:opacity-60"
                  >
                    {loading ? "กำลังสร้างหน้าสรุป..." : "สร้างหน้าสรุป"}
                  </button>
                </div>
              </div>
            )}

          {hasGenerated && finalResult && (
            <div className="space-y-8">
              <div className="border rounded-xl p-6 bg-gray-50">
                <h2 className="text-2xl font-semibold mb-4">Lead Magnet Draft</h2>
                <div className="whitespace-pre-wrap text-sm leading-7">
                  {finalResult.leadMagnetDraft}
                </div>
              </div>

              <div className="border rounded-xl p-6 bg-gray-50">
                <h2 className="text-2xl font-semibold mb-4">Title Options</h2>
                <ol className="list-decimal pl-6 text-sm leading-7">
                  {finalResult.titleOptions.map((title, index) => (
                    <li key={index}>{title}</li>
                  ))}
                </ol>
              </div>

              <div className="border rounded-xl p-6 bg-gray-50">
                <h2 className="text-2xl font-semibold mb-4">Suggested Format</h2>
                <div className="space-y-3 text-sm leading-7">
                  <div>
                    <strong>Format:</strong> {finalResult.suggestedFormat.format}
                  </div>
                  <div>
                    <strong>Reason:</strong> {finalResult.suggestedFormat.reason}
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-6 bg-gray-50">
                <h2 className="text-2xl font-semibold mb-4">CTA Copy</h2>
                <div className="space-y-4 text-sm leading-7">
                  <div>
                    <strong>Social Post:</strong>
                    <div className="whitespace-pre-wrap">
                      {finalResult.ctaCopy.socialPost}
                    </div>
                  </div>

                  <div>
                    <strong>LINE Welcome:</strong>
                    <div className="whitespace-pre-wrap">
                      {finalResult.ctaCopy.lineWelcome}
                    </div>
                  </div>

                  <div>
                    <strong>Landing Page Hero:</strong>
                    <div className="whitespace-pre-wrap">
                      {finalResult.ctaCopy.landingHero}
                    </div>
                  </div>
                </div>
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

                <button
                  type="button"
                  onClick={() => generateFinal(true)}
                  disabled={loading}
                  className="border px-6 py-3 rounded-lg disabled:opacity-60"
                >
                  {loading ? "กำลังสร้างใหม่..." : "สร้างหน้าสรุปใหม่"}
                </button>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="mt-8 border rounded-xl p-6 bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-3 w-3 rounded-full bg-black animate-pulse" />
              <h2 className="text-xl font-semibold flex items-center gap-2">
                กำลังประมวลผล
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
                {loadingStep >= 2 ? "✓" : "○"} เขียน Draft และคิด Title Options
              </div>

              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 3 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 3 ? "✓" : "○"} สร้าง CTA และเรียบเรียงผลลัพธ์ให้พร้อมใช้
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
                      ? "33%"
                      : loadingStep === 2
                      ? "66%"
                      : "90%",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}