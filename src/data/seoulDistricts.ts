export interface DistrictData {
  id: string;
  name: string;
  region: string;
  avgSalePrice: number; // 평균 매매가 (만원)
  avgJeonsePrice: number; // 평균 전세가 (만원)
  jeonseRatio: number; // 전세가율 (0~1)
  monthlyRentDeposit: number; // 월세 보증금 (만원)
  monthlyRent: number; // 월세 (만원)
  population: number; // 인구 (만명)
  gapInvestmentLevel: 'low' | 'medium' | 'high' | 'very_high';
  characteristics: string;
  isRegulated: boolean;
  avgOfficialPrice: number; // 평균 공시가격 (만원)
  reconstructionPremium: boolean;
  multiHomeHoldingRatio: number; // 다주택자 보유 비중 (%)
  unsoldUnits: number; // 미분양 호수
  supplyNext3Years: number; // 향후 3개년 누적 입주 예정 물량 (호)
  avgHouseholdIncome: number; // 구별 평균 가구 연소득 (만원)
  liquidityScore: number; // 거래 유동성 점수 (0~100)
}

export const seoulDistricts: DistrictData[] = [
  {
    id: 'gangnam', name: '강남구', region: '동남권 (강남3구)',
    avgSalePrice: 265000, avgJeonsePrice: 106000, jeonseRatio: 0.400,
    monthlyRentDeposit: 16000, monthlyRent: 330,
    population: 54.5, gapInvestmentLevel: 'low', characteristics: '국내 최고가 학군·업무 중심지, 고가주택 밀집, 종부세 최고 민감',
    isRegulated: true, avgOfficialPrice: 265000 * 0.69, reconstructionPremium: true,
    multiHomeHoldingRatio: 27.5, unsoldUnits: 12, supplyNext3Years: 8500, avgHouseholdIncome: 9800, liquidityScore: 88
  },
  {
    id: 'seocho', name: '서초구', region: '동남권 (강남3구)',
    avgSalePrice: 252000, avgJeonsePrice: 109000, jeonseRatio: 0.432,
    monthlyRentDeposit: 15500, monthlyRent: 320,
    population: 40.2, gapInvestmentLevel: 'low', characteristics: '반포·잠원 한강변 하이엔드 신축 밀집, 자산가 중심의 탄탄한 실수요',
    isRegulated: true, avgOfficialPrice: 252000 * 0.69, reconstructionPremium: true,
    multiHomeHoldingRatio: 26.8, unsoldUnits: 8, supplyNext3Years: 6200, avgHouseholdIncome: 9500, liquidityScore: 85
  },
  {
    id: 'songpa', name: '송파구', region: '동남권 (강남3구)',
    avgSalePrice: 172000, avgJeonsePrice: 82000, jeonseRatio: 0.477,
    monthlyRentDeposit: 11000, monthlyRent: 240,
    population: 65.2, gapInvestmentLevel: 'medium', characteristics: '잠실 엘리트파 대단지 주거타운, 강남 접근성 우수, 갈아타기 1순위',
    isRegulated: true, avgOfficialPrice: 172000 * 0.69, reconstructionPremium: true,
    multiHomeHoldingRatio: 24.2, unsoldUnits: 25, supplyNext3Years: 4800, avgHouseholdIncome: 8200, liquidityScore: 92
  },
  {
    id: 'yongsan', name: '용산구', region: '도심 / 한강벨트',
    avgSalePrice: 205000, avgJeonsePrice: 93000, jeonseRatio: 0.454,
    monthlyRentDeposit: 13000, monthlyRent: 280,
    population: 21.0, gapInvestmentLevel: 'low', characteristics: '국제업무지구·용산공원 개발, 한남뉴타운 등 최고급 정비사업 호재',
    isRegulated: true, avgOfficialPrice: 205000 * 0.69, reconstructionPremium: true,
    multiHomeHoldingRatio: 28.1, unsoldUnits: 15, supplyNext3Years: 3100, avgHouseholdIncome: 8600, liquidityScore: 80
  },
  {
    id: 'seongdong', name: '성동구', region: '도심 / 한강벨트',
    avgSalePrice: 154000, avgJeonsePrice: 79000, jeonseRatio: 0.513,
    monthlyRentDeposit: 8500, monthlyRent: 210,
    population: 27.2, gapInvestmentLevel: 'medium', characteristics: '성수 IT밸리·삼표레미콘 부지 개발, 마용성 대표 주거지',
    isRegulated: false, avgOfficialPrice: 154000 * 0.69, reconstructionPremium: false,
    multiHomeHoldingRatio: 23.5, unsoldUnits: 5, supplyNext3Years: 2400, avgHouseholdIncome: 7600, liquidityScore: 84
  },
  {
    id: 'mapo', name: '마포구', region: '도심 / 한강벨트',
    avgSalePrice: 141000, avgJeonsePrice: 77000, jeonseRatio: 0.546,
    monthlyRentDeposit: 7500, monthlyRent: 195,
    population: 36.5, gapInvestmentLevel: 'medium', characteristics: '여의도·광화문 CBD 직주근접, 신촌·홍대 상권, 3040 맞벌이 선호',
    isRegulated: false, avgOfficialPrice: 141000 * 0.69, reconstructionPremium: false,
    multiHomeHoldingRatio: 22.8, unsoldUnits: 18, supplyNext3Years: 3200, avgHouseholdIncome: 7400, liquidityScore: 86
  },
  {
    id: 'gwangjin', name: '광진구', region: '도심 / 한강벨트',
    avgSalePrice: 136000, avgJeonsePrice: 74000, jeonseRatio: 0.544,
    monthlyRentDeposit: 7500, monthlyRent: 190,
    population: 33.2, gapInvestmentLevel: 'medium', characteristics: '광장동 전통 학군, 동서울터미널 현대화 복합개발 추진',
    isRegulated: false, avgOfficialPrice: 136000 * 0.69, reconstructionPremium: false,
    multiHomeHoldingRatio: 21.4, unsoldUnits: 30, supplyNext3Years: 2100, avgHouseholdIncome: 7100, liquidityScore: 75
  },
  {
    id: 'yeongdeungpo', name: '영등포구', region: '서남권',
    avgSalePrice: 132000, avgJeonsePrice: 71000, jeonseRatio: 0.538,
    monthlyRentDeposit: 6500, monthlyRent: 180,
    population: 37.2, gapInvestmentLevel: 'medium', characteristics: '여의도 금융 중심지 재건축, 신길뉴타운 완성 및 영등포 도심 재생',
    isRegulated: false, avgOfficialPrice: 132000 * 0.69, reconstructionPremium: true,
    multiHomeHoldingRatio: 23.9, unsoldUnits: 45, supplyNext3Years: 4200, avgHouseholdIncome: 7300, liquidityScore: 83
  },
  {
    id: 'yangcheon', name: '양천구', region: '서남권',
    avgSalePrice: 145000, avgJeonsePrice: 76000, jeonseRatio: 0.524,
    monthlyRentDeposit: 8500, monthlyRent: 185,
    population: 43.1, gapInvestmentLevel: 'medium', characteristics: '목동 신시가지 1~14단지 전면 재건축 추진, 서울 서부 최고 학군',
    isRegulated: false, avgOfficialPrice: 145000 * 0.69, reconstructionPremium: true,
    multiHomeHoldingRatio: 25.0, unsoldUnits: 10, supplyNext3Years: 1800, avgHouseholdIncome: 7900, liquidityScore: 87
  },
  {
    id: 'gangdong', name: '강동구', region: '동남권 (준강남)',
    avgSalePrice: 126000, avgJeonsePrice: 68000, jeonseRatio: 0.540,
    monthlyRentDeposit: 6500, monthlyRent: 170,
    population: 46.0, gapInvestmentLevel: 'medium', characteristics: '올림픽파크포레온(둔촌주공) 등 대규모 입주, 고덕 비즈밸리 업무지구',
    isRegulated: false, avgOfficialPrice: 126000 * 0.69, reconstructionPremium: false,
    multiHomeHoldingRatio: 22.0, unsoldUnits: 55, supplyNext3Years: 14500, avgHouseholdIncome: 6900, liquidityScore: 89
  },
  {
    id: 'dongjak', name: '동작구', region: '서남권',
    avgSalePrice: 129000, avgJeonsePrice: 72000, jeonseRatio: 0.558,
    monthlyRentDeposit: 6500, monthlyRent: 175,
    population: 37.8, gapInvestmentLevel: 'medium', characteristics: '흑석뉴타운·노량진뉴타운 개발, 강남·여의도 배후 주거지',
    isRegulated: false, avgOfficialPrice: 129000 * 0.69, reconstructionPremium: true,
    multiHomeHoldingRatio: 22.5, unsoldUnits: 20, supplyNext3Years: 3800, avgHouseholdIncome: 6800, liquidityScore: 79
  },
  {
    id: 'jongno', name: '종로구', region: '도심 / 한강벨트',
    avgSalePrice: 116000, avgJeonsePrice: 65000, jeonseRatio: 0.560,
    monthlyRentDeposit: 5500, monthlyRent: 165,
    population: 13.8, gapInvestmentLevel: 'low', characteristics: '전통 정치·행정·문화 중심 도심, 경희궁자이 등 도심 직주근접 단지',
    isRegulated: false, avgOfficialPrice: 116000 * 0.69, reconstructionPremium: false,
    multiHomeHoldingRatio: 20.1, unsoldUnits: 8, supplyNext3Years: 900, avgHouseholdIncome: 6600, liquidityScore: 68
  },
  {
    id: 'jung', name: '중구', region: '도심 / 한강벨트',
    avgSalePrice: 114000, avgJeonsePrice: 67000, jeonseRatio: 0.588,
    monthlyRentDeposit: 5500, monthlyRent: 170,
    population: 11.8, gapInvestmentLevel: 'low', characteristics: '서울 중심 상업업무지구(CBD), 주거 비율 낮으나 도심 신축 수요 탄탄',
    isRegulated: false, avgOfficialPrice: 114000 * 0.69, reconstructionPremium: false,
    multiHomeHoldingRatio: 19.5, unsoldUnits: 12, supplyNext3Years: 1200, avgHouseholdIncome: 6500, liquidityScore: 66
  },
  {
    id: 'seodaemun', name: '서대문구', region: '서북권',
    avgSalePrice: 108000, avgJeonsePrice: 63000, jeonseRatio: 0.583,
    monthlyRentDeposit: 5500, monthlyRent: 160,
    population: 30.2, gapInvestmentLevel: 'medium', characteristics: '북아현뉴타운·가재울뉴타운, 대학가 인접, 광화문 직주근접',
    isRegulated: false, avgOfficialPrice: 108000 * 0.69, reconstructionPremium: false,
    multiHomeHoldingRatio: 21.0, unsoldUnits: 22, supplyNext3Years: 2900, avgHouseholdIncome: 6300, liquidityScore: 74
  },
  {
    id: 'dongdaemun', name: '동대문구', region: '동북권',
    avgSalePrice: 102000, avgJeonsePrice: 61000, jeonseRatio: 0.598,
    monthlyRentDeposit: 5500, monthlyRent: 155,
    population: 33.8, gapInvestmentLevel: 'medium', characteristics: '이문·휘경 뉴타운, 청량리역 GTX 환승 복합개발 중심지',
    isRegulated: false, avgOfficialPrice: 102000 * 0.69, reconstructionPremium: false,
    multiHomeHoldingRatio: 23.2, unsoldUnits: 85, supplyNext3Years: 9500, avgHouseholdIncome: 6100, liquidityScore: 82
  },
  {
    id: 'seongbuk', name: '성북구', region: '동북권',
    avgSalePrice: 95000, avgJeonsePrice: 58000, jeonseRatio: 0.611,
    monthlyRentDeposit: 4500, monthlyRent: 145,
    population: 42.5, gapInvestmentLevel: 'high', characteristics: '길음·장위 뉴타운 대단지 아파트 밀집, 갭투자 비중 높음',
    isRegulated: false, avgOfficialPrice: 95000 * 0.69, reconstructionPremium: false,
    multiHomeHoldingRatio: 25.8, unsoldUnits: 60, supplyNext3Years: 4100, avgHouseholdIncome: 5800, liquidityScore: 76
  },
  {
    id: 'nowon', name: '노원구', region: '동북권',
    avgSalePrice: 81000, avgJeonsePrice: 51000, jeonseRatio: 0.630,
    monthlyRentDeposit: 3500, monthlyRent: 125,
    population: 49.0, gapInvestmentLevel: 'very_high', characteristics: '상계·중계 재건축 추진, 갭투자 집중 구역으로 역전세·금리 민감도 최상위',
    isRegulated: false, avgOfficialPrice: 81000 * 0.69, reconstructionPremium: true,
    multiHomeHoldingRatio: 33.5, unsoldUnits: 95, supplyNext3Years: 3600, avgHouseholdIncome: 5400, liquidityScore: 88
  },
  {
    id: 'dobong', name: '도봉구', region: '동북권',
    avgSalePrice: 67000, avgJeonsePrice: 43000, jeonseRatio: 0.642,
    monthlyRentDeposit: 3000, monthlyRent: 110,
    population: 30.5, gapInvestmentLevel: 'high', characteristics: '창동·상계 신경제중심지 및 GTX-C 호재, 소형 저가 아파트 밀집',
    isRegulated: false, avgOfficialPrice: 67000 * 0.69, reconstructionPremium: false,
    multiHomeHoldingRatio: 29.8, unsoldUnits: 110, supplyNext3Years: 1900, avgHouseholdIncome: 4900, liquidityScore: 65
  },
  {
    id: 'gangbuk', name: '강북구', region: '동북권',
    avgSalePrice: 70000, avgJeonsePrice: 45000, jeonseRatio: 0.643,
    monthlyRentDeposit: 3000, monthlyRent: 115,
    population: 28.7, gapInvestmentLevel: 'high', characteristics: '미아뉴타운 정비, 북한산 배후 자연환경, 높은 전세가율',
    isRegulated: false, avgOfficialPrice: 70000 * 0.69, reconstructionPremium: false,
    multiHomeHoldingRatio: 28.5, unsoldUnits: 140, supplyNext3Years: 2200, avgHouseholdIncome: 4800, liquidityScore: 62
  },
  {
    id: 'jungnang', name: '중랑구', region: '동북권',
    avgSalePrice: 74000, avgJeonsePrice: 47000, jeonseRatio: 0.635,
    monthlyRentDeposit: 3500, monthlyRent: 120,
    population: 38.0, gapInvestmentLevel: 'high', characteristics: '상봉·망우 복합개발, 모아타운·재개발 집중, 갭투자 유입 이력',
    isRegulated: false, avgOfficialPrice: 74000 * 0.69, reconstructionPremium: false,
    multiHomeHoldingRatio: 27.2, unsoldUnits: 75, supplyNext3Years: 2800, avgHouseholdIncome: 5000, liquidityScore: 67
  },
  {
    id: 'eunpyeong', name: '은평구', region: '서북권',
    avgSalePrice: 89000, avgJeonsePrice: 56000, jeonseRatio: 0.629,
    monthlyRentDeposit: 4000, monthlyRent: 140,
    population: 46.2, gapInvestmentLevel: 'medium', characteristics: '은평뉴타운·수색증산뉴타운, GTX-A 연신내역 개통 호재',
    isRegulated: false, avgOfficialPrice: 89000 * 0.69, reconstructionPremium: false,
    multiHomeHoldingRatio: 24.1, unsoldUnits: 40, supplyNext3Years: 3400, avgHouseholdIncome: 5600, liquidityScore: 73
  },
  {
    id: 'gangseo', name: '강서구', region: '서남권',
    avgSalePrice: 94000, avgJeonsePrice: 59000, jeonseRatio: 0.628,
    monthlyRentDeposit: 4500, monthlyRent: 145,
    population: 56.1, gapInvestmentLevel: 'high', characteristics: '마곡 R&D 산업단지 배후 주거, 빌라·오피스텔 전세사기 여파 및 역전세 주의',
    isRegulated: false, avgOfficialPrice: 94000 * 0.69, reconstructionPremium: false,
    multiHomeHoldingRatio: 31.0, unsoldUnits: 90, supplyNext3Years: 3700, avgHouseholdIncome: 5900, liquidityScore: 78
  },
  {
    id: 'guro', name: '구로구', region: '서남권',
    avgSalePrice: 82000, avgJeonsePrice: 52000, jeonseRatio: 0.634,
    monthlyRentDeposit: 3800, monthlyRent: 130,
    population: 38.9, gapInvestmentLevel: 'high', characteristics: 'G밸리(구로디지털단지) 배후, 신도림 역세권, 공공재개발 활발',
    isRegulated: false, avgOfficialPrice: 82000 * 0.69, reconstructionPremium: false,
    multiHomeHoldingRatio: 26.5, unsoldUnits: 80, supplyNext3Years: 2600, avgHouseholdIncome: 5300, liquidityScore: 71
  },
  {
    id: 'geumcheon', name: '금천구', region: '서남권',
    avgSalePrice: 71000, avgJeonsePrice: 46000, jeonseRatio: 0.648,
    monthlyRentDeposit: 3000, monthlyRent: 115,
    population: 22.5, gapInvestmentLevel: 'high', characteristics: '신안산선 개통 예정 호재, 가산디지털단지 직주근접, 높은 전세가율',
    isRegulated: false, avgOfficialPrice: 71000 * 0.69, reconstructionPremium: false,
    multiHomeHoldingRatio: 27.0, unsoldUnits: 65, supplyNext3Years: 1800, avgHouseholdIncome: 4900, liquidityScore: 63
  },
  {
    id: 'gwanak', name: '관악구', region: '서남권',
    avgSalePrice: 87000, avgJeonsePrice: 55000, jeonseRatio: 0.632,
    monthlyRentDeposit: 3800, monthlyRent: 135,
    population: 48.2, gapInvestmentLevel: 'medium', characteristics: '신림선 경전철 개통, 서울대·청년 1인가구 밀집, 신림뉴타운 개발',
    isRegulated: false, avgOfficialPrice: 87000 * 0.69, reconstructionPremium: false,
    multiHomeHoldingRatio: 25.4, unsoldUnits: 50, supplyNext3Years: 3100, avgHouseholdIncome: 5500, liquidityScore: 76
  }
];
