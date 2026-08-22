export interface BubbleIndicatorResult {
  name: string;          // Korean name
  nameEn: string;        // English name
  value: number;         // computed value
  maxValue: number;      // scale maximum for charts
  riskLevel: 'safe' | 'caution' | 'warning' | 'danger' | 'critical';
  riskLabel: string;     // Korean risk label
  description: string;   // Korean explanation
  threshold: { safe: number; caution: number; warning: number; danger: number };
}

export interface BubbleParams {
  medianPrice?: number;
  medianIncome?: number;
  annualRent?: number;
  mortgageRate?: number;
  ltvRatio?: number;
  householdCredit?: number;
  nominalGDP?: number;
  creditTrend?: number;
  delinquencyRate?: number;
  delinquencyBaseline?: number;
  monthsOfSupply?: number;
  unsoldInventory?: number;
  unsoldBaseline?: number;
  constructionCost?: number;
}

function getRiskLevel(value: number, thresholds: { safe: number; caution: number; warning: number; danger: number }): { level: 'safe' | 'caution' | 'warning' | 'danger' | 'critical', label: string } {
  if (value < thresholds.safe) return { level: 'safe', label: '안전' };
  if (value < thresholds.caution) return { level: 'caution', label: '주의' };
  if (value < thresholds.warning) return { level: 'warning', label: '경고' };
  if (value < thresholds.danger) return { level: 'danger', label: '위험' };
  return { level: 'critical', label: '심각' };
}

export function calculatePIR(medianPrice: number, medianIncome: number): BubbleIndicatorResult {
  const value = medianPrice / medianIncome;
  const threshold = { safe: 5, caution: 10, warning: 15, danger: 15 };
  const risk = getRiskLevel(value, threshold);
  // Danger is >= 15, so anything above 15 is critical/danger
  const level = value >= 15 ? 'critical' : risk.level;
  
  return {
    name: '소득대비 주택가격비율',
    nameEn: 'PIR',
    value,
    maxValue: 25,
    riskLevel: level as any,
    riskLabel: risk.label,
    description: '가구의 연소득을 한 푼도 쓰지 않고 모았을 때 주택을 구입하는 데 걸리는 시간입니다.',
    threshold
  };
}

export function calculatePRR(medianPrice: number, annualRent: number): BubbleIndicatorResult {
  const value = medianPrice / annualRent;
  const threshold = { safe: 15, caution: 20, warning: 30, danger: 30 };
  const risk = getRiskLevel(value, threshold);
  
  return {
    name: '임대료대비 주택가격비율',
    nameEn: 'PRR',
    value,
    maxValue: 40,
    riskLevel: (value > 30 ? 'critical' : risk.level) as any,
    riskLabel: risk.label,
    description: '연간 임대료 대비 주택가격의 배수입니다. 이 수치가 높을수록 주택가격이 고평가되었음을 의미합니다.',
    threshold
  };
}

export function calculateKHAI(medianPrice: number, medianIncome: number, mortgageRate: number, ltvRatio: number): BubbleIndicatorResult {
  const loanAmount = medianPrice * ltvRatio;
  const monthlyRate = mortgageRate / 100 / 12;
  const months = 30 * 12; // 30 years assumption
  let annualPayment = 0;
  
  if (monthlyRate > 0) {
    annualPayment = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)) * 12;
  } else {
    annualPayment = loanAmount / 30;
  }
  
  const value = (annualPayment / (medianIncome * 0.25)) * 100;
  const threshold = { safe: 80, caution: 120, warning: 160, danger: 160 };
  const risk = getRiskLevel(value, threshold);
  
  return {
    name: '주택구입부담지수',
    nameEn: 'K-HAI',
    value,
    maxValue: 250,
    riskLevel: (value > 160 ? 'critical' : risk.level) as any,
    riskLabel: risk.label,
    description: '중위소득 가구가 중간가격 주택 구입 시 대출상환 부담을 나타내는 지수입니다.',
    threshold
  };
}

export function calculateTobinsQ(marketPrice: number, constructionCost: number): BubbleIndicatorResult {
  const value = marketPrice / constructionCost;
  const threshold = { safe: 1.1, caution: 1.3, warning: 1.5, danger: 1.5 };
  const risk = getRiskLevel(value, threshold);
  
  return {
    name: '토빈의 Q',
    nameEn: 'Tobin\'s Q',
    value,
    maxValue: 2.5,
    riskLevel: (value >= 1.5 ? 'critical' : risk.level) as any,
    riskLabel: risk.label,
    description: '주택의 시장가치를 대체비용(재건축 비용 등)으로 나눈 값입니다.',
    threshold
  };
}

export function calculateCreditGap(householdCredit: number, gdp: number, trend: number): BubbleIndicatorResult {
  const creditToGdp = householdCredit / gdp;
  const gap = (creditToGdp - trend) * 100; // in percentage points
  const threshold = { safe: 2, caution: 6, warning: 10, danger: 10 };
  const risk = getRiskLevel(gap, threshold);
  
  return {
    name: '신용갭',
    nameEn: 'Credit Gap',
    value: gap,
    maxValue: 20,
    riskLevel: (gap >= 10 ? 'critical' : risk.level) as any,
    riskLabel: risk.label,
    description: '명목 GDP 대비 가계신용 비율이 장기 추세선에서 얼마나 벗어났는지 나타냅니다.',
    threshold
  };
}

export function calculateDelinquencyRisk(currentRate: number, baseline: number): BubbleIndicatorResult {
  const value = (currentRate - baseline) * 100; // in bps
  const threshold = { safe: 20, caution: 50, warning: 100, danger: 100 };
  const risk = getRiskLevel(value, threshold);
  
  return {
    name: '연체율 급증위험',
    nameEn: 'Delinquency Risk',
    value,
    maxValue: 200,
    riskLevel: (value >= 100 ? 'critical' : risk.level) as any,
    riskLabel: risk.label,
    description: '대출 연체율이 과거 저점 대비 얼마나 상승했는지 나타냅니다 (bp 단위).',
    threshold
  };
}

export function calculateMonthsOfSupply(months: number): BubbleIndicatorResult {
  const threshold = { safe: 4, caution: 6, warning: 8, danger: 8 };
  const risk = getRiskLevel(months, threshold);
  
  return {
    name: '매물 소진 개월수',
    nameEn: 'Months of Supply',
    value: months,
    maxValue: 12,
    riskLevel: (months > 8 ? 'critical' : risk.level) as any,
    riskLabel: risk.label,
    description: '현재 시장에 나온 매물이 모두 팔리는 데 걸리는 기간입니다.',
    threshold
  };
}

export function calculateUnsoldSpike(current: number, baseline: number): BubbleIndicatorResult {
  const value = current / baseline;
  const threshold = { safe: 1.2, caution: 1.5, warning: 2.0, danger: 2.0 };
  const risk = getRiskLevel(value, threshold);
  
  return {
    name: '미분양 급증위험',
    nameEn: 'Unsold Inventory Spike',
    value,
    maxValue: 3.0,
    riskLevel: (value >= 2.0 ? 'critical' : risk.level) as any,
    riskLabel: risk.label,
    description: '미분양 주택 수가 기준선 대비 얼마나 증가했는지 나타냅니다.',
    threshold
  };
}

export function calculateAllIndicators(params: BubbleParams): BubbleIndicatorResult[] {
  const medianPrice = params.medianPrice ?? 100000;
  const medianIncome = params.medianIncome ?? 6000;
  const annualRent = params.annualRent ?? (medianPrice * 0.04);
  const mortgageRate = params.mortgageRate ?? 4.5;
  const ltvRatio = params.ltvRatio ?? 0.5;
  const householdCredit = params.householdCredit ?? 1900;
  const nominalGDP = params.nominalGDP ?? 2200;
  const creditTrend = params.creditTrend ?? 0.80;
  const delinquencyRate = params.delinquencyRate ?? 0.38;
  const delinquencyBaseline = params.delinquencyBaseline ?? 0.25;
  const monthsOfSupply = params.monthsOfSupply ?? 5.5;
  const unsoldInventory = params.unsoldInventory ?? 65000;
  const unsoldBaseline = params.unsoldBaseline ?? 55000;
  const constructionCost = params.constructionCost ?? (medianPrice * 0.7);

  return [
    calculatePIR(medianPrice, medianIncome),
    calculatePRR(medianPrice, annualRent),
    calculateKHAI(medianPrice, medianIncome, mortgageRate, ltvRatio),
    calculateTobinsQ(medianPrice, constructionCost),
    calculateCreditGap(householdCredit, nominalGDP, creditTrend),
    calculateDelinquencyRisk(delinquencyRate, delinquencyBaseline),
    calculateMonthsOfSupply(monthsOfSupply),
    calculateUnsoldSpike(unsoldInventory, unsoldBaseline)
  ];
}

export function getOverallBubbleRisk(indicators: BubbleIndicatorResult[]): { score: number; level: string; label: string } {
  let score = 0;
  for (const ind of indicators) {
    if (ind.riskLevel === 'critical' || ind.riskLevel === 'danger') score += 4;
    else if (ind.riskLevel === 'warning') score += 3;
    else if (ind.riskLevel === 'caution') score += 2;
    else score += 1;
  }
  
  const avg = score / indicators.length;
  
  if (avg < 1.5) return { score: avg, level: 'safe', label: '안전' };
  if (avg < 2.5) return { score: avg, level: 'caution', label: '주의' };
  if (avg < 3.5) return { score: avg, level: 'warning', label: '경고' };
  return { score: avg, level: 'critical', label: '위험' };
}
