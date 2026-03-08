"use client";

import { useEffect, useState } from "react";

type BigProblemOption = {
  title: string;
  symptoms: string;
  rootCause: string;
  costOfInaction: string;
  leadMagnetType: string;
};

export default function LeadMagnetStep1Page() {
  const [hasAccess, setHasAccess] = useState(false);

  const [avatarAnalysis, setAvatarAnalysis] = useState("");
  const [structuredAvatar, setStructuredAvatar] = useState<any>(null);
  const [currentProblem, setCurrentProblem] = useState("");

  const [avatarSummary, setAvatarSummary] = useState("");
  const [bigProblemOptions, setBigProblemOptions] = useState<BigProblemOption[]>(
    []
  );
  const [selectedProblemIndex, setSelectedProblemIndex] = useState<number | null>(
    null
  );

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

    const savedAnalysis = localStorage.getItem("confirmedAvatarAnalysis");
    const savedStructured = localStorage.getItem("confirmedStructuredAvatar");
    const savedProblem = localStorage.getItem("leadMagnetCurrentProblem");

    if (!savedAnalysis || !savedStructured || !savedProblem) {
      setError("ข้อมูลไม่ครบ กรุณากลับไปกรอกข้อมูลก่อน");
      return;
    }

    setAvatarAnalysis(savedAnalysis);
    setCurrentProblem(savedProblem);

    try {
      setStructuredAvatar(JSON.parse(savedStructured));
    } catch {
      setError("อ่านข้อมูล Avatar ไม่สำเร็จ กรุณากลับไปเริ่มใหม่");
    }
  }, []);

  const runLoadingSequence = () => {
    const timers = [
      setTimeout(() => {
        setLoadingStep(1);
        setLoadingMessage("กำลังอ่านข้อมูล Avatar และปัญหาที่คุณระบุ...");
      }, 0),
      setTimeout(() => {
        setLoadingStep(2);
        setLoadingMessage("กำลังวิเคราะห์และหา Big Problem ที่เหมาะ...");
      }, 1200),
      setTimeout(() => {
        setLoadingStep(3);
        setLoadingMessage("กำลังจัดโครงตัวเลือกให้อ่านง่ายและพร้อมเลือก...");
      }, 2800),
    ];

    return timers;
  };

  const generateStep1 = async () => {
    setLoading(true);
    setError("");
    setSelectedProblemIndex(null);
    setLoadingMessage("");
    setLoadingStep(0);

    const timers = runLoadingSequence();

    try {
      const res = await fetch("/api/lead-magnet/from-avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarAnalysis,
          structuredAvatar,
          currentProblem,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการสร้าง Step 1");
      }

      if (
        !data.avatarSummary ||
        !Array.isArray(data.bigProblemOptions) ||
        data.bigProblemOptions.length === 0
      ) {
        throw new Error(
          "Step 1 API ไม่ได้ส่ง avatarSummary หรือ bigProblemOptions กลับมา"
        );
      }

      setAvatarSummary(data.avatarSummary);
      setBigProblemOptions(data.bigProblemOptions);
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

  const handleSelectProblem = (index: number) => {
    setSelectedProblemIndex(index);
    setError("");
  };

  const handleContinue = () => {
    if (selectedProblemIndex === null) {
      setError("กรุณาเลือก Big Problem ที่ต้องการใช้");
      return;
    }

    const selectedProblem = bigProblemOptions[selectedProblemIndex];
    localStorage.setItem("selectedBigProblem", JSON.stringify(selectedProblem));

    window.location.href = "/lead-magnet-builder/step-2";
  };

  if (!hasAccess) return null;

  return (
    <main className="min-h-screen bg-white text-black p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Lead Magnet Builder - Step 1</h1>
        <p className="text-lg mb-8">
          เลือก Big Problem ที่ต้องการใช้เป็นแกนของ Lead Magnet
        </p>

        {error && (
          <div className="mb-6 border border-red-300 bg-red-50 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        <div className={loading ? "opacity-60 pointer-events-none" : ""}>
          {!hasGenerated && structuredAvatar && (
            <div className="space-y-6 max-w-3xl">
              <div className="border rounded-xl p-6 bg-gray-50">
                <h2 className="text-2xl font-semibold mb-4">ข้อมูลที่ใช้สร้าง Step 1</h2>

                {structuredAvatar?.shortSummary && (
                  <p className="mb-3 text-sm leading-7">
                    <strong>Avatar:</strong> {structuredAvatar.shortSummary}
                  </p>
                )}

                <p className="mb-3 text-sm leading-7">
                  <strong>ปัญหาที่กำลังพยายามแก้:</strong> {currentProblem}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => (window.location.href = "/lead-magnet-builder")}
                  className="border px-6 py-3 rounded-lg"
                >
                  กลับไปแก้ข้อมูล
                </button>

                <button
                  type="button"
                  onClick={generateStep1}
                  disabled={loading}
                  className="bg-black text-white px-6 py-3 rounded-lg disabled:opacity-60"
                >
                  {loading ? "กำลังสร้าง Step 1..." : "สร้าง Step 1"}
                </button>
              </div>
            </div>
          )}

          {hasGenerated && (
            <div className="space-y-6">
              <div className="border rounded-xl p-6 bg-gray-50">
                <h2 className="text-2xl font-semibold mb-4">สรุป Avatar</h2>
                <div className="whitespace-pre-wrap text-sm leading-7">
                  {avatarSummary}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">กดเลือก Big Problem</h2>

                <div className="grid gap-4">
                  {bigProblemOptions.map((option, index) => {
                    const isSelected = selectedProblemIndex === index;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelectProblem(index)}
                        aria-pressed={isSelected}
                        className={`text-left border-2 rounded-xl p-6 transition ${
                          isSelected
                            ? "border-green-600 bg-green-50 ring-2 ring-green-200"
                            : "border-gray-300 bg-white hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-xl font-semibold">
                            ข้อ {index + 1}: {option.title}
                          </h3>

                          {isSelected && (
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white text-lg font-bold">
                              ✓
                            </span>
                          )}
                        </div>

                        <div className="space-y-3 text-sm leading-7">
                          <div>
                            <strong>อาการที่เขาเจอ:</strong>
                            <div>{option.symptoms}</div>
                          </div>

                          <div>
                            <strong>ต้นเหตุเชิงโครงสร้าง:</strong>
                            <div>{option.rootCause}</div>
                          </div>

                          <div>
                            <strong>ผลกระทบถ้าไม่แก้:</strong>
                            <div>{option.costOfInaction}</div>
                          </div>

                          <div>
                            <strong>เหมาะกับ Lead Magnet แบบ:</strong>
                            <div>{option.leadMagnetType}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={generateStep1}
                  disabled={loading}
                  className="border px-6 py-3 rounded-lg disabled:opacity-60"
                >
                  {loading ? "กำลังสร้างใหม่..." : "สร้าง Step 1 ใหม่"}
                </button>

                <button
                  type="button"
                  onClick={() => (window.location.href = "/lead-magnet-builder")}
                  className="border px-6 py-3 rounded-lg"
                >
                  กลับไปแก้ข้อมูล
                </button>

                <button
                  type="button"
                  onClick={handleContinue}
                  className="bg-black text-white px-6 py-3 rounded-lg"
                >
                  ไป Step 2
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
                {loadingStep >= 1 ? "✓" : "○"} อ่านข้อมูล Avatar และปัญหาหลัก
              </div>

              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 2 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 2 ? "✓" : "○"} วิเคราะห์และสร้าง Big Problem options
              </div>

              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 3 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 3 ? "✓" : "○"} เรียบเรียงผลลัพธ์ให้อ่านง่ายและพร้อมเลือก
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