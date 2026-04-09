"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";

const parseLinePreviewOptions = (value: string | null) => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    return value ? [value] : [];
  }

  return [];
};

export default function PrelaunchContentPage() {
  const [hasAccess, setHasAccess] = useState(false);
  const [hasAvatar, setHasAvatar] = useState(false);
  const [avatarSummary, setAvatarSummary] = useState("");
  const [plc1LinePreview, setPlc1LinePreview] = useState("");
  const [plc2LinePreview, setPlc2LinePreview] = useState("");
  const [plc3LinePreview, setPlc3LinePreview] = useState("");
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
      const plc1PreviewOptions = parseLinePreviewOptions(
        localStorage.getItem("launchSequencePlc1LinePreviewOptions")
      );
      const plc2PreviewOptions = parseLinePreviewOptions(
        localStorage.getItem("launchSequencePlc2LinePreviewOptions")
      );
      const plc3PreviewOptions = parseLinePreviewOptions(
        localStorage.getItem("launchSequencePlc3LinePreviewOptions")
      );
      setPlc1LinePreview(
        plc1PreviewOptions[0] ||
          localStorage.getItem("launchSequencePlc1LinePreview") ||
          ""
      );
      setPlc2LinePreview(
        plc2PreviewOptions[0] ||
          localStorage.getItem("launchSequencePlc2LinePreview") ||
          ""
      );
      setPlc3LinePreview(
        plc3PreviewOptions[0] ||
          localStorage.getItem("launchSequencePlc3LinePreview") ||
          ""
      );
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
          <h1 className="text-4xl font-bold mb-3">2.2 สร้างเนื้อหา Prelaunch</h1>
          <p className="text-lg text-gray-700">
            เลือกสร้างเนื้อหาแต่ละชิ้นของ Prelaunch แยกกัน
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
            href="/launch-sequence/prelaunch-content/plc-1"
            className="border rounded-xl p-6 bg-white hover:bg-gray-50 transition block"
          >
            <h2 className="text-2xl font-semibold mb-3">เนื้อหา Prelaunch 1</h2>
            {plc1LinePreview ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Line OA Message Preview
                </p>
                <p className="text-sm leading-7 text-gray-700">
                  {plc1LinePreview}
                </p>
              </div>
            ) : (
              <p className="text-sm leading-7 text-gray-700">
                ใช้สำหรับสร้าง content ของ PLC 1 จาก strategy ที่บันทึกไว้
              </p>
            )}
          </a>

          <a
            href="/launch-sequence/prelaunch-content/plc-2"
            className="border rounded-xl p-6 bg-white hover:bg-gray-50 transition block"
          >
            <h2 className="text-2xl font-semibold mb-3">เนื้อหา Prelaunch 2</h2>
            {plc2LinePreview ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Line OA Message Preview
                </p>
                <p className="text-sm leading-7 text-gray-700">
                  {plc2LinePreview}
                </p>
              </div>
            ) : (
              <p className="text-sm leading-7 text-gray-700">
                ใช้สำหรับสร้าง content ของ PLC 2 จาก strategy ที่บันทึกไว้
              </p>
            )}
          </a>

          <a
            href="/launch-sequence/prelaunch-content/plc-3"
            className="border rounded-xl p-6 bg-white hover:bg-gray-50 transition block"
          >
            <h2 className="text-2xl font-semibold mb-3">เนื้อหา Prelaunch 3</h2>
            {plc3LinePreview ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Line OA Message Preview
                </p>
                <p className="text-sm leading-7 text-gray-700">
                  {plc3LinePreview}
                </p>
              </div>
            ) : (
              <p className="text-sm leading-7 text-gray-700">
                ใช้สำหรับสร้าง content ของ PLC 3 จาก strategy ที่บันทึกไว้
              </p>
            )}
          </a>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/launch-sequence/prelaunch"
            className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            ย้อนกลับ
          </a>
        </div>
      </div>
    </main>
  );
}
