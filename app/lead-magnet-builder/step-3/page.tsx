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

export default function LeadMagnetStep3Page() {
  const [hasAccess, setHasAccess] = useState(false);

  const [structuredAvatar, setStructuredAvatar] = useState<any>(null);
  const [currentProblem, setCurrentProblem] = useState("");
  const [selectedBigProblem, setSelectedBigProblem] =
    useState<BigProblemOption | null>(null);
  const [section2, setSection2] = useState<Section2 | null>(null);
  const [section3, setSection3] = useState<Section3 | null>(null);

  const [section4, setSection4] = useState<Section4 | null>(null);

  const [loading, setLoading] = useState(false);
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

    if (
      !savedStructured ||
      !savedProblem ||
      !savedSelectedProblem ||
      !savedSection2 ||
      !savedSection3
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
    } catch {
      setError("อ่านข้อมูลไม่สำเร็จ กรุณากลับไปเริ่มใหม่");
    }
  }, []);

  const generateStep3 = async (regenerate = false) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/lead-magnet/step-3", {
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
          regenerate,
          previousSection4: section4,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการสร้าง Step 3");
      }

      setSection4(data.section4);
      setHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    if (!section4) {
      setError("ยังไม่มีข้อมูลสำหรับยืนยัน");
      return;
    }

    localStorage.setItem("leadMagnetSection4", JSON.stringify(section4));
    window.location.href = "/lead-magnet-builder/step-4";
  };

  if (!hasAccess) return null;

  return (
    <main className="min-h-screen bg-white text-black p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Lead Magnet Builder - Step 3</h1>
        <p className="text-lg mb-8">สร้าง Section 4: The Gap</p>

        {error && (
          <div className="mb-6 border border-red-300 bg-red-50 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {selectedBigProblem && section2 && section3 && (
          <div className="border rounded-xl p-6 bg-gray-50 mb-8 space-y-4">
            <h2 className="text-2xl font-semibold">ข้อมูลที่ใช้สร้าง Step 3</h2>

            <div className="text-sm leading-7">
              <strong>Big Problem:</strong> {selectedBigProblem.title}
            </div>

            <div className="text-sm leading-7">
              <strong>ปัญหาที่กำลังพยายามแก้:</strong> {currentProblem}
            </div>

            <div className="text-sm leading-7">
              <strong>The Shift:</strong> {section2.newBelief}
            </div>

            <div className="text-sm leading-7">
              <strong>The Proof:</strong> {section3.format}
            </div>
          </div>
        )}

        {!hasGenerated && selectedBigProblem && section2 && section3 && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => (window.location.href = "/lead-magnet-builder/step-2")}
              className="border px-6 py-3 rounded-lg"
            >
              กลับไป Step 2
            </button>

            <button
              type="button"
              onClick={() => generateStep3(false)}
              disabled={loading}
              className="bg-black text-white px-6 py-3 rounded-lg disabled:opacity-60"
            >
              {loading ? "กำลังสร้าง Step 3..." : "สร้าง Step 3"}
            </button>
          </div>
        )}

        {hasGenerated && section4 && (
          <div className="space-y-8">
            <div className="border rounded-xl p-6 bg-gray-50">
              <h2 className="text-2xl font-semibold mb-4">Section 4: The Gap</h2>

              <div className="space-y-4 text-sm leading-7">
                <div>
                  <strong>สิ่งที่ยังขาดอยู่:</strong>
                  <div>{section4.gapSummary}</div>
                </div>

                <div>
                  <strong>ชั้นที่ลึกกว่าที่ต้องมี:</strong>
                  <ol className="list-decimal pl-6">
                    {section4.deeperLayers.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <strong>สะพานไปสู่ขั้นตอนถัดไป:</strong>
                  <div>{section4.bridgeToNextStep}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => (window.location.href = "/lead-magnet-builder/step-2")}
                className="border px-6 py-3 rounded-lg"
              >
                กลับไป Step 2
              </button>

              <button
                type="button"
                onClick={() => generateStep3(true)}
                disabled={loading}
                className="border px-6 py-3 rounded-lg disabled:opacity-60"
              >
                {loading ? "กำลังสร้างใหม่..." : "สร้างใหม่"}
              </button>

              <button
                type="button"
                onClick={handleApprove}
                className="bg-black text-white px-6 py-3 rounded-lg"
              >
                โอเค ไป Step ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}