"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import type { SelectedPlannerDay } from "../types";

const SELECTED_DAY_KEY = "contentPlanner30SelectedDay";

function getSelectedDay(): SelectedPlannerDay | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(SELECTED_DAY_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SelectedPlannerDay;
  } catch {
    return null;
  }
}

export default function VideoScriptGeneratorPage() {
  const [selectedDay] = useState<SelectedPlannerDay | null>(() => getSelectedDay());

  useEffect(() => {
    const savedAccess = localStorage.getItem("appAccessGranted");

    if (savedAccess !== "yes") {
      window.location.href = "/";
    }
  }, []);

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-3">Video Script Generator</h1>
          <p className="text-lg text-gray-700">
            หน้านี้พร้อมรับ brief จากวันที่เลือกใน 30-Day Content Planner
            และจะใช้ต่อยอดเป็นสคริปต์วิดีโอในขั้นถัดไป
          </p>
        </div>

        {selectedDay ? (
          <div className="border rounded-xl p-6 bg-gray-50 space-y-3">
            <h2 className="text-2xl font-semibold">
              วันที่เลือกจากแผนคอนเทนต์
            </h2>
            <p className="text-sm leading-7 text-gray-800">
              <strong>Day {selectedDay.day.day}:</strong> {selectedDay.day.title}
            </p>
            <p className="text-sm leading-7 text-gray-800">
              <strong>Content type:</strong> {selectedDay.day.contentType}
            </p>
            <p className="text-sm leading-7 text-gray-800">
              <strong>Summary:</strong> {selectedDay.day.summary}
            </p>
          </div>
        ) : (
          <div className="border rounded-xl p-6 bg-gray-50">
            <p className="text-sm leading-7 text-gray-700">
              ยังไม่มีวันที่ถูกส่งมาจาก 30-Day Content Planner
              แต่หน้านี้เตรียมไว้สำหรับรองรับ flow นั้นแล้ว
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            href="/content-generator"
            className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            กลับ Content Generator
          </Link>

          <Link
            href="/content-generator/30-day-planner/final"
            className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            กลับไปเลือกวัน
          </Link>
        </div>
      </div>
    </main>
  );
}
