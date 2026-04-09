"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";

export default function PrelaunchPage() {
  const [hasAccess, setHasAccess] = useState(false);
  const [hasAvatar, setHasAvatar] = useState(false);
  const [avatarSummary, setAvatarSummary] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedAccess = localStorage.getItem("appAccessGranted");

    if (savedAccess !== "granted-v2") {
      window.location.href = "/";
      return;
    }

    setHasAccess(true);

    const savedStructured = localStorage.getItem("confirmedStructuredAvatar");

    if (!savedStructured) {
      setError("ยังไม่พบ Avatar ที่ยืนยันแล้ว กรุณาไปวิเคราะห์ Avatar ก่อน");
      return;
    }

    try {
      const parsed = JSON.parse(savedStructured) as { shortSummary?: string };
      setAvatarSummary(parsed.shortSummary || "");
      setHasAvatar(true);
    } catch {
      setError("อ่านข้อมูล Avatar ไม่สำเร็จ กรุณาวิเคราะห์ใหม่");
    }
  }, []);

  if (!hasAccess) return null;

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-3">Step 2 : Prelaunch</h1>
          <p className="text-lg text-gray-700">
            รวมเครื่องมือสำหรับการวางโครงและการสร้างเนื้อหาในช่วง Prelaunch
          </p>
        </div>

        {error && (
          <div className="border border-red-300 bg-red-50 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {hasAvatar && (
          <div className="border rounded-xl p-6 bg-gray-50 space-y-3">
            <h2 className="text-2xl font-semibold">Avatar ที่พร้อมใช้งาน</h2>
            <p className="text-sm leading-7 text-gray-800">
              {avatarSummary || "พบ Avatar ที่ยืนยันแล้ว และพร้อมใช้กับเครื่องมือนี้"}
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <a
            href="/launch-sequence/step-2"
            className="border rounded-xl p-6 bg-white hover:bg-gray-50 transition block"
          >
            <h2 className="text-2xl font-semibold mb-3">
              2.1 สร้างกลยุธ์ Prelaunch
            </h2>
            <p className="text-sm leading-7 text-gray-700">
              วาง 3-part PLC sequence เพื่อเชื่อมจาก curiosity ไปสู่ความพร้อมก่อนเปิดขาย
            </p>
          </a>

          <a
            href="/launch-sequence/prelaunch-content"
            className="border rounded-xl p-6 bg-white hover:bg-gray-50 transition block"
          >
            <h2 className="text-2xl font-semibold mb-3">
              2.2 สร้างเนื้อหา Prelaunch
            </h2>
            <p className="text-sm leading-7 text-gray-700">
              เปลี่ยนโครง PLC ให้กลายเป็นเนื้อหาจริงสำหรับ PLC 1, PLC 2 และ PLC 3
            </p>
          </a>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/launch-sequence"
            className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            ย้อนกลับ
          </a>
        </div>
      </div>
    </main>
  );
}
