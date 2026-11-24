"use client";

import { useEffect, useRef } from "react";
import { useApp } from "./AppProvider";
import { RESTS } from "@/lib/data";
import { deficitOf, fmt, scoreMenu, won } from "@/lib/scoring";

export function DetailSheet() {
  const { detailId, openDetail, area, last, goal, budget, reco, eatMenu } = useApp();
  const ref = useRef<HTMLDialogElement>(null);
  const r = RESTS.find((x) => x.id === detailId) || null;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (r && !d.open) d.showModal();
    if (!r && d.open) d.close();
  }, [r]);

  const isAd = !!r && r.id === reco?.promoId;
  const ctx = last ? deficitOf(last.total, goal) : null;
  const scores = r && ctx ? r.menus.map(([, p, nu]) => scoreMenu(nu, p, ctx, goal, budget).s) : null;
  const bestI = scores ? scores.indexOf(Math.max(...scores)) : -1;
  const top = scores ? Math.max(0.0001, ...scores) : 1;

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby="dName"
      onClose={() => openDetail(null)}
      onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
    >
      {r && (
        <div className="in">
          <button className="btn ghost sm close" type="button" aria-label="닫기" onClick={() => ref.current?.close()}>닫기</button>
          <h2 id="dName">{r.name}</h2>
          <div className="meta">{r.cat} · {area || "주변"}에서 {r.dist}m · 도보 {r.walk}분</div>
          <div className="facts">
            <span>영업 {r.hours}</span>
            <span>메뉴 {r.menus.length}개</span>
            <span>{won(Math.min(...r.menus.map((m) => m[1])))}부터</span>
          </div>
          {isAd && <p className="adnote">광고 · 지금 내 영양 상태와 예산에 맞아서 보여드리는 식당이에요.</p>}
          <div>
            {r.menus.map(([name, price, n], i) => (
              <div key={name} className={"mi" + (i === bestI ? " best" : "")}>
                <div className="top"><div className="mn">{name}</div><div className="price">{won(price)}</div></div>
                <div className="nut">
                  <span>열량 {fmt(n.kcal)}kcal</span><span>단백질 {fmt(n.protein)}g</span><span>식이섬유 {fmt(n.fiber)}g</span>
                  <span>비타민C {fmt(n.vitC)}mg</span><span>철분 {fmt(n.iron)}mg</span><span>칼슘 {fmt(n.calcium)}mg</span><span>나트륨 {fmt(n.sodium)}mg</span>
                </div>
                <div className="act">
                  <span className="tag">
                    {scores
                      ? price > budget ? "예산 초과" : "나에게 맞는 정도 " + Math.max(0, Math.round((scores[i] / top) * 100)) + "%"
                      : "오늘 식단을 분석하면 맞춤 정도를 알려드려요"}
                  </span>
                  <button className="btn ghost sm" type="button" onClick={() => eatMenu(name, n)}>이 메뉴 먹었어요</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </dialog>
  );
}
