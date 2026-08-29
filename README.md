# 🏠 부동산 시뮬레이터 (Seoul Real Estate Stress Test Platform)

> **서울 25개 자치구 부동산 세제·역전세 스트레스 테스트 & 3개년 시장 붕괴 예측 플랫폼**

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-blue?style=for-the-badge&logo=github)](https://eljja.github.io/real_estate/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.15-22c55e?style=for-the-badge)](https://recharts.org/)
[![Zustand](https://img.shields.io/badge/Zustand-State_Management-purple?style=for-the-badge)](https://github.com/pmndrs/zustand)

---

## 🌐 서비스 접속 및 배포 안내
- **실시간 웹 서비스 주소**: 👉 **[https://eljja.github.io/real_estate/](https://eljja.github.io/real_estate/)**
- **GitHub 저장소**: 👉 **[https://github.com/eljja/real_estate](https://github.com/eljja/real_estate)**
- **특징**: 별도의 백엔드 데이터베이스나 로컬 서버 없이 웹 브라우저 클라이언트 사이드(Client-Side)에서 100% 실시간 연산 및 렌더링을 수행합니다.

---

## 📌 프로젝트 개요 (Overview)

대한민국 특유의 **전세-갭투자 무이자 사금융 레버리지 구조**와 **복잡한 조세 체계(재산세·종합부동산세·취득세·양도세)**, 그리고 **거시 금융 규제(DSR·LTV·스트레스 금리)**가 결합되었을 때:

1. **1주택자 vs 2주택자 vs 3주택 이상 다주택자**의 실질 세부담과 가계 현금흐름 붕괴 한계선(HSI)을 정밀 산출합니다.
2. **서울 25개 자치구별** 전세가율, 다주택 보유 비중, 3개년 신규 입주물량, 거래 유동성을 반영한 **붕괴 위험도(CRS 2.0)**를 평가합니다.
3. 거시 변수 충격에 따른 **향후 3개년(12분기) 주택가격 및 전세가 궤적(Bull/Bear 신뢰구간)**을 예측합니다.
4. BIS, IMF, OECD 기준 **글로벌 8대 부동산 거품 조기경보 지표**를 실시간으로 진단하고 **A4 종합 진단 보고서**를 출력/PDF 저장할 수 있습니다.

---

## 🧭 주요 기능 구성 (5대 분석 탭)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 1. 🏛️ 세부담 & 현금흐름 분석 (Tax & Cashflow) : 보유세 및 순지출 듀얼 비교 차트     │
│ 2. 🗺️ 서울 25개 구 붕괴위험도 (CRS 2.0 Map) : 6대 복합지표 모식도 & 급매 확률   │
│ 3. 📈 3개년 시계열 가격 예측 (3-Year Forecast) : Bull/Bear 불확실성 밴드 시뮬레이션 │
│ 4. 🚨 글로벌 8대 버블 조기경보 (Bubble Index) : BIS/IMF 기준 레이더 & 수학 공식   │
│ 5. 📑 종합 스트레스 진단 보고서 (Executive Report) : A4 규격 출력 & PDF 저장 지원 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1. 🏛️ 세부담 & 가계 현금흐름 분석 (Tax Comparison)
- **보유세(재산세+종부세) & 순보유비용 분리형 듀얼 차트**: 
  - 복잡한 이중 Y축을 2개의 전용 차트로 분리하여 직관성 극대화
  - 1주택/2주택/3주택 각각 **[현재 시나리오 막대]** 바로 옆에 **[2026 현행 기준 막대]**를 1:1로 나란히 배치하여 세금 증가분을 한눈에 파악
- **가계 주거부담지수 (HSI, Housing Stress Index)**:
  $$\text{HSI} = \frac{\text{연간 보유세} + \text{연간 대출원리금} - \text{순임대수입}}{\text{가구 연소득}}$$
- **실질 가처분소득(82%) 및 최저생계비(3,200만원) 연계 잔여 현금흐름** 정밀 산출

### 2. 🗺️ 서울 25개 자치구 부동산 붕괴 위험도 (CRS 2.0 Map)
- **6대 복합 리스크 계량 모델**:
  1. **역전세 & 전세가율 위험 (25%)**: 전세가율 40~70% 정규화 + 전세가 하락 충격 반영
  2. **갭투자 & 다주택 밀집도 (20%)**: 구별 다주택 보유 비중(20~35%) 및 갭투자 등급
  3. **다주택 HSI 부채상환 압력 (20%)**: 다주택 가계의 소득 대비 주거비 지출 강도
  4. **3개년 입주물량 과잉 위험 (15%)**: 세대수 대비 향후 3년 입주 예정 물량 및 미분양 호수
  5. **거래 유동성 위축 위험 (10%)**: 환금성 및 실거래량 위축도
  6. **인구 유출 위험 (10%)**: 자치구 인구 규모 및 이동 추세
- **부가 기능**: 25개 구 지리적 모식도 그리드, 권역별 필터(동남권, 도심/한강, 서남권, 동북권, 서북권), 급매 출회 확률(%) 랭킹

### 3. 📈 3개년 시계열 가격 궤적 & 시장 붕괴 예측 (Simulation)
- **12분기 비선형 다변량 피드백 시뮬레이션**:
  - 한국은행 기준금리 변동 후 2~3분기 시차 효과(Time Decay Lag)
  - DSR 한도 및 소득 기반 주택구입 감당능력(Affordability Headroom)
  - 전세 갭 레버리지 전이 및 대규모 입주물량 충격 반영
- **Bull/Bear 신뢰구간 밴드 차트**: 낙관 상한선(Bull)과 비관 하한선(Bear) 음영 밴드 제공
- 25개 구별 1년 후 / 3년 후 누적 변동률 및 다주택 매도 압력 vs 매수 여력 지수 산출

### 4. 🚨 글로벌 8대 부동산 거품 조기경보 지표 (Bubble Index)
1. **PIR (소득 대비 주택가격비율)**: 서울 중위가격 / 중위소득 (UN-Habitat / KB국민은행)
2. **PRR (임대료 대비 주택가격비율)**: 중위가격 / 연간 임대수입 (OECD / IMF PER 모델)
3. **K-HAI (주택구입부담지수)**: 표준 원리금 / 소득 25% (한국주택금융공사)
4. **Tobin's Q for Housing**: 시장 시세 / 대체 재생산원가(건축비+토지비) (한국은행)
5. **BIS Credit-to-GDP Gap**: GDP 대비 가계신용 장기 추세 이탈도 (국제결제은행)
6. **주담대 연체율 급증 위험**: 저점 대비 연체율 상승폭 (bp 단위) (금융감독원)
7. **Months of Supply (재고 소진 개월수)**: 활성 매물 총수 / 월간 거래량 (미국 NAR)
8. **미분양 스파이크**: 준공 후 악성 미분양 급증 배율 (국토교통부)
- **부가 기능**: 8대 지표 위험도 레이더 차트, 10년 역사적 백분위수 게이지, 공식 수식 설명 팝업 모달

### 5. 📑 종합 스트레스 진단 보고서 (Executive Report)
- 현재 시뮬레이션 설정(금리, 세제, 규제, 주택가격)을 A4 규격의 브리핑 리포트로 실시간 자동 생성
- 가계 재무 진단, 25개 구 Top 5 위험구 vs 안전구, 3개년 예측치, 8대 버블 신호등, 종합 행동 권고 수록
- **[리포트 출력 / PDF 저장]** 원클릭 지원 (`window.print` 스타일 최적화)

---

## 🎛️ 시나리오 프리셋 (Scenario Presets)

| 시나리오명 | 기준금리 | 공정시장가액 | 종부세율 배율 | 다주택 중과 | DSR 상한 | 전세 변동률 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. 2026 현행 기준 (Baseline)** | 3.0% | 60% | 1.0배 | OFF | 40% | 0% |
| **2. 경착륙 (Hard Landing)** | 5.0% | 80% | 1.5배 | ON | 35% | -20% |
| **3. 저금리 유동성 장세** | 1.5% | 60% | 0.8배 | OFF | 50% | +15% |
| **4. 양극화 심화 (똘똘한 한 채)** | 3.5% | 60% | 1.0배 | OFF | 40% | 0% |
| **5. 전세 $\rightarrow$ 월세 전환 가속** | 4.0% | 60% | 1.0배 | OFF | 40% | -15% |
| **6. 극단 스트레스 테스트 (Black Swan)** | 6.0% | 100% | 2.0배 | ON | 30% | -30% |

---

## 📁 프로젝트 디렉토리 구조

```
real_estate/
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions → GitHub Pages 자동 배포 파이프라인
├── index.html                     # Google Search Console, SEO 메타태그, JSON-LD
├── package.json                   # React 18, Vite 6, Tailwind CSS v4, Recharts, Zustand
├── vite.config.ts                 # base: '/real_estate/' (GitHub Pages 경로 매핑)
├── tsconfig.json                  # TypeScript 설정
├── public/
│   ├── favicon.svg                # 고층 아파트 & 금융 트렌드 커스텀 벡터 파비콘
│   ├── og-image.svg               # SNS 및 구글 검색 리치 프리뷰 Open Graph 이미지
│   ├── robots.txt                 # 검색엔진 크롤러 색인 규칙
│   └── sitemap.xml                # 구글 서치 콘솔 등록용 XML 사이트맵
├── src/
│   ├── main.tsx                   # React 애플리케이션 진입점
│   ├── App.tsx                    # 반응형 2컬럼 레이아웃 및 5개 탭 라우팅
│   ├── index.css                  # Tailwind CSS v4 (@import "tailwindcss")
│   ├── data/
│   │   ├── taxBrackets.ts         # 재산세·종부세·취득세·양도세 법정 누진세율표
│   │   ├── seoulDistricts.ts      # 서울 25개 구 실거래·전세·월세·입주물량 데이터셋
│   │   └── scenarioPresets.ts     # 6대 거시 경제 시나리오 프리셋
│   ├── engine/
│   │   ├── taxEngine.ts           # 한국 부동산 조세 정밀 계산 엔진
│   │   ├── jeonseEngine.ts        # 전세·갭투자 레버리지 & 역전세 민감도 엔진
│   │   ├── stressEngine.ts        # HSI 주거부담지수 & CRS 2.0 붕괴 위험도 모델
│   │   ├── forecastEngine.ts      # 3개년(12분기) Bull/Bear 시계열 가격 예측 엔진
│   │   └── bubbleIndicators.ts    # 글로벌 8대 부동산 거품 조기경보 엔진
│   ├── store/
│   │   └── useSimStore.ts         # Zustand 전역 상태 관리 (파라미터 & 필터)
│   ├── utils/
│   │   ├── formatters.ts          # 한글 화폐 단위 포맷터 (억/만원 표기)
│   │   └── colorScale.ts          # 위험도별 컬러 및 한글 라벨 매핑
│   └── components/
│       ├── layout/                # Header (매크로 티커), TabNavigation, Footer
│       ├── controls/              # MacroSliderPanel, PropertyInputPanel (구별 시세 동기화)
│       └── tabs/
│           ├── TaxComparisonTab.tsx   # 세부담 & 현금흐름 듀얼 비교 탭
│           ├── SeoulMapTab.tsx        # 서울 25개 구 CRS 2.0 모식도 탭
│           ├── SimulationTab.tsx      # 3개년 시계열 궤적 예측 탭
│           ├── BubbleIndexTab.tsx     # 글로벌 8대 버블 조기경보 탭
│           └── ReportTab.tsx          # 종합 스트레스 진단 보고서 (A4 출력) 탭
└── README.md
```

---

## 🛠️ 기술 스택 및 빌드/배포 환경

- **Core**: React 18.3, TypeScript 5.6, Vite 6.2
- **Styling**: Tailwind CSS v4, Lucide React
- **Data Visualization**: Recharts (ComposedChart, AreaChart, BarChart, LineChart, RadarChart)
- **State Management**: Zustand 5.0
- **CI/CD**: GitHub Actions (`JamesIves/github-pages-deploy-action@v4`)
- **Hosting**: GitHub Pages (`gh-pages` branch)

---

## ⚖️ 면책 조항 (Disclaimer)

본 시뮬레이터는 거시 경제학, 계량 조세 통계 및 금융 공학 연구·교육 목적으로 제작된 시뮬레이션 모델이며 법적 투자 자문이나 개별 세무 자문이 아닙니다. 실제 부동산 취득·보유·양도 및 자산 운용 시에는 공인된 세무사 및 금융 전문가와 상담하시기 바랍니다.
