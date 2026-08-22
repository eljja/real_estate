# 서울 부동산 거시·미시 스트레스 테스트 & 시장 붕괴 예측 플랫폼

> 🚀 **GitHub Pages 배포 주소**: [https://eljja.github.io/real_estate](https://eljja.github.io/real_estate)  
> 💻 **GitHub 저장소**: [https://github.com/eljja/real_estate](https://github.com/eljja/real_estate)  
> ⚡ **기술 스택**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Recharts + Zustand + Lucide Icons  
> 🌐 **구동 환경**: 별도 백엔드 서버 없이 웹 브라우저(Client-Side)에서 100% 실시간 연산

---

## 📌 프로젝트 소개

한국 특유의 **전세-갭투자 무이자 사금융 레버리지 구조**와 **복잡한 부동산 조세 정책(재산세·종합부동산세·취득세·양도소득세)** 및 **금융 규제(DSR·LTV·스트레스 금리)**가 결합되었을 때, 시장 참여자(1주택자 vs 다주택자)의 보유 한계선(Tipping Point)과 서울 25개 자치구별 시장 취약성을 정밀 시뮬레이션하는 거시·미시 스트레스 테스트 플랫폼입니다.

---

## 🧮 핵심 시뮬레이션 엔진

### 1. 정밀 한국 부동산 조세 계산 엔진 (`taxEngine.ts`)
- **재산세**: 공시가격 현실화율(69%), 공정시장가액비율(1주택 43~45%, 다주택 60%), 표준 누진세율 및 1주택 특례세율, 도시지역분(0.14%), 지방교육세(20%) 반영
- **종합부동산세**: 1세대 1주택 기본공제(12억), 다주택 기본공제(9억), 일반세율(0.5~2.7%) vs 3주택 중과세율(0.5~5.0%), 고령자 및 장기보유 세액공제(최대 80%), 농어촌특별세(20%)
- **취득세 & 양도소득세**: 조정대상지역 및 보유 주택수별 차등세율, 1주택 12억 초과 고가주택 안분계산, 장기보유특별공제(최대 80%)

### 2. 한국형 전세·갭투자 역학 엔진 (`jeonseEngine.ts`)
- **전월세전환율**: $\text{전환율} = \frac{\text{월세} \times 12}{\text{전세보증금} - \text{월세보증금}} \times 100$ (법정 상한: $\min(\text{기준금리} + 2.0\%, 10.0\%)$)
- **갭투자 레버리지 & ROE**: 전세가율에 따른 레버리지 배수($\frac{1}{1 - \text{전세가율}}$) 및 가격 변동 시 자기자본 수익률
- **역전세 자금부족액 (Capital Shortfall)**: 전세가 하락 시 임대인의 만기 반환 부족액 산출
- **깡통전세 판정**: HUG 전세보증금반환보증 126% 룰($\text{공시가} \times 140\% \times 90\%$) 및 경매 낙찰가율 대비 위험 평가

### 3. 보유 스트레스 지수 (HSI) & 구별 붕괴 위험도 (`stressEngine.ts`)
$$\text{HSI (Holding Stress Index)} = \frac{\text{연간 보유세(재산세+종부세)} + \text{연간 대출원리금} - \text{순임대수익}}{\text{가구 연소득}}$$
- **CRS (Crash Risk Score, 0~100점)**: 전세가율 위험도(25%) + 갭투자 집중도(20%) + 다주택자 HSI(25%) + 매물 수급 위험(15%) + 인구 동향(15%) 가중합산 모델

### 4. 글로벌 8대 부동산 버블 & 조기경보 지표 (`bubbleIndicators.ts`)
1. **PIR (Price-to-Income Ratio)**: 소득 대비 주택가격 비율 (서울 기준 13~15배 수준)
2. **PRR (Price-to-Rent Ratio)**: 임대료 대비 주택가격 비율
3. **K-HAI (주택구입부담지수)**: 중위소득 가구의 표준 주담대 상환 부담 지수
4. **Tobin's Q for Housing**: 주택 시장가액 대비 재생산원가(공사비+토지비) 비율
5. **BIS Credit-to-GDP Gap (신용갭)**: 민간신용/GDP의 장기 추세 이탈도
6. **주담대 연체율 급증 위험**: 저점 대비 연체율 상승폭 (bp 단위)
7. **Months of Supply (재고 소진 개월수)**: 활성 매물량 / 월간 거래량
8. **미분양 스파이크**: 준공 후 미분양(악성 미분양) 증가율

### 5. 시나리오 기반 3년 시계열 가격 예측 엔진 (`forecastEngine.ts`)
- 금리, DSR/LTV 규제, 전세가 변동, 다주택자 세부담이 상호작용하는 다변량 피드백 루프를 적용하여 서울 25개 구별 12개 분기(3년) 매매가 및 전세가 궤적 시뮬레이션

---

## 📂 프로젝트 구조

```
real_estate/
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions → GitHub Pages 자동 배포 CI/CD
├── index.html                     # 메인 HTML 엔트리포인트
├── package.json                   # React 19, TypeScript, Tailwind, Recharts, Zustand
├── vite.config.ts                 # base: '/real_estate/' (GitHub Pages 경로 매핑)
├── tsconfig.json                  # TypeScript 설정
├── public/                        # 파비콘 및 정적 에셋
├── src/
│   ├── main.tsx                   # React 마운트
│   ├── App.tsx                    # 반응형 2컬럼 레이아웃 & 4개 탭 컨트롤러
│   ├── index.css                  # Tailwind CSS v4 스타일링 & 커스텀 스크롤바
│   ├── data/
│   │   ├── taxBrackets.ts         # 재산세/종부세/취득세/양도세 법정 세율표 및 공제액
│   │   ├── seoulDistricts.ts      # 서울 25개 자치구 종합 프로파일 데이터셋
│   │   ├── scenarioPresets.ts     # 6대 거시 시나리오 프리셋 정의
│   │   └── seoulGeo.ts            # 서울시 행정구역 좌표 및 모식도 데이터
│   ├── engine/
│   │   ├── taxEngine.ts           # 한국 세제 정밀 연산 엔진
│   │   ├── jeonseEngine.ts        # 전세·갭투자 레버리지 & 역전세 엔진
│   │   ├── stressEngine.ts        # HSI 스트레스 지수 & CRS 붕괴 위험도 산출
│   │   ├── bubbleIndicators.ts    # 국제 표준 8대 거품 지표 계산
│   │   └── forecastEngine.ts      # 시계열 가격 변동 & 매도 압력 예측
│   ├── store/
│   │   └── useSimStore.ts         # Zustand 전역 상태 관리
│   ├── utils/
│   │   ├── formatters.ts          # 만원 단위 한글 포맷터 (억/만원 표기)
│   │   └── colorScale.ts          # 위험 등급별 Hex 색상 및 한글 라벨 매핑
│   └── components/
│       ├── layout/                # Header, TabNavigation, Footer
│       ├── controls/              # MacroSliderPanel, PropertyInputPanel
│       └── tabs/                  # TaxComparisonTab, SeoulMapTab, SimulationTab, BubbleIndexTab
└── README.md
```

---

## 🚀 GitHub Pages 배포 및 사용법

### 자동 배포 (GitHub Actions)
본 저장소의 `main` 브랜치에 코드를 푸시하면 `.github/workflows/deploy.yml` 워크플로우가 자동으로 실행되어 Vite 정적 번들을 빌드하고 `https://eljja.github.io/real_estate`로 자동 배포됩니다.

### GitHub 저장소 설정 (최초 1회)
1. GitHub 저장소의 **Settings** → **Pages**로 이동합니다.
2. **Build and deployment** > **Source** 항목에서 **GitHub Actions**를 선택합니다.
3. 코드가 푸시되면 자동으로 사이트가 배포되어 전 세계 어디서나 접속할 수 있습니다.

---

## ⚖️ 면책 조항 (Disclaimer)
본 시뮬레이터는 거시 경제학, 금융 공학 연구 및 교육 목적으로 제작된 시뮬레이션 모델이며 투자 권유나 개별 세무 자문이 아닙니다. 실제 취득·보유·양도세 납부 및 자산 운용 시에는 공인된 세무사 및 금융 전문가와 상담하시기 바랍니다.
