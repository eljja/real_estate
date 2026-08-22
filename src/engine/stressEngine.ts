export interface HsiResult {
  annualPropertyTax: number;   // 연간 재산세
  annualComprehensiveTax: number; // 연간 종부세
  annualMortgage: number;      // 연간 대출 원리금
  annualRentalIncome: number;  // 연간 순임대수입
  totalAnnualCost: number;     // 연간 총비용
  netCashflow: number;         // 순현금흐름
  hsi: number;                 // HSI 지수
  hsiLevel: 'safe' | 'caution' | 'warning' | 'danger' | 'collapse';
  hsiLabel: string;            // Korean label
}

export interface CrashRiskResult {
  jeonseRisk: number;          // 전세가율 위험도 (0~100)
  gapInvestmentRisk: number;   // 갭투자 집중도 (0~100)
  multiHomeHsi: number;        // 다주택자 HSI (0~100 scaled)
  supplyRisk: number;          // 매물 과잉 위험 (0~100)
  populationRisk: number;      // 인구유출 위험 (0~100)
  totalCrs: number;            // 종합 CRS (0~100)
  crsLevel: string;            // 위험 등급
}

export interface CrsWeights {
  jeonseWeight: number;        // default 0.25
  gapWeight: number;           // default 0.20
  hsiWeight: number;           // default 0.25
  supplyWeight: number;        // default 0.15
  populationWeight: number;    // default 0.15
}

export function getHsiLevel(hsi: number): { level: 'safe' | 'caution' | 'warning' | 'danger' | 'collapse'; label: string } {
  if (hsi < 0.3) return { level: 'safe', label: '안전' };
  if (hsi < 0.5) return { level: 'caution', label: '주의' };
  if (hsi < 0.7) return { level: 'warning', label: '경고' };
  if (hsi < 1.0) return { level: 'danger', label: '위험' };
  return { level: 'collapse', label: '붕괴' };
}

export function getCrsLevel(crs: number): { level: string; label: string } {
  if (crs < 20) return { level: 'safe', label: '안전' };
  if (crs < 40) return { level: 'caution', label: '주의' };
  if (crs < 60) return { level: 'warning', label: '경고' };
  if (crs < 80) return { level: 'danger', label: '고위험' };
  return { level: 'collapse', label: '붕괴 임박' };
}

export function calculateMortgagePayment(principal: number, annualRate: number, years: number): number {
  if (principal <= 0) return 0;
  if (annualRate <= 0) return principal / years;
  
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  return payment * 12; // 연간
}

export function calculateHSI(annualTax: number, annualMortgage: number, annualRentalIncome: number, annualIncome: number): HsiResult {
  const totalAnnualCost = annualTax + annualMortgage;
  const netCost = Math.max(0, totalAnnualCost - annualRentalIncome);
  const netCashflow = annualRentalIncome - totalAnnualCost;
  
  const hsi = annualIncome > 0 ? netCost / annualIncome : Infinity;
  const hsiLevelData = getHsiLevel(hsi);

  return {
    annualPropertyTax: annualTax * 0.4, // placeholder split
    annualComprehensiveTax: annualTax * 0.6,
    annualMortgage,
    annualRentalIncome,
    totalAnnualCost,
    netCashflow,
    hsi,
    hsiLevel: hsiLevelData.level,
    hsiLabel: hsiLevelData.label
  };
}

export function calculateCrashRiskScore(districtData: any, params: any, weights: CrsWeights = { jeonseWeight: 0.25, gapWeight: 0.20, hsiWeight: 0.25, supplyWeight: 0.15, populationWeight: 0.15 }): CrashRiskResult {
  const jeonseRatio = districtData?.jeonseRatio ?? 0.6;
  const jeonseRisk = Math.min(100, Math.max(0, ((0.75 - jeonseRatio) / (0.75 - 0.35)) * 100)); // lower jeonse ratio = higher risk in some contexts, but usually higher = reverse jeonse risk. Let's assume higher ratio = higher gap risk. Wait, mapping [0.35, 0.75] to [0,100]:
  const jeonseRiskMapped = Math.min(100, Math.max(0, (jeonseRatio - 0.35) * (100 / 0.4)));

  let gapInvestmentRisk = 35;
  const gapLevel = districtData?.gapLevel ?? 'medium';
  if (gapLevel === 'low') gapInvestmentRisk = 10;
  else if (gapLevel === 'medium') gapInvestmentRisk = 35;
  else if (gapLevel === 'high') gapInvestmentRisk = 65;
  else if (gapLevel === 'very_high') gapInvestmentRisk = 90;

  const hsi = params?.hsi ?? 0.5;
  const multiHomeHsi = Math.min(100, Math.max(0, (hsi / 1.5) * 100));

  const supplyRisk = districtData?.supplyRisk ?? 50;
  
  const popTrend = districtData?.populationTrend ?? 0; // negative means outflow
  const populationRisk = Math.min(100, Math.max(0, -popTrend * 10)); // simple map

  const totalCrs = (
    jeonseRiskMapped * weights.jeonseWeight +
    gapInvestmentRisk * weights.gapWeight +
    multiHomeHsi * weights.hsiWeight +
    supplyRisk * weights.supplyWeight +
    populationRisk * weights.populationWeight
  );

  const crsLevelData = getCrsLevel(totalCrs);

  return {
    jeonseRisk: jeonseRiskMapped,
    gapInvestmentRisk,
    multiHomeHsi,
    supplyRisk,
    populationRisk,
    totalCrs,
    crsLevel: crsLevelData.label
  };
}
