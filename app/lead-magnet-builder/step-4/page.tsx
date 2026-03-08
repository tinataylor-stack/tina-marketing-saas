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

type NextStepOption = {
  title: string;
  whyItFits: string;
  whatTheyDoNext: string;
  whatTheyGet: string;
  promise: string;
};

export default function LeadMagnetStep4Page() {
  const [structuredAvatar, setStructuredAvatar] = useState<any>(null);
  const [currentProblem, setCurrentProblem] = useState("");
  const [selectedBigProblem, setSelectedBigProblem] =
    useState<BigProblemOption | null>(null);
  const [section2, setSection2] = useState<Section2 | null>(null);
  const [section3, setSection3] = useState<Section3 | null>(null);
  const [section4, setSection4] = useState<Section4 | null>(null);

  const [section5Options, setSection5Options] = useState<NextStepOption[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null
  );
  const [customNextStep, setCustomNextStep] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    const savedStructured = localStorage.getItem("confirmedStructuredAvatar");
    const savedProblem = localStorage.getItem("leadMagnetCurrentProblem");
    const savedSelectedProblem = localStorage.getItem("selectedBigProblem");
    const savedSection2 = localStorage.getItem("leadMagnetSection2");
    const savedSection3 = localStorage.getItem("leadMagnetSection3");
    const savedSection4 = localStorage.getItem("leadMagnetSection4");

    if (
      !savedStructured ||
      !savedProblem ||
      !savedSelectedProblem ||
      !savedSection2 ||
      !savedSection3 ||
      !savedSection4
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
    } catch {
      setError("อ่านข้อมูลไม่สำเร็จ กรุณากลับไปเริ่มใหม่");
    }
  }, []);

  const generateStep4 = async (regenerate = false) => {
    setLoading(true);
    setError("");
    setSelectedOptionIndex(null);

    try {
      const res = await fetch("/api/lead-magnet/step-4", {
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
          regenerate,
          previousSection5Options: section5Options,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการสร้าง Step 4");
      }

      if (
        !Array.isArray(data.section5Options) ||
        data.section5Options.length === 0
      ) {
        throw new Error("Step 4 API ไม่ได้ส่ง section5Options กลับมา");
      }

      setSection5Options(data.section5Options);
      setHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (index: number) => {
  setSelectedOptionIndex(index);
  setCustomNextStep("");
  setError("");
};

  const handleApprove = async () => {
    if (selectedOptionIndex === null && !customNextStep.trim()) {
      setError("กรุณาเลือก Next Step หรือระบุ Next Step ที่ต้องการเอง");
      return;
    }

    if (customNextStep.trim()) {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/lead-magnet/step-4/custom", {
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
            customNextStep: customNextStep.trim(),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "เกิดข้อผิดพลาดในการสร้าง Next Step แบบกำหนดเอง"
          );
        }

        localStorage.setItem("leadMagnetSection5", JSON.stringify(data.section5));
        window.location.href = "/lead-magnet-builder/final";
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }

      return;
    }

    const selectedOption = section5Options[selectedOptionIndex!];

if (!selectedOption) {
  setError("ไม่พบ Next Step ที่เลือก");
  return;
}

localStorage.setItem("leadMagnetSection5", JSON.stringify(selectedOption));
window.location.href = "/lead-magnet-builder/final";
  };

  return (
    <main className="min-h-screen bg-white text-black p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Lead Magnet Builder - Step 4</h1>
        <p className="text-lg mb-8">สร้าง Section 5: The Next Step</p>

        {error && (
          <div className="mb-6 border border-red-300 bg-red-50 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {selectedBigProblem && section4 && (
          <div className="border rounded-xl p-6 bg-gray-50 mb-8 space-y-4">
            <h2 className="text-2xl font-semibold">ข้อมูลที่ใช้สร้าง Step 4</h2>

            <div className="text-sm leading-7">
              <strong>Big Problem:</strong> {selectedBigProblem.title}
            </div>

            <div className="text-sm leading-7">
              <strong>ปัญหาที่กำลังพยายามแก้:</strong> {currentProblem}
            </div>

            <div className="text-sm leading-7">
              <strong>The Gap:</strong> {section4.gapSummary}
            </div>

            <div className="text-sm leading-7">
              <strong>สะพานไปสู่ขั้นตอนถัดไป:</strong> {section4.bridgeToNextStep}
            </div>
          </div>
        )}

        {!hasGenerated && selectedBigProblem && section4 && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => (window.location.href = "/lead-magnet-builder/step-3")}
              className="border px-6 py-3 rounded-lg"
            >
              กลับไป Step 3
            </button>

            <button
              type="button"
              onClick={() => generateStep4(false)}
              disabled={loading}
              className="bg-black text-white px-6 py-3 rounded-lg disabled:opacity-60"
            >
              {loading ? "กำลังสร้าง Step 4..." : "สร้าง Step 4"}
            </button>
          </div>
        )}

        {hasGenerated && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                เลือก Section 5: The Next Step
              </h2>

              <div className="grid gap-4">
                {section5Options.map((option, index) => {
                  const isSelected = selectedOptionIndex === index;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectOption(index)}
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
                          <strong>ทำไมถึงเหมาะ:</strong>
                          <div>{option.whyItFits}</div>
                        </div>

                        <div>
                          <strong>ผู้ใช้ต้องทำอะไรต่อ:</strong>
                          <div>{option.whatTheyDoNext}</div>
                        </div>

                        <div>
                          <strong>เขาจะได้อะไร:</strong>
                          <div>{option.whatTheyGet}</div>
                        </div>

                        <div>
                          <strong>Promise:</strong>
                          <div>{option.promise}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border rounded-xl p-6 bg-gray-50">
              <h3 className="text-xl font-semibold mb-3">
                หรือระบุ Next Step ที่อยากได้เอง
              </h3>

              <p className="text-sm text-gray-700 mb-3 leading-7">
                ถ้าตัวเลือกที่ AI สร้างยังไม่ตรง คุณสามารถพิมพ์ทิศทาง Next Step
                ที่ต้องการเองได้
              </p>

              <textarea
                value={customNextStep}
               onChange={(e) => {
  setCustomNextStep(e.target.value);
  setSelectedOptionIndex(null);
}}
                className="w-full border p-3 rounded-lg"
                rows={4}
                placeholder="เช่น ให้พาไปแอด LINE เพื่อรับ Mock Exam A-Level ภาษาจีน"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => (window.location.href = "/lead-magnet-builder/step-3")}
                className="border px-6 py-3 rounded-lg"
              >
                กลับไป Step 3
              </button>

              <button
                type="button"
                onClick={() => generateStep4(true)}
                disabled={loading}
                className="border px-6 py-3 rounded-lg disabled:opacity-60"
              >
                {loading ? "กำลังสร้างใหม่..." : "สร้างใหม่"}
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={loading}
                className="bg-black text-white px-6 py-3 rounded-lg disabled:opacity-60"
              >
                {loading ? "กำลังบันทึก..." : "ใช้อันนี้และไปหน้าสรุป"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}