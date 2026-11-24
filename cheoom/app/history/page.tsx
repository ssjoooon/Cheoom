"use client";

import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { GOALN, NUTS, TARGET } from "@/lib/data";
import { fmt, todayKey } from "@/lib/scoring";

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

export default function HistoryPage() {
  const { history, goal, removeDay, ready } = useApp();
  // 저장된 기록은 클라이언트에서만 복원되므로, 복원 전에는 날짜 의존 UI를 그리지 않음
  if (!ready) return <section className="step"><h2>식단 기록</h2></section>;

  const keys = Object.keys(history).sort().reverse();
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(todayKey(d)); }
  const maxK = Math.max(2600, ...days.map((k) => (history[k] ? history[k].total.kcal : 0)));
  const tgtK = TARGET[goal].kcal;

  return (
    <section className="step">
      <h2>식단 기록</h2>
      <p className="sub">분석할 때마다 그날 기록이 이 브라우저에 자동으로 저장돼요. 서버로 보내지 않아요.</p>
      <p className="sub" style={{ margin: "6px 0 0" }}>최근 7일 열량</p>
      <div
        className="chart" role="img"
        aria-label={"최근 7일 섭취 열량: " + days.map((k) => k.slice(5) + " " + (history[k] ? Math.round(history[k].total.kcal) + "kcal" : "기록 없음")).join(", ")}
      >
        <div className="goal" style={{ bottom: (tgtK / maxK) * 100 + "%" }}><span>목표 {tgtK.toLocaleString("ko-KR")}kcal</span></div>
        {days.map((k) => {
          const h = history[k];
          return (
            <div className="col" key={k}>
              <i
                className={h ? (h.total.kcal > TARGET[h.goal || goal].kcal ? "over" : "") : "none"}
                style={h ? { height: Math.max(3, (h.total.kcal / maxK) * 100) + "%" } : undefined}
              />
            </div>
          );
        })}
      </div>
      <div className="xl">
        {days.map((k) => <span key={k}>{k === todayKey() ? "오늘" : DOW[new Date(k + "T00:00").getDay()]}</span>)}
      </div>

      {!keys.length ? (
        <>
          <p className="empty">아직 기록이 없어요. 오늘 먹은 것을 분석하면 여기에 쌓여요.</p>
          <Link className="btn ghost" href="/">오늘 기록하기</Link>
        </>
      ) : keys.map((k) => {
        const h = history[k];
        const tg = TARGET[h.goal] || TARGET.keep;
        const dt = new Date(k + "T00:00");
        const low = (["protein", "fiber", "vitC", "iron", "calcium"] as const).filter((x) => h.total[x] / tg[x] < 0.5).map((x) => NUTS.find((n) => n.k === x)!.n);
        return (
          <div className="day" key={k}>
            <div className="hd">
              <div className="dt">{dt.getMonth() + 1}월 {dt.getDate()}일 ({DOW[dt.getDay()]}){k === todayKey() ? " · 오늘" : ""}</div>
              <span className="tag">{GOALN[h.goal] || ""}</span>
            </div>
            <div className="plate" style={{ margin: "6px 0" }}>{(h.items || []).map((i, n) => <span key={i + n}>{i}</span>)}</div>
            <div className="nut">
              <span>열량 {fmt(h.total.kcal)}kcal ({Math.round((h.total.kcal / tg.kcal) * 100)}%)</span>
              <span>단백질 {fmt(h.total.protein)}g</span><span>식이섬유 {fmt(h.total.fiber)}g</span><span>나트륨 {fmt(h.total.sodium)}mg</span>
            </div>
            <div className="hd" style={{ marginTop: 8 }}>
              <span className="tag">{low.length ? "부족: " + low.join(", ") : "부족한 영양 없음"}</span>
              <button className="btn ghost sm" type="button" onClick={() => { if (confirm(`${dt.getMonth() + 1}월 ${dt.getDate()}일 기록을 삭제할까요?`)) removeDay(k); }}>삭제</button>
            </div>
          </div>
        );
      })}
    </section>
  );
}
