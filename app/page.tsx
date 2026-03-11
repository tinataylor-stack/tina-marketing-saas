"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";

export default function HomePage() {
  const [password, setPassword] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedAccess = localStorage.getItem("appAccessGranted");
    if (savedAccess === "yes") {
      setHasAccess(true);
    }
  }, []);

  const handleUnlock = () => {
    if (password === "TinaTest2026") {
      localStorage.setItem("appAccessGranted", "yes");
      setHasAccess(true);
      setError("");
      return;
    }

    setError("รหัสไม่ถูกต้อง");
  };

  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-white text-black p-10">
        <div className="max-w-xl mx-auto pt-24">
          <h1 className="text-4xl font-bold mb-4">Private Test Access</h1>
          <p className="text-lg mb-6 text-gray-700">
            หน้านี้เปิดสำหรับผู้ทดสอบเท่านั้น
          </p>

          {error && (
            <div className="mb-4 border border-red-300 bg-red-50 text-red-700 rounded-lg p-4">
              {error}
            </div>
          )}

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded-lg mb-4"
            placeholder="ใส่รหัสเพื่อเข้าใช้งาน"
          />

          <button
            type="button"
            onClick={handleUnlock}
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            เข้าใช้งาน
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">AI Marketing Tools</h1>
          <p className="text-lg text-gray-700">
            เครื่องมือช่วยวิเคราะห์ลูกค้า ออกแบบ Lead Magnet
            และสร้างเนื้อหาทางการตลาดด้วย AI
          </p>
        </div>

        <div className="space-y-6">
          <a
            href="/avatar-analyzer"
            className="block border rounded-xl p-6 hover:bg-gray-50 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">Avatar Analyzer</h2>
            <p className="text-gray-700">
              วิเคราะห์ Customer Avatar เชิงกลยุทธ์ เพื่อเข้าใจปัญหา ความต้องการ
              และโอกาสของลูกค้า
            </p>
          </a>

          <a
            href="/lead-magnet-builder"
            className="block border rounded-xl p-6 hover:bg-gray-50 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">Lead Magnet Builder</h2>
            <p className="text-gray-700">
              สร้างโครง Lead Magnet แบบเป็นขั้นตอน ตั้งแต่ Big Problem
              ไปจนถึง Draft พร้อมใช้
            </p>
          </a>

          <a
            href="/lead-magnet-content"
            className="block border rounded-xl p-6 hover:bg-gray-50 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">
              Lead Magnet Content
            </h2>
            <p className="text-gray-700">
              เปลี่ยน Lead Magnet Draft ให้กลายเป็นเนื้อหาจริง เช่น บทความ
              PDF Guide Checklist Workbook หรือ Email Course
            </p>
          </a>
        </div>

        <div className="text-sm text-gray-500 text-center pt-6">
          เวอร์ชันทดสอบสำหรับผู้ใช้กลุ่มแรก
        </div>
      </div>
    </main>
  );
}