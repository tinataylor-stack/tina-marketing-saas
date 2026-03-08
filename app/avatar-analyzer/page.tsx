"use client";

import { useState } from "react";

type FormData = {
  business: string;
  product: string;
  roughAvatar: string;
  price: string;
  country: string;
};

export default function AvatarAnalyzerPage() {
  const [form, setForm] = useState<FormData>({
    business: "",
    product: "",
    roughAvatar: "",
    price: "",
    country: "",
  });

  const [draftResult, setDraftResult] = useState("");
  const [draftStructuredAvatar, setDraftStructuredAvatar] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const analyzeAvatar = async (regenerate = false) => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (!regenerate) {
      setDraftResult("");
      setDraftStructuredAvatar(null);
    }

    try {
      const res = await fetch("/api/avatar-analyzer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          regenerate,
          previousDraft: draftResult,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการวิเคราะห์ Avatar");
      }

      setDraftResult(data.output);
      setDraftStructuredAvatar(data.structuredAvatar);
      setHasAnalyzed(true);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !form.business.trim() ||
      !form.product.trim() ||
      !form.roughAvatar.trim() ||
      !form.price.trim() ||
      !form.country.trim()
    ) {
      setError("กรุณากรอกข้อมูลให้ครบก่อนวิเคราะห์ Avatar");
      return;
    }

    await analyzeAvatar(false);
  };

  const handleRegenerate = async () => {
    await analyzeAvatar(true);
  };

  const handleEditAgain = () => {
    setIsEditing(true);
    setError("");
    setSuccessMessage("");
  };

  const handleSaveAvatar = () => {
    if (!draftResult || !draftStructuredAvatar) {
      setError("ยังไม่มี Avatar ที่พร้อมบันทึก");
      return;
    }

    // clear old lead magnet session
    localStorage.removeItem("leadMagnetCurrentProblem");
    localStorage.removeItem("selectedBigProblem");
    localStorage.removeItem("leadMagnetSection2");
    localStorage.removeItem("leadMagnetSection3");
    localStorage.removeItem("leadMagnetSection4");
    localStorage.removeItem("leadMagnetSection5");

    // save confirmed avatar
    localStorage.setItem("confirmedAvatarAnalysis", draftResult);
    localStorage.setItem(
      "confirmedStructuredAvatar",
      JSON.stringify(draftStructuredAvatar)
    );

    setError("");
    setSuccessMessage("บันทึก Avatar เรียบร้อยแล้ว");
  };

  return (
    <main className="min-h-screen bg-white text-black p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Avatar Analyzer</h1>
        <p className="text-lg mb-8">
          เครื่องมือวิเคราะห์ Customer Avatar เชิงกลยุทธ์
        </p>

        {error && (
          <div className="mb-6 border border-red-300 bg-red-50 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 border border-green-300 bg-green-50 text-green-700 rounded-lg p-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          <div>
            <label className="font-medium block mb-1">
              ธุรกิจของคุณคืออะไร?
            </label>
            <input
              name="business"
              value={form.business}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border p-3 rounded-lg disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="font-medium block mb-1">
              สินค้าหรือบริการที่คุณขายคืออะไร?
            </label>
            <textarea
              name="product"
              value={form.product}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border p-3 rounded-lg disabled:bg-gray-100"
              rows={4}
            />
          </div>

          <div>
            <label className="font-medium block mb-1">
              กลุ่มเป้าหมายที่คุณ “คิดว่า” ใช่ตอนนี้คือใคร?
            </label>
            <textarea
              name="roughAvatar"
              value={form.roughAvatar}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border p-3 rounded-lg disabled:bg-gray-100"
              rows={5}
            />
          </div>

          <div>
            <label className="font-medium block mb-1">
              ราคาสินค้าหรือช่วงราคา
            </label>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border p-3 rounded-lg disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="font-medium block mb-1">
              ขายที่ประเทศไหน
            </label>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border p-3 rounded-lg disabled:bg-gray-100"
            />
          </div>

          {isEditing && (
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-6 py-3 rounded-lg disabled:opacity-60"
            >
              {loading ? "กำลังวิเคราะห์..." : "วิเคราะห์ Avatar"}
            </button>
          )}
        </form>

        {draftResult && (
          <div className="mt-10 max-w-4xl border rounded-xl p-6 bg-gray-50">
            <h2 className="text-2xl font-semibold mb-4">Draft Avatar Analysis</h2>

            <div className="whitespace-pre-wrap text-sm leading-7">
              {draftResult}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSaveAvatar}
                className="bg-black text-white px-6 py-3 rounded-lg"
              >
                บันทึก Avatar นี้
              </button>

              <button
                type="button"
                onClick={handleRegenerate}
                disabled={loading}
                className="border px-6 py-3 rounded-lg disabled:opacity-60"
              >
                {loading ? "กำลังสร้างใหม่..." : "วิเคราะห์ใหม่"}
              </button>

              <button
                type="button"
                onClick={handleEditAgain}
                className="border px-6 py-3 rounded-lg"
              >
                แก้ข้อมูลแล้ววิเคราะห์ใหม่
              </button>

              <button
                type="button"
                onClick={() => (window.location.href = "/")}
                className="border px-6 py-3 rounded-lg"
              >
                กลับหน้าแรก
              </button>
            </div>
          </div>
        )}

        {hasAnalyzed && isEditing && (
          <div className="mt-6 text-sm text-gray-600">
            ตอนนี้คุณสามารถแก้ข้อมูลด้านบน แล้วกด “วิเคราะห์ Avatar” ใหม่ได้
          </div>
        )}
      </div>
    </main>
  );
}