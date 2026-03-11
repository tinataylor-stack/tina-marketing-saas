import Link from "next/link";

export default function Navbar() {
  return (
    <div className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          AI Marketing Tools
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-gray-700 hover:text-black">
            หน้าแรก
          </Link>

          <Link
            href="/avatar-analyzer"
            className="text-gray-700 hover:text-black"
          >
            Avatar Analyzer
          </Link>

          <Link
            href="/lead-magnet-builder"
            className="text-gray-700 hover:text-black"
          >
            Lead Magnet Builder
          </Link>

          <Link
            href="/lead-magnet-content"
            className="text-gray-700 hover:text-black"
          >
            Content Tool
          </Link>
        </div>
      </div>
    </div>
  );
}