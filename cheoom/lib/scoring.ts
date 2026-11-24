import { MED_DB, FOOD_DB, NUTS, N, TARGET, emptyNut, type Goal, type Nut, type Rest } from "./data";

export const won = (n: number) => n.toLocaleString("ko-KR") + "원";
export const fmt = (v: number) => (v >= 100 ? Math.round(v).toLocaleString("ko-KR") : String(Math.round(v * 10) / 10));
export function todayKey(d = new Date()) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

export type Analysis = {
  items: string[];
  total: Nut;
  notes: { med: string; note: string }[];
  summary: string;
};
export type DayEntry = Analysis & { date: string; goal: Goal; meds: string };

/** API 키가 없거나 호출이 실패했을 때 쓰는 간이 분석 (데모 음식 사전) */
export function localAnalyze(text: string, meds: string): Analysis {
  const parts = text.split(/[,\n、]|그리고|이랑|하고/).map((s) => s.trim()).filter(Boolean);
  const items: string[] = [];
  const total = emptyNut();
  parts.forEach((p) => {
    const hit = FOOD_DB.find(([name]) => p.includes(name));
    if (hit) {
      items.push(hit[0]);
      NUTS.forEach((x) => (total[x.k] += hit[1][x.k]));
    } else {
      items.push(p.replace(/^(아침|점심|저녁|간식)\s*/, ""));
      const g = N(350, 10, 2, 5, 1.5, 50, 700);
      NUTS.forEach((x) => (total[x.k] += g[x.k]));
    }
  });
  const notes: Analysis["notes"] = [];
  MED_DB.forEach(([re, med, note]) => { if (re.test(meds)) notes.push({ med, note }); });
  return { items, total, notes, summary: "" };
}

export function deficitOf(total: Nut, goal: Goal) {
  const tgt = TARGET[goal];
  const d: Record<string, number> = {};
  (["protein", "fiber", "vitC", "iron", "calcium"] as const).forEach((k) => (d[k] = Math.max(0, 1 - total[k] / tgt[k])));
  return { d, kcalLeft: Math.max(0, tgt.kcal - total.kcal), sodiumLeft: Math.max(0, tgt.sodium - total.sodium) };
}
export type Ctx = ReturnType<typeof deficitOf>;

export function scoreMenu(n: Nut, price: number, ctx: Ctx, goal: Goal, budget: number) {
  const tgt = TARGET[goal];
  let s = 0;
  const why: string[] = [];
  (["protein", "fiber", "vitC", "iron", "calcium"] as const).forEach((k) => {
    const need = tgt[k] * Math.max(ctx.d[k], 0.0001);
    const cover = Math.min(1, n[k] / need);
    s += cover * ctx.d[k] * (k === "protein" && goal === "muscle" ? 1.8 : 1);
    if (ctx.d[k] > 0.3 && n[k] / tgt[k] >= 0.25) why.push(NUTS.find((x) => x.k === k)!.n + " 보충");
  });
  let goalMiss = false;
  if (goal === "lose" && n.kcal > ctx.kcalLeft * 0.6) { s -= 0.8; goalMiss = true; }
  else if (n.kcal <= Math.max(ctx.kcalLeft, 400)) why.push("열량 적당");
  if (n.kcal > Math.max(ctx.kcalLeft, 500) + 300) { s -= 0.4; goalMiss = true; }
  if (n.sodium > ctx.sodiumLeft) s -= 0.5; else if (n.sodium < 800) why.push("저염");
  const overBudget = price > budget;
  if (overBudget) s -= 2; else why.push("예산 안");
  return { s, why, overBudget, goalMiss };
}

export type Best = ReturnType<typeof scoreMenu> & { i: number; name: string; price: number; n: Nut };
export function bestFor(r: Rest, ctx: Ctx, goal: Goal, budget: number): Best {
  let best: Best | null = null;
  r.menus.forEach(([name, price, n], i) => {
    const sc = scoreMenu(n, price, ctx, goal, budget);
    if (!best || sc.s > best.s) best = { ...sc, i, name, price, n };
  });
  const b = best as unknown as Best;
  const why = b.why.slice(0, 3);
  if (r.dist <= 350) why.push("도보 " + r.walk + "분");
  return { ...b, why: why.slice(0, 4) };
}

export type Shown = { r: Rest; b: Best; rank: number };
export type Reco = { scored: { r: Rest; b: Best }[]; promoId: string | null; shown: Shown[]; top: number };
export function recommend(total: Nut, goal: Goal, budget: number, restList: Rest[]): Reco {
  const ctx = deficitOf(total, goal);
  const scored = restList.map((r) => ({ r, b: bestFor(r, ctx, goal, budget) })).sort((a, b) => b.b.s - a.b.s);
  const top = scored[0].b.s;
  const promo = scored.find((x) => x.r.ad && !x.b.overBudget && x.b.s >= top * 0.75 && x.b.s > 0);
  const list = scored.filter((x) => x !== promo && !x.b.overBudget && x.b.s > 0).slice(0, promo ? 3 : 4);
  const shown = (promo ? [promo, ...list] : list).map((x, i) => ({ ...x, rank: i + 1 }));
  return { scored, promoId: promo ? promo.r.id : null, shown, top };
}
