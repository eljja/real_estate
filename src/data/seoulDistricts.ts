export interface DistrictData {
  id: string;
  name: string;
  region: string;
  avgSalePrice: number;
  avgJeonsePrice: number;
  jeonseRatio: number;
  monthlyRentDeposit: number;
  monthlyRent: number;
  population: number;
  gapInvestmentLevel: 'low' | 'medium' | 'high' | 'very_high';
  characteristics: string;
  isRegulated: boolean;
  avgOfficialPrice: number;
  reconstructionPremium: boolean;
}

export const seoulDistricts: DistrictData[] = [
  {
    id: 'gangnam', name: '강남구', region: '강남3구',
    avgSalePrice: 258000, avgJeonsePrice: 102000, jeonseRatio: 0.395,
    monthlyRentDeposit: 15000, monthlyRent: 320,
    population: 55.0, gapInvestmentLevel: 'low', characteristics: '교육, 업무중심지, 고가주택 밀집',
    isRegulated: true, avgOfficialPrice: 258000 * 0.69, reconstructionPremium: true
  },
  {
    id: 'seocho', name: '서초구', region: '강남3구',
    avgSalePrice: 245000, avgJeonsePrice: 105000, jeonseRatio: 0.428,
    monthlyRentDeposit: 15000, monthlyRent: 310,
    population: 40.5, gapInvestmentLevel: 'low', characteristics: '고급 주거지, 신축 선호도 높음',
    isRegulated: true, avgOfficialPrice: 245000 * 0.69, reconstructionPremium: true
  },
  {
    id: 'songpa', name: '송파구', region: '강남3구',
    avgSalePrice: 165000, avgJeonsePrice: 78000, jeonseRatio: 0.472,
    monthlyRentDeposit: 10000, monthlyRent: 230,
    population: 65.5, gapInvestmentLevel: 'medium', characteristics: '대단지 아파트 밀집, 주거 환경 양호',
    isRegulated: true, avgOfficialPrice: 165000 * 0.69, reconstructionPremium: true
  },
  {
    id: 'yongsan', name: '용산구', region: '도심권',
    avgSalePrice: 198000, avgJeonsePrice: 89000, jeonseRatio: 0.449,
    monthlyRentDeposit: 12000, monthlyRent: 270,
    population: 21.2, gapInvestmentLevel: 'low', characteristics: '개발 호재, 한강변 프리미엄',
    isRegulated: true, avgOfficialPrice: 198000 * 0.69, reconstructionPremium: true
  },
  {
    id: 'seongdong', name: '성동구', region: '도심권',
    avgSalePrice: 148000, avgJeonsePrice: 76000, jeonseRatio: 0.513,
    monthlyRentDeposit: 8000, monthlyRent: 200,
    population: 27.5, gapInvestmentLevel: 'medium', characteristics: '직주근접, 신흥 고급 주거지',
    isRegulated: false, avgOfficialPrice: 148000 * 0.69, reconstructionPremium: false
  },
  {
    id: 'mapo', name: '마포구', region: '도심권',
    avgSalePrice: 135000, avgJeonsePrice: 74000, jeonseRatio: 0.548,
    monthlyRentDeposit: 7000, monthlyRent: 190,
    population: 36.8, gapInvestmentLevel: 'medium', characteristics: '젊은 층 선호도 높음, 직주근접',
    isRegulated: false, avgOfficialPrice: 135000 * 0.69, reconstructionPremium: false
  },
  {
    id: 'gwangjin', name: '광진구', region: '동북권',
    avgSalePrice: 131000, avgJeonsePrice: 71000, jeonseRatio: 0.542,
    monthlyRentDeposit: 7000, monthlyRent: 185,
    population: 33.5, gapInvestmentLevel: 'medium', characteristics: '한강변, 교육 인프라',
    isRegulated: false, avgOfficialPrice: 131000 * 0.69, reconstructionPremium: false
  },
  {
    id: 'yeongdeungpo', name: '영등포구', region: '서남권',
    avgSalePrice: 128000, avgJeonsePrice: 68000, jeonseRatio: 0.531,
    monthlyRentDeposit: 6000, monthlyRent: 175,
    population: 37.5, gapInvestmentLevel: 'medium', characteristics: '여의도 업무지구 배후',
    isRegulated: false, avgOfficialPrice: 128000 * 0.69, reconstructionPremium: true
  },
  {
    id: 'yangcheon', name: '양천구', region: '서남권',
    avgSalePrice: 139000, avgJeonsePrice: 72000, jeonseRatio: 0.518,
    monthlyRentDeposit: 8000, monthlyRent: 180,
    population: 43.5, gapInvestmentLevel: 'medium', characteristics: '목동 학군, 재건축 기대감',
    isRegulated: false, avgOfficialPrice: 139000 * 0.69, reconstructionPremium: true
  },
  {
    id: 'gangdong', name: '강동구', region: '동남권',
    avgSalePrice: 122000, avgJeonsePrice: 65000, jeonseRatio: 0.533,
    monthlyRentDeposit: 6000, monthlyRent: 165,
    population: 46.2, gapInvestmentLevel: 'medium', characteristics: '대규모 신축 입주, 주거 여건 양호',
    isRegulated: false, avgOfficialPrice: 122000 * 0.69, reconstructionPremium: false
  },
  {
    id: 'dongjak', name: '동작구', region: '서남권',
    avgSalePrice: 125000, avgJeonsePrice: 69000, jeonseRatio: 0.552,
    monthlyRentDeposit: 6000, monthlyRent: 170,
    population: 38.0, gapInvestmentLevel: 'medium', characteristics: '강남 및 여의도 접근성',
    isRegulated: false, avgOfficialPrice: 125000 * 0.69, reconstructionPremium: false
  },
  {
    id: 'jongno', name: '종로구', region: '도심권',
    avgSalePrice: 112000, avgJeonsePrice: 62000, jeonseRatio: 0.554,
    monthlyRentDeposit: 5000, monthlyRent: 160,
    population: 14.0, gapInvestmentLevel: 'low', characteristics: '전통적 도심, 주거지 비중 낮음',
    isRegulated: false, avgOfficialPrice: 112000 * 0.69, reconstructionPremium: false
  },
  {
    id: 'jung', name: '중구', region: '도심권',
    avgSalePrice: 110000, avgJeonsePrice: 64000, jeonseRatio: 0.581,
    monthlyRentDeposit: 5000, monthlyRent: 165,
    population: 12.0, gapInvestmentLevel: 'low', characteristics: '업무중심지, 아파트 공급 적음',
    isRegulated: false, avgOfficialPrice: 110000 * 0.69, reconstructionPremium: false
  },
  {
    id: 'seodaemun', name: '서대문구', region: '서북권',
    avgSalePrice: 104000, avgJeonsePrice: 60000, jeonseRatio: 0.577,
    monthlyRentDeposit: 5000, monthlyRent: 155,
    population: 30.5, gapInvestmentLevel: 'medium', characteristics: '도심 접근성 양호, 뉴타운',
    isRegulated: false, avgOfficialPrice: 104000 * 0.69, reconstructionPremium: false
  },
  {
    id: 'dongdaemun', name: '동대문구', region: '동북권',
    avgSalePrice: 98000, avgJeonsePrice: 58000, jeonseRatio: 0.592,
    monthlyRentDeposit: 5000, monthlyRent: 150,
    population: 34.0, gapInvestmentLevel: 'medium', characteristics: '청량리 개발 호재, 교통 요지',
    isRegulated: false, avgOfficialPrice: 98000 * 0.69, reconstructionPremium: false
  },
  {
    id: 'seongbuk', name: '성북구', region: '동북권',
    avgSalePrice: 92000, avgJeonsePrice: 55000, jeonseRatio: 0.598,
    monthlyRentDeposit: 4000, monthlyRent: 140,
    population: 42.8, gapInvestmentLevel: 'medium', characteristics: '대규모 주거지, 뉴타운',
    isRegulated: false, avgOfficialPrice: 92000 * 0.69, reconstructionPremium: false
  },
  {
    id: 'nowon', name: '노원구', region: '동북권',
    avgSalePrice: 78000, avgJeonsePrice: 48000, jeonseRatio: 0.615,
    monthlyRentDeposit: 3000, monthlyRent: 120,
    population: 49.5, gapInvestmentLevel: 'very_high', characteristics: '학군 우수, 중저가 아파트 밀집',
    isRegulated: false, avgOfficialPrice: 78000 * 0.69, reconstructionPremium: true
  },
  {
    id: 'dobong', name: '도봉구', region: '동북권',
    avgSalePrice: 65000, avgJeonsePrice: 41000, jeonseRatio: 0.631,
    monthlyRentDeposit: 3000, monthlyRent: 105,
    population: 30.8, gapInvestmentLevel: 'high', characteristics: '외곽 지역, 저렴한 주거비',
    isRegulated: false, avgOfficialPrice: 65000 * 0.69, reconstructionPremium: false
  },
  {
    id: 'gangbuk', name: '강북구', region: '동북권',
    avgSalePrice: 68000, avgJeonsePrice: 43000, jeonseRatio: 0.632,
    monthlyRentDeposit: 3000, monthlyRent: 110,
    population: 29.0, gapInvestmentLevel: 'high', characteristics: '외곽 지역, 자연 환경 우수',
    isRegulated: false, avgOfficialPrice: 68000 * 0.69, reconstructionPremium: false
  },
  {
    id: 'jungnang', name: '중랑구', region: '동북권',
    avgSalePrice: 72000, avgJeonsePrice: 45000, jeonseRatio: 0.625,
    monthlyRentDeposit: 3000, monthlyRent: 115,
    population: 38.2, gapInvestmentLevel: 'high', characteristics: '서울 동북권 외곽 주거지',
    isRegulated: false, avgOfficialPrice: 72000 * 0.69, reconstructionPremium: false
  },
  {
    id: 'eunpyeong', name: '은평구', region: '서북권',
    avgSalePrice: 86000, avgJeonsePrice: 53000, jeonseRatio: 0.616,
    monthlyRentDeposit: 4000, monthlyRent: 135,
    population: 46.5, gapInvestmentLevel: 'medium', characteristics: '뉴타운 개발, 주거 환경 개선',
    isRegulated: false, avgOfficialPrice: 86000 * 0.69, reconstructionPremium: false
  },
  {
    id: 'gangseo', name: '강서구', region: '서남권',
    avgSalePrice: 91000, avgJeonsePrice: 56000, jeonseRatio: 0.615,
    monthlyRentDeposit: 4000, monthlyRent: 140,
    population: 56.5, gapInvestmentLevel: 'high', characteristics: '마곡지구 개발, 서남권 관문',
    isRegulated: false, avgOfficialPrice: 91000 * 0.69, reconstructionPremium: false
  },
  {
    id: 'guro', name: '구로구', region: '서남권',
    avgSalePrice: 79000, avgJeonsePrice: 49000, jeonseRatio: 0.620,
    monthlyRentDeposit: 3500, monthlyRent: 125,
    population: 39.2, gapInvestmentLevel: 'high', characteristics: '디지털단지 배후, 중저가 아파트',
    isRegulated: false, avgOfficialPrice: 79000 * 0.69, reconstructionPremium: false
  },
  {
    id: 'geumcheon', name: '금천구', region: '서남권',
    avgSalePrice: 69000, avgJeonsePrice: 44000, jeonseRatio: 0.638,
    monthlyRentDeposit: 3000, monthlyRent: 110,
    population: 22.8, gapInvestmentLevel: 'high', characteristics: '디지털단지 인접, 저렴한 주거비',
    isRegulated: false, avgOfficialPrice: 69000 * 0.69, reconstructionPremium: false
  },
  {
    id: 'gwanak', name: '관악구', region: '서남권',
    avgSalePrice: 84000, avgJeonsePrice: 52000, jeonseRatio: 0.619,
    monthlyRentDeposit: 3500, monthlyRent: 130,
    population: 48.5, gapInvestmentLevel: 'medium', characteristics: '청년층 거주 비율 높음',
    isRegulated: false, avgOfficialPrice: 84000 * 0.69, reconstructionPremium: false
  }
];
