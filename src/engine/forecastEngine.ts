export interface ForecastParams {
  baseRate: number;            // 기준금리 (%)
  jeonseChangeRate: number;    // 전세가 변동률
  dsrLimit: number;            // DSR 한도
  ltvLimit: number;            // LTV 한도
  taxBurdenChange: number;     // 세부담 증가율 (0 = 변화없음)
  supplyChange: number;        // 공급 변동 (매물/입주 증감)
}

export interface DistrictForecast {
  districtId: string;
  districtName: string;
  priceChangeRate: number;     // 예상 매매가 변동률 (%)
  jeonseChangeRate: number;    // 예상 전세가 변동률 (%)
  sellPressure: number;        // 매도 압력 (0~100)
  buyingPower: number;         // 매수 여력 (0~100)
  riskDirection: 'up' | 'stable' | 'down' | 'crash';
  riskLabel: string;
}

export interface DistrictData {
  id: string;
  name: string;
  currentPrice: number;
  jeonseRatio: number;
  monthsOfSupply: number;
  multiHomeRatio: number;
  averageIncome: number;
}

export function forecastDistrict(district: DistrictData, params: ForecastParams, hsi: number, crs: number): DistrictForecast {
  // dsrHeadroom logic
  const interestRate = params.baseRate + 1.5; // proxy mortgage rate
  const affordableLoan = (district.averageIncome * params.dsrLimit) / (interestRate / 100);
  const maxLtvLoan = district.currentPrice * params.ltvLimit;
  const maxBorrowing = Math.min(affordableLoan, maxLtvLoan);
  const neutralPrice = maxBorrowing + (district.averageIncome * 2); // proxy for equity
  const dsrHeadroom = (neutralPrice - district.currentPrice) / district.currentPrice;

  // Coefficients
  const alpha = 2.0;
  const beta = 0.5;
  const gamma = 1.5;
  const delta = -3.0;

  const equilibriumSupply = 5.0; // months
  
  let priceChangeRate = 
    alpha * (dsrHeadroom) + 
    beta * (params.jeonseChangeRate) + 
    gamma * (1 / (district.monthsOfSupply || 1) - (1 / equilibriumSupply)) + 
    delta * params.taxBurdenChange;
    
  priceChangeRate -= (params.supplyChange * 0.1);

  // sellPressure
  let sellPressure = (hsi * 50) + (district.multiHomeRatio * 30) - (params.jeonseChangeRate * 100);
  sellPressure = Math.min(100, Math.max(0, sellPressure));

  // buyingPower
  let buyingPower = (params.dsrLimit * 100) + (params.ltvLimit * 50) - (params.baseRate * 10);
  buyingPower = Math.min(100, Math.max(0, buyingPower));

  let riskDirection: 'up' | 'stable' | 'down' | 'crash' = 'stable';
  let riskLabel = '보합';
  
  if (priceChangeRate < -0.1) {
    riskDirection = 'crash';
    riskLabel = '폭락';
  } else if (priceChangeRate < -0.02) {
    riskDirection = 'down';
    riskLabel = '하락';
  } else if (priceChangeRate > 0.05) {
    riskDirection = 'up';
    riskLabel = '상승';
  }

  return {
    districtId: district.id,
    districtName: district.name,
    priceChangeRate: priceChangeRate * 100, // convert to %
    jeonseChangeRate: params.jeonseChangeRate * 100,
    sellPressure,
    buyingPower,
    riskDirection,
    riskLabel
  };
}

export function forecastAllDistricts(districts: DistrictData[], params: ForecastParams, baseHsi: number, baseCrs: number): DistrictForecast[] {
  return districts.map(district => forecastDistrict(district, params, baseHsi, baseCrs));
}

export function generateTimeSeriesProjection(district: DistrictData, params: ForecastParams, quarters: number): { quarter: number; price: number; jeonse: number; hsi: number }[] {
  const result = [];
  let currentPrice = district.currentPrice;
  let currentJeonse = district.currentPrice * district.jeonseRatio;
  let currentHsi = 0.5; // proxy starting HSI
  
  for (let q = 1; q <= quarters; q++) {
    const dsrHeadroom = (district.averageIncome * 5 - currentPrice) / currentPrice; // simplified
    const priceChange = (dsrHeadroom * 0.1) + (params.jeonseChangeRate * 0.2) - (currentHsi * 0.05);
    
    currentPrice = currentPrice * (1 + priceChange);
    currentJeonse = currentJeonse * (1 + params.jeonseChangeRate);
    
    // Feedback loop: falling prices increase HSI stress
    if (priceChange < 0) {
      currentHsi += 0.05;
    } else {
      currentHsi -= 0.02;
    }
    
    result.push({
      quarter: q,
      price: currentPrice,
      jeonse: currentJeonse,
      hsi: currentHsi
    });
  }
  
  return result;
}
