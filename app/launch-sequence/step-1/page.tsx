"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";

type LaunchFoundationForm = {
  offerName: string;
  offerDescription: string;
  offerFormat: string;
  price: string;
  launchGoal: string;
  launchContext: string;
};

const DEFAULT_FORM: LaunchFoundationForm = {
  offerName: "",
  offerDescription: "",
  offerFormat: "",
  price: "",
  launchGoal: "",
  launchContext: "",
};

export default function LaunchFoundationStepPage() {
  const [hasAccess, setHasAccess] = useState(false);
  const [avatarAnalysis, setAvatarAnalysis] = useState("");
  const [structuredAvatar, setStructuredAvatar] = useState<any>(null);
  const [form, setForm] = useState<LaunchFoundationForm>(DEFAULT_FORM);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const savedAccess = localStorage.getItem("appAccessGranted");

    if (savedAccess !== "yes") {
      window.location.href = "/";
      return;
    }

    setHasAccess(true);

    const savedAnalysis = localStorage.getItem("confirmedAvatarAnalysis");
    const savedStructured = localStorage.getItem("confirmedStructuredAvatar");

    if (!savedAnalysis || !savedStructured) {
      setError("ยังไม่พบ Avatar ที่ยืนยันแล้ว กรุณาไปวิเคราะห์ Avatar ก่อน");
      return;
    }

    setAvatarAnalysis(savedAnalysis);

    try {
      setStructuredAvatar(JSON.parse(savedStructured));
    } catch {
      setError("อ่านข้อมูล Avatar ไม่สำเร็จ กรุณาวิเคราะห์ใหม่");
    }

    const savedForm: LaunchFoundationForm = {
      offerName: localStorage.getItem("launchSequenceOffer") || "",
      offerDescription: localStorage.getItem("launchSequenceOfferDetails") || "",
      offerFormat: localStorage.getItem("launchSequenceOfferFormat") || "",
      price: localStorage.getItem("launchSequencePrice") || "",
      launchGoal: localStorage.getItem("launchSequenceGoal") || "",
      launchContext: localStorage.getItem("launchSequenceContext") || "",
    };

    setForm(savedForm);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (
      !form.offerName.trim() ||
      !form.offerDescription.trim() ||
      !form.offerFormat.trim() ||
      !form.price.trim() ||
      !form.launchGoal.trim()
    ) {
      setError("กรุณากรอกข้อมูลวางกลยุทธ์ Launch สินค้าให้ครบก่อน");
      return;
    }

    localStorage.setItem("launchSequenceOffer", form.offerName.trim());
    localStorage.setItem(
      "launchSequenceOfferDetails",
      form.offerDescription.trim()
    );
    localStorage.setItem("launchSequenceOfferFormat", form.offerFormat.trim());
    localStorage.setItem("launchSequencePrice", form.price.trim());
    localStorage.setItem("launchSequenceGoal", form.launchGoal.trim());
    localStorage.setItem("launchSequenceContext", form.launchContext.trim());

    setSuccessMessage("บันทึกข้อมูลวางกลยุทธ์ Launch สินค้าเรียบร้อยแล้ว");
  };

  if (!hasAccess) return null;

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-3">
            Step 1 : วางกลยุทธ์ Launch สินค้า
          </h1>
          <p className="text-lg text-gray-700">
            กำหนดข้อมูลพื้นฐานของ Offer และบริบทการเปิดตัว
            เพื่อใช้เป็นแกนของการวางกลยุทธ์ Launch สินค้า
          </p>
        </div>

        {error && (
          <div className="border border-red-300 bg-red-50 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {avatarAnalysis && (
          <div className="border rounded-xl p-6 bg-gray-50">
            <h2 className="text-2xl font-semibold mb-4">Avatar ที่ใช้อยู่</h2>

            {structuredAvatar?.shortSummary && (
              <p className="mb-4 text-sm text-gray-700 leading-7">
                <strong>สรุปสั้น:</strong> {structuredAvatar.shortSummary}
              </p>
            )}

            <div className="whitespace-pre-wrap text-sm leading-7">
              {avatarAnalysis}
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
          <div>
            <label className="font-medium block mb-1">
              Offer ที่กำลังจะเปิดตัวคืออะไร?
            </label>
            <input
              name="offerName"
              value={form.offerName}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              placeholder="เช่น คอร์สลดน้ำหนัก 8 สัปดาห์"
            />
          </div>

          <div>
            <label className="font-medium block mb-1">
              Offer นี้ช่วยลูกค้าเรื่องอะไร?
            </label>
            <textarea
              name="offerDescription"
              value={form.offerDescription}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              rows={4}
              placeholder="อธิบายผลลัพธ์ ปัญหาที่ช่วยแก้ และ transformation หลัก"
            />
          </div>

          <div>
            <label className="font-medium block mb-1">
              รูปแบบของ Offer คืออะไร?
            </label>
            <input
              name="offerFormat"
              value={form.offerFormat}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              placeholder="เช่น คอร์สออนไลน์ เวิร์กช็อป โปรแกรมกลุ่ม หรือบริการ"
            />
          </div>

          <div>
            <label className="font-medium block mb-1">ราคา หรือช่วงราคา</label>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              placeholder="เช่น 4,900 บาท หรือ 15,000 - 25,000 บาท"
            />
          </div>

          <div>
            <label className="font-medium block mb-1">
              เป้าหมายของการเปิดตัวครั้งนี้คืออะไร?
            </label>
            <textarea
              name="launchGoal"
              value={form.launchGoal}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              rows={3}
              placeholder="เช่น ต้องการเปิดรับรอบแรก สร้างยอดขายรอบ launch หรือทดสอบ positioning ใหม่"
            />
          </div>

          <div>
            <label className="font-medium block mb-1">
              บริบทเพิ่มเติมของการเปิดตัว
            </label>
            <textarea
              name="launchContext"
              value={form.launchContext}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              rows={4}
              placeholder="เช่น มีโบนัสอะไร ใช้ช่องทางไหน หรือมีข้อจำกัดอะไรที่ควรรู้"
            />
          </div>

          {successMessage && (
            <div className="border border-green-300 bg-green-50 text-green-700 rounded-lg p-4">
              {successMessage}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <a
              href="/launch-sequence"
              className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
            >
              ย้อนกลับ
            </a>

            <button
              type="submit"
              className="bg-black text-white px-6 py-3 rounded-lg"
            >
              บันทึก
            </button>

            <a
              href="/launch-sequence/prelaunch"
              className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition"
            >
              สร้าง Prelaunch
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
