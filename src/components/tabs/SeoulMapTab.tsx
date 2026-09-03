import React, { useMemo, useState } from 'react';
import { useSimStore, RegionFilter } from '../../store/useSimStore';
import { seoulDistricts } from '../../data/seoulDistricts';
import { calculateCrashRiskScore, calculateHSI, calculateMortgagePayment } from '../../engine/stressEngine';
import { calculateAnnualHoldingTax } from '../../engine/taxEngine';
import { analyzeJeonse } from '../../engine/jeonseEngine';
import { getCrashRiskColor, getHsiColor } from '../../utils/colorScale';
import { formatManWon, formatPercent } from '../../utils/formatters';
import { MapPin, AlertOctagon, Flame, Building, Filter, ArrowUpDown, ShieldAlert, CheckCircle2, ShieldCheck, TrendingDown, Percent, Info } from 'lucide-react';

// 서울시 25개 자치구 실제 지형 반영 6x6 그리드
const GRID_LAYOUT: (string | null)[][] = [
  // Row 0: 서울 최북단 (도봉, 강북, 노원)
  [null, 'gangbuk', 'dobong', 'nowon', null, null],
  // Row 1: 서북부 ~ 동북부 (은평, 서대문, 종로, 성북, 동대문, 중랑)
  ['eunpyeong', 'seodaemun', 'jongno', 'seongbuk', 'dongdaemun', 'jungnang'],
  // Row 2: 한강 이북 도심 및 강변 (마포, 중구, 용산, 성동, 광진)
  [null, 'mapo', 'jung', 'yongsan', 'seongdong', 'gwangjin'],
  // Row 3: 한강 이남 서부 ~ 동남부 (강서, 영등포, 동작, 서초, 강남, 강동)
  ['gangseo', 'yeongdeungpo', 'dongjak', 'seocho', 'gangnam', 'gangdong'],
  // Row 4: 서남부 주거지 및 송파 (양천, 구로, 관악, 송파)
  ['yangcheon', 'guro', 'gwanak', null, 'songpa', null],
  // Row 5: 최남단 (금천)
  [null, 'geumcheon', null, null, null, null]
];

export default function SeoulMapTab() {
  const { params, selectedDistrict, setSelectedDistrict, regionFilter, setRegionFilter } = useSimStore();
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [sortBy, setSortBy] = useState<'crs' | 'jeonseRatio' | 'price' | 'fireSale'>('crs');
  const [showJeonseModal, setShowJeonseModal] = useState(false);

  const districtAnalysis = useMemo(() => {
    return seoulDistricts.map(d => {
      const officialPrice = d.avgSalePrice * 0.69;
      const tax = calculateAnnualHoldingTax(officialPrice, officialPrice * 3, 3, params.ownerAge, params.holdingYears, {
        fairValueRatio: params.fairValueRatio,
        cptMultiplier: params.cptMultiplier,
        multiHomeSurcharge: params.multiHomeSurcharge
      });
      const mortgage = calculateMortgagePayment(params.mortgagePrincipal, params.baseRate + 1.5, params.mortgageYears);
      const rentalIncome = (d.monthlyRent * 12);
      const hsi = calculateHSI(tax.totalAnnual, mortgage, rentalIncome, params.annualIncome).hsi;

      const risk = calculateCrashRiskScore(
        d,
        hsi,
        params.jeonseChange / 100,
        params.crsWeights
      );

      // 전세가 하락 시 호당 보증금 부족액
      const jeonseDropAmount = Math.round(d.avgJeonsePrice * Math.max(0, -params.jeonseChange / 100));

      return {
        ...d,
        hsi,
        risk,
        tax,
        mortgage,
        jeonseDropAmount
      };
    });
  }, [params]);

  const filteredDistricts = useMemo(() => {
    if (regionFilter === 'all') return districtAnalysis;
    return districtAnalysis.filter(d => d.region.includes(regionFilter));
  }, [districtAnalysis, regionFilter]);

  const activeDistrict = useMemo(() => {
    const id = selectedDistrict || 'gangnam';
    return districtAnalysis.find(d => d.id === id) || districtAnalysis[0];
  }, [selectedDistrict, districtAnalysis]);

  // 전세 & 갭투자 정밀 분석 엔진 결합
  const jeonseAnalysis = useMemo(() => {
    return analyzeJeonse({
      salePrice: activeDistrict.avgSalePrice,
      currentJeonse: activeDistrict.avgJeonsePrice,
      originalJeonse: activeDistrict.avgJeonsePrice,
      officialPrice: activeDistrict.avgSalePrice * 0.69,
      monthlyRentDeposit: activeDistrict.monthlyRentDeposit,
      monthlyRent: activeDistrict.monthlyRent,
      baseRate: params.baseRate,
      jeonseChangeRate: params.jeonseChange / 100
    });
  }, [activeDistrict, params]);

  const sortedDistricts = useMemo(() => {
    const list = [...filteredDistricts];
    if (sortBy === 'crs') {
      return list.sort((a, b) => b.risk.totalCrs - a.risk.totalCrs);
    }
    if (sortBy === 'jeonseRatio') {
      return list.sort((a, b) => b.jeonseRatio - a.jeonseRatio);
    }
    if (sortBy === 'price') {
      return list.sort((a, b) => b.avgSalePrice - a.avgSalePrice);
    }
    if (sortBy === 'fireSale') {
      return list.sort((a, b) => b.risk.fireSaleProbability - a.risk.fireSaleProbability);
    }
    return list;
  }, [filteredDistricts, sortBy]);

  return (
    <div className="p-6 space-y-6 text-gray-200 max-w-7xl mx-auto">
      {/* 탭 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <MapPin className="text-blue-400" />
              서울 25개 자치구 시장 붕괴 위험도 (CRS 2.0 지리 모식도)
            </h2>
            <span className="bg-red-950/80 text-red-400 border border-red-800/40 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Flame size={12} /> 실시간 스트레스 반응
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            전세가율(25%) &middot; 갭투자 집중도(20%) &middot; 다주택 HSI(20%) &middot; 입주물량(15%) &middot; 유동성 위축(10%) &middot; 인구유출(10%)을 종합 평가합니다.
          </p>
        </div>

        {/* 권역 필터 및 뷰 모드 전환 버튼 */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800 text-xs">
            {(['all', '동남권', '도심', '서남권', '동북권', '서북권'] as RegionFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`px-2.5 py-1 rounded transition-colors font-medium ${
                  regionFilter === r ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {r === 'all' ? '전체 구' : r}
              </button>
            ))}
          </div>

          <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800 text-xs">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                viewMode === 'map' ? 'bg-gray-800 text-blue-400' : 'text-gray-400'
              }`}
            >
              지리 모식도
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                viewMode === 'table' ? 'bg-gray-800 text-blue-400' : 'text-gray-400'
              }`}
            >
              상세 순위표
            </button>
          </div>
        </div>
      </div>

      {/* 메인 뷰 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측 2열: 모식도 / 테이블 */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-800 flex flex-col justify-between">
          {viewMode === 'map' ? (
            <>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Building size={14} className="text-blue-400" />
                    서울시 25개 자치구 실제 지형 모식도 (클릭 시 우측 상세 분석)
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>안전</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span>주의</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span>위험</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>붕괴위기</span>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-2.5 my-2">
                  {GRID_LAYOUT.map((row, rIdx) =>
                    row.map((districtId, cIdx) => {
                      if (!districtId) {
                        return <div key={`${rIdx}-${cIdx}`} className="aspect-[1.1] rounded-lg bg-transparent"></div>;
                      }
                      const d = districtAnalysis.find(x => x.id === districtId);
                      if (!d) return null;

                      const isSelected = activeDistrict.id === d.id;
                      const crsColor = getCrashRiskColor(d.risk.totalCrs);

                      return (
                        <div
                          key={d.id}
                          onClick={() => setSelectedDistrict(d.id)}
                          className={`aspect-[1.1] p-2 rounded-xl flex flex-col justify-between cursor-pointer transition-all border ${
                            isSelected
                              ? 'ring-2 ring-blue-400 border-white scale-105 shadow-xl z-10'
                              : 'hover:scale-102 border-gray-800 hover:border-gray-600'
                          }`}
                          style={{
                            backgroundColor: `${crsColor}18`,
                            borderColor: isSelected ? '#60a5fa' : `${crsColor}40`
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-gray-100">{d.name}</span>
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: crsColor }} />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-400">CRS 위험도</div>
                            <div className="text-sm font-black" style={{ color: crsColor }}>
                              {d.risk.totalCrs.toFixed(1)}점
                            </div>
                          </div>
                          <div className="flex justify-between text-[9px] text-gray-400 border-t border-gray-800/60 pt-0.5">
                            <span>전세가율 {Math.round(d.jeonseRatio * 100)}%</span>
                            <span className="text-red-400 font-bold">{d.risk.fireSaleProbability}%</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800 flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-2">
                <span>💡 <strong>실시간 연동</strong>: 좌측 패널의 금리·전세가·종부세를 조절하면 각 구의 CRS 점수와 위험 색상이 즉시 반응합니다.</span>
                <span>선택 구: <strong className="text-gray-200">{activeDistrict.name}</strong> ({activeDistrict.region})</span>
              </div>
            </>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-400">25개 구 정밀 통계 순위표</span>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span>정렬:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2 py-1"
                  >
                    <option value="crs">CRS 위험 점수순</option>
                    <option value="fireSale">급매 출회 확률순</option>
                    <option value="jeonseRatio">전세가율 높은순</option>
                    <option value="price">평균 매매가순</option>
                  </select>
                </div>
              </div>

              <table className="w-full text-xs text-left text-gray-300">
                <thead className="bg-gray-800/80 text-gray-400 uppercase">
                  <tr>
                    <th className="px-3.5 py-2.5">구 이름</th>
                    <th className="px-3.5 py-2.5">권역</th>
                    <th className="px-3.5 py-2.5">위험 점수(CRS)</th>
                    <th className="px-3.5 py-2.5">급매 출회 확률</th>
                    <th className="px-3.5 py-2.5">전세가율</th>
                    <th className="px-3.5 py-2.5">평균 매매가</th>
                    <th className="px-3.5 py-2.5">취약 유형</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {sortedDistricts.map(d => {
                    const color = getCrashRiskColor(d.risk.totalCrs);
                    const isSelected = activeDistrict.id === d.id;

                    return (
                      <tr
                        key={d.id}
                        onClick={() => setSelectedDistrict(d.id)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-950/50' : 'hover:bg-gray-800/50'}`}
                      >
                        <td className="px-3.5 py-2.5 font-bold text-gray-100 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                          {d.name}
                        </td>
                        <td className="px-3.5 py-2.5 text-gray-400">{d.region.split(' ')[0]}</td>
                        <td className="px-3.5 py-2.5 font-extrabold" style={{ color }}>
                          {d.risk.totalCrs.toFixed(1)}점 ({d.risk.crsLevel})
                        </td>
                        <td className="px-3.5 py-2.5 font-bold text-red-400">{d.risk.fireSaleProbability}%</td>
                        <td className="px-3.5 py-2.5 font-semibold">{formatPercent(d.jeonseRatio)}</td>
                        <td className="px-3.5 py-2.5 font-medium text-gray-200">{formatManWon(d.avgSalePrice)}</td>
                        <td className="px-3.5 py-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-300">
                            {d.risk.vulnerabilityType}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 우측 1열: 자치구 정밀 진단 카드 */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-5">
          <div className="flex justify-between items-start border-b border-gray-800 pb-4">
            <div>
              <span className="text-xs text-blue-400 font-bold">{activeDistrict.region}</span>
              <h3 className="text-2xl font-black text-gray-100 mt-0.5">{activeDistrict.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{activeDistrict.characteristics}</p>
            </div>
            <div
              className="px-3 py-2 rounded-xl text-center shadow-lg"
              style={{
                backgroundColor: `${getCrashRiskColor(activeDistrict.risk.totalCrs)}25`,
                color: getCrashRiskColor(activeDistrict.risk.totalCrs),
                border: `1px solid ${getCrashRiskColor(activeDistrict.risk.totalCrs)}50`
              }}
            >
              <div className="text-[10px] uppercase font-bold">CRS 2.0 종합</div>
              <div className="text-xl font-black">{activeDistrict.risk.totalCrs.toFixed(1)}점</div>
              <div className="text-[10px] font-bold mt-0.5">{activeDistrict.risk.crsLevel}</div>
            </div>
          </div>

          {/* 6대 하위 리스크 게이지 바 */}
          <div className="space-y-2.5 text-xs bg-gray-800/40 p-3.5 rounded-lg border border-gray-800">
            <div className="font-bold text-gray-200 mb-1 flex items-center justify-between">
              <span>6대 리스크 구성 분석</span>
              <span className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                <Flame size={12} /> 급매 확률 {activeDistrict.risk.fireSaleProbability}%
              </span>
            </div>

            <div>
              <div className="flex justify-between text-gray-400 mb-0.5">
                <span>역전세 &middot; 전세가율 위험</span>
                <span className="font-bold text-gray-200">{activeDistrict.risk.jeonseRisk}점</span>
              </div>
              <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${activeDistrict.risk.jeonseRisk}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-400 mb-0.5">
                <span>갭투자 &middot; 다주택 집중도</span>
                <span className="font-bold text-gray-200">{activeDistrict.risk.gapInvestmentRisk}점</span>
              </div>
              <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${activeDistrict.risk.gapInvestmentRisk}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-400 mb-0.5">
                <span>다주택 HSI 부채상환 압력</span>
                <span className="font-bold text-gray-200">{activeDistrict.risk.multiHomeHsiRisk}점</span>
              </div>
              <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: `${activeDistrict.risk.multiHomeHsiRisk}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-gray-400 mb-0.5">
                <span>향후 3년 입주물량 과잉 위험</span>
                <span className="font-bold text-gray-200">{activeDistrict.risk.supplyInventoryRisk}점</span>
              </div>
              <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${activeDistrict.risk.supplyInventoryRisk}%` }} />
              </div>
            </div>
          </div>

          {/* 역전세 스트레스 & HUG 126% 보증 진단 (신규 통합) */}
          <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-3.5 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-blue-300 flex items-center gap-1">
                <ShieldAlert size={14} className="text-blue-400" />
                HUG 안심전세 126% 보증 진단
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                jeonseAnalysis.canGetHugGuarantee ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
              }`}>
                {jeonseAnalysis.canGetHugGuarantee ? '보증 가입 가능' : '보증 한도 초과(위험)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300 pt-1">
              <div>
                <span className="text-gray-400">HUG 보증 한도:</span> {formatManWon(jeonseAnalysis.hugGuaranteeLimit)}
              </div>
              <div>
                <span className="text-gray-400">갭투자 레버리지:</span> {jeonseAnalysis.leverage}배
              </div>
              <div>
                <span className="text-gray-400">집값 10% 상승 ROE:</span> <span className="text-blue-400 font-semibold">+{jeonseAnalysis.roeOn10PercentGain}%</span>
              </div>
              <div>
                <span className="text-gray-400">집값 10% 하락 ROE:</span> <span className="text-red-400 font-semibold">-{jeonseAnalysis.roeOn10PercentLoss}%</span>
              </div>
            </div>

            {/* 민감도 매트릭스 버튼 */}
            <button
              onClick={() => setShowJeonseModal(true)}
              className="w-full mt-2 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded font-bold text-[11px] transition-colors"
            >
              역전세 하락률별 보증금 결손 매트릭스 보기 &rarr;
            </button>
          </div>

          {/* 주요 수치 요약 */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-gray-800 pb-1.5">
              <span className="text-gray-400">평균 매매가</span>
              <span className="font-bold text-gray-100">{formatManWon(activeDistrict.avgSalePrice)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-1.5">
              <span className="text-gray-400">평균 전세가 (전세가율)</span>
              <span className="font-semibold text-gray-200">
                {formatManWon(activeDistrict.avgJeonsePrice)} ({formatPercent(activeDistrict.jeonseRatio)})
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-1.5">
              <span className="text-gray-400">향후 3년 입주 예정 물량</span>
              <span className="font-semibold text-blue-400">{activeDistrict.supplyNext3Years.toLocaleString()} 세대</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-1.5">
              <span className="text-gray-400">다주택자 보유 비중</span>
              <span className="font-semibold text-orange-400">{activeDistrict.multiHomeHoldingRatio}%</span>
            </div>
            {activeDistrict.jeonseDropAmount > 0 && (
              <div className="flex justify-between border-b border-gray-800 pb-1.5 bg-red-950/40 p-2 rounded text-red-300">
                <span>전세 하락 시 호당 결손액</span>
                <span className="font-bold text-red-400">-{formatManWon(activeDistrict.jeonseDropAmount)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 역전세 민감도 모달 */}
      {showJeonseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex justify-between items-start border-b border-gray-800 pb-3">
              <div>
                <span className="text-xs text-blue-400 font-bold">{activeDistrict.name} 역전세 스트레스 진단</span>
                <h3 className="text-lg font-black text-gray-100 mt-0.5">전세가 하락 시나리오별 임대인 결손금 매트릭스</h3>
              </div>
              <button
                onClick={() => setShowJeonseModal(false)}
                className="px-2 py-1 text-gray-400 hover:text-white font-bold text-sm"
              >
                &times;
              </button>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left text-gray-300">
                <thead className="bg-gray-800 text-gray-400 uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2">전세가 변동</th>
                    <th className="px-3 py-2">예상 전세가</th>
                    <th className="px-3 py-2">호당 반환 결손금</th>
                    <th className="px-3 py-2">경매 깡통 위험</th>
                    <th className="px-3 py-2">위험 등급</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {jeonseAnalysis.sensitivityMatrix.map((sc, i) => (
                    <tr key={i} className="hover:bg-gray-800/50">
                      <td className="px-3 py-2.5 font-bold text-gray-100">{sc.dropRatePercent}</td>
                      <td className="px-3 py-2.5">{formatManWon(sc.projectedJeonse)}</td>
                      <td className="px-3 py-2.5 font-bold text-red-400">
                        {sc.shortfallAmount > 0 ? `-${formatManWon(sc.shortfallAmount)}` : '없음 (정상)'}
                      </td>
                      <td className="px-3 py-2.5">
                        {sc.auctionLiquidationRisk ? (
                          <span className="text-red-400 font-bold">경매 손실권 진입</span>
                        ) : (
                          <span className="text-emerald-400">원금 보전</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sc.distressLevel === '깡통전세' ? 'bg-red-500/30 text-red-300' :
                          sc.distressLevel === '위험' ? 'bg-orange-500/30 text-orange-300' :
                          sc.distressLevel === '경고' ? 'bg-yellow-500/30 text-yellow-300' :
                          'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {sc.distressLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowJeonseModal(false)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
