"use client";

import { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";

type FoundationSummary = {
  offerName: string;
  offerDescription: string;
  offerFormat: string;
  price: string;
  launchGoal: string;
  launchContext: string;
};

type PlcSection = {
  headline: string;
  contentOutline: string;
  talkingPoints: string;
  cta: string;
};

type PrelaunchPlan = {
  plc1: PlcSection;
  plc2: PlcSection;
  plc3: PlcSection;
};

const EMPTY_PLC: PlcSection = {
  headline: "",
  contentOutline: "",
  talkingPoints: "",
  cta: "",
};

export default function Plc3ContentPage() {
  const [hasAccess, setHasAccess] = useState(false);
  const [avatarAnalysis, setAvatarAnalysis] = useState("");
  const [structuredAvatar, setStructuredAvatar] = useState<any>(null);
  const [avatarSummary, setAvatarSummary] = useState("");
  const [foundation, setFoundation] = useState<FoundationSummary | null>(null);
  const [plc3, setPlc3] = useState<PlcSection>(EMPTY_PLC);
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    const savedAccess = localStorage.getItem("appAccessGranted");

    if (savedAccess !== "yes") {
      window.location.href = "/";
      return;
    }

    setHasAccess(true);

    const savedAnalysis = localStorage.getItem("confirmedAvatarAnalysis");
    const savedStructured = localStorage.getItem("confirmedStructuredAvatar");
    const savedPlan = localStorage.getItem("launchSequencePrelaunchPlan");
    const savedContent = localStorage.getItem("launchSequencePlc3Content") || "";

    const offerName = localStorage.getItem("launchSequenceOffer") || "";
    const offerDescription =
      localStorage.getItem("launchSequenceOfferDetails") || "";
    const offerFormat = localStorage.getItem("launchSequenceOfferFormat") || "";
    const price = localStorage.getItem("launchSequencePrice") || "";
    const launchGoal = localStorage.getItem("launchSequenceGoal") || "";
    const launchContext = localStorage.getItem("launchSequenceContext") || "";

    if (!savedAnalysis || !savedStructured || !savedPlan) {
      setError("ยังไม่พบข้อมูล Avatar หรือ Prelaunch Strategy ที่พร้อมใช้งาน");
      return;
    }

    if (!offerName || !offerDescription || !offerFormat || !price || !launchGoal) {
      setError("ยังไม่พบข้อมูลวางกลยุทธ์ Launch สินค้าที่ครบ");
      return;
    }

    setAvatarAnalysis(savedAnalysis);
    setGeneratedContent(savedContent);
    setFoundation({
      offerName,
      offerDescription,
      offerFormat,
      price,
      launchGoal,
      launchContext,
    });

    try {
      const parsedStructured = JSON.parse(savedStructured) as {
        shortSummary?: string;
      };
      const parsedPlan = JSON.parse(savedPlan) as PrelaunchPlan;

      setStructuredAvatar(parsedStructured);
      setAvatarSummary(parsedStructured.shortSummary || "");
      setPlc3(parsedPlan.plc3 || EMPTY_PLC);
    } catch {
      setError("อ่านข้อมูลที่บันทึกไว้ไม่สำเร็จ กรุณาสร้างใหม่");
    }
  }, []);

  useEffect(() => {
    if (!copyMessage) return;

    const timer = setTimeout(() => {
      setCopyMessage("");
    }, 1800);

    return () => clearTimeout(timer);
  }, [copyMessage]);

  const runLoadingSequence = () => {
    const timers = [
      setTimeout(() => {
        setLoadingStep(1);
        setLoadingMessage("กำลังอ่าน Avatar และ PLC 3 Strategy...");
      }, 0),
      setTimeout(() => {
        setLoadingStep(2);
        setLoadingMessage("กำลังเขียนเนื้อหา Prelaunch 3...");
      }, 1200),
      setTimeout(() => {
        setLoadingStep(3);
        setLoadingMessage("กำลังเรียบเรียงให้พร้อมใช้งาน...");
      }, 2800),
    ];

    return timers;
  };

  const generateContent = async () => {
    if (!avatarAnalysis || !structuredAvatar || !foundation || !plc3.headline) {
      setError("ข้อมูลไม่ครบสำหรับสร้างเนื้อหา Prelaunch 3");
      return;
    }

    setLoading(true);
    setError("");
    setLoadingMessage("");
    setLoadingStep(0);

    const timers = runLoadingSequence();

    try {
      const res = await fetch("/api/launch-sequence/prelaunch-content/plc-3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarAnalysis,
          structuredAvatar,
          foundation,
          plc3,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "สร้างเนื้อหา Prelaunch 3 ไม่สำเร็จ");
      }

      const content = data.content || "";
      setGeneratedContent(content);
      localStorage.setItem("launchSequencePlc3Content", content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      timers.forEach(clearTimeout);
      setLoading(false);
      setLoadingMessage("");
      setLoadingStep(0);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedContent) return;

    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopyMessage("คัดลอกเรียบร้อยแล้ว");
    } catch {
      setCopyMessage("ไม่สามารถคัดลอกได้");
    }
  };

  if (!hasAccess) return null;

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-3">เนื้อหา Prelaunch 3</h1>
          <p className="text-lg text-gray-700">
            สร้างเนื้อหา PLC 3 จาก Avatar และ Prelaunch Strategy ที่บันทึกไว้
          </p>
        </div>

        {error && (
          <div className="border border-red-300 bg-red-50 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {avatarSummary && (
          <div className="border rounded-xl p-6 bg-gray-50 space-y-3">
            <h2 className="text-2xl font-semibold">Avatar ที่พร้อมใช้งาน</h2>
            <p className="text-sm leading-7 text-gray-800">{avatarSummary}</p>
          </div>
        )}

        {plc3.headline && (
          <div className="border rounded-xl p-6 bg-gray-50 space-y-4">
            <h2 className="text-2xl font-semibold">PLC 3 Strategy ที่ใช้อยู่</h2>
            <div className="text-sm leading-7">
              <strong>Headline:</strong> {plc3.headline}
            </div>
            <div className="text-sm leading-7 whitespace-pre-wrap">
              <strong>Outline:</strong> {"\n"}
              {plc3.contentOutline}
            </div>
            <div className="text-sm leading-7 whitespace-pre-wrap">
              <strong>Talking points:</strong> {"\n"}
              {plc3.talkingPoints}
            </div>
            <div className="text-sm leading-7 whitespace-pre-wrap">
              <strong>CTA:</strong> {"\n"}
              {plc3.cta}
            </div>
          </div>
        )}

        {loading && !generatedContent && (
          <div className="border rounded-xl p-6 bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-3 w-3 rounded-full bg-black animate-pulse" />
              <h2 className="text-xl font-semibold">กำลังสร้างเนื้อหา Prelaunch 3</h2>
            </div>

            <p className="text-sm text-gray-700 mb-4">{loadingMessage}</p>

            <div className="space-y-3 text-sm">
              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 1 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 1 ? "✓" : "○"} อ่าน Avatar และ PLC 3 Strategy
              </div>
              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 2 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 2 ? "✓" : "○"} เขียนเนื้อหา Prelaunch 3
              </div>
              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 3 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 3 ? "✓" : "○"} เรียบเรียงให้พร้อมใช้งาน
              </div>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded bg-gray-200">
              <div
                className="h-full rounded bg-black transition-all duration-700"
                style={{
                  width:
                    loadingStep === 0
                      ? "10%"
                      : loadingStep === 1
                      ? "35%"
                      : loadingStep === 2
                      ? "65%"
                      : "90%",
                }}
              />
            </div>
          </div>
        )}

        {!generatedContent && (
          <div className="flex flex-wrap gap-3">
            <a
              href="/launch-sequence/prelaunch-content"
              className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
            >
              ย้อนกลับ
            </a>

            <button
              type="button"
              onClick={generateContent}
              disabled={loading}
              className="bg-black text-white px-6 py-3 rounded-lg disabled:opacity-60"
            >
              {loading ? "กำลังสร้าง..." : "สร้างเนื้อหา Prelaunch 3"}
            </button>
          </div>
        )}

        {copyMessage && (
          <div className="border border-green-300 bg-green-50 text-green-700 rounded-lg p-4">
            {copyMessage}
          </div>
        )}

        {generatedContent && (
          <>
            <div className="border rounded-xl p-6 bg-white">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h2 className="text-2xl font-semibold">ผลลัพธ์เนื้อหา</h2>

                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="rounded-full border px-3 py-1 text-sm text-gray-500 hover:text-black hover:border-gray-400"
                >
                  copy
                </button>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-7">
                {generatedContent}
              </div>
            </div>

            {loading && (
              <div className="border rounded-xl p-6 bg-gray-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-3 w-3 rounded-full bg-black animate-pulse" />
                  <h2 className="text-xl font-semibold">
                    กำลังสร้างเนื้อหา Prelaunch 3
                  </h2>
                </div>

                <p className="text-sm text-gray-700 mb-4">{loadingMessage}</p>

                <div className="space-y-3 text-sm">
                  <div
                    className={`flex items-center gap-2 ${
                      loadingStep >= 1 ? "text-black font-medium" : "text-gray-400"
                    }`}
                  >
                    {loadingStep >= 1 ? "✓" : "○"} อ่าน Avatar และ PLC 3 Strategy
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      loadingStep >= 2 ? "text-black font-medium" : "text-gray-400"
                    }`}
                  >
                    {loadingStep >= 2 ? "✓" : "○"} เขียนเนื้อหา Prelaunch 3
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      loadingStep >= 3 ? "text-black font-medium" : "text-gray-400"
                    }`}
                  >
                    {loadingStep >= 3 ? "✓" : "○"} เรียบเรียงให้พร้อมใช้งาน
                  </div>
                </div>

                <div className="mt-4 h-2 w-full overflow-hidden rounded bg-gray-200">
                  <div
                    className="h-full rounded bg-black transition-all duration-700"
                    style={{
                      width:
                        loadingStep === 0
                          ? "10%"
                          : loadingStep === 1
                          ? "35%"
                          : loadingStep === 2
                          ? "65%"
                          : "90%",
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <a
                href="/launch-sequence/prelaunch-content"
                className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
              >
                ย้อนกลับ
              </a>

              <button
                type="button"
                onClick={generateContent}
                disabled={loading}
                className="border px-6 py-3 rounded-lg disabled:opacity-60"
              >
                {loading ? "กำลังสร้างใหม่..." : "สร้างใหม่"}
              </button>

            </div>
          </>
        )}
      </div>
    </main>
  );
}
