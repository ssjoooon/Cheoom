"use client";

import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { RestCard } from "@/components/RestCard";
import { GOALN, NUTS, PRODUCTS, TARGET, type Goal } from "@/lib/data";
import { deficitOf, fmt, won } from "@/lib/scoring";

export default function TodayPage() {
  const a = useApp();
  const { goal, budget, last, reco } = a;
  const tgt = TARGET[goal];
  const ctx = last ? deficitOf(last.total, goal) : null;
  const lows = ctx ? NUTS.filter((x) => (ctx.d[x.k] ?? 0) > 0.5).map((x) => x.n) : [];
  const shop = ctx
    ? PRODUCTS.map((p) => ({ ...p, s: p.fills.reduce((acc, k) => acc + (ctx.d[k] || 0), 0) })).sort((x, y) => y.s - x.s).slice(0, 3)
    : [];

  return (
    <>
      <header className="hero">
        <h1>오늘 먹은 걸 알려주면,<br />모자란 만큼 근처에서 채워드려요</h1>
        <p>먹은 음식과 복용 중인 약을 적거나 사진으로 올리세요. 목표와 예산에 맞는 가까운 한 끼를 찾아드립니다.</p>
      </header>

      <section className="step" aria-labelledby="s1">
        <h2 id="s1">내 기준</h2>
        <p className="sub">한 번 정해두면 다음에도 기억해요.</p>
        <label className="f" id="goalLabel">목표</label>
        <div className="seg" role="group" aria-labelledby="goalLabel">
          {(Object.keys(GOALN) as Goal[]).map((g) => (
            <button key={g} type="button" aria-pressed={goal === g} onClick={() => a.setGoal(g)}>{GOALN[g]}</button>
          ))}
        </div>
        <label className="f" htmlFor="budget">한 끼 예산</label>
        <div className="row">
          <input id="budget" type="range" min={5000} max={30000} step={1000} value={budget} onChange={(e) => a.setBudget(+e.target.value)} />
          <span className="budget-val">{won(budget)}</span>
        </div>
        <label className="f" htmlFor="area">지금 있는 곳</label>
        <input id="area" type="text" value={a.area} onChange={(e) => a.setArea(e.target.value)} aria-describedby="areaNote" />
        <div className="status" id="areaNote">데모에서는 가상의 역삼역 주변 식당으로 보여드려요.</div>
      </section>

      <section className="step" aria-labelledby="s2">
        <h2 id="s2">오늘 먹은 것</h2>
        <p className="sub">대충 적어도 괜찮아요. 쉼표나 줄바꿈으로 나눠주세요.</p>
        <label className="f" htmlFor="foods">음식</label>
        <textarea id="foods" value={a.foods} onChange={(e) => a.setFoods(e.target.value)} placeholder="예: 아침 아메리카노, 점심 라면이랑 삼각김밥" />
        <div className="examples">
          {["아메리카노, 라면, 삼각김밥", "토스트, 우유, 제육볶음", "바나나, 짜장면"].map((t) => (
            <button key={t} type="button" onClick={() => a.setFoods(t)}>{t}</button>
          ))}
        </div>
        <div className="photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {a.photo && <img src={a.photo.preview} alt="올린 음식 사진 미리보기" />}
          <div className="ptxt">{a.photo ? "사진을 받았어요. 분석할 때 함께 읽을게요." : "음식 사진을 올리면 무엇을 먹었는지 알아서 읽어요."}</div>
          <label className="btn ghost" htmlFor="photo">사진 올리기</label>
          <input id="photo" type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) a.pickPhoto(f); }} />
        </div>
        <label className="f" htmlFor="meds">복용 중인 약·영양제</label>
        <input id="meds" type="text" value={a.meds} onChange={(e) => a.setMeds(e.target.value)} placeholder="예: 철분제, 고혈압약" />
        <div className="examples">
          {["철분제", "고혈압약", "항생제"].map((t) => (
            <button key={t} type="button" onClick={() => a.setMeds(a.meds.trim() ? a.meds.trim() + ", " + t : t)}>{t}</button>
          ))}
        </div>
        <button className="btn main" type="button" disabled={a.busy} onClick={async () => {
          if (await a.analyze()) requestAnimationFrame(() => document.getElementById("r1")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));
        }}>
          부족한 영양 확인하고 식당 찾기
        </button>
        <div className="status" role="status">{a.status}</div>
      </section>

      {last && reco && ctx && (
        <>
          <section className="step" aria-labelledby="r1">
            <h2 id="r1">오늘 섭취 분석</h2>
            <div className="plate">{last.items.map((i, k) => <span key={i + k}>{i}</span>)}</div>
            <div>
              {NUTS.map((x) => {
                const v = last.total[x.k], t = tgt[x.k], pct = Math.round((v / t) * 100);
                const cls = x.limit ? (pct >= 80 ? " over" : "") : x.k === "kcal" ? (pct > 100 ? " over" : "") : pct < 50 ? " low" : "";
                return (
                  <div key={x.k} className={"gauge" + cls}>
                    <div className="top">
                      <span><b>{x.n}</b> {fmt(v)}{x.u}</span>
                      <span className="tag">{x.limit ? "상한 " : "목표 "}{fmt(t)}{x.u} · {pct}%</span>
                    </div>
                    <div className="bar"><i style={{ width: Math.min(100, pct) + "%" }} /></div>
                  </div>
                );
              })}
            </div>
            <div className="need">
              {lows.length
                ? `남은 하루 동안 ${lows.join(", ")}을(를) 채우면 좋아요. 남은 열량은 약 ${fmt(ctx.kcalLeft)}kcal예요.`
                : `영양 균형이 괜찮아요. 남은 열량은 약 ${fmt(ctx.kcalLeft)}kcal예요.`}
            </div>
            {last.summary && <p className="summary">{last.summary}</p>}
            {last.notes.map((n, i) => (
              <div className="med" key={i}><b>💊 {n.med || "복용 약"}</b>{n.note}</div>
            ))}
          </section>

          <section className="step" aria-labelledby="r2">
            <div className="hd"><h2 id="r2">지금 가면 좋은 곳</h2><Link className="btn ghost sm" href="/map">지도로 보기</Link></div>
            <p className="sub">{a.area || "주변"} · 예산 {won(budget)} 이내 · 부족한 영양을 잘 채우는 순서예요.</p>
            {reco.shown.length
              ? reco.shown.map((x) => <RestCard key={x.r.id} x={x} top={reco.top} />)
              : <p className="sub">예산 안에서 맞는 곳이 없어요. 예산을 조금 올려보세요.</p>}
          </section>

          <section className="step" aria-labelledby="r3">
            <h2 id="r3">집에서 채우기</h2>
            <p className="sub">부족한 영양을 바로 보충할 수 있는 채움 스토어 상품이에요.</p>
            <div className="shop">
              {shop.map((p) => (
                <div className="prod" key={p.name}>
                  <div className="pn">{p.name}</div>
                  <div className="pd">{p.desc}</div>
                  <div className="pp">{won(p.price)}</div>
                  <button className="btn ghost sm" type="button" onClick={() => a.toast(`${p.name}을(를) 장바구니에 담았어요 (데모)`)}>장바구니 담기</button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
