"use client";

import { useEffect, useState } from "react";

export default function LeadMagnetBuilderPage() {
  const [hasAccess, setHasAccess] = useState(false);
  const [avatarAnalysis, setAvatarAnalysis] = useState("");
  const [structuredAvatar, setStructuredAvatar] = useState<any>(null);
  const [currentProblem, setCurrentProblem] = useState("");
  const [error, setError] = useState("");

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

    if (!savedAnalysis || !savedStructured) {
      setError("ยังไม่พบ Avatar ที่ยืนยันแล้ว กรุณาไปวิเคราะห์ Avatar ก่อน");
      return;
    }

    setAvatarAnalysis(savedAnalysis);

    try {
      setStructuredAvatar(JSON.parse(savedStructured));
    } catch {
      setError("อ่านข้อมูล Avatar ไม่สำเร็จ กรุณาวิเคราะห์ใหม่");
    }

    if (savedProblem) {
      setCurrentProblem(savedProblem);
    }
  }, []);

  const handleContinue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!currentProblem.trim()) {
      setError("กรุณากรอกปัญหาที่ลูกค้ากำลังพยายามแก้");
      return;
    }

    localStorage.setItem("leadMagnetCurrentProblem", currentProblem.trim());
    window.location.href = "/lead-magnet-builder/step-1";
  };

  if (!hasAccess) return null;

  return (
    <main className="min-h-screen bg-white text-black p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Lead Magnet Builder</h1>
        <p className="text-lg mb-8">
          ใช้ Avatar ที่วิเคราะห์ไว้แล้ว แล้วระบุปัญหาที่ลูกค้ากำลังพยายามแก้
        </p>

        {error && (
          <div className="mb-6 border border-red-300 bg-red-50 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {avatarAnalysis && (
          <div className="mb-8 border rounded-xl p-6 bg-gray-50">
            <h2 className="text-2xl font-semibold mb-4">Avatar ที่ใช้อยู่</h2>

            {structuredAvatar?.shortSummary && (
              <p className="mb-4 text-sm text-gray-700">
                <strong>สรุปสั้น:</strong> {structuredAvatar.shortSummary}
              </p>
            )}

            <div className="whitespace-pre-wrap text-sm leading-7">
              {avatarAnalysis}
            </div>
          </div>
        )}

        {structuredAvatar && (
          <form onSubmit={handleContinue} className="space-y-6 max-w-3xl">
            <div>
              <label className="font-medium block mb-1">
                ลูกค้าของคุณกำลังพยายามแก้ปัญหาอะไรอยู่ตอนนี้?
              </label>
              <textarea
                value={currentProblem}
                onChange={(e) => setCurrentProblem(e.target.value)}
                className="w-full border p-3 rounded-lg"
                rows={4}
                placeholder="เช่น อยากลดน้ำหนักแต่ควบคุมอาหารไม่ได้"
              />
            </div>

            <button
              type="submit"
              className="bg-black text-white px-6 py-3 rounded-lg"
            >
              ไป Step 1
            </button>
          </form>
        )}
      </div>
    </main>
  );
}