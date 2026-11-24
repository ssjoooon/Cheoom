"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "오늘" },
  { href: "/map", label: "지도" },
  { href: "/history", label: "기록" },
  { href: "/ads", label: "광고주" },
];

export function TopBar() {
  const path = usePathname();
  return (
    <div className="topbar">
      <div className="in">
        <div className="brand">
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <path d="M5 18h30a15 15 0 0 1-30 0z" fill="currentColor" />
            <circle cx="14" cy="13" r="4" fill="#F2C230" />
            <circle cx="22" cy="11" r="4.5" fill="#D9483B" />
            <circle cx="29" cy="14" r="3.5" fill="currentColor" opacity=".55" />
          </svg>
          <span>채움</span>
        </div>
        <nav className="tabs" aria-label="화면">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} aria-current={path === t.href ? "page" : undefined}>
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
