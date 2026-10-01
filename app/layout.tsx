import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "차근차근 | 내 생활에 맞는 중고차",
  description: "구매예산과 월 유지비를 함께 비교하는 중고차 직거래 커뮤니티",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
