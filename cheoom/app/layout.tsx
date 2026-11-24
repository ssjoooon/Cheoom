import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/components/AppProvider";
import { TopBar } from "@/components/TopBar";
import { DetailSheet } from "@/components/DetailSheet";
import { Toast } from "@/components/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "채움 — 오늘 부족한 걸 채워주는 한 끼",
  description: "오늘 먹은 음식과 약을 기준으로 부족한 영양을 채워주는 근처 식당을 추천합니다. (시연용 가상 데이터)",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=IBM+Plex+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppProvider>
          <TopBar />
          <div className="wrap">
            {children}
            <p className="disclaimer">
              채움의 분석은 참고용 추정치이며 의학적 진단이나 처방을 대신하지 않습니다. 약과 음식의 상호작용은 반드시 의사나 약사와 확인하세요. 식당, 메뉴, 상품, 가격은 모두 시연용 가상 데이터입니다.
            </p>
          </div>
          <DetailSheet />
          <Toast />
        </AppProvider>
      </body>
    </html>
  );
}
