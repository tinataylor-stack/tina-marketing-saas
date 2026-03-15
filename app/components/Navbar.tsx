import Link from "next/link";
import AvatarEntryLink from "./AvatarEntryLink";

export default function Navbar() {
  return (
    <div className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          AI Marketing Tools
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/content-generator"
            className="text-gray-700 hover:text-black"
          >
            Content Generator
          </Link>

          <Link
            href="/lead-magnet-builder"
            className="text-gray-700 hover:text-black"
          >
            Lead Magnet
          </Link>

          <Link
            href="/launch-sequence"
            className="text-gray-700 hover:text-black"
          >
            Launch
          </Link>

          <AvatarEntryLink className="bg-black text-white px-4 py-2 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
