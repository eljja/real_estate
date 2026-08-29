import { DistrictData } from '../data/seoulDistricts';

export interface HsiResult {
  annualPropertyTax: number; // 연간 재산세
  annualComprehensiveTax: number; // 연간 종부세
  annualMortgage: number; // 연간 대출 원리금
  annualRentalIncome: number; // 연간 순임대수입
  totalAnnualCost: number; // 연간 총 보유비용 (세금 + 대출이자)
  netAnnualCost: number; // 순 보유비용 (총비용 - 임대수입)
  disposableIncome: number; // 가구 세후 가처분 소득 추정치
  discretionaryCashflow: number; // 생계비 제외 잉여 현금흐름
  hsi: number; // HSI 지수 (순보유비용 / 연소득)
  hsiLevel: 'safe' | 'caution' | 'warning' | 'danger' | 'collapse';
  hsiLabel: string; // 한글 진단 라벨
  distressDescription: string; // 상세 재무 진단
}

export interface CrashRiskResult {
  jeonseRisk: number; // 전세가율 & 역전세 위험도 (0~100)
  gapInvestmentRisk: number; // 갭투자 & 다주택 밀집도 (0~100)
  multiHomeHsiRisk: number; // 다주택자 HSI 부채상환 압력 (0~100)
  supplyInventoryRisk: number; // 미분양 & 3년 입주물량 과잉 위험 (0~100)
  liquidityContractionRisk: number; // 거래 유동성 위축 위험 (0~100)
  populationRisk: number; // 인구 유출 위험 (0~100)
  totalCrs: number; // 종합 CRS 지수 (0~100)
  crsLevel: '매우 안전' | '안전' | '주의' | '위험' | '붕괴 위기';
  fireSaleProbability: number; // 급매·패닉셀 출회 추정 확률 (%)
  vulnerabilityType: '역전세 취약' | '종부세 고부담' | '공급과잉 우려' | '안정형';
}

export interface CrsWeights {
  jeonse: number; // default 0.25
  gap: number; // default 0.20
  hsi: number; // default 0.20
  supply: number; // default 0.15
  liquidity: number; // default 0.10
  population: number; // default 0.10
}

export function getHsiLevel(hsi: number): { level: 'safe' | 'caution' | 'warning' | 'danger' | 'collapse'; label: string; desc: string } {
  if (hsi < 0.30) {
    return { level: 'safe', label: '안정적 (여유)', desc: '가구 소득 대비 주거비 지출이 30% 미만으로 현금흐름이 매우 건전합니다.' };
  }
  if (hsi < 0.50) {
    return { level: 'caution', label: '경계 (주의)', desc: '주거비가 소득의 30~50%를 차지하여 가처분 소득이 축소되고 있습니다.' };
  }
  if (hsi < 0.70) {
    return { level: 'warning', label: '위험 (현금흐름 악화)', desc: '주거비가 소득의 절반을 초과하여 추가 금리 인상 시 적자 가구 전환 위험이 큽니다.' };
  }
  if (hsi < 1.00) {
    return { level: 'danger', label: '고위험 (한계 가구)', desc: '세금과 원리금 상환만으로 소득의 70~100%가 소진되어 자산 매각을 고려해야 합니다.' };
  }
  return { level: 'collapse', label: '한계 초과 (파산 위기)', desc: '연간 주거 지출이 가구 연소득을 초과하여 원리금 연체 또는 급매 처분이 불가피합니다.' };
}

export function getCrsLevel(crs: number): { level: '매우 안전' | '안전' | '주의' | '위험' | '붕괴 위기'; label: string } {
  if (crs < 25) return { level: '매우 안전', label: '매우 안전' };
  if (crs < 45) return { level: '안전', label: '안전' };
  if (crs < 65) return { level: '주의', label: '주의' };
  if (crs < 80) return { level: '위험', label: '고위험' };
  return { level: '붕괴 위기', label: '붕괴 임박' };
}

/**
 * 원리금균등상환 연간 납입액 계산기
 */
export function calculateMortgagePayment(principal: number, annualRate: number, years: number): number {
  if (principal <= 0) return 0;
  if (annualRate <= 0) return principal / years;

  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = years * 12;
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  return monthlyPayment * 12;
}

/**
 * 정밀 주거부담지수 (HSI) 산출
 */
export function calculateHSI(
  annualTax: number,
  annualMortgage: number,
  annualRentalIncome: number,
  annualIncome: number
): HsiResult {
  const totalAnnualCost = annualTax + annualMortgage;
  const netAnnualCost = Math.max(0, totalAnnualCost - annualRentalIncome);

  // 실질 가처분소득 (소득세 및 4대보험 약 18% 공제 추정)
  const disposableIncome = Math.round(annualIncome * 0.82);
  // 표준 4인 가구 기본 최저생계비 (약 3,200만원)
  const basicLivingCost = 3200;
  const discretionaryCashflow = disposableIncome - netAnnualCost - basicLivingCost;

  const hsi = annualIncome > 0 ? netAnnualCost / annualIncome : 1.0;
  const levelInfo = getHsiLevel(hsi);

  return {
    annualPropertyTax: Math.round(annualTax * 0.45),
    annualComprehensiveTax: Math.round(annualTax * 0.55),
    annualMortgage: Math.round(annualMortgage),
    annualRentalIncome: Math.round(annualRentalIncome),
    totalAnnualCost: Math.round(totalAnnualCost),
    netAnnualCost: Math.round(netAnnualCost),
    disposableIncome,
    discretionaryCashflow: Math.round(discretionaryCashflow),
    hsi,
    hsiLevel: levelInfo.level,
    hsiLabel: levelInfo.label,
    distressDescription: levelInfo.desc
  };
}

/**
 * 서울 자치구별 붕괴 위험도 (CRS 2.0) 종합 산출
 */
export function calculateCrashRiskScore(
  district: DistrictData,
  hsi: number,
  jeonseChangeRate: number = 0,
  weights: CrsWeights = {
    jeonse: 0.25,
    gap: 0.20,
    hsi: 0.20,
    supply: 0.15,
    liquidity: 0.10,
    population: 0.10
  }
): CrashRiskResult {
  // 1. 전세가율 & 역전세 위험도 (0~100): 전세가율 40% 이하=0점, 70% 이상=100점 + 전세가 하락 충격 반영
  const baseJeonseRisk = Math.min(100, Math.max(0, ((district.jeonseRatio - 0.40) / 0.30) * 100));
  const reverseJeonsePenalty = Math.max(0, -jeonseChangeRate * 120);
  const jeonseRisk = Math.min(100, baseJeonseRisk + reverseJeonsePenalty);

  // 2. 갭투자 & 다주택 밀집도 (0~100)
  const gapLevelScore = {
    low: 15,
    medium: 40,
    high: 70,
    very_high: 95
  }[district.gapInvestmentLevel];
  const multiHomeHoldingScore = Math.min(100, Math.max(0, (district.multiHomeHoldingRatio / 40) * 100));
  const gapInvestmentRisk = Math.round(gapLevelScore * 0.6 + multiHomeHoldingScore * 0.4);

  // 3. 다주택 HSI 부채상환 압력 (0~100)
  const multiHomeHsiRisk = Math.min(100, Math.max(0, (hsi / 1.2) * 100));

  // 4. 공급 & 미분양 위험도 (0~100): 3년 입주물량 / 세대수 비중 + 미분양
  const supplyRatio = (district.supplyNext3Years / (district.population * 4000)) * 100; // 세대당 인구 2.5명 환산
  const supplyScore = Math.min(100, supplyRatio * 20);
  const unsoldScore = Math.min(100, (district.unsoldUnits / 150) * 100);
  const supplyInventoryRisk = Math.round(supplyScore * 0.7 + unsoldScore * 0.3);

  // 5. 거래 유동성 위축 위험 (0~100): 유동성 점수가 낮을수록 위험
  const liquidityContractionRisk = Math.max(0, 100 - district.liquidityScore);

  // 6. 인구 유출 위험 (0~100)
  const populationRisk = district.population < 25 ? 75 : district.population < 35 ? 50 : 25;

  // 종합 가중 합산
  const totalCrs = (
    jeonseRisk * weights.jeonse +
    gapInvestmentRisk * weights.gap +
    multiHomeHsiRisk * weights.hsi +
    supplyInventoryRisk * weights.supply +
    liquidityContractionRisk * weights.liquidity +
    populationRisk * weights.population
  );

  const levelInfo = getCrsLevel(totalCrs);

  // 급매 출회 추정 확률
  const fireSaleProbability = Math.min(95, Math.max(5, Math.round(totalCrs * 0.95)));

  // 취약성 유형 분류
  let vulnerabilityType: '역전세 취약' | '종부세 고부담' | '공급과잉 우려' | '안정형' = '안정형';
  if (district.jeonseRatio >= 0.60 && district.gapInvestmentLevel === 'very_high') {
    vulnerabilityType = '역전세 취약';
  } else if (district.avgSalePrice >= 170000 && district.isRegulated) {
    vulnerabilityType = '종부세 고부담';
  } else if (district.supplyNext3Years >= 9000) {
    vulnerabilityType = '공급과잉 우려';
  }

  return {
    jeonseRisk: Math.round(jeonseRisk),
    gapInvestmentRisk: Math.round(gapInvestmentRisk),
    multiHomeHsiRisk: Math.round(multiHomeHsiRisk),
    supplyInventoryRisk: Math.round(supplyInventoryRisk),
    liquidityContractionRisk: Math.round(liquidityContractionRisk),
    populationRisk: Math.round(populationRisk),
    totalCrs: Math.round(totalCrs * 10) / 10,
    crsLevel: levelInfo.level,
    fireSaleProbability,
    vulnerabilityType
  };
}
