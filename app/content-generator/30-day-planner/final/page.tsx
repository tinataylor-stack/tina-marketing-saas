"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import Navbar from "../../../components/Navbar";
import type {
  ContentPlanner30Plan,
  ContentPlannerDay,
  SelectedPlannerDay,
} from "../../types";

const PLANNER_PLAN_KEY = "contentPlanner30Plan";
const PLANNER_SELECTED_DAY_KEY = "contentPlanner30SelectedDay";

type PlannerFinalSnapshot = {
  hasChecked: boolean;
  plan: ContentPlanner30Plan | null;
};

const EMPTY_SNAPSHOT: PlannerFinalSnapshot = {
  hasChecked: false,
  plan: null,
};

let cachedSnapshotKey = "";
let cachedSnapshotValue: PlannerFinalSnapshot = EMPTY_SNAPSHOT;

function subscribe() {
  return () => {};
}

function getServerSnapshot() {
  return EMPTY_SNAPSHOT;
}

function getClientSnapshot(): PlannerFinalSnapshot {
  const raw = localStorage.getItem(PLANNER_PLAN_KEY) || "";

  if (raw === cachedSnapshotKey) {
    return cachedSnapshotValue;
  }

  if (!raw) {
    cachedSnapshotKey = raw;
    cachedSnapshotValue = {
      hasChecked: true,
      plan: null,
    };
    return cachedSnapshotValue;
  }

  try {
    cachedSnapshotKey = raw;
    cachedSnapshotValue = {
      hasChecked: true,
      plan: JSON.parse(raw) as ContentPlanner30Plan,
    };
    return cachedSnapshotValue;
  } catch {
    cachedSnapshotKey = raw;
    cachedSnapshotValue = {
      hasChecked: true,
      plan: null,
    };
    return cachedSnapshotValue;
  }
}

function getGeneratorPath(day: ContentPlannerDay) {
  if (day.recommendedGeneratorType === "video-script") {
    return "/content-generator/video-script";
  }

  return "/content-generator/social-post";
}

function buildCopyText(day: ContentPlannerDay) {
  return [
    `Day ${day.day}`,
    `ประเภทคอนเทนต์: ${day.contentType}`,
    `หัวข้อ: ${day.title}`,
    `Theme: ${day.theme}`,
    `Format: ${day.format}`,
    `Hook: ${day.hookIdea}`,
    `Angle: ${day.angle}`,
    `Summary: ${day.summary}`,
    `CTA Direction: ${day.ctaDirection}`,
  ].join("\n");
}

export default function ContentPlannerFinalPage() {
  const { hasChecked, plan } = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    if (hasChecked && !plan) {
      window.location.href = "/content-generator/30-day-planner";
    }
  }, [hasChecked, plan]);

  useEffect(() => {
    if (!copyMessage) return;

    const timer = setTimeout(() => {
      setCopyMessage("");
    }, 1800);

    return () => clearTimeout(timer);
  }, [copyMessage]);

  const handleCopy = async (day: ContentPlannerDay) => {
    try {
      await navigator.clipboard.writeText(buildCopyText(day));
      setCopyMessage(`คัดลอก Day ${day.day} เรียบร้อยแล้ว`);
    } catch {
      setCopyMessage("ไม่สามารถคัดลอกได้");
    }
  };

  const handleUseDay = (day: ContentPlannerDay) => {
    if (!plan) return;

    const selectedDay: SelectedPlannerDay = {
      planPlatform: plan.platform,
      tone: plan.tone,
      extraContext: plan.extraContext,
      avatarSummary: plan.avatarSummary,
      businessContext: plan.businessContext,
      day,
    };

    localStorage.setItem(PLANNER_SELECTED_DAY_KEY, JSON.stringify(selectedDay));
    window.location.href = getGeneratorPath(day);
  };

  if (!hasChecked || !plan) return null;

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-3">30-Day Content Planner</h1>
          <p className="text-lg text-gray-700">
            แผนคอนเทนต์ 30 วันที่สร้างจาก Avatar ที่บันทึกไว้
            พร้อมให้เลือกแต่ละวันไปต่อยอดเป็นเนื้อหาจริง
          </p>
        </div>

        <div className="border rounded-xl p-6 bg-gray-50 space-y-3">
          <h2 className="text-2xl font-semibold">ภาพรวมของแผน</h2>
          <p className="text-sm leading-7 text-gray-800">
            <strong>Platform:</strong> {plan.platform}
          </p>
          <p className="text-sm leading-7 text-gray-800">
            <strong>Avatar summary:</strong> {plan.avatarSummary}
          </p>
          <div className="text-sm leading-7 whitespace-pre-wrap text-gray-800">
            <strong>Business context:</strong> {"\n"}
            {plan.businessContext}
          </div>
          {plan.tone && (
            <p className="text-sm leading-7 text-gray-800">
              <strong>Tone / style:</strong> {plan.tone}
            </p>
          )}
          {plan.extraContext && (
            <div className="text-sm leading-7 whitespace-pre-wrap text-gray-800">
              <strong>Extra context:</strong> {"\n"}
              {plan.extraContext}
            </div>
          )}
        </div>

        {copyMessage && (
          <div className="border rounded-lg p-4 bg-gray-50 text-sm">
            {copyMessage}
          </div>
        )}

        <div className="space-y-4">
          {plan.days.map((day) => (
            <div key={day.day} className="border rounded-xl p-6 bg-white space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Day {day.day}</div>
                  <h2 className="text-2xl font-semibold">{day.title}</h2>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(day)}
                  className="border rounded-full px-4 py-2 text-sm hover:bg-gray-50 transition"
                >
                  copy
                </button>
              </div>

              <div className="flex flex-wrap gap-2 text-sm">
                <span className="border rounded-full px-3 py-1 bg-gray-50">
                  {day.contentType}
                </span>
                <span className="border rounded-full px-3 py-1 bg-gray-50">
                  {day.format}
                </span>
                <span className="border rounded-full px-3 py-1 bg-gray-50">
                  {day.recommendedGeneratorType}
                </span>
              </div>

              <div className="text-sm leading-7 space-y-2">
                <p>
                  <strong>Theme:</strong> {day.theme}
                </p>
                <p>
                  <strong>Hook idea:</strong> {day.hookIdea}
                </p>
                <p>
                  <strong>Angle:</strong> {day.angle}
                </p>
                <p>
                  <strong>Summary:</strong> {day.summary}
                </p>
                <p>
                  <strong>CTA direction:</strong> {day.ctaDirection}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleUseDay(day)}
                  className="bg-black text-white px-6 py-3 rounded-lg"
                >
                  สร้างคอนเทนต์จากวันนี้
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/content-generator/30-day-planner"
            className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            แก้ input แล้วสร้างใหม่
          </Link>
        </div>
      </div>
    </main>
  );
}
