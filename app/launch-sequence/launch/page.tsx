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

type LaunchSetup = {
  bonuses: string;
  urgencyMechanism: string;
  checkoutDirection: string;
  launchNotes: string;
  priorityObjections: string;
  testimonials: string;
};

type DayConfig = {
  key: "day1" | "day2" | "day3" | "day4" | "day5";
  title: string;
  description: string;
  storageKey: string;
  route: string;
  messageCount: number;
};

const SETUP_STORAGE_KEY = "launchSequenceLaunchSetup";

const DAY_CONFIGS: DayConfig[] = [
  {
    key: "day1",
    title: "Day 1: Cart Open",
    description: "2 ข้อความสำหรับวันเปิดขาย เพื่อประกาศว่า cart เปิดแล้วและดึงคนที่พร้อมตัดสินใจ",
    storageKey: "launchSequenceDay1Messages",
    route: "/api/launch-sequence/launch/day-1-cart-open",
    messageCount: 2,
  },
  {
    key: "day2",
    title: "Day 2: Objection Handling",
    description: "1 ข้อความสำหรับคลายข้อกังวลหลักในวันที่ 2 โดยไม่เร่งขายเร็วเกินไป",
    storageKey: "launchSequenceDay2Messages",
    route: "/api/launch-sequence/launch/day-2-objection",
    messageCount: 1,
  },
  {
    key: "day3",
    title: "Day 3: Proof / Belief",
    description: "1 ข้อความที่เน้น proof, testimonial energy และความเชื่อว่าคนแบบเขาก็ทำได้",
    storageKey: "launchSequenceDay3Messages",
    route: "/api/launch-sequence/launch/day-3-objection",
    messageCount: 1,
  },
  {
    key: "day4",
    title: "Day 4: Objection + Scarcity + Urgency",
    description: "2 ข้อความสำหรับเพิ่มแรงตัดสินใจ พร้อมเชื่อม objection เข้ากับ scarcity และ urgency",
    storageKey: "launchSequenceDay4Messages",
    route: "/api/launch-sequence/launch/day-4-urgency",
    messageCount: 2,
  },
  {
    key: "day5",
    title: "Day 5: Last Call / Cart Close",
    description: "3 ข้อความสำหรับวันปิด cart ไล่จากเตือนรอบสุดท้ายไปจนถึง close",
    storageKey: "launchSequenceDay5Messages",
    route: "/api/launch-sequence/launch/day-5-cart-close",
    messageCount: 3,
  },
];

const DEFAULT_SETUP: LaunchSetup = {
  bonuses: "",
  urgencyMechanism: "",
  checkoutDirection: "",
  launchNotes: "",
  priorityObjections: "",
  testimonials: "",
};

const DEFAULT_MESSAGES: Record<DayConfig["key"], string[]> = {
  day1: [],
  day2: [],
  day3: [],
  day4: [],
  day5: [],
};

const DEFAULT_LOADING: Record<DayConfig["key"], boolean> = {
  day1: false,
  day2: false,
  day3: false,
  day4: false,
  day5: false,
};

const DEFAULT_LOADING_STEP: Record<DayConfig["key"], number> = {
  day1: 0,
  day2: 0,
  day3: 0,
  day4: 0,
  day5: 0,
};

const DEFAULT_LOADING_MESSAGE: Record<DayConfig["key"], string> = {
  day1: "",
  day2: "",
  day3: "",
  day4: "",
  day5: "",
};

const LOADING_PROGRESS_BY_STEP: Record<number, number> = {
  0: 10,
  1: 38,
  2: 72,
  3: 96,
};

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeMessages(value: string | null): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    return value ? [value] : [];
  }

  return [];
}

function getAllGeneratedMessages(
  messagesByDay: Record<DayConfig["key"], string[]>,
  excludeKey?: DayConfig["key"]
) {
  return DAY_CONFIGS.flatMap((config) =>
    config.key === excludeKey ? [] : messagesByDay[config.key]
  );
}

export default function LaunchPage() {
  const [hasAccess, setHasAccess] = useState(false);
  const [avatarAnalysis, setAvatarAnalysis] = useState("");
  const [avatarSummary, setAvatarSummary] = useState("");
  const [structuredAvatar, setStructuredAvatar] = useState<Record<string, unknown> | null>(
    null
  );
  const [foundation, setFoundation] = useState<FoundationSummary | null>(null);
  const [prelaunchPlan, setPrelaunchPlan] = useState<PrelaunchPlan | null>(null);
  const [setup, setSetup] = useState<LaunchSetup>(DEFAULT_SETUP);
  const [messagesByDay, setMessagesByDay] =
    useState<Record<DayConfig["key"], string[]>>(DEFAULT_MESSAGES);
  const [loadingByDay, setLoadingByDay] =
    useState<Record<DayConfig["key"], boolean>>(DEFAULT_LOADING);
  const [loadingStepByDay, setLoadingStepByDay] =
    useState<Record<DayConfig["key"], number>>(DEFAULT_LOADING_STEP);
  const [loadingMessageByDay, setLoadingMessageByDay] =
    useState<Record<DayConfig["key"], string>>(DEFAULT_LOADING_MESSAGE);
  const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);
  const [setupProgress, setSetupProgress] = useState(0);
  const [setupProgressMessage, setSetupProgressMessage] = useState("");
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    const savedAccess = localStorage.getItem("appAccessGranted");

    if (savedAccess !== "granted-v2") {
      window.location.href = "/";
      return;
    }

    setHasAccess(true);

    const savedAnalysis = localStorage.getItem("confirmedAvatarAnalysis") || "";
    const savedStructured = localStorage.getItem("confirmedStructuredAvatar");
    const savedPlan = localStorage.getItem("launchSequencePrelaunchPlan");

    const offerName = localStorage.getItem("launchSequenceOffer") || "";
    const offerDescription =
      localStorage.getItem("launchSequenceOfferDetails") || "";
    const offerFormat = localStorage.getItem("launchSequenceOfferFormat") || "";
    const price = localStorage.getItem("launchSequencePrice") || "";
    const launchGoal = localStorage.getItem("launchSequenceGoal") || "";
    const launchContext = localStorage.getItem("launchSequenceContext") || "";

    if (
      !savedAnalysis ||
      !savedStructured ||
      !offerName ||
      !offerDescription ||
      !offerFormat ||
      !price ||
      !launchGoal
    ) {
      setError("ยังไม่พบข้อมูล Avatar หรือ Launch Strategy ที่พร้อมใช้งาน");
      return;
    }

    if (!savedPlan) {
      setError("ยังไม่พบ Prelaunch Strategy กรุณาสร้าง Step 2 ก่อน");
      return;
    }

    try {
      const parsedStructured = JSON.parse(savedStructured) as {
        shortSummary?: string;
      } & Record<string, unknown>;
      const parsedPlan = JSON.parse(savedPlan) as PrelaunchPlan;

      setAvatarAnalysis(savedAnalysis);
      setStructuredAvatar(parsedStructured);
      setAvatarSummary(parsedStructured.shortSummary || "");
      setPrelaunchPlan(parsedPlan);
      setFoundation({
        offerName,
        offerDescription,
        offerFormat,
        price,
        launchGoal,
        launchContext,
      });
      setSetup(parseJson<LaunchSetup>(localStorage.getItem(SETUP_STORAGE_KEY), DEFAULT_SETUP));

      setMessagesByDay({
        day1: normalizeMessages(localStorage.getItem("launchSequenceDay1Messages")),
        day2: normalizeMessages(localStorage.getItem("launchSequenceDay2Messages")),
        day3: normalizeMessages(localStorage.getItem("launchSequenceDay3Messages")),
        day4: normalizeMessages(localStorage.getItem("launchSequenceDay4Messages")),
        day5: normalizeMessages(localStorage.getItem("launchSequenceDay5Messages")),
      });
    } catch {
      setError("อ่านข้อมูล Launch ที่บันทึกไว้ไม่สำเร็จ กรุณาสร้างใหม่");
    }
  }, []);

  useEffect(() => {
    if (!copyMessage) return;

    const timer = setTimeout(() => {
      setCopyMessage("");
    }, 1800);

    return () => clearTimeout(timer);
  }, [copyMessage]);

  const updateSetup = (nextValues: Partial<LaunchSetup>) => {
    const nextSetup = { ...setup, ...nextValues };
    setSetup(nextSetup);
    localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(nextSetup));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("คัดลอกเรียบร้อยแล้ว");
    } catch {
      setCopyMessage("ไม่สามารถคัดลอกได้");
    }
  };

  const runLoadingSequence = (dayKey: DayConfig["key"], dayTitle: string) => {
    const timers = [
      setTimeout(() => {
        setLoadingStepByDay((prev) => ({
          ...prev,
          [dayKey]: 1,
        }));
        setLoadingMessageByDay((prev) => ({
          ...prev,
          [dayKey]: `กำลังอ่าน Avatar, Launch Foundation และบริบทของ ${dayTitle}...`,
        }));
      }, 0),
      setTimeout(() => {
        setLoadingStepByDay((prev) => ({
          ...prev,
          [dayKey]: 2,
        }));
        setLoadingMessageByDay((prev) => ({
          ...prev,
          [dayKey]: `กำลังเขียนข้อความ LINE Broadcast สำหรับ ${dayTitle}...`,
        }));
      }, 1200),
      setTimeout(() => {
        setLoadingStepByDay((prev) => ({
          ...prev,
          [dayKey]: 3,
        }));
        setLoadingMessageByDay((prev) => ({
          ...prev,
          [dayKey]: `กำลังปรับถ้อยคำไม่ให้ซ้ำกับข้อความเดิม และจัดให้อ่านลื่นบน LINE...`,
        }));
      }, 2600),
    ];

    return timers;
  };

  const generateMessages = async (config: DayConfig) => {
    if (!avatarAnalysis || !structuredAvatar || !foundation || !prelaunchPlan) {
      setError("ข้อมูลไม่ครบสำหรับสร้าง Launch LINE Broadcast");
      return;
    }

    if (
      !setup.urgencyMechanism.trim() ||
      !setup.checkoutDirection.trim() ||
      !setup.priorityObjections.trim()
    ) {
      setError("กรุณากรอกข้อมูล Launch Setup ที่จำเป็นให้ครบก่อนสร้างข้อความ");
      return;
    }

    setError("");
    setLoadingByDay((prev) => ({
      ...prev,
      [config.key]: true,
    }));
    setLoadingStepByDay((prev) => ({
      ...prev,
      [config.key]: 0,
    }));
    setLoadingMessageByDay((prev) => ({
      ...prev,
      [config.key]: "",
    }));

    const timers = runLoadingSequence(config.key, config.title);

    try {
      const response = await fetch(config.route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarAnalysis,
          structuredAvatar,
          foundation,
          prelaunchPlan,
          launchSetup: setup,
          priorMessages: getAllGeneratedMessages(messagesByDay, config.key),
          previousMessages: messagesByDay[config.key],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "สร้างข้อความ Launch ไม่สำเร็จ");
      }

      const nextMessages = Array.isArray(data.messages)
        ? data.messages.filter((item: unknown): item is string => typeof item === "string")
        : [];

      setMessagesByDay((prev) => ({
        ...prev,
        [config.key]: nextMessages,
      }));
      localStorage.setItem(config.storageKey, JSON.stringify(nextMessages));
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      timers.forEach(clearTimeout);
      setLoadingByDay((prev) => ({
        ...prev,
        [config.key]: false,
      }));
      setLoadingStepByDay((prev) => ({
        ...prev,
        [config.key]: 0,
      }));
      setLoadingMessageByDay((prev) => ({
        ...prev,
        [config.key]: "",
      }));
    }
  };

  const resetAllGeneratedMessages = (clearStorageOnly = false) => {
    if (!clearStorageOnly) {
      setMessagesByDay(DEFAULT_MESSAGES);
    }
    setError("");
    setCopyMessage("");

    DAY_CONFIGS.forEach((config) => {
      localStorage.removeItem(config.storageKey);
    });
  };

  const regenerateAllMessages = async () => {
    if (isRegeneratingAll) {
      return;
    }

    if (!avatarAnalysis || !structuredAvatar || !foundation || !prelaunchPlan) {
      setError("ข้อมูลไม่ครบสำหรับสร้าง Launch LINE Broadcast");
      return;
    }

    if (
      !setup.urgencyMechanism.trim() ||
      !setup.checkoutDirection.trim() ||
      !setup.priorityObjections.trim()
    ) {
      setError("กรุณากรอกข้อมูล Launch Setup ที่จำเป็นให้ครบก่อนสร้างข้อความ");
      return;
    }

    setIsRegeneratingAll(true);
    setError("");
    setCopyMessage("");
    setSetupProgress(6);
    setSetupProgressMessage("กำลังล้างข้อความเดิมและเตรียมสร้าง Day 1 ใหม่...");
    setMessagesByDay(DEFAULT_MESSAGES);
    resetAllGeneratedMessages(true);

    const nextMessagesByDay: Record<DayConfig["key"], string[]> = {
      day1: [],
      day2: [],
      day3: [],
      day4: [],
      day5: [],
    };

    try {
      const config = DAY_CONFIGS[0];

      setSetupProgress(30);
      setSetupProgressMessage(`กำลังสร้าง ${config.title}...`);

      setLoadingByDay((prev) => ({
        ...prev,
        [config.key]: true,
      }));
      setLoadingStepByDay((prev) => ({
        ...prev,
        [config.key]: 1,
      }));
      setLoadingMessageByDay((prev) => ({
        ...prev,
        [config.key]: `กำลังสร้างจาก Launch Setup สำหรับ ${config.title}...`,
      }));

      const response = await fetch(config.route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarAnalysis,
          structuredAvatar,
          foundation,
          prelaunchPlan,
          launchSetup: setup,
          priorMessages: getAllGeneratedMessages(nextMessagesByDay, config.key),
          previousMessages: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `สร้างข้อความ ${config.title} ไม่สำเร็จ`);
      }

      const nextMessages = Array.isArray(data.messages)
        ? data.messages.filter(
            (item: unknown): item is string => typeof item === "string"
          )
        : [];

      nextMessagesByDay[config.key] = nextMessages;

      setMessagesByDay((prev) => ({
        ...prev,
        [config.key]: nextMessages,
      }));
      localStorage.setItem(config.storageKey, JSON.stringify(nextMessages));

      setLoadingByDay((prev) => ({
        ...prev,
        [config.key]: false,
      }));
      setLoadingStepByDay((prev) => ({
        ...prev,
        [config.key]: 0,
      }));
      setLoadingMessageByDay((prev) => ({
        ...prev,
        [config.key]: "",
      }));

      setSetupProgress(100);
      setSetupProgressMessage(
        "สร้าง Day 1 เรียบร้อยแล้ว วันที่เหลือให้กดสร้างทีละบล็อกได้เลย"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setSetupProgressMessage("เกิดข้อผิดพลาดระหว่างสร้าง Day 1");
    } finally {
      DAY_CONFIGS.forEach((config) => {
        setLoadingByDay((prev) => ({
          ...prev,
          [config.key]: false,
        }));
        setLoadingStepByDay((prev) => ({
          ...prev,
          [config.key]: 0,
        }));
        setLoadingMessageByDay((prev) => ({
          ...prev,
          [config.key]: "",
        }));
      });

      setTimeout(() => {
        setIsRegeneratingAll(false);
        setSetupProgress(0);
        setSetupProgressMessage("");
      }, 900);
    }
  };

  if (!hasAccess) return null;

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-3">Step 3 : Launch</h1>
          <p className="text-lg text-gray-700">
            สร้างข้อความ LINE Broadcast สำหรับช่วงเปิดขายแบบ 5 วัน
            โดยแยกเป็นรายวันตามบทบาทของแต่ละช่วงใน launch
          </p>
        </div>

        {error && (
          <div className="border border-red-300 bg-red-50 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {copyMessage && (
          <div className="border border-green-300 bg-green-50 text-green-700 rounded-lg p-4">
            {copyMessage}
          </div>
        )}

        {structuredAvatar && (
          <div className="border rounded-xl p-6 bg-gray-50 space-y-3">
            <h2 className="text-2xl font-semibold">Avatar ที่พร้อมใช้งาน</h2>
            <p className="text-sm leading-7 text-gray-800">
              {avatarSummary || "พบ Avatar ที่ยืนยันแล้ว และพร้อมใช้กับเครื่องมือนี้"}
            </p>
          </div>
        )}

        {foundation && (
          <div className="border rounded-xl p-6 bg-white space-y-4">
            <h2 className="text-2xl font-semibold">Launch Foundation</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                  Offer
                </p>
                <p className="font-medium">{foundation.offerName}</p>
                <p className="text-sm leading-7 text-gray-700 mt-2">
                  {foundation.offerDescription}
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50 space-y-2 text-sm leading-7 text-gray-700">
                <p>
                  <strong>Format:</strong> {foundation.offerFormat}
                </p>
                <p>
                  <strong>Price:</strong> {foundation.price}
                </p>
                <p>
                  <strong>Goal:</strong> {foundation.launchGoal}
                </p>
                <p>
                  <strong>Context:</strong> {foundation.launchContext || "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        {prelaunchPlan && (
          <div className="border rounded-xl p-6 bg-white space-y-4">
            <h2 className="text-2xl font-semibold">Prelaunch Continuity</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                  PLC 1
                </p>
                <p className="font-medium">{prelaunchPlan.plc1.headline}</p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                  PLC 2
                </p>
                <p className="font-medium">{prelaunchPlan.plc2.headline}</p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                  PLC 3
                </p>
                <p className="font-medium">{prelaunchPlan.plc3.headline}</p>
              </div>
            </div>
          </div>
        )}

        <div className="border rounded-xl p-6 bg-white space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Launch Setup</h2>
            <p className="text-sm leading-7 text-gray-700">
              กรอกข้อมูลเฉพาะรอบ launch นี้ เพื่อให้ข้อความ LINE Broadcast
              เชื่อมจาก prelaunch ไปสู่การปิดการขายได้ชัดขึ้น
            </p>
            <p className="text-sm leading-7 text-gray-500 mt-2">
              ปุ่มสร้างใหม่จะสร้าง Day 1 ให้ก่อน ส่วน Day 2 - Day 5
              สามารถกดสร้างแยกในแต่ละบล็อกได้
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="font-medium block mb-1">
                Bonus หรือสิ่งเพิ่มมูลค่า
              </label>
              <textarea
                value={setup.bonuses}
                onChange={(e) => updateSetup({ bonuses: e.target.value })}
                className="w-full border p-3 rounded-lg"
                rows={4}
                placeholder="เช่น โบนัสเวิร์กช็อป, template เพิ่มเติม, support, Q&A"
              />
            </div>

            <div>
              <label className="font-medium block mb-1">
                Scarcity / Urgency สร้างความเร่งด่วน
              </label>
              <textarea
                value={setup.urgencyMechanism}
                onChange={(e) =>
                  updateSetup({ urgencyMechanism: e.target.value })
                }
                className="w-full border p-3 rounded-lg"
                rows={4}
                placeholder="เช่น ปิดรับวันศุกร์ 22:00, โบนัสหมดเมื่อ cart ปิด, ราคานี้เฉพาะรอบนี้"
              />
            </div>

            <div>
              <label className="font-medium block mb-1">CTA</label>
              <textarea
                value={setup.checkoutDirection}
                onChange={(e) =>
                  updateSetup({ checkoutDirection: e.target.value })
                }
                className="w-full border p-3 rounded-lg"
                rows={4}
                placeholder="เช่น คลิกลิงก์เพื่อสมัคร, ทักแชทเพื่อรับรายละเอียด, กดปุ่มเพื่อชำระเงิน"
              />
            </div>

            <div>
              <label className="font-medium block mb-1">
                ข้อโต้แย้งหรือข้ออ้างจากลูกค้า
              </label>
              <textarea
                value={setup.priorityObjections}
                onChange={(e) =>
                  updateSetup({ priorityObjections: e.target.value })
                }
                className="w-full border p-3 rounded-lg"
                rows={4}
                placeholder="เช่น กลัวทำไม่ได้, ไม่มีเวลา, ไม่แน่ใจว่าคุ้มไหม, กลัวว่าไม่เหมาะกับตัวเอง"
              />
            </div>
          </div>

          <div>
            <label className="font-medium block mb-1">
              Testimonial หรือผลลัพธ์จากลูกค้าเก่า
            </label>
            <textarea
              value={setup.testimonials}
              onChange={(e) => updateSetup({ testimonials: e.target.value })}
              className="w-full border p-3 rounded-lg"
              rows={4}
              placeholder="เช่น ลูกค้าแบบไหนที่ทำได้, transformation ที่เคยเกิดขึ้น, before/after pattern, proof ที่อยากให้ใช้ในข้อความ Day 3"
            />
            <p className="text-sm leading-7 text-gray-500 mt-2">
              ช่องนี้เป็น optional ใช้สำหรับใส่ proof, testimonial, หรือ pattern
              ที่ช่วยให้คนอ่านรู้สึกว่าเขาก็ทำได้เหมือนกัน
            </p>
          </div>

          <div>
            <label className="font-medium block mb-1">หมายเหตุเพิ่มเติม</label>
            <textarea
              value={setup.launchNotes}
              onChange={(e) => updateSetup({ launchNotes: e.target.value })}
              className="w-full border p-3 rounded-lg"
              rows={4}
              placeholder="เช่น รอบนี้อยากเน้นคนที่ดู PLC ครบแล้ว, มีคนถามเรื่องไหนเยอะเป็นพิเศษ, โทนที่อยากใช้"
            />
          </div>

          {isRegeneratingAll && (
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between gap-3 text-sm text-gray-700">
                <span>กำลังสร้าง Launch Sequence ใหม่จาก Setup นี้...</span>
                <span>{setupProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-500"
                  style={{ width: `${setupProgress}%` }}
                />
              </div>
              <p className="text-sm leading-7 text-gray-700">
                {setupProgressMessage || "กำลังเตรียมข้อมูล..."}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={regenerateAllMessages}
              disabled={isRegeneratingAll}
              className="border px-5 py-3 rounded-lg hover:bg-gray-50 transition disabled:opacity-60"
            >
              สร้างใหม่
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {DAY_CONFIGS.map((config) => {
            const messages = messagesByDay[config.key];
            const isLoading = loadingByDay[config.key];
            const loadingStep = loadingStepByDay[config.key];
            const loadingMessage = loadingMessageByDay[config.key];
            const progressValue = LOADING_PROGRESS_BY_STEP[loadingStep] || 10;

            return (
              <div key={config.key} className="border rounded-xl p-6 bg-white space-y-5">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{config.title}</h2>
                  <p className="text-sm leading-7 text-gray-700">
                    {config.description}
                  </p>
                </div>

                {isLoading && (
                  <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                    <div className="flex items-center justify-between gap-3 text-sm text-gray-700">
                      <span>กำลังสร้างข้อความของบล็อกนี้...</span>
                      <span>{progressValue}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-black transition-all duration-500"
                        style={{ width: `${progressValue}%` }}
                      />
                    </div>
                    <p className="text-sm leading-7 text-gray-700">
                      {loadingMessage || "กำลังเตรียมข้อความ..."}
                    </p>
                  </div>
                )}

                {messages.length > 0 ? (
                  <div className="grid gap-4">
                    {messages.map((message, index) => (
                      <div
                        key={`${config.key}-${index}`}
                        className="border rounded-lg p-4 bg-gray-50 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-gray-700">
                            Message {index + 1}
                          </p>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(message)}
                            className="border px-3 py-1 rounded-lg text-sm hover:bg-white transition"
                          >
                            คัดลอก
                          </button>
                        </div>
                        <div className="whitespace-pre-wrap text-sm leading-7">
                          {message}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-gray-50 text-sm leading-7 text-gray-700">
                    ยังไม่มีข้อความสำหรับวันนี้ กดสร้างเพื่อ generate ชุดข้อความตามบทบาทของวัน
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => generateMessages(config)}
                    disabled={isLoading}
                    className="bg-black text-white px-5 py-3 rounded-lg disabled:opacity-60"
                  >
                    {isLoading
                      ? "กำลังสร้าง..."
                      : messages.length > 0
                      ? "สร้างใหม่"
                      : "สร้างข้อความ"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/launch-sequence"
            className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            ย้อนกลับ
          </a>

          <a
            href="/launch-sequence/prelaunch"
            className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            ไป Step 2
          </a>
        </div>
      </div>
    </main>
  );
}
