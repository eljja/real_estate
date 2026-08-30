import { create } from 'zustand';

export interface SimParams {
  // 거시 경제
  baseRate: number; // 기준금리 (%) default 3.0
  // 보유세 정책
  fairValueRatio: number; // 공정시장가액비율 default 0.6
  cptMultiplier: number; // 종부세 세율 배율 default 1.0
  multiHomeSurcharge: boolean; // 다주택 중과 default false
  // 대출 규제
  ltvLimit: number; // LTV 상한 default 0.7
  dsrLimit: number; // DSR 상한 default 0.4
  // 전세 시장
  jeonseChange: number; // 전세가 증감률 default 0
  conversionRate: number; // 전월세전환율 default 4.8
  // 주택 정보
  propertyPrice: number; // 매매가 (만원) default 150000 (15억)
  numberOfHomes: number; // 보유 주택수 default 1
  annualIncome: number; // 가구 연소득 (만원) default 7000
  holdingYears: number; // 보유 기간 default 5
  residenceYears: number; // 거주 기간 default 5
  ownerAge: number; // 소유자 나이 default 45
  mortgagePrincipal: number; // 대출 원금 (만원) default 50000
  mortgageYears: number; // 대출 기간 default 30
  // CRS 가중치
  crsWeights: {
    jeonse: number;
    gap: number;
    hsi: number;
    supply: number;
    liquidity: number;
    population: number;
  };
}

export type TabId = 'tax' | 'map' | 'simulation' | 'bubble' | 'report';
export type RegionFilter = 'all' | '동남권' | '도심' | '서남권' | '동북권' | '서북권';

interface SimStore {
  params: SimParams;
  activeTab: TabId;
  selectedScenario: string;
  selectedDistrict: string | null;
  regionFilter: RegionFilter;
  setParams: (partial: Partial<SimParams>) => void;
  setActiveTab: (tab: TabId) => void;
  setSelectedScenario: (id: string) => void;
  setSelectedDistrict: (id: string | null) => void;
  setRegionFilter: (region: RegionFilter) => void;
  applyScenario: (params: Partial<SimParams>) => void;
  resetParams: () => void;
}

const defaultParams: SimParams = {
  baseRate: 3.0,
  fairValueRatio: 0.6,
  cptMultiplier: 1.0,
  multiHomeSurcharge: false,
  ltvLimit: 0.7,
  dsrLimit: 0.4,
  jeonseChange: 0,
  conversionRate: 4.8,
  propertyPrice: 150000,
  numberOfHomes: 1,
  annualIncome: 7000,
  holdingYears: 5,
  residenceYears: 5,
  ownerAge: 45,
  mortgagePrincipal: 50000,
  mortgageYears: 30,
  crsWeights: {
    jeonse: 0.25,
    gap: 0.20,
    hsi: 0.20,
    supply: 0.15,
    liquidity: 0.10,
    population: 0.10
  }
};

export const useSimStore = create<SimStore>((set) => ({
  params: defaultParams,
  activeTab: 'tax',
  selectedScenario: 'base',
  selectedDistrict: 'gangnam',
  regionFilter: 'all',
  setParams: (partial) => set((state) => ({ params: { ...state.params, ...partial } })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedScenario: (id) => set({ selectedScenario: id }),
  setSelectedDistrict: (id) => set({ selectedDistrict: id }),
  setRegionFilter: (region) => set({ regionFilter: region }),
  applyScenario: (params) => set((state) => ({ params: { ...state.params, ...params } })),
  resetParams: () => set({ params: defaultParams, selectedScenario: 'base' })
}));
