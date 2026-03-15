"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import Navbar from "../components/Navbar";

type ContentGeneratorSnapshot = {
  hasCheckedAccess: boolean;
  hasAccess: boolean;
  hasAvatar: boolean;
  avatarSummary: string;
  error: string;
};

const EMPTY_SNAPSHOT: ContentGeneratorSnapshot = {
  hasCheckedAccess: false,
  hasAccess: false,
  hasAvatar: false,
  avatarSummary: "",
  error: "",
};

let cachedSnapshotKey = "";
let cachedSnapshotValue: ContentGeneratorSnapshot = EMPTY_SNAPSHOT;

function subscribe() {
  return () => {};
}

function getServerSnapshot() {
  return EMPTY_SNAPSHOT;
}

function getClientSnapshot(): ContentGeneratorSnapshot {
  const savedAccess = localStorage.getItem("appAccessGranted");
  const savedStructured = localStorage.getItem("confirmedStructuredAvatar");
  const snapshotKey = `${savedAccess || ""}::${savedStructured || ""}`;

  if (snapshotKey === cachedSnapshotKey) {
    return cachedSnapshotValue;
  }

  if (savedAccess !== "yes") {
    cachedSnapshotKey = snapshotKey;
    cachedSnapshotValue = EMPTY_SNAPSHOT;
    return cachedSnapshotValue;
  }

  if (!savedStructured) {
    cachedSnapshotKey = snapshotKey;
    cachedSnapshotValue = {
      hasCheckedAccess: true,
      hasAccess: true,
      hasAvatar: false,
      avatarSummary: "",
      error: "ยังไม่พบ Avatar ที่ยืนยันแล้ว กรุณาไปวิเคราะห์ Avatar ก่อน",
    };
    return cachedSnapshotValue;
  }

  try {
    const parsed = JSON.parse(savedStructured) as { shortSummary?: string };

    cachedSnapshotKey = snapshotKey;
    cachedSnapshotValue = {
      hasCheckedAccess: true,
      hasAccess: true,
      hasAvatar: true,
      avatarSummary: parsed.shortSummary || "",
      error: "",
    };
    return cachedSnapshotValue;
  } catch {
    cachedSnapshotKey = snapshotKey;
    cachedSnapshotValue = {
      hasCheckedAccess: true,
      hasAccess: true,
      hasAvatar: false,
      avatarSummary: "",
      error: "อ่านข้อมูล Avatar ไม่สำเร็จ กรุณาวิเคราะห์ใหม่",
    };
    return cachedSnapshotValue;
  }
}

export default function ContentGeneratorPage() {
  const { hasCheckedAccess, hasAccess, hasAvatar, avatarSummary, error } =
    useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    if (hasCheckedAccess && !hasAccess) {
      window.location.href = "/";
    }
  }, [hasCheckedAccess, hasAccess]);

  if (!hasCheckedAccess || !hasAccess) return null;

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-3">Content Generator</h1>
          <p className="text-lg text-gray-700">
            พื้นที่สำหรับเครื่องมือเปลี่ยนไอเดียและแผนให้กลายเป็นเนื้อหาจริง
            โดยแยกออกจากหน้าวางกลยุทธ์อย่างชัดเจน
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
          <Link
            href="/content-generator/30-day-planner"
            className="border rounded-xl p-6 bg-white hover:bg-gray-50 transition block"
          >
            <h2 className="text-2xl font-semibold mb-3">
              30-Day Content Planner
            </h2>
            <p className="text-sm leading-7 text-gray-700">
              ใช้สำหรับวางแผนคอนเทนต์ 30 วันก่อน
              แล้วค่อยเลือกแต่ละวันไปสร้างเนื้อหาจริงต่อแบบวันต่อวัน
            </p>
          </Link>

          <Link
            href="/content-generator/social-post"
            className="border rounded-xl p-6 bg-white hover:bg-gray-50 transition block"
          >
            <h2 className="text-2xl font-semibold mb-3">
              Social Post Generator
            </h2>
            <p className="text-sm leading-7 text-gray-700">
              สร้างโพสต์สำหรับโซเชียลได้ทันทีจาก brief ที่กรอกเอง
              หรือดึงจากวันที่เลือกไว้ในแผนคอนเทนต์ที่บันทึกไว้แล้ว
            </p>
          </Link>

          <Link
            href="/content-generator/line-broadcast"
            className="border rounded-xl p-6 bg-white hover:bg-gray-50 transition block"
          >
            <h2 className="text-2xl font-semibold mb-3">
              Line Broadcast Generator
            </h2>
            <p className="text-sm leading-7 text-gray-700">
              สร้างข้อความสำหรับ LINE Broadcast ได้ทั้งแบบเริ่มใหม่เอง
              หรือใช้ข้อมูลจากวันที่เลือกไว้ในแผนคอนเทนต์ที่บันทึกไว้
            </p>
          </Link>

          <Link
            href="/content-generator/video-script"
            className="border rounded-xl p-6 bg-white hover:bg-gray-50 transition block"
          >
            <h2 className="text-2xl font-semibold mb-3">
              Video Script Generator
            </h2>
            <p className="text-sm leading-7 text-gray-700">
              เปลี่ยนไอเดียให้กลายเป็นสคริปต์วิดีโอได้ทันที
              ทั้งจาก brief ใหม่หรือจากวันที่เลือกไว้ในแผน 30 วัน
            </p>
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </main>
  );
}
