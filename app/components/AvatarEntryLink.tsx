"use client";

import { useEffect, useState } from "react";

type AvatarEntryLinkProps = {
  className: string;
};

export default function AvatarEntryLink({
  className,
}: AvatarEntryLinkProps) {
  const [label, setLabel] = useState(
    "เริ่มต้นที่นี่ (วิเคราะห์ Avatar ลูกค้าของคุณ)"
  );

  useEffect(() => {
    const savedAvatar = localStorage.getItem("confirmedStructuredAvatar");

    if (savedAvatar) {
      setLabel("ดู Avatar ของคุณ");
    }
  }, []);

  return (
    <a href="/avatar-analyzer" className={className}>
      {label}
    </a>
  );
}
