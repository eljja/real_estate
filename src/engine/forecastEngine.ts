import { DistrictData } from '../data/seoulDistricts';

export interface ForecastParams {
  baseRate: number; // 기준금리 (%)
  jeonseChangeRate: number; // 전세가 변동률 (-0.30 ~ +0.30)
  dsrLimit: number; // DSR 한도 (0.20 ~ 0.60)
  ltvLimit: number; // LTV 한도 (0.10 ~ 0.90)
  taxBurdenChange: number; // 세부담 변동 지수 (-1.0 ~ +2.0)
  supplyChange: number; // 공급 변동 (입주물량 충격 지수)
}

export interface DistrictForecast {
  districtId: string;
  districtName: string;
  region: string;
  currentPrice: number;
  currentJeonse: number;
  predicted1YearPrice: number;
  predicted3YearPrice: number;
  priceChangeRate1Year: number; // 1년 후 변동률 (%)
  priceChangeRate3Year: number; // 3년 후 누적 변동률 (%)
  jeonseChangeRate3Year: number; // 3년 후 전세가 변동률 (%)
  sellPressure: number; // 매도 압력 지수 (0~100)
  buyingPower: number; // 실수요 매수 여력 지수 (0~100)
  riskDirection: 'crash' | 'down' | 'stable' | 'up' | 'surge';
  riskLabel: string;
  riskSummary: string;
}

export interface TimeSeriesPoint {
  quarter: number; // 분기 (1~12)
  quarterLabel: string; // "1Q", "2Q", ... "12Q (3년)"
  basePrice: number; // 기준 예측 매매가
  bullPrice: number; // 낙관 시나리오 상한가 (Bull)
  bearPrice: number; // 비관 시나리오 하한가 (Bear)
  jeonsePrice: number; // 예상 전세가
  hsiStress: number; // 누적 HSI 스트레스
  marketLiquidity: number; // 거래 유동성 지수
}

/**
 * 자치구별 3개년 다변량 피드백 예측
 */
export function forecastDistrict(
  district: DistrictData,
  params: ForecastParams,
  hsi: number,
  crs: number
): DistrictForecast {
  const mortgageRate = params.baseRate + 1.5; // 가산금리 반영 실효금리
  
  // 1. DSR 및 소득 기반 주택구입 감당능력 (Affordability Headroom)
  const maxAffordableLoan = (district.avgHouseholdIncome * params.dsrLimit) / (mortgageRate / 100);
  const maxLtvLoan = district.avgSalePrice * params.ltvLimit;
  const maxBorrowing = Math.min(maxAffordableLoan, maxLtvLoan);
  const theoreticalCapacity = maxBorrowing + (district.avgHouseholdIncome * 3.5); // 자기자본 포함
  const dsrHeadroom = (theoreticalCapacity - district.avgSalePrice) / district.avgSalePrice;

  // 2. 가중 계수 모델링
  const alphaDSR = 1.8; // 금리·대출 규제 민감도
  const betaJeonse = 0.65; // 전세 갭 레버리지 전이 민감도
  const gammaSupply = -0.45; // 3년 공급물량 충격 계수
  const deltaTax = -0.85; // 다주택 종부세 매도 충격

  const supplyShock = (district.supplyNext3Years / (district.population * 4000)) * (1 + params.supplyChange);

  // 연간 환산 가격 변동률 (%)
  let annualChangeRate = (
    alphaDSR * dsrHeadroom * 10 +
    betaJeonse * (params.jeonseChangeRate * 100) +
    gammaSupply * supplyShock * 10 +
    deltaTax * params.taxBurdenChange * 8
  );

  // 규제지역 및 재건축 프리미엄 보정
  if (district.isRegulated) {
    annualChangeRate -= (params.taxBurdenChange > 0 ? 2.5 : 0);
  }
  if (district.reconstructionPremium && params.baseRate > 4.0) {
    annualChangeRate -= 3.0; // 고금리 시 재건축 사업성 악화 반영
  }

  // 3개년 누적 복리 변동률
  const compound3Year = Math.pow(1 + annualChangeRate / 100, 3) - 1;
  const priceChangeRate3Year = Math.round(compound3Year * 1000) / 10;
  const priceChangeRate1Year = Math.round(annualChangeRate * 10) / 10;

  const predicted1YearPrice = Math.round(district.avgSalePrice * (1 + priceChangeRate1Year / 100));
  const predicted3YearPrice = Math.round(district.avgSalePrice * (1 + priceChangeRate3Year / 100));

  // 매도 압력 지수 (0~100)
  let sellPressure = (hsi * 40) + (crs * 0.4) + (district.multiHomeHoldingRatio * 0.8);
  if (params.jeonseChangeRate < 0) sellPressure += Math.abs(params.jeonseChangeRate) * 100;
  sellPressure = Math.min(100, Math.max(5, Math.round(sellPressure)));

  // 매수 여력 지수 (0~100)
  let buyingPower = (params.dsrLimit * 100) + (params.ltvLimit * 40) - (params.baseRate * 12);
  buyingPower = Math.min(100, Math.max(5, Math.round(buyingPower)));

  // 위험 방향 분류
  let riskDirection: 'crash' | 'down' | 'stable' | 'up' | 'surge' = 'stable';
  let riskLabel = '보합세';
  let riskSummary = '수급과 금융 여건이 균형을 이루며 제한적 등락을 보입니다.';

  if (priceChangeRate3Year <= -15.0) {
    riskDirection = 'crash';
    riskLabel = '폭락 경보';
    riskSummary = '고금리와 역전세 충격으로 다주택자 투매 및 경매 낙찰률 급락이 우려됩니다.';
  } else if (priceChangeRate3Year < -4.0) {
    riskDirection = 'down';
    riskLabel = '하락 국면';
    riskSummary = '대출 한도 축소 및 세부담 증가로 매수세가 위축되어 가격 조정을 받습니다.';
  } else if (priceChangeRate3Year > 15.0) {
    riskDirection = 'surge';
    riskLabel = '급등 과열';
    riskSummary = '저금리 유동성과 공급 부족으로 매물 잠김 및 갭투자 쏠림이 발생합니다.';
  } else if (priceChangeRate3Year > 4.0) {
    riskDirection = 'up';
    riskLabel = '상승 흐름';
    riskSummary = '실수요 매수 여력이 견고하여 완만한 가격 상승세를 유지합니다.';
  }

  return {
    districtId: district.id,
    districtName: district.name,
    region: district.region,
    currentPrice: district.avgSalePrice,
    currentJeonse: district.avgJeonsePrice,
    predicted1YearPrice,
    predicted3YearPrice,
    priceChangeRate1Year,
    priceChangeRate3Year,
    jeonseChangeRate3Year: Math.round(params.jeonseChangeRate * 1000) / 10,
    sellPressure,
    buyingPower,
    riskDirection,
    riskLabel,
    riskSummary
  };
}

/**
 * 12개 분기 시계열 궤적 시뮬레이션 (forecastDistrict 예측 결과와 100% 수학적 동기화)
 */
export function generateTimeSeriesProjection(
  district: DistrictData,
  params: ForecastParams,
  quarters: number = 12,
  forecastResult?: DistrictForecast
): TimeSeriesPoint[] {
  const result: TimeSeriesPoint[] = [];
  const startPrice = district.avgSalePrice;
  const startJeonse = district.avgJeonsePrice;
  
  const forecast = forecastResult ?? forecastDistrict(district, params, 0.65, 60);
  const targetPrice3Y = forecast.predicted3YearPrice;
  const targetJeonse3Y = Math.round(startJeonse * (1 + (forecast.jeonseChangeRate3Year / 100)));

  // 분기별 실질 복리 변동률 산출
  const totalGrowthRatio = targetPrice3Y / startPrice;
  const nominalQRate = Math.pow(Math.max(0.1, totalGrowthRatio), 1 / quarters) - 1;
  const nominalJeonseQRate = Math.pow(Math.max(0.1, targetJeonse3Y / startJeonse), 1 / quarters) - 1;

  for (let q = 1; q <= quarters; q++) {
    const weight = q / quarters;
    const currentPrice = q === quarters ? targetPrice3Y : Math.round(startPrice * Math.pow(1 + nominalQRate, q));
    const currentJeonse = q === quarters ? targetJeonse3Y : Math.round(startJeonse * Math.pow(1 + nominalJeonseQRate, q));

    // 시간 경과에 따른 예측 신뢰구간 (불확실성 상/하한선)
    const bandSpan = (q * 0.012) * currentPrice;
    const bullPrice = Math.round(currentPrice + bandSpan);
    const bearPrice = Math.round(currentPrice - bandSpan * 1.25);

    result.push({
      quarter: q,
      quarterLabel: q === quarters ? '12Q (3년)' : `${q}Q`,
      basePrice: currentPrice,
      bullPrice,
      bearPrice,
      jeonsePrice: currentJeonse,
      hsiStress: Math.min(100, Math.max(10, Math.round(forecast.sellPressure * (0.8 + weight * 0.4)))),
      marketLiquidity: Math.min(100, Math.max(10, Math.round(forecast.buyingPower * (1.1 - weight * 0.3))))
    });
  }

  return result;
}
