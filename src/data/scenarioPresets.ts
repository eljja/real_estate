export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  params: {
    baseRate: number;       // 기준금리 (%)
    fairValueRatio: number; // 종부세 공정시장가액비율 (0~1)
    cptMultiplier: number;  // 종부세 세율 배율 (1.0 = 현행)
    ltvLimit: number;       // LTV 상한 (0~1)
    dsrLimit: number;       // DSR 상한 (0~1)
    jeonseChange: number;   // 전세가 증감률 (-0.3 ~ +0.3)
    conversionRate: number; // 전월세전환율 (%)
    multiHomeSurcharge: boolean; // 다주택 중과 적용 여부
  };
}

export const scenarioPresets: ScenarioPreset[] = [
  {
    id: 'current',
    name: '기준 2026 현행',
    description: '현재의 거시경제 지표 및 규제 환경 유지',
    params: {
      baseRate: 3.0,
      fairValueRatio: 0.6,
      cptMultiplier: 1.0,
      ltvLimit: 0.7,
      dsrLimit: 0.4,
      jeonseChange: 0,
      conversionRate: 4.8,
      multiHomeSurcharge: false
    }
  },
  {
    id: 'hard_landing',
    name: '경착륙 (Hard Landing)',
    description: '고금리 장기화, 전세가 급락, 규제 강화의 복합 위기',
    params: {
      baseRate: 5.0,
      fairValueRatio: 0.8,
      cptMultiplier: 1.5,
      ltvLimit: 0.5,
      dsrLimit: 0.35,
      jeonseChange: -0.2,
      conversionRate: 6.5,
      multiHomeSurcharge: true
    }
  },
  {
    id: 'liquidity',
    name: '유동성 장세',
    description: '금리 인하와 규제 완화로 인한 유동성 확대',
    params: {
      baseRate: 1.5,
      fairValueRatio: 0.6,
      cptMultiplier: 0.8,
      ltvLimit: 0.8,
      dsrLimit: 0.5,
      jeonseChange: 0.15,
      conversionRate: 3.5,
      multiHomeSurcharge: false
    }
  },
  {
    id: 'polarization',
    name: '양극화 심화',
    description: '규제는 현행 유지되나 시장 불확실성으로 인한 양극화',
    params: {
      baseRate: 3.5,
      fairValueRatio: 0.6,
      cptMultiplier: 1.0,
      ltvLimit: 0.7,
      dsrLimit: 0.4,
      jeonseChange: 0,
      conversionRate: 5.0,
      multiHomeSurcharge: false
    }
  },
  {
    id: 'monthly_rent_accel',
    name: '전세→월세 전환 가속',
    description: '전세 사기 여파 및 고금리로 인한 월세 선호 심화',
    params: {
      baseRate: 4.0,
      fairValueRatio: 0.6,
      cptMultiplier: 1.0,
      ltvLimit: 0.7,
      dsrLimit: 0.4,
      jeonseChange: -0.15,
      conversionRate: 6.0,
      multiHomeSurcharge: false
    }
  },
  {
    id: 'extreme_stress',
    name: '극단 스트레스 테스트',
    description: '최악의 시장 붕괴 및 징벌적 세제 시나리오',
    params: {
      baseRate: 6.0,
      fairValueRatio: 1.0,
      cptMultiplier: 2.0,
      ltvLimit: 0.3,
      dsrLimit: 0.3,
      jeonseChange: -0.3,
      conversionRate: 8.0,
      multiHomeSurcharge: true
    }
  }
];
