"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import AvatarEntryLink from "./components/AvatarEntryLink";

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
    if (password === "AppKruTina2026") {
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
            เริ่มจาก Avatar ก่อน แล้วค่อยไปต่อในแต่ละชุดเครื่องมือ
            เพื่อให้ทุกหน้าใช้ข้อมูลเดียวกันได้อย่างเป็นระบบ
          </p>
        </div>

        <div className="flex justify-center">
          <AvatarEntryLink className="bg-black text-white px-6 py-3 rounded-lg" />
        </div>

        <div className="space-y-6">
          <a
            href="/content-generator"
            className="block border rounded-xl p-6 hover:bg-gray-50 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">Content Generator</h2>
            <p className="text-gray-700">
              พื้นที่สำหรับเครื่องมือสร้างคอนเทนต์ในอนาคต
              โดยจะแยกจากหน้ากลยุทธ์อย่างชัดเจน
            </p>
          </a>

          <a
            href="/lead-magnet-builder"
            className="block border rounded-xl p-6 hover:bg-gray-50 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">Lead Magnet</h2>
            <p className="text-gray-700">
              รวมเครื่องมือสำหรับวางกลยุทธ์ Lead Magnet
              และเปลี่ยนกลยุทธ์นั้นให้กลายเป็นเนื้อหาจริง
            </p>
          </a>

          <a
            href="/launch-sequence"
            className="block border rounded-xl p-6 hover:bg-gray-50 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">Launch</h2>
            <p className="text-gray-700">
              รวมเครื่องมือสำหรับ วางกลยุทธ์ Launch สินค้า, สร้าง Prelaunch,
              PLC Content และ Launch Plan
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
