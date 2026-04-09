"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function LeadMagnetBuilderPage() {
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
          <h1 className="text-4xl font-bold mb-3">Lead Magnet</h1>
          <p className="text-lg text-gray-700">
            แยกส่วนระหว่างการวางกลยุทธ์ Lead Magnet
            และการเปลี่ยนกลยุทธ์นั้นให้เป็นเนื้อหาจริง
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
            href="/lead-magnet-builder/strategy"
            className="border rounded-xl p-6 bg-white hover:bg-gray-50 transition block"
          >
            <h2 className="text-2xl font-semibold mb-3">
              สร้างกลยุทธ์ Lead Magnet
            </h2>
            <p className="text-sm leading-7 text-gray-700">
              วางโครง Lead Magnet แบบเป็นขั้นตอน ตั้งแต่ Big Problem
              ไปจนถึง Draft เชิงกลยุทธ์
            </p>
          </a>

          <a
            href="/lead-magnet-content"
            className="border rounded-xl p-6 bg-white hover:bg-gray-50 transition block"
          >
            <h2 className="text-2xl font-semibold mb-3">
              สร้างเนื้อหา Lead Magnet
            </h2>
            <p className="text-sm leading-7 text-gray-700">
              เปลี่ยน Lead Magnet Draft ให้กลายเป็นเนื้อหาจริง เช่น บทความ
              PDF Guide Checklist Workbook หรือ Email Course
            </p>
          </a>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/"
            className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            กลับหน้าแรก
          </a>
        </div>
      </div>
    </main>
  );
}
