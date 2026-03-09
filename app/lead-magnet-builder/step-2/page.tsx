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

export default function LeadMagnetStep2Page() {
  const [hasAccess, setHasAccess] = useState(false);

  const [avatarAnalysis, setAvatarAnalysis] = useState("");
  const [structuredAvatar, setStructuredAvatar] = useState<any>(null);
  const [currentProblem, setCurrentProblem] = useState("");
  const [selectedBigProblem, setSelectedBigProblem] =
    useState<BigProblemOption | null>(null);

  const [section2, setSection2] = useState<Section2 | null>(null);
  const [section3, setSection3] = useState<Section3 | null>(null);

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
    const savedSelectedProblem = localStorage.getItem("selectedBigProblem");

    if (
      !savedAnalysis ||
      !savedStructured ||
      !savedProblem ||
      !savedSelectedProblem
    ) {
      setError("ข้อมูลไม่ครบ กรุณากลับไป Step ก่อนหน้า");
      return;
    }

    setAvatarAnalysis(savedAnalysis);
    setCurrentProblem(savedProblem);

    try {
      setStructuredAvatar(JSON.parse(savedStructured));
      setSelectedBigProblem(JSON.parse(savedSelectedProblem));
    } catch {
      setError("อ่านข้อมูลไม่สำเร็จ กรุณากลับไปเริ่มใหม่");
    }
  }, []);

  const runLoadingSequence = () => {
    const timers = [
      setTimeout(() => {
        setLoadingStep(1);
        setLoadingMessage("กำลังอ่านข้อมูล Avatar และ Big Problem ที่คุณเลือก...");
      }, 0),
      setTimeout(() => {
        setLoadingStep(2);
        setLoadingMessage("กำลังวิเคราะห์และสร้าง The Shift...");
      }, 1200),
      setTimeout(() => {
        setLoadingStep(3);
        setLoadingMessage("กำลังจัดโครง The Proof และเรียบเรียงคำตอบ...");
      }, 2800),
    ];

    return timers;
  };

  const generateStep2 = async (regenerate = false) => {
    setLoading(true);
    setError("");
    setLoadingMessage("");
    setLoadingStep(0);

    const timers = runLoadingSequence();

    try {
      const res = await fetch("/api/lead-magnet/step-2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarAnalysis,
          structuredAvatar,
          currentProblem,
          selectedBigProblem,
          regenerate,
          previousSection2: section2,
          previousSection3: section3,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการสร้าง Step 2");
      }

      setSection2(data.section2);
      setSection3(data.section3);
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

  const handleApprove = () => {
    if (!section2 || !section3) {
      setError("ยังไม่มีข้อมูลสำหรับยืนยัน");
      return;
    }

    localStorage.setItem("leadMagnetSection2", JSON.stringify(section2));
    localStorage.setItem("leadMagnetSection3", JSON.stringify(section3));

    window.location.href = "/lead-magnet-builder/step-3";
  };

  if (!hasAccess) return null;

  return (
    <main className="min-h-screen bg-white text-black p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Lead Magnet Builder - Step 2</h1>
        <p className="text-lg mb-8">
          สร้าง The Shift และ The Proof จาก Big Problem ที่เลือก
        </p>

        {error && (
          <div className="mb-6 border border-red-300 bg-red-50 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        <div className={loading ? "opacity-60 pointer-events-none" : ""}>
          {selectedBigProblem && (
            <div className="border rounded-xl p-6 bg-gray-50 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Big Problem ที่เลือก</h2>

              <div className="space-y-3 text-sm leading-7">
                <div>
                  <strong>ชื่อปัญหา:</strong>
                  <div>{selectedBigProblem.title}</div>
                </div>

                <div>
                  <strong>อาการที่เขาเจอ:</strong>
                  <div>{selectedBigProblem.symptoms}</div>
                </div>

                <div>
                  <strong>ต้นเหตุเชิงโครงสร้าง:</strong>
                  <div>{selectedBigProblem.rootCause}</div>
                </div>

                <div>
                  <strong>ผลกระทบถ้าไม่แก้:</strong>
                  <div>{selectedBigProblem.costOfInaction}</div>
                </div>
              </div>
            </div>
          )}

          {!hasGenerated && selectedBigProblem && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => (window.location.href = "/lead-magnet-builder/step-1")}
                className="border px-6 py-3 rounded-lg"
              >
                กลับไป Step 1
              </button>

              <button
                type="button"
                onClick={() => generateStep2(false)}
                disabled={loading}
                className="bg-black text-white px-6 py-3 rounded-lg disabled:opacity-60"
              >
                {loading ? "กำลังสร้าง Step 2..." : "สร้าง Step 2"}
              </button>
            </div>
          )}

          {hasGenerated && section2 && section3 && (
            <div className="space-y-8">
              <div className="border rounded-xl p-6 bg-gray-50">
                <h2 className="text-2xl font-semibold mb-4">Section 2: The Shift</h2>

                <div className="space-y-4 text-sm leading-7">
                  <div>
                    <strong>ความเชื่อเดิมที่ทำให้ติด:</strong>
                    <div>{section2.oldBelief}</div>
                  </div>

                  <div>
                    <strong>ความจริง/มุมมองใหม่:</strong>
                    <div>{section2.newBelief}</div>
                  </div>

                  <div>
                    <strong>กลไก:</strong>
                    <div>{section2.mechanism}</div>
                  </div>

                  <div>
                    <strong>Mini Framework:</strong>
                    <ol className="list-decimal pl-6">
                      {section2.miniFramework.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-6 bg-gray-50">
                <h2 className="text-2xl font-semibold mb-4">Section 3: The Proof</h2>

                <div className="space-y-4 text-sm leading-7">
                  <div>
                    <strong>รูปแบบ:</strong>
                    <div>{section3.format}</div>
                  </div>

                  <div>
                    <strong>เนื้อหา:</strong>
                    <div className="whitespace-pre-wrap">{section3.content}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => (window.location.href = "/lead-magnet-builder/step-1")}
                  className="border px-6 py-3 rounded-lg"
                >
                  กลับไป Step 1
                </button>

                <button
                  type="button"
                  onClick={() => generateStep2(true)}
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
                  ชอบ ไป Step ถัดไป
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
                {loadingStep >= 1 ? "✓" : "○"} อ่านข้อมูลจาก Step ก่อนหน้า
              </div>

              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 2 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 2 ? "✓" : "○"} วิเคราะห์และสร้าง The Shift
              </div>

              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 3 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 3 ? "✓" : "○"} สร้าง The Proof และเรียบเรียงผลลัพธ์
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