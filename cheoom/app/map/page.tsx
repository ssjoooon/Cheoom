"use client";

import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { RestCard } from "@/components/RestCard";
import { RESTS } from "@/lib/data";

const ROADS: [string, number, string, number, number][] = [
  ["M-560 0H560", 46, "테헤란로", -520, -14], ["M0 -420V420", 34, "", 0, 0], ["M-560 -230H560", 18, "", 0, 0],
  ["M-560 240H560", 18, "", 0, 0], ["M-360 -420V420", 18, "", 0, 0], ["M330 -420V420", 18, "", 0, 0],
];

export default function MapPage() {
  const { reco, openDetail, adBump, last } = useApp();
  const shown = reco?.shown ?? [];
  const promoId = reco?.promoId ?? null;
  const rankMap: Record<string, number> = {};
  shown.forEach((x) => (rankMap[x.r.id] = x.rank));
  const order = RESTS.slice().sort((a, b) => (rankMap[a.id] ? 1 : 0) - (rankMap[b.id] ? 1 : 0));

  return (
    <section className="step">
      <h2>주변 식당 지도</h2>
      <p className="sub">
        {last
          ? "번호는 오늘 내 상황에 맞는 추천 순위예요. 핀을 누르면 메뉴와 영양 정보를 볼 수 있어요."
          : "오늘 먹은 걸 분석하면 나에게 맞는 순서로 번호가 붙어요. 핀을 누르면 메뉴를 볼 수 있어요."}
      </p>
      <div className="mapbox">
        <svg viewBox="-560 -420 1120 840" role="img" aria-label="역삼역 주변 식당 지도">
          <rect x={-560} y={-420} width={1120} height={840} fill="var(--block)" />
          <rect x={200} y={230} width={260} height={150} rx={24} fill="var(--park)" />
          <text x={330} y={310} textAnchor="middle" fontSize={22} fill="var(--soft)">공원</text>
          {ROADS.map(([d, w, label, lx, ly]) => (
            <g key={d}>
              <path d={d} stroke="var(--road)" strokeWidth={w} fill="none" />
              {label && <text x={lx} y={ly + 30} fontSize={20} fill="var(--soft)">{label}</text>}
            </g>
          ))}
          <rect x={-34} y={-20} width={68} height={40} rx={20} fill="#3BA34A" />
          <text x={0} y={7} textAnchor="middle" fontSize={18} fill="#fff" fontWeight={700}>역삼</text>
          <g transform="translate(60,40)">
            <circle r={26} fill="var(--tomato)" opacity={0.18} />
            <circle r={11} fill="var(--tomato)" stroke="#fff" strokeWidth={4} />
          </g>
          {order.map((r) => {
            const rank = rankMap[r.id], isAd = r.id === promoId;
            const open = () => { if (isAd) adBump(r.id, "click"); openDetail(r.id); };
            return (
              <g
                key={r.id} className="pin" transform={`translate(${r.x},${r.y})`} tabIndex={0} role="button"
                aria-label={`${r.name}${rank ? `, 추천 ${rank}위` : ""}${isAd ? ", 광고" : ""}`}
                onClick={open}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
              >
                {rank ? (
                  <>
                    <path d="M0 0 C-6 -16 -26 -24 -26 -44 A26 26 0 1 1 26 -44 C26 -24 6 -16 0 0Z" fill={isAd ? "var(--citrus)" : "var(--ink)"} />
                    <circle className="ring" cx={0} cy={-44} r={28} fill="none" stroke="transparent" strokeWidth={0} />
                    <text x={0} y={-36} textAnchor="middle" fontSize={24} fontWeight={700} fill={isAd ? "#2A2208" : "var(--paper)"}>{rank}</text>
                    <text x={0} y={24} textAnchor="middle" fontSize={17} fontWeight={700} fill="var(--ink)" stroke="var(--block)" strokeWidth={5} paintOrder="stroke">{r.name}</text>
                  </>
                ) : (
                  <>
                    <circle className="ring" r={12} fill="var(--soft)" opacity={0.55} />
                    <text x={0} y={30} textAnchor="middle" fontSize={15} fill="var(--soft)" stroke="var(--block)" strokeWidth={4} paintOrder="stroke">{r.name}</text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="legend">
        <span><i style={{ background: "var(--ink)" }} />추천 순위</span>
        <span><i style={{ background: "var(--citrus)" }} />광고(나에게 맞을 때만)</span>
        <span><i style={{ background: "var(--soft)", opacity: 0.5 }} />기타 식당</span>
        <span><i style={{ background: "var(--tomato)" }} />내 위치</span>
      </div>
      <div className="maplist">
        {shown.length
          ? shown.map((x) => <RestCard key={x.r.id} x={x} top={shown[0].b.s} />)
          : <Link className="btn ghost" href="/" style={{ marginTop: 12 }}>오늘 먹은 것 입력하러 가기</Link>}
      </div>
    </section>
  );
}
