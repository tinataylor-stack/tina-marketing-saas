export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black p-10">
      <div className="max-w-3xl mx-auto space-y-10">

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            AI Marketing Tools
          </h1>

          <p className="text-lg text-gray-700">
            เครื่องมือช่วยวิเคราะห์ลูกค้า และออกแบบ Lead Magnet สำหรับธุรกิจ
          </p>
        </div>

        <div className="grid gap-6">

          <a
            href="/avatar-analyzer"
            className="border rounded-xl p-6 hover:bg-gray-50 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">
              Avatar Analyzer
            </h2>

            <p className="text-gray-700">
              วิเคราะห์ Customer Avatar เชิงกลยุทธ์ เพื่อเข้าใจปัญหา ความต้องการ
              และโอกาสของลูกค้า
            </p>
          </a>

          <a
            href="/lead-magnet-builder"
            className="border rounded-xl p-6 hover:bg-gray-50 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">
              Lead Magnet Builder
            </h2>

            <p className="text-gray-700">
              สร้างโครง Lead Magnet แบบเป็นขั้นตอน ตั้งแต่ Big Problem
              ไปจนถึง Draft พร้อมใช้
            </p>
          </a>

        </div>

        <div className="text-sm text-gray-500 text-center pt-6">
          เวอร์ชันทดสอบสำหรับผู้ใช้กลุ่มแรก
        </div>

      </div>
    </main>
  );
}