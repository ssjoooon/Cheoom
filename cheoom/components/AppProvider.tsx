"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AD_BASE, NUTS, RESTS, emptyNut, type AdStat, type Goal, type Nut } from "@/lib/data";
import { localAnalyze, recommend, todayKey, type Analysis, type DayEntry, type Reco } from "@/lib/scoring";

type AdLive = Record<string, Partial<AdStat>>;
type Photo = { preview: string; mediaType: string; data: string };

// 기록 저장은 우선 이 브라우저의 localStorage에 둔다 (서버로 보내지 않음)
const LS = {
  get<T>(k: string, f: T): T {
    try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : f; } catch { return f; }
  },
  set(k: string, v: unknown) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 저장 불가 환경이면 무시 */ }
  },
};

type Ctx = {
  ready: boolean;
  goal: Goal; setGoal: (g: Goal) => void;
  budget: number; setBudget: (n: number) => void;
  area: string; setArea: (s: string) => void;
  foods: string; setFoods: (s: string) => void;
  meds: string; setMeds: (s: string) => void;
  photo: Photo | null; pickPhoto: (f: File) => Promise<void>;
  busy: boolean; status: string;
  last: DayEntry | null;
  reco: Reco | null;
  history: Record<string, DayEntry>;
  analyze: () => Promise<boolean>;
  eatMenu: (name: string, n: Nut) => Promise<void>;
  removeDay: (key: string) => void;
  adStat: (id: string) => AdStat & { live: Partial<AdStat> };
  adBump: (id: string, key: keyof AdStat) => void;
  adReset: () => void;
  detailId: string | null; openDetail: (id: string | null) => void;
  toast: (msg: string) => void; toastMsg: string; toastOn: boolean;
};

const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error("AppProvider 밖에서 useApp을 사용했어요");
  return c;
};

/** 사진을 긴 변 1280px JPEG로 줄여서 base64로 만든다 (전송량과 API 한도 절약) */
function shrink(file: File): Promise<Photo> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 1280;
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      const dataUrl = c.toDataURL("image/jpeg", 0.85);
      URL.revokeObjectURL(url);
      resolve({ preview: dataUrl, mediaType: "image/jpeg", data: dataUrl.split(",")[1] });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image")); };
    img.src = url;
  });
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [goal, setGoalS] = useState<Goal>("keep");
  const [budget, setBudgetS] = useState(12000);
  const [area, setArea] = useState("역삼역 근처");
  const [foods, setFoods] = useState("");
  const [meds, setMeds] = useState("");
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [last, setLast] = useState<DayEntry | null>(null);
  const [history, setHistory] = useState<Record<string, DayEntry>>({});
  const [adLive, setAdLive] = useState<AdLive>({});
  const [detailId, openDetail] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const tt = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg); setToastOn(true);
    if (tt.current) clearTimeout(tt.current);
    tt.current = setTimeout(() => setToastOn(false), 2400);
  }, []);

  // 최초 1회: 저장된 프로필·기록 복원
  /* eslint-disable react-hooks/set-state-in-effect -- localStorage는 클라이언트에서만 읽을 수 있어 마운트 후 1회 복원 */
  useEffect(() => {
    const p = LS.get<{ goal?: Goal; budget?: number }>("chaeum-profile", {});
    if (p.goal) setGoalS(p.goal);
    if (p.budget) setBudgetS(p.budget);
    const h = LS.get<Record<string, DayEntry>>("chaeum-history", {});
    setHistory(h);
    setAdLive(LS.get<AdLive>("chaeum-ads", {}));
    const today = h[todayKey()];
    if (today) { setLast(today); setFoods(today.items.join(", ")); setMeds(today.meds || ""); }
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const setGoal = (g: Goal) => { setGoalS(g); LS.set("chaeum-profile", { goal: g, budget }); };
  const setBudget = (n: number) => { setBudgetS(n); LS.set("chaeum-profile", { goal, budget: n }); };

  const reco = useMemo(() => (last ? recommend(last.total, goal, budget, RESTS) : null), [last, goal, budget]);

  const saveDay = useCallback((e: DayEntry) => {
    setHistory((h) => { const n = { ...h, [e.date]: e }; LS.set("chaeum-history", n); return n; });
  }, []);
  const removeDay = (key: string) => {
    setHistory((h) => { const n = { ...h }; delete n[key]; LS.set("chaeum-history", n); return n; });
    if (key === todayKey()) setLast(null);
    toast("기록을 삭제했어요");
  };

  const adBump = useCallback((id: string, key: keyof AdStat) => {
    setAdLive((a) => { const n = { ...a, [id]: { ...a[id], [key]: (a[id]?.[key] || 0) + 1 } }; LS.set("chaeum-ads", n); return n; });
  }, []);
  const adStat = (id: string) => {
    const b = AD_BASE[id] || {}, l = adLive[id] || {};
    const o = { imp: 0, click: 0, visit: 0, budget: 0, fit: 0, goal: 0 } as AdStat;
    (Object.keys(o) as (keyof AdStat)[]).forEach((k) => (o[k] = (b[k] || 0) + (l[k] || 0)));
    return { ...o, live: l };
  };
  const adReset = () => { setAdLive({}); LS.set("chaeum-ads", {}); toast("이번 세션 수치를 초기화했어요"); };

  const pickPhoto = async (f: File) => {
    try { setPhoto(await shrink(f)); } catch { setStatus("사진을 읽지 못했어요. 다른 사진으로 시도해 주세요."); }
  };

  const analyze = async () => {
    const text = foods.trim(), m = meds.trim();
    if (!text && !photo) { setStatus("먹은 음식을 적거나 사진을 올려주세요."); return false; }
    setBusy(true);
    setStatus("Claude가 식단을 분석하고 있어요…");
    let res: Analysis | null = null;
    let note = "";
    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foods: text, meds: m, goal, image: photo ? { mediaType: photo.mediaType, data: photo.data } : undefined }),
      });
      if (r.ok) res = (await r.json()) as Analysis;
      else {
        const j = await r.json().catch(() => ({}));
        note = j.error === "no_key" ? "AI 연결이 아직 설정되지 않아 간이 분석으로 보여드려요."
          : j.error === "rate_limited" ? "요청이 많아 간이 분석으로 보여드려요."
          : "AI 분석이 어려워 간이 분석으로 보여드려요.";
      }
    } catch { note = "AI 분석이 어려워 간이 분석으로 보여드려요."; }
    if (!res) {
      res = localAnalyze(text || "샐러드", m);
      if (photo) note += " (사진은 간이 분석에서 읽지 못해요)";
    }
    setStatus(note.trim());
    const entry: DayEntry = { ...res, date: todayKey(), goal, meds: m };
    saveDay(entry);
    setLast(entry);
    // 광고 노출/미노출 사유 집계
    const rc = recommend(entry.total, goal, budget, RESTS);
    rc.scored.filter((x) => x.r.ad).forEach((x) => {
      if (x.r.id === rc.promoId) adBump(x.r.id, "imp");
      else if (x.b.overBudget) adBump(x.r.id, "budget");
      else if (x.b.goalMiss) adBump(x.r.id, "goal");
      else adBump(x.r.id, "fit");
    });
    setBusy(false);
    return true;
  };

  const eatMenu = async (name: string, n: Nut) => {
    if (reco && detailId === reco.promoId && detailId) adBump(detailId, "visit");
    const base: DayEntry = last && last.date === todayKey()
      ? last
      : { date: todayKey(), goal, items: [], total: emptyNut(), notes: [], summary: "", meds: meds.trim() };
    const total = { ...base.total };
    NUTS.forEach((x) => (total[x.k] += n[x.k]));
    const entry: DayEntry = { ...base, items: [...base.items, name], total, summary: "" };
    setFoods((f) => (f.trim() ? f.trim() + ", " + name : name));
    saveDay(entry);
    setLast(entry);
    openDetail(null);
    toast(`${name}을(를) 오늘 기록에 더했어요`);
  };

  const value: Ctx = {
    ready, goal, setGoal, budget, setBudget, area, setArea, foods, setFoods, meds, setMeds, photo, pickPhoto,
    busy, status, last, reco, history, analyze, eatMenu, removeDay, adStat, adBump, adReset,
    detailId, openDetail, toast, toastMsg, toastOn,
  };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
