export interface JeonseSensitivityScenario {
  dropRate: number; // 전세가 변동률 (-0.30 ~ 0)
  dropRatePercent: string; // "-10%", "-20%"
  projectedJeonse: number; // 변동 후 예상 전세가 (만원)
  shortfallAmount: number; // 호당 보증금 반환 부족액 (만원)
  auctionLiquidationRisk: boolean; // 경매 배당 손실 구간 진입 여부
  distressLevel: '안전' | '주의' | '경고' | '위험' | '깡통전세';
}

export interface JeonseAnalysis {
  conversionRate: number; // 전월세전환율 (%)
  legalConversionCap: number; // 법정 전월세전환율 상한 (%)
  leverage: number; // 갭투자 레버리지 배수 (1 / (1 - 전세가율))
  gapAmount: number; // 갭 (초기 자기자본) (만원)
  roeOn10PercentGain: number; // 집값 10% 상승 시 자기자본 ROE (%)
  roeOn10PercentLoss: number; // 집값 10% 하락 시 자기자본 ROE (%)
  reverseJeonseShortfall: number; // 현재 시나리오 기준 보증금 반환 결손액 (만원)
  isCanJeonse: boolean; // 깡통전세 판정 (경매 낙찰가율 기준)
  hugGuaranteeLimit: number; // HUG 전세보증금반환보증 한도 (공시가 × 126%)
  canGetHugGuarantee: boolean; // HUG 보증 가입 가능 여부
  monthlyRentFromConversion: number; // 전세의 월세 전환 시 적정 월세 (만원)
  annualRentalIncome: number; // 연간 임대수입 (만원)
  sensitivityMatrix: JeonseSensitivityScenario[]; // 역전세 민감도 매트릭스
}

export interface JeonseParams {
  salePrice: number; // 매매가 (만원)
  currentJeonse: number; // 현재 전세가 (만원)
  originalJeonse: number; // 기존 계약 당시 전세가 (만원)
  officialPrice: number; // 공시가격 (만원)
  monthlyRentDeposit: number; // 월세 보증금 (만원)
  monthlyRent: number; // 월세 (만원)
  baseRate: number; // 기준금리 (%)
  jeonseChangeRate: number; // 전세가 변동률 (-0.30 ~ +0.30)
}

export function calculateConversionRate(jeonseDeposit: number, monthlyDeposit: number, monthlyRent: number): number {
  if (jeonseDeposit <= monthlyDeposit) return 0;
  return Math.round((((monthlyRent * 12) / (jeonseDeposit - monthlyDeposit)) * 100) * 10) / 10;
}

export function calculateLeverage(salePrice: number, jeonsePrice: number): number {
  if (salePrice <= 0) return 1.0;
  const jeonseRatio = jeonsePrice / salePrice;
  if (jeonseRatio >= 0.99) return 99.0;
  return Math.round((1 / (1 - jeonseRatio)) * 10) / 10;
}

export function calculateReverseJeonseShortfall(originalJeonse: number, currentJeonse: number): number {
  return Math.max(0, originalJeonse - currentJeonse);
}

export function isCanJeonse(jeonsePrice: number, salePrice: number, auctionRate: number = 0.78): boolean {
  if (salePrice <= 0) return false;
  return jeonsePrice >= (salePrice * auctionRate);
}

export function calculateHugLimit(officialPrice: number): number {
  // 2024~2026 현행 HUG 안심전세 126% 룰: 공시가격 × 140% × 90% = 공시가 × 1.26
  return Math.round(officialPrice * 1.26);
}

export function calculateGapInvestmentROE(salePrice: number, jeonsePrice: number, priceChangeRate: number): number {
  const gap = salePrice - jeonsePrice;
  if (gap <= 0) return 999.0;
  const gain = salePrice * priceChangeRate;
  return Math.round((gain / gap) * 1000) / 10;
}

export function legalConversionRateCap(baseRate: number): number {
  // 주택임대차보호법: min(기준금리 + 2.0%, 10.0%)
  return Math.min(Math.round((baseRate + 2.0) * 10) / 10, 10.0);
}

export function analyzeJeonse(params: JeonseParams): JeonseAnalysis {
  const conversionRate = calculateConversionRate(params.currentJeonse, params.monthlyRentDeposit, params.monthlyRent);
  const legalCap = legalConversionRateCap(params.baseRate);
  const leverage = calculateLeverage(params.salePrice, params.currentJeonse);
  const gapAmount = Math.max(0, params.salePrice - params.currentJeonse);
  
  const roeOn10PercentGain = calculateGapInvestmentROE(params.salePrice, params.currentJeonse, 0.10);
  const roeOn10PercentLoss = calculateGapInvestmentROE(params.salePrice, params.currentJeonse, -0.10);

  const projectedJeonse = Math.round(params.currentJeonse * (1 + params.jeonseChangeRate));
  const reverseJeonseShortfall = calculateReverseJeonseShortfall(params.originalJeonse, projectedJeonse);

  const canJeonse = isCanJeonse(params.currentJeonse, params.salePrice);
  const hugGuaranteeLimit = calculateHugLimit(params.officialPrice);
  const canGetHugGuarantee = params.currentJeonse <= hugGuaranteeLimit;

  const effectiveConversion = Math.min(conversionRate || legalCap, legalCap);
  const monthlyRentFromConversion = Math.round(((params.currentJeonse - params.monthlyRentDeposit) * (effectiveConversion / 100)) / 12);
  const annualRentalIncome = params.monthlyRent * 12;

  // 역전세 민감도 매트릭스 (0%, -5%, -10%, -15%, -20%, -30%)
  const dropScenarios = [0, -0.05, -0.10, -0.15, -0.20, -0.30];
  const sensitivityMatrix: JeonseSensitivityScenario[] = dropScenarios.map(rate => {
    const proj = Math.round(params.currentJeonse * (1 + rate));
    const shortfall = Math.max(0, params.originalJeonse - proj);
    const auctionRisk = isCanJeonse(proj, params.salePrice);
    
    let distressLevel: '안전' | '주의' | '경고' | '위험' | '깡통전세' = '안전';
    if (shortfall >= 15000 || auctionRisk) distressLevel = '깡통전세';
    else if (shortfall >= 10000) distressLevel = '위험';
    else if (shortfall >= 5000) distressLevel = '경고';
    else if (shortfall > 0) distressLevel = '주의';

    return {
      dropRate: rate,
      dropRatePercent: rate === 0 ? '0% (현재)' : `${Math.round(rate * 100)}%`,
      projectedJeonse: proj,
      shortfallAmount: shortfall,
      auctionLiquidationRisk: auctionRisk,
      distressLevel
    };
  });

  return {
    conversionRate,
    legalConversionCap: legalCap,
    leverage,
    gapAmount,
    roeOn10PercentGain,
    roeOn10PercentLoss,
    reverseJeonseShortfall,
    isCanJeonse: canJeonse,
    hugGuaranteeLimit,
    canGetHugGuarantee,
    monthlyRentFromConversion,
    annualRentalIncome,
    sensitivityMatrix
  };
}
