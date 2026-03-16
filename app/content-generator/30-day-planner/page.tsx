"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import type {
  ContentPlanner30Input,
  ContentPlanner30Plan,
  PlannerPlatform,
  StructuredAvatar,
} from "../types";

const PLANNER_INPUT_KEY = "contentPlanner30Input";
const PLANNER_PLAN_KEY = "contentPlanner30Plan";

const PLATFORM_OPTIONS: Array<{
  id: PlannerPlatform;
  title: string;
  description: string;
}> = [
  {
    id: "facebook",
    title: "Facebook",
    description: "เหมาะกับคอนเทนต์โพสต์ยาว, engagement และการปูทางรายวัน",
  },
  {
    id: "instagram",
    title: "Instagram",
    description: "เหมาะกับคอนเทนต์ที่ต้องการ hook เร็ว ภาพชัด และอ่านสั้นกระชับ",
  },
  {
    id: "tiktok",
    title: "TikTok",
    description: "เหมาะกับคอนเทนต์ที่เน้นจังหวะไว มุมสด และหยุดคนดูให้ได้เร็ว",
  },
  {
    id: "youtube",
    title: "YouTube",
    description: "เหมาะกับคอนเทนต์ที่เล่าได้ลึกขึ้น และต่อยอดเป็นวิดีโอได้ชัด",
  },
];

const TONE_OPTIONS = [
  "",
  "เป็นกันเอง",
  "ให้ความรู้แบบเข้าใจง่าย",
  "สนุกและมีพลัง",
  "อบอุ่นน่าเชื่อถือ",
  "พรีเมียมและมืออาชีพ",
  "ตรงประเด็น กระชับ ชัดเจน",
];

const LOADING_PROGRESS_BY_STEP: Record<number, number> = {
  0: 8,
  1: 35,
  2: 68,
  3: 95,
};

type PlannerPageState = {
  hasAccess: boolean;
  avatarAnalysis: string;
  structuredAvatar: StructuredAvatar | null;
  error: string;
};

function getInitialState(): PlannerPageState {
  if (typeof window === "undefined") {
    return {
      hasAccess: false,
      avatarAnalysis: "",
      structuredAvatar: null,
      error: "",
    };
  }

  const savedAccess = localStorage.getItem("appAccessGranted");

  if (savedAccess !== "yes") {
    return {
      hasAccess: false,
      avatarAnalysis: "",
      structuredAvatar: null,
      error: "",
    };
  }

  const savedAnalysis = localStorage.getItem("confirmedAvatarAnalysis") || "";
  const savedStructured = localStorage.getItem("confirmedStructuredAvatar");

  if (!savedAnalysis || !savedStructured) {
    return {
      hasAccess: true,
      avatarAnalysis: "",
      structuredAvatar: null,
      error: "ยังไม่พบ Avatar ที่ยืนยันแล้ว กรุณาไปวิเคราะห์ Avatar ก่อน",
    };
  }

  try {
    return {
      hasAccess: true,
      avatarAnalysis: savedAnalysis,
      structuredAvatar: JSON.parse(savedStructured) as StructuredAvatar,
      error: "",
    };
  } catch {
    return {
      hasAccess: true,
      avatarAnalysis: savedAnalysis,
      structuredAvatar: null,
      error: "อ่านข้อมูล Avatar ไม่สำเร็จ กรุณาวิเคราะห์ใหม่",
    };
  }
}

function getInitialInput(): ContentPlanner30Input {
  if (typeof window === "undefined") {
    return {
      platform: "facebook",
      tone: "",
      extraContext: "",
    };
  }

  const raw = localStorage.getItem(PLANNER_INPUT_KEY);

  if (!raw) {
    return {
      platform: "facebook",
      tone: "",
      extraContext: "",
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ContentPlanner30Input>;

    return {
      platform:
        parsed.platform === "facebook" ||
        parsed.platform === "instagram" ||
        parsed.platform === "tiktok" ||
        parsed.platform === "youtube"
          ? parsed.platform
          : "facebook",
      tone: parsed.tone || "",
      extraContext: parsed.extraContext || "",
    };
  } catch {
    return {
      platform: "facebook",
      tone: "",
      extraContext: "",
    };
  }
}

export default function ContentPlannerPage() {
  const [pageState] = useState<PlannerPageState>(() => getInitialState());
  const [form, setForm] = useState<ContentPlanner30Input>(() => getInitialInput());
  const [savedPlan] = useState<ContentPlanner30Plan | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = localStorage.getItem(PLANNER_PLAN_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as ContentPlanner30Plan;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(pageState.error);

  useEffect(() => {
    if (!pageState.hasAccess) {
      window.location.href = "/";
    }
  }, [pageState.hasAccess]);

  const runLoadingSequence = () => {
    const timers = [
      setTimeout(() => {
        setLoadingStep(1);
        setLoadingMessage("กำลังอ่านข้อมูล Avatar ที่บันทึกไว้...");
      }, 0),
      setTimeout(() => {
        setLoadingStep(2);
        setLoadingMessage("กำลังกระจายหัวข้อคอนเทนต์ให้ครบทั้ง 30 วัน...");
      }, 1200),
      setTimeout(() => {
        setLoadingStep(3);
        setLoadingMessage("กำลังจัด hook, angle และแนวทางต่อยอดของแต่ละวัน...");
      }, 2600),
    ];

    return timers;
  };

  const updateForm = (nextValues: Partial<ContentPlanner30Input>) => {
    const nextForm = { ...form, ...nextValues };
    setForm(nextForm);
    localStorage.setItem(PLANNER_INPUT_KEY, JSON.stringify(nextForm));
  };

  const handleGenerate = async () => {
    setError("");

    if (!pageState.structuredAvatar || !pageState.avatarAnalysis) {
      setError("ยังไม่พบ Avatar ที่พร้อมใช้งาน");
      return;
    }

    setLoading(true);
    setLoadingStep(0);
    setLoadingMessage("");

    localStorage.setItem(PLANNER_INPUT_KEY, JSON.stringify(form));

    const timers = runLoadingSequence();

    try {
      const response = await fetch("/api/content-generator/30-day-planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarAnalysis: pageState.avatarAnalysis,
          structuredAvatar: pageState.structuredAvatar,
          input: form,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        plan?: ContentPlanner30Plan;
      };

      if (!response.ok || !data.plan) {
        throw new Error(data.error || "สร้างแผนคอนเทนต์ 30 วันไม่สำเร็จ");
      }

      localStorage.setItem(PLANNER_PLAN_KEY, JSON.stringify(data.plan));
      window.location.href = "/content-generator/30-day-planner/final";
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      timers.forEach(clearTimeout);
      setLoading(false);
      setLoadingStep(0);
      setLoadingMessage("");
    }
  };

  if (!pageState.hasAccess) return null;

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-3">30-Day Content Planner</h1>
          <p className="text-lg text-gray-700">
            วางแผนคอนเทนต์ 30 วันจาก Avatar ที่บันทึกไว้
            แล้วค่อยเลือกแต่ละวันไปสร้างเนื้อหาจริงต่อในเครื่องมือที่เหมาะกับงานนั้น
          </p>
        </div>

        {error && (
          <div className="border border-red-300 bg-red-50 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {pageState.structuredAvatar?.shortSummary && (
          <div className="border rounded-xl p-6 bg-gray-50 space-y-3">
            <h2 className="text-2xl font-semibold">Avatar ที่พร้อมใช้งาน</h2>
            <p className="text-sm leading-7 text-gray-800">
              {pageState.structuredAvatar.shortSummary}
            </p>
          </div>
        )}

        {savedPlan && (
          <div className="border rounded-xl p-6 bg-gray-50 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                แผนคอนเทนต์ที่สร้างไว้ล่าสุด
              </h2>
              <p className="text-sm leading-7 text-gray-700">
                พบแผน 30 วันที่เคยสร้างไว้แล้ว
                คุณสามารถกลับไปดูแผนเดิมก่อนได้โดยไม่ต้องสร้างใหม่ทุกครั้ง
              </p>
            </div>

            <div className="text-sm leading-7 text-gray-800 space-y-1">
              <p>
                <strong>Platform:</strong> {savedPlan.platform}
              </p>
              <p>
                <strong>จำนวนวันที่สร้างไว้:</strong> {savedPlan.days.length} วัน
              </p>
              <p>
                <strong>Avatar summary:</strong> {savedPlan.avatarSummary}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/content-generator/30-day-planner/final"
                className="border px-6 py-3 rounded-lg hover:bg-white transition"
              >
                ดูแผนที่สร้างไว้
              </Link>
            </div>
          </div>
        )}

        <div className="border rounded-xl p-6 bg-white space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-3">ตั้งค่าการวางแผน</h2>
            <p className="text-sm leading-7 text-gray-700">
              ระบบจะจัดคอนเทนต์ให้มีความหลากหลายทั้ง ให้ความรู้,
              สร้างความน่าสนใจ, สร้างความบันเทิง, สร้างความไว้วางใจ
              และกระตุ้นการมีส่วนร่วม โดยอิงจาก Avatar ที่บันทึกไว้
            </p>
          </div>

          <div className="space-y-3">
            <label className="font-medium block">Primary platform</label>
            <div className="grid gap-3 md:grid-cols-3">
              {PLATFORM_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => updateForm({ platform: option.id })}
                  className={`border rounded-xl p-4 text-left transition ${
                    form.platform === option.id
                      ? "border-green-600 bg-green-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium mb-1">{option.title}</div>
                  <div className="text-sm leading-6 text-gray-700">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-medium block mb-1">
              Tone / style direction (optional)
            </label>
            <select
              value={form.tone}
              onChange={(event) => updateForm({ tone: event.target.value })}
              className="w-full border p-3 rounded-lg bg-white"
            >
              {TONE_OPTIONS.map((option) => (
                <option key={option || "empty"} value={option}>
                  {option || "เลือก tone / style"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium block mb-1">
              Extra context (optional)
            </label>
            <textarea
              value={form.extraContext}
              onChange={(event) =>
                updateForm({ extraContext: event.target.value })
              }
              className="w-full border p-3 rounded-lg"
              rows={4}
              placeholder="ใส่ข้อมูลเสริมที่อยากให้ระบบใช้วางแผน เช่น campaign พิเศษ หรือข้อจำกัดบางอย่าง"
            />
          </div>
        </div>

        {loading && (
          <div className="border rounded-xl p-6 bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-3 w-3 rounded-full bg-black animate-pulse" />
              <h2 className="text-xl font-semibold">
                กำลังสร้างแผนคอนเทนต์ 30 วัน
              </h2>
            </div>

            <p className="text-sm text-gray-700 mb-4">{loadingMessage}</p>

            <div className="mb-5">
              <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-black transition-all duration-500"
                  style={{
                    width: `${LOADING_PROGRESS_BY_STEP[loadingStep] ?? 8}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 1 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 1 ? "✓" : "○"} อ่านข้อมูล Avatar
              </div>
              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 2 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 2 ? "✓" : "○"} วางหัวข้อคอนเทนต์ครบ 30 วัน
              </div>
              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 3 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 3 ? "✓" : "○"} จัดแนว hook, angle และ format
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            href="/content-generator"
            className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            ย้อนกลับ
          </Link>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !pageState.structuredAvatar}
            className="bg-black text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            สร้างแผน 30 วัน
          </button>
        </div>
      </div>
    </main>
  );
}
