"use client";

import { useApp } from "@/components/AppProvider";
import { RESTS } from "@/lib/data";

export default function AdsPage() {
  const { adStat, adReset, reco } = useApp();
  const ads = RESTS.filter((r) => r.ad);
  let imp = 0, click = 0, cand = 0;
  ads.forEach((r) => { const s = adStat(r.id); imp += s.imp; click += s.click; cand += s.imp + s.budget + s.fit + s.goal; });
  const kpis: [string, string][] = [
    [imp.toLocaleString("ko-KR"), "맞춤 노출"],
    [(imp ? (click / imp) * 100 : 0).toFixed(1) + "%", "클릭률"],
    [(cand ? (imp / cand) * 100 : 0).toFixed(0) + "%", "노출 적합률"],
  ];

  return (
    <section className="step">
      <h2>광고주 대시보드</h2>
      <p className="sub">채움 광고는 사용자의 영양 상태, 목표, 예산에 맞을 때만 노출돼요. 노출되지 않은 이유까지 보여드립니다.</p>
      <div className="kpis">
        {kpis.map(([v, l]) => <div className="kpi" key={l}><b>{v}</b><span>{l}</span></div>)}
      </div>
      {ads.map((r) => {
        const s = adStat(r.id);
        const tot = s.imp + s.budget + s.fit + s.goal || 1;
        const tip = s.budget > s.fit && s.budget > s.goal
          ? "예산 초과로 빠지는 경우가 많아요. 1만 원대 런치 메뉴를 추가하면 노출이 늘어요."
          : s.goal > s.fit ? "목표와 안 맞는 경우가 많아요. 저칼로리·고단백 메뉴를 앞세워 보세요."
          : "영양이 맞지 않아 빠지는 경우가 있어요. 채소·단백질을 보강한 메뉴를 고려해 보세요.";
        const l = s.live;
        const live = l.imp || l.fit || l.goal || l.budget
          ? ` 이번 세션: 노출 ${l.imp || 0}회, 미노출 ${(l.fit || 0) + (l.goal || 0) + (l.budget || 0)}회.` : "";
        return (
          <div className="adcard" key={r.id}>
            <div className="hd"><div className="nm">{r.name}</div><div className="fit">{r.id === reco?.promoId ? "지금 노출 중" : ""}</div></div>
            <div className="nut">
              <span>노출 {s.imp.toLocaleString("ko-KR")}</span>
              <span>클릭 {s.click.toLocaleString("ko-KR")} ({(s.imp ? (s.click / s.imp) * 100 : 0).toFixed(1)}%)</span>
              <span>방문·주문 {s.visit.toLocaleString("ko-KR")}</span>
            </div>
            <div className="split" role="img" aria-label={`노출 ${s.imp}, 영양 부적합 ${s.fit}, 목표 불일치 ${s.goal}, 예산 초과 ${s.budget}`}>
              {([["k1", s.imp], ["k2", s.fit], ["k3", s.goal], ["k4", s.budget]] as const).map(([c, v]) => <i key={c} className={c} style={{ width: (v / tot) * 100 + "%" }} />)}
            </div>
            <div className="keys">
              {([["k1", "노출"], ["k2", "영양 부적합"], ["k3", "목표 불일치"], ["k4", "예산 초과"]] as const).map(([c, t]) => <span key={c}><i className={c} />{t}</span>)}
            </div>
            <p className="adnote">{tip + live}</p>
          </div>
        );
      })}
      <div className="policy"><b>노출 기준</b><br />추천 점수가 그 사용자의 1위 식당 대비 75% 이상이고 예산 안일 때만 맨 위에 광고로 보여요. 맞지 않는 사용자에게 돈을 내고 노출되는 일은 없어서, 클릭과 방문 전환율이 높아집니다.</div>
      <p className="disclaimer">지난 7일 수치는 시연용 가상 데이터이고, 이 화면에서 분석을 실행하면 그 결과가 더해져요. 실서비스에서는 광고주 계정으로 따로 로그인하는 화면입니다.</p>
      <button className="btn ghost sm" type="button" onClick={adReset}>이번 세션 수치 초기화</button>
    </section>
  );
}
