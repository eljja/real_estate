export interface JeonseAnalysis {
  conversionRate: number;       // 전월세전환율 (%)
  leverage: number;             // 갭투자 레버리지 배수
  gapAmount: number;            // 갭 (자기자본) (만원)
  roeOnGain: number;            // 10% 상승 시 ROE
  roeOnLoss: number;            // 10% 하락 시 ROE
  reverseJeonseShortfall: number; // 역전세 부족액 (만원)
  isCanJeonse: boolean;         // 깡통전세 여부
  hugGuaranteeLimit: number;    // HUG 보증 한도 (만원)
  canGetHugGuarantee: boolean;  // HUG 보증 가입 가능 여부
  monthlyRentFromConversion: number; // 전환 시 월세 (만원)
  annualRentalIncome: number;   // 연간 임대수입 (만원)
}

export interface JeonseParams {
  salePrice: number;           // 매매가 (만원)
  currentJeonse: number;       // 현재 전세가 (만원)
  originalJeonse: number;      // 기존 계약 전세가 (만원)
  officialPrice: number;       // 공시가격 (만원)
  monthlyRentDeposit: number;  // 월세 보증금 (만원)
  monthlyRent: number;         // 월세 (만원)
  baseRate: number;            // 기준금리 (%)
  jeonseChangeRate: number;    // 전세가 변동률 (-0.3~+0.3)
}

export function calculateConversionRate(jeonseDeposit: number, monthlyDeposit: number, monthlyRent: number): number {
  if (jeonseDeposit <= monthlyDeposit) return 0;
  return ((monthlyRent * 12) / (jeonseDeposit - monthlyDeposit)) * 100;
}

export function calculateLeverage(salePrice: number, jeonsePrice: number): number {
  if (salePrice <= 0) return 0;
  const jeonseRatio = jeonsePrice / salePrice;
  if (jeonseRatio >= 1) return Infinity;
  return 1 / (1 - jeonseRatio);
}

export function calculateReverseJeonseShortfall(originalJeonse: number, currentJeonse: number): number {
  return Math.max(0, originalJeonse - currentJeonse);
}

export function isCanJeonse(jeonsePrice: number, salePrice: number, auctionRate: number = 0.78): boolean {
  if (salePrice <= 0) return false;
  return jeonsePrice >= (salePrice * auctionRate);
}

export function calculateHugLimit(officialPrice: number): number {
  return officialPrice * 1.4 * 0.9;
}

export function calculateGapInvestmentROE(salePrice: number, jeonsePrice: number, priceChangeRate: number): number {
  const gap = salePrice - jeonsePrice;
  if (gap <= 0) return Infinity;
  const gain = salePrice * priceChangeRate;
  return (gain / gap) * 100;
}

export function legalConversionRateCap(baseRate: number): number {
  return Math.min(baseRate + 2.0, 10.0);
}

export function analyzeJeonse(params: JeonseParams): JeonseAnalysis {
  const conversionRate = calculateConversionRate(params.currentJeonse, params.monthlyRentDeposit, params.monthlyRent);
  const leverage = calculateLeverage(params.salePrice, params.currentJeonse);
  const gapAmount = Math.max(0, params.salePrice - params.currentJeonse);
  const roeOnGain = calculateGapInvestmentROE(params.salePrice, params.currentJeonse, 0.10);
  const roeOnLoss = calculateGapInvestmentROE(params.salePrice, params.currentJeonse, -0.10);
  
  const projectedJeonse = params.currentJeonse * (1 + params.jeonseChangeRate);
  const reverseJeonseShortfall = calculateReverseJeonseShortfall(params.originalJeonse, projectedJeonse);
  
  const canJeonse = isCanJeonse(params.currentJeonse, params.salePrice);
  const hugGuaranteeLimit = calculateHugLimit(params.officialPrice);
  const canGetHugGuarantee = params.currentJeonse <= hugGuaranteeLimit;

  const legalCap = legalConversionRateCap(params.baseRate);
  const effectiveConversionRate = Math.min(conversionRate || legalCap, legalCap);
  
  const monthlyRentFromConversion = ((params.currentJeonse - params.monthlyRentDeposit) * (effectiveConversionRate / 100)) / 12;
  const annualRentalIncome = params.monthlyRent * 12;

  return {
    conversionRate,
    leverage,
    gapAmount,
    roeOnGain,
    roeOnLoss,
    reverseJeonseShortfall,
    isCanJeonse: canJeonse,
    hugGuaranteeLimit,
    canGetHugGuarantee,
    monthlyRentFromConversion,
    annualRentalIncome
  };
}
