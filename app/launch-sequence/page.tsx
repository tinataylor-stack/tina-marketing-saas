"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function LaunchSequencePage() {
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

    const savedAnalysis = localStorage.getItem("confirmedAvatarAnalysis");
    const savedStructured = localStorage.getItem("confirmedStructuredAvatar");

    if (!savedAnalysis || !savedStructured) {
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
          <h1 className="text-4xl font-bold mb-3">Launch</h1>
          <p className="text-lg text-gray-700">
            แยกการทำงานออกเป็น 3 ส่วน เพื่อให้ภาพรวมของ Launch ชัดและไม่รกเกินไป
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

        <div className="grid gap-4 md:grid-cols-3">
          <a
            href="/launch-sequence/step-1"
            className="border rounded-xl p-6 bg-white hover:bg-gray-50 transition block"
          >
            <h2 className="text-2xl font-semibold mb-3">
              Step 1 : วางกลยุทธ์ Launch สินค้า
            </h2>
            <p className="text-sm leading-7 text-gray-700">
              วางแกนกลยุทธ์ของการเปิดตัวให้ชัด ทั้ง Offer, Angle,
              Transformation และเหตุผลที่คนควรสนใจ
            </p>
          </a>

          <a
            href="/launch-sequence/prelaunch"
            className="border rounded-xl p-6 bg-white hover:bg-gray-50 transition block"
          >
            <h2 className="text-2xl font-semibold mb-3">Step 2 : Prelaunch</h2>
            <p className="text-sm leading-7 text-gray-700">
              รวมเครื่องมือสำหรับวางโครง Prelaunch
              และสร้างเนื้อหา Prelaunch ในลำดับถัดไป
            </p>
          </a>

          <a
            href="/launch-sequence/launch"
            className="border rounded-xl p-6 bg-white hover:bg-gray-50 transition block"
          >
            <h2 className="text-2xl font-semibold mb-3">
              Step 3 : Launch
            </h2>
            <p className="text-sm leading-7 text-gray-700">
              รวมเครื่องมือสำหรับ Launch Plan
              และ Final Blueprint ในช่วงเปิดขาย
            </p>
          </a>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/"
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            กลับหน้าแรก
          </a>
        </div>
      </div>
    </main>
  );
}
