"use client";

import { useApp } from "./AppProvider";
import { fmt, won, type Shown } from "@/lib/scoring";

export function RestCard({ x, top }: { x: Shown; top: number }) {
  const { reco, openDetail, adBump } = useApp();
  const { r, b } = x;
  const isAd = r.id === reco?.promoId;
  return (
    <button
      type="button"
      className={"rest" + (isAd ? " ad" : "")}
      onClick={() => { if (isAd) adBump(r.id, "click"); openDetail(r.id); }}
    >
      <div className="hd">
        <div>
          <div className="nm">
            <span className="rank">{x.rank}</span>
            {r.name}
            {isAd && <span className="adtag">광고</span>}
          </div>
          <div className="meta">{r.cat} · {r.dist}m · 도보 {r.walk}분</div>
        </div>
        <div className="fit">적합도 {Math.max(1, Math.round((b.s / top) * 100))}%</div>
      </div>
      <div className="menu">추천 메뉴 <b>{b.name}</b></div>
      <div className="hd" style={{ marginTop: 6 }}>
        <span className="meta">{b.n.kcal}kcal · 단백질 {b.n.protein}g · 나트륨 {fmt(b.n.sodium)}mg</span>
        <span className="price">{won(b.price)}</span>
      </div>
      <div className="why">{b.why.map((w) => <span key={w}>{w}</span>)}</div>
      {isAd && <div className="adnote">광고 식당은 내 영양 상태와 예산에 맞을 때만 위에 보여드려요.</div>}
    </button>
  );
}
