export interface BubbleIndicatorResult {
  name: string; // 한글 지표명
  nameEn: string; // 영문 약어
  institution: string; // 권고/산출 기관 (BIS, IMF, HF, OECD)
  value: number; // 현재 산출치
  maxValue: number; // 차트 스케일 상한선
  historical10YrAvg: number; // 10년 역사적 평균치
  historicalPercentile: number; // 10년 백분위수 (%)
  formula: string; // 산출 공식
  riskLevel: 'safe' | 'caution' | 'warning' | 'danger' | 'critical';
  riskLabel: string;
  description: string;
  dangerImplication: string; // 위험 구간 진입 시 파급 영향
  threshold: { safe: number; caution: number; warning: number; danger: number };
}

export interface BubbleParams {
  medianPrice?: number;
  medianIncome?: number;
  annualRent?: number;
  mortgageRate?: number;
  ltvRatio?: number;
  householdCredit?: number; // 조원
  nominalGDP?: number; // 조원
  creditTrend?: number;
  delinquencyRate?: number;
  delinquencyBaseline?: number;
  monthsOfSupply?: number;
  unsoldInventory?: number;
  unsoldBaseline?: number;
  constructionCost?: number;
}

function getRiskLevel(
  value: number,
  thresholds: { safe: number; caution: number; warning: number; danger: number }
): { level: 'safe' | 'caution' | 'warning' | 'danger' | 'critical'; label: string } {
  if (value < thresholds.safe) return { level: 'safe', label: '안전 (Safe)' };
  if (value < thresholds.caution) return { level: 'caution', label: '주의 (Caution)' };
  if (value < thresholds.warning) return { level: 'warning', label: '경고 (Warning)' };
  if (value < thresholds.danger) return { level: 'danger', label: '위험 (Danger)' };
  return { level: 'critical', label: '심각 (Critical)' };
}

export function calculatePIR(medianPrice: number, medianIncome: number): BubbleIndicatorResult {
  const value = Math.round((medianPrice / medianIncome) * 10) / 10;
  const threshold = { safe: 7.0, caution: 11.0, warning: 14.5, danger: 16.0 };
  const risk = getRiskLevel(value, threshold);

  return {
    name: '소득 대비 주택가격비율',
    nameEn: 'PIR (Price to Income Ratio)',
    institution: 'UN-Habitat / KB국민은행',
    value,
    maxValue: 25.0,
    historical10YrAvg: 11.8,
    historicalPercentile: Math.min(99, Math.max(5, Math.round((value / 18) * 100))),
    formula: '서울 아파트 중위 매매가격 ÷ 가구 중위 연소득',
    riskLevel: risk.level,
    riskLabel: risk.label,
    description: '중위소득 가구가 소득을 한 푼도 쓰지 않고 모았을 때 서울 중간가격 주택을 구입하는 데 걸리는 햇수입니다.',
    dangerImplication: '15배 초과 시 청년·무주택자의 근로의욕 상실 및 자산 불평등 극대화, 출산율 급락 요인으로 작용합니다.',
    threshold
  };
}

export function calculatePRR(medianPrice: number, annualRent: number): BubbleIndicatorResult {
  const safeRent = Math.max(100, annualRent);
  const value = Math.round((medianPrice / safeRent) * 10) / 10;
  const threshold = { safe: 18.0, caution: 24.0, warning: 30.0, danger: 35.0 };
  const risk = getRiskLevel(value, threshold);

  return {
    name: '임대료 대비 주택가격비율',
    nameEn: 'PRR (Price to Rent Ratio)',
    institution: 'OECD / IMF',
    value,
    maxValue: 45.0,
    historical10YrAvg: 23.5,
    historicalPercentile: Math.min(99, Math.max(5, Math.round((value / 35) * 100))),
    formula: '중위 매매가격 ÷ 연간 실질 임대료 총액 (PER 개념)',
    riskLevel: risk.level,
    riskLabel: risk.label,
    description: '주식의 PER과 같은 지표로, 주택의 펀더멘털(임대수익 가치) 대비 시세의 고평가 정도를 측정합니다.',
    dangerImplication: '30배 초과 시 순수 임대수익률이 3% 미만으로 전락하여 시세차익 기대감이 꺾일 때 매물 투매가 촉발됩니다.',
    threshold
  };
}

export function calculateKHAI(medianPrice: number, medianIncome: number, mortgageRate: number, ltvRatio: number): BubbleIndicatorResult {
  const loanAmount = medianPrice * Math.min(0.7, ltvRatio);
  const monthlyRate = mortgageRate / 100 / 12;
  const totalMonths = 30 * 12;
  let annualPayment = 0;
  if (monthlyRate > 0) {
    annualPayment = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)) * 12;
  } else {
    annualPayment = loanAmount / 30;
  }

  // K-HAI: 중위소득 25% 대비 원리금 상환액 비율 (100 = 소득 25%를 정확히 상환에 투입)
  const value = Math.round((annualPayment / (medianIncome * 0.25)) * 1000) / 10;
  const threshold = { safe: 100, caution: 140, warning: 180, danger: 210 };
  const risk = getRiskLevel(value, threshold);

  return {
    name: '주택구입부담지수',
    nameEn: 'K-HAI (Korea Housing Affordability)',
    institution: '한국주택금융공사 (HF)',
    value,
    maxValue: 280,
    historical10YrAvg: 135.2,
    historicalPercentile: Math.min(99, Math.max(5, Math.round((value / 220) * 100))),
    formula: '(적정 대출 상환액 ÷ 가구소득의 25%) × 100',
    riskLevel: risk.level,
    riskLabel: risk.label,
    description: '중위소득 가구가 중간가격 주택을 구입할 때 금융비용 부담을 나타내며, 100을 넘을수록 소득 대비 과도한 부채를 짊어졌음을 의미합니다.',
    dangerImplication: '180 초과 시 금리 0.5%p 인상만으로도 영끌 가구의 원리금 연체가 급증하여 가계 소비가 급격히 위축됩니다.',
    threshold
  };
}

export function calculateTobinsQ(marketPrice: number, constructionCost: number): BubbleIndicatorResult {
  const safeCost = Math.max(1000, constructionCost);
  const value = Math.round((marketPrice / safeCost) * 100) / 100;
  const threshold = { safe: 1.10, caution: 1.30, warning: 1.55, danger: 1.80 };
  const risk = getRiskLevel(value, threshold);

  return {
    name: '주택 토빈의 Q',
    nameEn: "Tobin's Q for Housing",
    institution: '한국은행 / 노벨경제학상 토빈 모델',
    value,
    maxValue: 2.50,
    historical10YrAvg: 1.28,
    historicalPercentile: Math.min(99, Math.max(5, Math.round((value / 2.0) * 100))),
    formula: '주택 시장 시세 ÷ 대체 비용 (토지비 + 건축비)',
    riskLevel: risk.level,
    riskLabel: risk.label,
    description: '신축 주택을 새로 짓는 비용(건축원가+토지대) 대비 기존 주택 시장가격의 배수로, 순수 투기적 프리미엄을 측정합니다.',
    dangerImplication: '1.6 초과 시 거품 붕괴 국면에서 건축비 수준으로 시세가 급락하여 분양 시장 미분양이 폭증합니다.',
    threshold
  };
}

export function calculateCreditGap(householdCredit: number, gdp: number, trend: number): BubbleIndicatorResult {
  const creditRatio = (householdCredit / gdp) * 100;
  const gap = Math.round((creditRatio - (trend * 100)) * 10) / 10;
  const threshold = { safe: 2.0, caution: 5.5, warning: 9.0, danger: 12.0 };
  const risk = getRiskLevel(gap, threshold);

  return {
    name: '민간신용 / GDP 갭',
    nameEn: 'BIS Credit-to-GDP Gap',
    institution: '국제결제은행 (BIS)',
    value: gap,
    maxValue: 20.0,
    historical10YrAvg: 6.2,
    historicalPercentile: Math.min(99, Math.max(5, Math.round((gap / 15) * 100))),
    formula: '(명목 GDP 대비 가계신용 비율) - 장기 추세선(HP필터)',
    riskLevel: risk.level,
    riskLabel: risk.label,
    description: '국가 경제 규모 대비 가계부채가 장기 균형 추세에서 얼마나 과도하게 팽창했는지를 측정하는 글로벌 금융위기 조기경보 1순위 지표입니다.',
    dangerImplication: '10%p 초과 시 BIS 기준 국가 거시건전성 위기 경보 단계로, 강제적 대출 총량 규제 및 디레버리징 충격이 도래합니다.',
    threshold
  };
}

export function calculateDelinquencyRisk(currentRate: number, baseline: number): BubbleIndicatorResult {
  const diffBps = Math.round((currentRate - baseline) * 100);
  const threshold = { safe: 15, caution: 40, warning: 75, danger: 110 };
  const risk = getRiskLevel(diffBps, threshold);

  return {
    name: '주담대 연체율 급증 위험',
    nameEn: 'Mortgage Delinquency Spike',
    institution: '금융감독원 / 연준(FRB)',
    value: diffBps,
    maxValue: 180,
    historical10YrAvg: 30,
    historicalPercentile: Math.min(99, Math.max(5, Math.round((diffBps / 120) * 100))),
    formula: '(현재 주택담보대출 연체율 - 역사적 저점 연체율) (bp 단위)',
    riskLevel: risk.level,
    riskLabel: risk.label,
    description: '부실 대출의 초기 징후로, 연체율이 저점 대비 가파르게 상승할수록 은행권 부실채권(NPL) 매각 및 경매 물건 쇄도가 발생합니다.',
    dangerImplication: '80bp 이상 급등 시 2금융권 PF 및 가계대출 연쇄 부실로 이어져 금융권의 대출 회수가 가속화됩니다.',
    threshold
  };
}

export function calculateMonthsOfSupply(months: number): BubbleIndicatorResult {
  const value = Math.round(months * 10) / 10;
  const threshold = { safe: 4.0, caution: 6.5, warning: 8.5, danger: 11.0 };
  const risk = getRiskLevel(value, threshold);

  return {
    name: '매물 재고 소진 개월수',
    nameEn: 'Months of Inventory Supply',
    institution: '미국 전미부동산협회 (NAR)',
    value,
    maxValue: 16.0,
    historical10YrAvg: 5.8,
    historicalPercentile: Math.min(99, Math.max(5, Math.round((value / 12) * 100))),
    formula: '현재 시장 등록 활성 매물 총수 ÷ 월평균 아파트 실거래량',
    riskLevel: risk.level,
    riskLabel: risk.label,
    description: '신규 매물이 전혀 나오지 않는다고 가정할 때, 현재 매물이 모두 거래되어 소진되는 데 걸리는 기간입니다.',
    dangerImplication: '9개월 초과 시 완벽한 매수자 우위 시장으로 전환되어 호가 공백 및 급매물 위주의 계단식 하락이 지속됩니다.',
    threshold
  };
}

export function calculateUnsoldSpike(current: number, baseline: number): BubbleIndicatorResult {
  const safeBase = Math.max(1000, baseline);
  const value = Math.round((current / safeBase) * 100) / 100;
  const threshold = { safe: 1.15, caution: 1.45, warning: 1.85, danger: 2.20 };
  const risk = getRiskLevel(value, threshold);

  return {
    name: '준공 후 미분양 급증 위험',
    nameEn: 'Unsold Inventory Spike',
    institution: '국토교통부 주택통계',
    value,
    maxValue: 3.20,
    historical10YrAvg: 1.25,
    historicalPercentile: Math.min(99, Math.max(5, Math.round((value / 2.5) * 100))),
    formula: '현재 미분양 호수 ÷ 기준선(5만호 평시 수준)',
    riskLevel: risk.level,
    riskLabel: risk.label,
    description: '악성 미분양으로 불리는 준공 후 미분양의 급증세는 건설사 자금난과 직결되며 공급 시장 경색을 유발합니다.',
    dangerImplication: '2.0배 초과 시 건설사 연쇄 부도 및 금융권 부실 전이로 부동산 PF 위기가 본격화됩니다.',
    threshold
  };
}

export function calculateAllIndicators(params: BubbleParams): BubbleIndicatorResult[] {
  const medianPrice = params.medianPrice ?? 115000;
  const medianIncome = params.medianIncome ?? 7200;
  const annualRent = params.annualRent ?? (medianPrice * 0.038);
  const mortgageRate = params.mortgageRate ?? 4.5;
  const ltvRatio = params.ltvRatio ?? 0.6;
  const householdCredit = params.householdCredit ?? 1920;
  const nominalGDP = params.nominalGDP ?? 2280;
  const creditTrend = params.creditTrend ?? 0.78;
  const delinquencyRate = params.delinquencyRate ?? 0.42;
  const delinquencyBaseline = params.delinquencyBaseline ?? 0.22;
  const monthsOfSupply = params.monthsOfSupply ?? 6.2;
  const unsoldInventory = params.unsoldInventory ?? 68000;
  const unsoldBaseline = params.unsoldBaseline ?? 52000;
  const constructionCost = params.constructionCost ?? (medianPrice * 0.68);

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

export function getOverallBubbleRisk(indicators: BubbleIndicatorResult[]): {
  score: number;
  level: 'safe' | 'caution' | 'warning' | 'danger' | 'critical';
  label: string;
  summary: string;
  dangerCount: number;
} {
  let totalScore = 0;
  let dangerCount = 0;

  for (const ind of indicators) {
    if (ind.riskLevel === 'critical') { totalScore += 4; dangerCount++; }
    else if (ind.riskLevel === 'danger') { totalScore += 3.5; dangerCount++; }
    else if (ind.riskLevel === 'warning') { totalScore += 2.5; }
    else if (ind.riskLevel === 'caution') { totalScore += 1.5; }
    else { totalScore += 1; }
  }

  const avg = Math.round((totalScore / indicators.length) * 10) / 10;

  if (avg >= 3.3 || dangerCount >= 4) {
    return {
      score: avg,
      level: 'critical',
      label: '심각한 거품 (붕괴 임박)',
      summary: '8대 핵심 지표 중 다수가 위험 임계선을 돌파하여 금리 충격 시 자산가격의 급격한 디레버리징(경착륙) 위험이 최고조에 달해 있습니다.',
      dangerCount
    };
  }
  if (avg >= 2.6 || dangerCount >= 2) {
    return {
      score: avg,
      level: 'warning',
      label: '경고 (과열 조정 국면)',
      summary: '소득 및 펀더멘털 대비 주택가격이 고평가 구간에 진입해 있어 대출 규제 강화 시 거래 위축 및 가격 조정 가능성이 큽니다.',
      dangerCount
    };
  }
  if (avg >= 1.8) {
    return {
      score: avg,
      level: 'caution',
      label: '주의 (국지적 과열)',
      summary: '일부 상급지 및 신축 중심의 선별적 과열이 관측되나 전체 거시 금융시스템 위험으로의 전이는 제한적입니다.',
      dangerCount
    };
  }
  return {
    score: avg,
    level: 'safe',
    label: '안전 (균형 시장)',
    summary: '주요 거시 지표들이 장기 추세선 및 역사적 평균 범위 내에서 안정적으로 유지되고 있습니다.',
    dangerCount
  };
}
