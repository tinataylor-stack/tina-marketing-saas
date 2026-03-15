"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";

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

const DEFAULT_PLAN: PrelaunchPlan = {
  plc1: { ...EMPTY_PLC },
  plc2: { ...EMPTY_PLC },
  plc3: { ...EMPTY_PLC },
};

export default function PrelaunchSequenceStepPage() {
  const [hasAccess, setHasAccess] = useState(false);
  const [avatarAnalysis, setAvatarAnalysis] = useState("");
  const [structuredAvatar, setStructuredAvatar] = useState<any>(null);
  const [foundation, setFoundation] = useState<FoundationSummary | null>(null);
  const [avatarSummary, setAvatarSummary] = useState("");
  const [plan, setPlan] = useState<PrelaunchPlan>(DEFAULT_PLAN);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false);

  useEffect(() => {
    const savedAccess = localStorage.getItem("appAccessGranted");

    if (savedAccess !== "yes") {
      window.location.href = "/";
      return;
    }

    setHasAccess(true);

    const savedAnalysis = localStorage.getItem("confirmedAvatarAnalysis");
    const savedStructured = localStorage.getItem("confirmedStructuredAvatar");
    const offerName = localStorage.getItem("launchSequenceOffer") || "";
    const offerDescription =
      localStorage.getItem("launchSequenceOfferDetails") || "";
    const offerFormat = localStorage.getItem("launchSequenceOfferFormat") || "";
    const price = localStorage.getItem("launchSequencePrice") || "";
    const launchGoal = localStorage.getItem("launchSequenceGoal") || "";
    const launchContext = localStorage.getItem("launchSequenceContext") || "";

    if (
      !offerName ||
      !offerDescription ||
      !offerFormat ||
      !price ||
      !launchGoal
    ) {
      setError("ยังไม่พบข้อมูลวางกลยุทธ์ Launch สินค้าที่ครบ กรุณากลับไปกรอก Step 1 ก่อน");
      return;
    }

    if (!savedAnalysis || !savedStructured) {
      setError("ยังไม่พบ Avatar ที่ยืนยันแล้ว กรุณาไปวิเคราะห์ Avatar ก่อน");
      return;
    }

    setAvatarAnalysis(savedAnalysis);

    setFoundation({
      offerName,
      offerDescription,
      offerFormat,
      price,
      launchGoal,
      launchContext,
    });

    if (savedStructured) {
      try {
        const parsed = JSON.parse(savedStructured) as { shortSummary?: string };
        setStructuredAvatar(parsed);
        setAvatarSummary(parsed.shortSummary || "");
      } catch {
        setError("อ่านข้อมูล Avatar ไม่สำเร็จ กรุณาวิเคราะห์ใหม่");
      }
    }

    const savedPlcPlan = localStorage.getItem("launchSequencePrelaunchPlan");

    if (savedPlcPlan) {
      try {
        setPlan(JSON.parse(savedPlcPlan) as PrelaunchPlan);
        setHasAttemptedGeneration(true);
      } catch {
        setPlan(DEFAULT_PLAN);
      }
    }
  }, []);

  const runLoadingSequence = () => {
    const timers = [
      setTimeout(() => {
        setLoadingStep(1);
        setLoadingMessage("กำลังอ่าน Avatar และข้อมูลวางกลยุทธ์ Launch สินค้า...");
      }, 0),
      setTimeout(() => {
        setLoadingStep(2);
        setLoadingMessage("กำลังวาง narrative progression ของ PLC 1 ถึง PLC 3...");
      }, 1200),
      setTimeout(() => {
        setLoadingStep(3);
        setLoadingMessage("กำลังจัด headline, outline, talking points และ CTA...");
      }, 2800),
    ];

    return timers;
  };

  const generatePlan = async (regenerate = false) => {
    setError("");
    setSuccessMessage("");
    setLoading(true);
    setLoadingMessage("");
    setLoadingStep(0);
    setHasAttemptedGeneration(true);

    if (!foundation || !avatarAnalysis || !structuredAvatar) {
      setError("ข้อมูลไม่ครบสำหรับสร้าง Prelaunch Sequence");
      setLoading(false);
      return;
    }

    const timers = runLoadingSequence();

    try {
      const res = await fetch("/api/launch-sequence/prelaunch-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarAnalysis,
          structuredAvatar,
          foundation,
          regenerate,
          previousPlan: plan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "สร้าง Prelaunch Sequence ไม่สำเร็จ");
      }

      const nextPlan: PrelaunchPlan = {
        plc1: data.plc1 || EMPTY_PLC,
        plc2: data.plc2 || EMPTY_PLC,
        plc3: data.plc3 || EMPTY_PLC,
      };

      setPlan(nextPlan);
      localStorage.setItem("launchSequencePrelaunchPlan", JSON.stringify(nextPlan));
      setSuccessMessage("สร้าง Prelaunch Sequence เรียบร้อยแล้ว");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      timers.forEach(clearTimeout);
      setLoading(false);
      setLoadingMessage("");
      setLoadingStep(0);
    }
  };

  const renderPlcCard = (
    plcKey: keyof PrelaunchPlan,
    title: string,
    description: string
  ) => {
    const section = plan[plcKey];

    return (
      <div className="border rounded-xl p-6 bg-white space-y-5">
        <div>
          <h2 className="text-2xl font-semibold mb-2">{title}</h2>
          <p className="text-sm leading-7 text-gray-700">{description}</p>
        </div>

        <div>
          <h3 className="font-medium mb-1">Headline</h3>
          <div className="border rounded-lg p-4 bg-gray-50 whitespace-pre-wrap text-sm leading-7">
            {section.headline}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-1">Content outline</h3>
          <div className="border rounded-lg p-4 bg-gray-50 whitespace-pre-wrap text-sm leading-7">
            {section.contentOutline}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-1">Key talking points</h3>
          <div className="border rounded-lg p-4 bg-gray-50 whitespace-pre-wrap text-sm leading-7">
            {section.talkingPoints}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-1">CTA</h3>
          <div className="border rounded-lg p-4 bg-gray-50 whitespace-pre-wrap text-sm leading-7">
            {section.cta}
          </div>
        </div>
      </div>
    );
  };

  if (!hasAccess) return null;

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-3">2.1 สร้างกลยุธ์ Prelaunch</h1>
        </div>

        {error && (
          <div className="border border-red-300 bg-red-50 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="border border-green-300 bg-green-50 text-green-700 rounded-lg p-4">
            {successMessage}
          </div>
        )}

        {foundation && (
          <div className="border rounded-xl p-6 bg-gray-50 space-y-3 text-sm leading-7">
            <h2 className="text-2xl font-semibold mb-2">
              ข้อมูลวางกลยุทธ์ Launch สินค้าที่ใช้อยู่
            </h2>
            <div>
              <strong>Offer:</strong> {foundation.offerName}
            </div>
            <div>
              <strong>คำอธิบาย:</strong> {foundation.offerDescription}
            </div>
            <div>
              <strong>รูปแบบ:</strong> {foundation.offerFormat}
            </div>
            <div>
              <strong>ราคา:</strong> {foundation.price}
            </div>
            <div>
              <strong>เป้าหมายการเปิดตัว:</strong> {foundation.launchGoal}
            </div>
            {foundation.launchContext && (
              <div>
                <strong>บริบทเพิ่มเติม:</strong> {foundation.launchContext}
              </div>
            )}
            {avatarSummary && (
              <div>
                <strong>Avatar:</strong> {avatarSummary}
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="border rounded-xl p-6 bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-3 w-3 rounded-full bg-black animate-pulse" />
              <h2 className="text-xl font-semibold">กำลังสร้าง Prelaunch Sequence</h2>
            </div>

            <p className="text-sm text-gray-700 mb-4">{loadingMessage}</p>

            <div className="space-y-3 text-sm">
              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 1 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 1 ? "✓" : "○"} อ่าน Avatar และข้อมูลวางกลยุทธ์ Launch สินค้า
              </div>
              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 2 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 2 ? "✓" : "○"} วาง flow ของ PLC 1 ถึง PLC 3
              </div>
              <div
                className={`flex items-center gap-2 ${
                  loadingStep >= 3 ? "text-black font-medium" : "text-gray-400"
                }`}
              >
                {loadingStep >= 3 ? "✓" : "○"} จัด headline, outline, talking points และ CTA
              </div>
            </div>
          </div>
        )}

        {!plan.plc1.headline && (
          <div className="flex flex-wrap gap-3">
            <a
              href="/launch-sequence/prelaunch"
              className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
            >
              ย้อนกลับ
            </a>

            <button
              type="button"
              onClick={() => generatePlan(false)}
              disabled={loading}
              className="bg-black text-white px-6 py-3 rounded-lg disabled:opacity-60"
            >
              {loading ? "กำลังสร้าง..." : "สร้าง Prelaunch Sequence"}
            </button>
          </div>
        )}

        {plan.plc1.headline && (
          <div className="space-y-6">
            {renderPlcCard(
              "plc1",
              "PLC 1 - Opportunity",
              "เปิดโอกาสใหม่ แก้ปัญหาแรก และจบด้วยการเปิดประเด็นของปัญหาถัดไป"
            )}

            {renderPlcCard(
              "plc2",
              "PLC 2 - Transformation",
              "พาผู้ชมเห็น transformation ที่เป็นไปได้ แก้ปัญหาที่สอง และปูไปสู่ปัญหาที่สาม"
            )}

            {renderPlcCard(
              "plc3",
              "PLC 3 - Ownership",
              "ทำให้ผู้ชมรู้สึกว่าเขาทำได้จริง แก้ปัญหาที่สาม ตอบ objection และ foreshadow offer"
            )}

            <div className="flex flex-wrap gap-3">
              <a
                href="/launch-sequence/prelaunch"
                className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
              >
                ย้อนกลับ
              </a>

              <button
                type="button"
                onClick={() => generatePlan(true)}
                disabled={loading}
                className="border px-6 py-3 rounded-lg disabled:opacity-60"
              >
                {loading ? "กำลังสร้างใหม่..." : "สร้างใหม่"}
              </button>
            </div>
          </div>
        )}

        {!loading && !plan.plc1.headline && !error && (
          <div className="border rounded-xl p-6 bg-white text-sm leading-7 text-gray-700">
            กดปุ่ม "สร้าง Prelaunch Sequence" เพื่อให้ระบบใช้ข้อมูลจาก Avatar และ
            ข้อมูลวางกลยุทธ์ Launch สินค้า สร้าง PLC 1, PLC 2 และ PLC 3 ให้โดยอัตโนมัติ
          </div>
        )}

      </div>
    </main>
  );
}
