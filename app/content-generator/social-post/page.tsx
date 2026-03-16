"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import type { SelectedPlannerDay, StructuredAvatar } from "../types";

const SELECTED_DAY_KEY = "contentPlanner30SelectedDay";
const SOCIAL_POST_INPUT_KEY = "contentGeneratorSocialPostInput";
const SOCIAL_POST_RESULT_KEY = "contentGeneratorSocialPostResult";
const SOCIAL_POST_MODE_KEY = "contentGeneratorSocialPostMode";

type SavedInput = {
  hookAngle: string;
  mostPeopleThink: string;
  realIssue: string;
  gameIsNot: string;
  gameIs: string;
  step1: string;
  step2: string;
  step3: string;
  proof: string;
  summaryLesson: string;
  extraInstructions: string;
};

type GenerationMode = "planner" | "freestyle";

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

function getSavedInput(): SavedInput {
  if (typeof window === "undefined") {
    return {
      hookAngle: "",
      mostPeopleThink: "",
      realIssue: "",
      gameIsNot: "",
      gameIs: "",
      step1: "",
      step2: "",
      step3: "",
      proof: "",
      summaryLesson: "",
      extraInstructions: "",
    };
  }

  const raw = localStorage.getItem(SOCIAL_POST_INPUT_KEY);

  if (!raw) {
    return {
      hookAngle: "",
      mostPeopleThink: "",
      realIssue: "",
      gameIsNot: "",
      gameIs: "",
      step1: "",
      step2: "",
      step3: "",
      proof: "",
      summaryLesson: "",
      extraInstructions: "",
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SavedInput>;

    return {
      hookAngle: parsed.hookAngle || "",
      mostPeopleThink: parsed.mostPeopleThink || "",
      realIssue: parsed.realIssue || "",
      gameIsNot: parsed.gameIsNot || "",
      gameIs: parsed.gameIs || "",
      step1: parsed.step1 || "",
      step2: parsed.step2 || "",
      step3: parsed.step3 || "",
      proof: parsed.proof || "",
      summaryLesson: parsed.summaryLesson || "",
      extraInstructions: parsed.extraInstructions || "",
    };
  } catch {
    return {
      hookAngle: "",
      mostPeopleThink: "",
      realIssue: "",
      gameIsNot: "",
      gameIs: "",
      step1: "",
      step2: "",
      step3: "",
      proof: "",
      summaryLesson: "",
      extraInstructions: "",
    };
  }
}

export default function SocialPostGeneratorPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [selectedDay, setSelectedDay] = useState<SelectedPlannerDay | null>(null);
  const [generationMode, setGenerationMode] = useState<GenerationMode>("freestyle");
  const [savedInput, setSavedInput] = useState<SavedInput>(() => getSavedInput());
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [avatarAnalysis, setAvatarAnalysis] = useState("");
  const [structuredAvatar, setStructuredAvatar] = useState<StructuredAvatar | null>(
    null
  );

  useEffect(() => {
    const savedAccess = localStorage.getItem("appAccessGranted");

    if (savedAccess !== "yes") {
      window.location.href = "/";
      return;
    }

    const savedAnalysis = localStorage.getItem("confirmedAvatarAnalysis") || "";
    const savedStructured = localStorage.getItem("confirmedStructuredAvatar");
    const savedResult = localStorage.getItem(SOCIAL_POST_RESULT_KEY) || "";
    const nextSelectedDay = getSelectedDay();
    const savedMode = localStorage.getItem(SOCIAL_POST_MODE_KEY);

    setHasMounted(true);
    setSelectedDay(nextSelectedDay);

    setAvatarAnalysis(savedAnalysis);
    setGeneratedContent(savedResult);

    if (savedMode === "planner" || savedMode === "freestyle") {
      if (savedMode === "planner" && !nextSelectedDay) {
        setGenerationMode("freestyle");
      } else {
        setGenerationMode(savedMode);
      }
    } else {
      setGenerationMode(nextSelectedDay ? "planner" : "freestyle");
    }

    if (savedStructured) {
      try {
        const parsed = JSON.parse(savedStructured) as StructuredAvatar;
        setStructuredAvatar(parsed);
      } catch {
        setError("อ่านข้อมูล Avatar ไม่สำเร็จ กรุณาวิเคราะห์ใหม่");
      }
    } else {
      setError("ยังไม่พบ Avatar ที่ยืนยันแล้ว กรุณาไปวิเคราะห์ Avatar ก่อน");
    }
  }, []);

  useEffect(() => {
    if (!copyMessage) return;

    const timer = setTimeout(() => {
      setCopyMessage("");
    }, 1800);

    return () => clearTimeout(timer);
  }, [copyMessage]);

  const updateSavedInput = (nextValues: Partial<SavedInput>) => {
    const nextInput = { ...savedInput, ...nextValues };
    setSavedInput(nextInput);
    localStorage.setItem(SOCIAL_POST_INPUT_KEY, JSON.stringify(nextInput));
  };

  const updateGenerationMode = (nextMode: GenerationMode) => {
    setGenerationMode(nextMode);
    localStorage.setItem(SOCIAL_POST_MODE_KEY, nextMode);
    setError("");
  };

  const runLoadingSequence = () => {
    const timers = [
      setTimeout(() => {
        setLoadingStep(1);
        setLoadingMessage("กำลังอ่าน Avatar และ brief ที่เกี่ยวข้อง...");
      }, 0),
      setTimeout(() => {
        setLoadingStep(2);
        setLoadingMessage("กำลังเขียน Social Post ให้เหมาะกับคอนเทนต์วันนี้...");
      }, 1200),
      setTimeout(() => {
        setLoadingStep(3);
        setLoadingMessage("กำลังเรียบเรียงให้อ่านลื่นและพร้อมใช้งาน...");
      }, 2600),
    ];

    return timers;
  };

  const handleGenerate = async () => {
    setError("");
    setCopyMessage("");

    if (!avatarAnalysis || !structuredAvatar) {
      setError("ยังไม่พบ Avatar ที่พร้อมใช้งาน");
      return;
    }

    if (generationMode === "freestyle" && !savedInput.hookAngle.trim()) {
      setError("กรุณาใส่ Hook angle");
      return;
    }

    if (generationMode === "freestyle" && !savedInput.realIssue.trim()) {
      setError("กรุณาใส่ But the real issue is...");
      return;
    }

    if (generationMode === "freestyle" && !savedInput.gameIs.trim()) {
      setError("กรุณาใส่ The game is...");
      return;
    }

    if (generationMode === "freestyle" && !savedInput.summaryLesson.trim()) {
      setError("กรุณาใส่ Summary");
      return;
    }

    setLoading(true);
    setLoadingStep(0);
    setLoadingMessage("");
    setGeneratedContent("");

    localStorage.setItem(SOCIAL_POST_INPUT_KEY, JSON.stringify(savedInput));

    const timers = runLoadingSequence();

    try {
      const response = await fetch("/api/content-generator/social-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarAnalysis,
          structuredAvatar,
          selectedDay: generationMode === "planner" ? selectedDay : null,
          frameworkInput:
            generationMode === "freestyle"
              ? {
                  hookAngle: savedInput.hookAngle,
                  mostPeopleThink: savedInput.mostPeopleThink,
                  realIssue: savedInput.realIssue,
                  gameIsNot: savedInput.gameIsNot,
                  gameIs: savedInput.gameIs,
                  step1: savedInput.step1,
                  step2: savedInput.step2,
                  step3: savedInput.step3,
                  proof: savedInput.proof,
                  summaryLesson: savedInput.summaryLesson,
                }
              : null,
          extraInstructions: savedInput.extraInstructions,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        content?: string;
      };

      if (!response.ok || !data.content) {
        throw new Error(data.error || "สร้าง Social Post ไม่สำเร็จ");
      }

      setGeneratedContent(data.content);
      localStorage.setItem(SOCIAL_POST_RESULT_KEY, data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      timers.forEach(clearTimeout);
      setLoading(false);
      setLoadingStep(0);
      setLoadingMessage("");
    }
  };

  const handleCopy = async () => {
    if (!generatedContent) return;

    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopyMessage("คัดลอกเรียบร้อยแล้ว");
    } catch {
      setCopyMessage("ไม่สามารถคัดลอกได้");
    }
  };

  if (!hasMounted) return null;

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-3">Social Post Generator</h1>
          <p className="text-lg text-gray-700">
            สร้างโพสต์จริงจากวันที่เลือกใน 30-Day Content Planner
            หรือสร้างจาก brief ที่กรอกเองได้ทันที
          </p>
        </div>

        {error && (
          <div className="border border-red-300 bg-red-50 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        <div className="border rounded-xl p-6 bg-white space-y-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2">โหมดการสร้างคอนเทนต์</h2>
            <p className="text-sm leading-7 text-gray-700">
              เลือกได้ว่าจะใช้วันที่ส่งมาจากแผน 30 วัน
              หรือสร้าง Social Post แบบอิสระจาก brief ใหม่
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => updateGenerationMode("planner")}
              disabled={!selectedDay}
              className={`border rounded-xl p-4 text-left transition disabled:opacity-50 ${
                generationMode === "planner"
                  ? "border-green-600 bg-green-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="font-medium mb-1">ใช้จากวันที่เลือกในแผน</div>
              <div className="text-sm leading-6 text-gray-700">
                ใช้ข้อมูลจาก 30-Day Content Planner เป็นแกนหลักของโพสต์นี้
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateGenerationMode("freestyle")}
              className={`border rounded-xl p-4 text-left transition ${
                generationMode === "freestyle"
                  ? "border-green-600 bg-green-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="font-medium mb-1">
                สร้างแบบอิสระ (มีโครงช่วยเขียน)
              </div>
              <div className="text-sm leading-6 text-gray-700">
                กรอกโครงโพสต์ใหม่เพื่อสร้างคอนเทนต์โดยไม่ยึดตามแผน 30 วัน
              </div>
            </button>
          </div>
        </div>

        {generationMode === "planner" && selectedDay ? (
          <div className="space-y-3">
            <div className="border rounded-xl p-6 bg-gray-50 space-y-3">
              <h2 className="text-2xl font-semibold">
                วันที่เลือกจากแผนคอนเทนต์
              </h2>
              <p className="text-sm leading-7 text-gray-800">
                <strong>Day {selectedDay.day.day}:</strong> {selectedDay.day.title}
              </p>
              <p className="text-sm leading-7 text-gray-800">
                <strong>Format:</strong> {selectedDay.day.format}
              </p>
              <p className="text-sm leading-7 text-gray-800">
                <strong>Hook idea:</strong> {selectedDay.day.hookIdea}
              </p>
              <p className="text-sm leading-7 text-gray-800">
                <strong>Content type:</strong> {selectedDay.day.contentType}
              </p>
              <p className="text-sm leading-7 text-gray-800">
                <strong>Summary:</strong> {selectedDay.day.summary}
              </p>
              <p className="text-sm leading-7 text-gray-800">
                <strong>CTA direction:</strong> {selectedDay.day.ctaDirection}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                className="bg-black text-white px-6 py-3 rounded-lg disabled:opacity-50"
                disabled={loading}
              >
                สร้างโพสท์
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/content-generator/30-day-planner/final";
                }}
                className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
              >
                เลือกวันอื่น
              </button>
            </div>
          </div>
        ) : null}

        <div className="border rounded-xl p-5 bg-white space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Brief สำหรับสร้างโพสต์</h2>
            <p className="text-sm leading-7 text-gray-700">
              {generationMode === "planner"
                ? "ระบบจะใช้วันที่จาก planner เป็นแกนหลัก และคุณสามารถใส่คำสั่งเพิ่มเพื่อปรับโทนหรือมุมได้"
                : "กรอกเฉพาะส่วนที่คุณมีไอเดียได้เลย ระบบจะช่วยเรียบเรียงให้กลายเป็นโพสต์ Facebook ที่สมบูรณ์ขึ้น"}
            </p>
          </div>

          {generationMode === "freestyle" && (
            <div className="space-y-5">
              <p className="text-sm text-gray-600">
                ไม่จำเป็นต้องกรอกครบทุกช่อง ถ้ามีแค่แกนหลัก ระบบจะช่วยขยายให้เป็นโพสต์ที่อ่านลื่นขึ้น
              </p>

              <div>
                <label className="font-medium block mb-1">
                  ประเด็นเปิดโพสต์ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={savedInput.hookAngle}
                  onChange={(event) =>
                    updateSavedInput({ hookAngle: event.target.value })
                  }
                  className="w-full border p-3 rounded-lg"
                  rows={2}
                  placeholder="เช่น ยิ่งพยายามมากขึ้น บางทีผลลัพธ์อาจยิ่งแย่ลง"
                />
                <p className="text-sm text-gray-500 mt-1">
                  ใส่ประเด็นแบบ contrarian หรือ curiosity
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">ปัญหา</h3>
                <div>
                  <label className="font-medium block mb-1">
                    คนส่วนใหญ่มักคิดว่า...
                  </label>
                  <textarea
                    value={savedInput.mostPeopleThink}
                    onChange={(event) =>
                      updateSavedInput({ mostPeopleThink: event.target.value })
                    }
                    className="w-full border p-3 rounded-lg"
                    rows={2}
                    placeholder="เช่น คนส่วนใหญ่มักคิดว่าต้องทำให้มากขึ้นถึงจะเห็นผล"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    เว้นว่างได้ ถ้ายังไม่แน่ใจ ระบบจะช่วยเรียบเรียงให้
                  </p>
                </div>
                <div>
                  <label className="font-medium block mb-1">
                    แต่ปัญหาที่แท้จริงคือ...{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={savedInput.realIssue}
                    onChange={(event) =>
                      updateSavedInput({ realIssue: event.target.value })
                    }
                    className="w-full border p-3 rounded-lg"
                    rows={2}
                    placeholder="เช่น แต่ปัญหาจริงคือทำผิดจุดตั้งแต่ต้น"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">มุมมองสำคัญ</h3>
                <div>
                  <label className="font-medium block mb-1">
                    สิ่งสำคัญไม่ใช่...
                  </label>
                  <textarea
                    value={savedInput.gameIsNot}
                    onChange={(event) =>
                      updateSavedInput({ gameIsNot: event.target.value })
                    }
                    className="w-full border p-3 rounded-lg"
                    rows={2}
                    placeholder="เช่น ไม่ใช่การพยายามให้หนักขึ้นอย่างเดียว"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    เว้นว่างได้ ถ้ายังไม่แน่ใจ ระบบจะช่วยเรียบเรียงให้
                  </p>
                </div>
                <div>
                  <label className="font-medium block mb-1">
                    สิ่งสำคัญคือ... <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={savedInput.gameIs}
                    onChange={(event) =>
                      updateSavedInput({ gameIs: event.target.value })
                    }
                    className="w-full border p-3 rounded-lg"
                    rows={2}
                    placeholder="เช่น การวางระบบที่ถูกต้องตั้งแต่แรก"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Framework</h3>
                <div>
                  <label className="font-medium block mb-1">Step 1</label>
                  <input
                    type="text"
                    value={savedInput.step1}
                    onChange={(event) =>
                      updateSavedInput({ step1: event.target.value })
                    }
                    className="w-full border p-3 rounded-lg"
                    placeholder="เช่น เริ่มจากดูว่าตอนนี้อะไรคือคอขวดจริง"
                  />
                </div>
                <div>
                  <label className="font-medium block mb-1">Step 2</label>
                  <input
                    type="text"
                    value={savedInput.step2}
                    onChange={(event) =>
                      updateSavedInput({ step2: event.target.value })
                    }
                    className="w-full border p-3 rounded-lg"
                    placeholder="เช่น ตัดสิ่งที่ทำให้ไขว้เขวออกก่อน"
                  />
                </div>
                <div>
                  <label className="font-medium block mb-1">Step 3</label>
                  <input
                    type="text"
                    value={savedInput.step3}
                    onChange={(event) =>
                      updateSavedInput({ step3: event.target.value })
                    }
                    className="w-full border p-3 rounded-lg"
                    placeholder="เช่น โฟกัสแค่ action ที่ทำให้เกิดผลจริง"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium block mb-1">ตัวอย่างประกอบ</label>
                <textarea
                  value={savedInput.proof}
                  onChange={(event) =>
                    updateSavedInput({ proof: event.target.value })
                  }
                  className="w-full border p-3 rounded-lg"
                  rows={3}
                  placeholder="เช่น เคสตัวอย่าง ประสบการณ์จริง หรือ pattern ที่เห็นซ้ำบ่อย"
                />
                <p className="text-sm text-gray-500 mt-1">ตัวอย่าง / data / story</p>
              </div>

              <div>
                <label className="font-medium block mb-1">
                  สรุปแก่นสำคัญ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={savedInput.summaryLesson}
                  onChange={(event) =>
                    updateSavedInput({ summaryLesson: event.target.value })
                  }
                  className="w-full border p-3 rounded-lg"
                  rows={2}
                  placeholder="เช่น ถ้าจำได้แค่อย่างเดียว อย่าเริ่มจากทำให้มากขึ้น ให้เริ่มจากทำให้ตรงจุดขึ้น"
                />
                <p className="text-sm text-gray-500 mt-1">
                  ถ้าจะจำแค่เรื่องเดียว ให้จำสิ่งนี้
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="font-medium block mb-1">
              คำสั่งเพิ่มเติม (ถ้ามี)
            </label>
            <textarea
              value={savedInput.extraInstructions}
              onChange={(event) =>
                updateSavedInput({ extraInstructions: event.target.value })
              }
              className="w-full border p-3 rounded-lg"
              rows={3}
              placeholder="เช่น ขอให้น้ำเสียงเป็นกันเอง อ่านง่าย ไม่ขายแรง และปิดท้ายด้วยคำถาม"
            />
          </div>
        </div>

        {loading && (
          <div className="border rounded-xl p-6 bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-3 w-3 rounded-full bg-black animate-pulse" />
              <h2 className="text-xl font-semibold">กำลังสร้าง Social Post</h2>
            </div>

            <p className="text-sm text-gray-700 mb-4">{loadingMessage}</p>

            <div className="mb-5">
              <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-black transition-all duration-500"
                  style={{
                    width: `${loadingStep === 1 ? 35 : loadingStep === 2 ? 68 : loadingStep === 3 ? 95 : 8}%`,
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
                {loadingStep >= 1 ? "✓" : "○"} อ่าน Avatar และ brief
              </div>
              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 2 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 2 ? "✓" : "○"} เขียนโพสต์ฉบับเต็ม
              </div>
              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 3 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 3 ? "✓" : "○"} เรียบเรียงให้พร้อมใช้งาน
              </div>
            </div>
          </div>
        )}

        {!loading && generatedContent && generationMode === "freestyle" && (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              className="bg-black text-white px-6 py-3 rounded-lg"
            >
              สร้างใหม่
            </button>
          </div>
        )}

        {generatedContent && (
          <div className="border rounded-xl p-6 bg-white space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">ผลลัพธ์ Social Post</h2>

              <button
                type="button"
                onClick={handleCopy}
                className="border rounded-full px-4 py-2 text-sm hover:bg-gray-50 transition"
              >
                copy
              </button>
            </div>

            {copyMessage && <p className="text-sm text-gray-600">{copyMessage}</p>}

            <div className="border rounded-lg p-4 bg-gray-50 whitespace-pre-wrap text-sm leading-7">
              {generatedContent}
            </div>
          </div>
        )}

        {!(generationMode === "freestyle" && generatedContent) && (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              className="bg-black text-white px-6 py-3 rounded-lg disabled:opacity-50"
              disabled={loading}
            >
              {generatedContent ? "สร้างใหม่" : "สร้างคอนเทนต์"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
