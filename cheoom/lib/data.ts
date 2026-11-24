export type NutKey = "kcal" | "protein" | "fiber" | "vitC" | "iron" | "calcium" | "sodium";
export type Nut = Record<NutKey, number>;
export type Goal = "lose" | "keep" | "muscle";

export const NUTS: { k: NutKey; n: string; u: string; limit?: boolean }[] = [
  { k: "kcal", n: "열량", u: "kcal" },
  { k: "protein", n: "단백질", u: "g" },
  { k: "fiber", n: "식이섬유", u: "g" },
  { k: "vitC", n: "비타민C", u: "mg" },
  { k: "iron", n: "철분", u: "mg" },
  { k: "calcium", n: "칼슘", u: "mg" },
  { k: "sodium", n: "나트륨", u: "mg", limit: true },
];
export const GOALN: Record<Goal, string> = { lose: "체중 감량", keep: "건강 유지", muscle: "근육 늘리기" };
export const TARGET: Record<Goal, Nut> = {
  lose: { kcal: 1600, protein: 80, fiber: 25, vitC: 100, iron: 12, calcium: 700, sodium: 2000 },
  keep: { kcal: 2000, protein: 65, fiber: 25, vitC: 100, iron: 12, calcium: 700, sodium: 2000 },
  muscle: { kcal: 2400, protein: 110, fiber: 25, vitC: 100, iron: 12, calcium: 800, sodium: 2000 },
};
export const N = (kcal: number, protein: number, fiber: number, vitC: number, iron: number, calcium: number, sodium: number): Nut => ({
  kcal, protein, fiber, vitC, iron, calcium, sodium,
});
export const emptyNut = (): Nut => N(0, 0, 0, 0, 0, 0, 0);

export const FOOD_DB: [string, Nut][] = [
  ["아메리카노", N(10, 0, 0, 0, 0, 5, 10)], ["라떼", N(180, 9, 0, 0, 0, 280, 120)], ["라면", N(500, 10, 2, 0, 2, 30, 1800)],
  ["삼각김밥", N(200, 5, 1, 0, 0.5, 10, 450)], ["김밥", N(450, 12, 3, 5, 2, 60, 900)], ["토스트", N(350, 10, 2, 0, 2, 80, 550)],
  ["우유", N(130, 6, 0, 0, 0, 220, 100)], ["제육볶음", N(650, 30, 3, 10, 3, 50, 1400)], ["바나나", N(100, 1, 3, 10, 0.3, 6, 1)],
  ["짜장면", N(800, 20, 4, 5, 3, 50, 2400)], ["샐러드", N(150, 4, 4, 40, 1.5, 60, 250)], ["닭가슴살", N(150, 30, 0, 0, 0.8, 10, 350)],
  ["계란", N(80, 6, 0, 0, 0.9, 28, 70)], ["사과", N(95, 0, 4, 8, 0.2, 10, 2)], ["피자", N(600, 24, 3, 5, 3, 350, 1300)],
  ["햄버거", N(550, 25, 2, 2, 4, 120, 1000)], ["비빔밥", N(600, 20, 6, 15, 4, 80, 1100)], ["떡볶이", N(480, 8, 2, 5, 2, 40, 1300)],
  ["콜라", N(140, 0, 0, 0, 0, 0, 15)],
];
export const MED_DB: [RegExp, string, string][] = [
  [/철분/, "철분제", "커피·녹차·우유와 같이 먹으면 흡수가 줄어요. 2시간 정도 간격을 두고, 비타민C가 든 음식과 함께 드세요."],
  [/고혈압|혈압/, "고혈압약", "자몽(주스 포함)은 일부 혈압약의 효과를 바꿀 수 있어요. 짠 음식은 줄이는 게 좋아요."],
  [/항생제/, "항생제", "일부 항생제는 우유·요거트 같은 칼슘 식품과 같이 먹으면 흡수가 줄어요. 복용 간격을 약사에게 확인하세요."],
  [/와파린|항응고/, "항응고제", "시금치·케일 같은 비타민K 많은 채소는 갑자기 많이 먹거나 끊지 말고 일정하게 드세요."],
  [/당뇨|메트포르민/, "당뇨약", "끼니를 거르면 저혈당 위험이 있어요. 단 음료보다 통곡물과 단백질 위주로 드세요."],
];

export type Rest = {
  id: string; name: string; x: number; y: number; cat: string; ad: boolean; hours: string;
  menus: [string, number, Nut][]; dist: number; walk: number;
};
// 가상 식당: x,y는 역삼역 기준 미터 (동쪽 +x, 남쪽 +y)
const RAW: Omit<Rest, "dist" | "walk">[] = [
  { id: "r1", name: "초록접시 샐러드랩", x: 150, y: -100, cat: "샐러드", ad: true, hours: "10:30–21:00", menus: [
    ["연어 포케 샐러드", 11900, N(520, 32, 8, 60, 3, 90, 700)], ["닭가슴살 콥 샐러드", 10900, N(450, 38, 7, 45, 2.5, 110, 820)], ["아보카도 그레인볼", 9900, N(560, 16, 12, 30, 3.5, 80, 540)]] },
  { id: "r2", name: "한상정식 역삼점", x: -230, y: -260, cat: "한식", ad: false, hours: "11:00–21:30", menus: [
    ["고등어구이 정식", 10000, N(720, 35, 6, 20, 3.5, 150, 1300)], ["제육 정식", 9500, N(780, 32, 5, 15, 3, 70, 1600)], ["나물 비빔 정식", 9000, N(610, 18, 9, 25, 4.5, 140, 1000)]] },
  { id: "r3", name: "닭장군 그릴", x: 380, y: 160, cat: "그릴", ad: true, hours: "11:00–22:00", menus: [
    ["닭가슴살 스테이크 덮밥", 9500, N(610, 45, 4, 15, 2, 40, 900)], ["그릴 치킨 샐러드", 8900, N(380, 36, 6, 35, 2, 60, 650)], ["양념 닭다리살 덮밥", 10500, N(820, 38, 3, 10, 2.5, 40, 1500)]] },
  { id: "r4", name: "소담 순두부", x: -160, y: 200, cat: "한식", ad: false, hours: "07:30–21:00", menus: [
    ["해물 순두부찌개", 9000, N(480, 28, 4, 10, 4, 250, 1500)], ["굴 순두부찌개", 9500, N(460, 26, 4, 12, 6, 260, 1450)], ["두부 부침 정식", 8500, N(520, 24, 5, 10, 4.5, 320, 900)]] },
  { id: "r5", name: "오늘의 소고기국밥", x: -470, y: 120, cat: "한식", ad: false, hours: "06:00–22:00", menus: [
    ["소고기 무국밥", 9500, N(560, 30, 3, 8, 5, 60, 1400)], ["선지 해장국", 9000, N(520, 28, 3, 10, 8, 70, 1700)], ["수육 정식", 13000, N(780, 48, 3, 8, 5.5, 60, 1200)]] },
  { id: "r6", name: "그린볼 비건키친", x: 300, y: -330, cat: "비건", ad: false, hours: "11:00–20:30", menus: [
    ["두부 퀴노아 볼", 12500, N(540, 24, 11, 55, 6, 300, 600)], ["병아리콩 커리", 11500, N(620, 20, 13, 30, 6.5, 120, 850)], ["시금치 렌틸 수프 세트", 10500, N(430, 19, 12, 60, 7, 180, 700)]] },
  { id: "r7", name: "버거스테이션", x: -280, y: -40, cat: "패스트푸드", ad: true, hours: "10:00–23:00", menus: [
    ["더블 치즈버거 세트", 9900, N(1150, 42, 4, 5, 5, 350, 1900)], ["그릴 치킨버거 단품", 6900, N(480, 32, 3, 6, 2.5, 120, 980)], ["치킨 랩", 5900, N(420, 22, 4, 12, 2, 110, 860)]] },
  { id: "r8", name: "바다숲 회덮밥", x: 470, y: -60, cat: "일식", ad: false, hours: "11:30–21:00", menus: [
    ["모둠 회덮밥", 13000, N(620, 34, 5, 25, 2.5, 80, 950)], ["연어 덮밥", 14000, N(690, 30, 3, 10, 1.5, 40, 800)], ["미역 우동 세트", 9000, N(520, 16, 4, 5, 2.5, 120, 1700)]] },
  { id: "r9", name: "과일가게 스무디바", x: 60, y: 110, cat: "카페", ad: false, hours: "08:00–20:00", menus: [
    ["키위 요거트 스무디", 6500, N(280, 10, 5, 120, 0.5, 250, 90)], ["프로틴 바나나 쉐이크", 7500, N(380, 30, 4, 12, 1, 320, 180)], ["그릭요거트 볼", 8000, N(350, 20, 6, 40, 1, 260, 110)]] },
  { id: "r10", name: "역삼 스테이크하우스", x: -60, y: -370, cat: "양식", ad: true, hours: "11:30–22:00", menus: [
    ["채끝 스테이크 런치", 24000, N(880, 55, 4, 15, 7, 60, 1100)], ["스테이크 샐러드", 18000, N(520, 42, 6, 40, 5.5, 90, 780)], ["안심 스테이크", 32000, N(760, 60, 3, 10, 7.5, 40, 900)]] },
];
export const RESTS: Rest[] = RAW.map((r) => {
  const dist = Math.round((Math.hypot(r.x, r.y) * 1.25) / 10) * 10;
  return { ...r, dist, walk: Math.max(1, Math.round(dist / 70)) };
});

export const PRODUCTS = [
  { name: "채움 단백질 쉐이크 14입", desc: "한 팩에 단백질 25g", price: 29900, fills: ["protein"] },
  { name: "채움 데일리 섬유 젤리", desc: "하루 2개로 식이섬유 8g", price: 15900, fills: ["fiber"] },
  { name: "채움 비타민C 1000", desc: "60정, 하루 1정", price: 12900, fills: ["vitC"] },
  { name: "채움 철분+비타민C", desc: "흡수를 돕는 조합, 30정", price: 18900, fills: ["iron", "vitC"] },
  { name: "채움 칼슘·마그네슘·D", desc: "60정, 하루 2정", price: 16900, fills: ["calcium"] },
  { name: "채움 저염 현미 도시락", desc: "냉동 7팩, 나트륨 450mg", price: 34900, fills: ["fiber", "protein"] },
];

// 광고주 대시보드용 지난 7일 가상 데이터
export type AdStat = { imp: number; click: number; visit: number; budget: number; fit: number; goal: number };
export const AD_BASE: Record<string, Partial<AdStat>> = {
  r1: { imp: 1840, click: 412, visit: 96, budget: 310, fit: 520, goal: 180 },
  r3: { imp: 1520, click: 301, visit: 71, budget: 150, fit: 690, goal: 240 },
  r7: { imp: 220, click: 31, visit: 6, budget: 40, fit: 860, goal: 1420 },
  r10: { imp: 360, click: 94, visit: 19, budget: 2210, fit: 310, goal: 120 },
};
