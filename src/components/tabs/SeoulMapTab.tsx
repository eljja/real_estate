import React, { useMemo, useState } from 'react';
import { useSimStore, RegionFilter } from '../../store/useSimStore';
import { seoulDistricts } from '../../data/seoulDistricts';
import { calculateCrashRiskScore, calculateHSI, calculateMortgagePayment } from '../../engine/stressEngine';
import { calculateAnnualHoldingTax } from '../../engine/taxEngine';
import { getCrashRiskColor, getHsiColor } from '../../utils/colorScale';
import { formatManWon, formatPercent } from '../../utils/formatters';
import { MapPin, AlertOctagon, Flame, Building, Filter, ArrowUpDown, ShieldAlert, CheckCircle2 } from 'lucide-react';

const GRID_LAYOUT: (string | null)[][] = [
  [null, null, 'dobong', null, null, null],
  ['eunpyeong', 'gangbuk', 'nowon', null, null, null],
  ['seodaemun', 'jongno', 'seongbuk', 'dongdaemun', 'jungnang', null],
  ['mapo', 'jung', 'yongsan', 'seongdong', 'gwangjin', 'gangdong'],
  ['yangcheon', 'yeongdeungpo', 'dongjak', 'seocho', 'gangnam', 'songpa'],
  ['gangseo', 'guro', 'gwanak', 'geumcheon', null, null]
];

export default function SeoulMapTab() {
  const { params, selectedDistrict, setSelectedDistrict, regionFilter, setRegionFilter } = useSimStore();
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [sortBy, setSortBy] = useState<'crs' | 'jeonseRatio' | 'price' | 'fireSale'>('crs');

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

  const sortedDistricts = useMemo(() => {
    const list = [...filteredDistricts];
    if (sortBy === 'crs') {
      return list.sort((a, b) => b.risk.totalCrs - a.risk.totalCrs);
    } else if (sortBy === 'jeonseRatio') {
      return list.sort((a, b) => b.jeonseRatio - a.jeonseRatio);
    } else if (sortBy === 'fireSale') {
      return list.sort((a, b) => b.risk.fireSaleProbability - a.risk.fireSaleProbability);
    } else {
      return list.sort((a, b) => b.avgSalePrice - a.avgSalePrice);
    }
  }, [filteredDistricts, sortBy]);

  return (
    <div className="p-6 space-y-6 text-gray-200 max-w-7xl mx-auto">
      {/* 탭 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <MapPin className="text-blue-400" />
              서울 25개 자치구별 부동산 붕괴 위험도 (CRS 2.0)
            </h2>
            <span className="bg-red-950/80 text-red-400 border border-red-800/40 text-[11px] font-bold px-2 py-0.5 rounded-full">
              6대 복합지표
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            전세가율 &middot; 갭투자 밀집도 &middot; 보유세 스트레스(HSI) &middot; 3개년 공급물량 &middot; 거래 유동성을 종합한 위기 조기경보 모델
          </p>
        </div>

        {/* 뷰 전환 및 권역 필터 */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800 text-xs">
            {(['all', '동남권', '도심', '서남권', '동북권', '서북권'] as RegionFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`px-2.5 py-1 rounded transition-colors ${
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
                    서울시 25개 자치구 지리적 배치도 (클릭 시 우측 상세 분석)
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
                      const isFilteredOut = regionFilter !== 'all' && !d.region.includes(regionFilter);
                      const color = getCrashRiskColor(d.risk.totalCrs);

                      return (
                        <button
                          key={districtId}
                          onClick={() => setSelectedDistrict(d.id)}
                          className={`aspect-[1.1] p-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                            isFilteredOut ? 'opacity-25 grayscale' : ''
                          } ${
                            isSelected
                              ? 'border-white ring-2 ring-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-105 z-10'
                              : 'border-transparent hover:scale-102 hover:border-gray-600'
                          }`}
                          style={{
                            backgroundColor: `${color}20`,
                            borderColor: isSelected ? '#ffffff' : `${color}50`
                          }}
                        >
                          <span className="font-bold text-xs sm:text-sm text-gray-100">{d.name}</span>
                          <span
                            className="text-[11px] font-extrabold mt-1 px-1.5 py-0.5 rounded shadow-sm"
                            style={{ backgroundColor: color, color: '#ffffff' }}
                          >
                            {Math.round(d.risk.totalCrs)}점
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-800 flex flex-wrap items-center justify-between text-xs text-gray-400 gap-2">
                <span>💡 <strong>동북권(노도강)</strong>: 역전세·갭투자 취약 | <strong>동남권(강남3구)</strong>: 종부세·DSR 민감</span>
                <span className="text-gray-300">선택된 구: <strong className="text-blue-400">{activeDistrict.name}</strong></span>
              </div>
            </>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-400">정렬 기준 선택:</span>
                <div className="flex gap-1.5 text-xs">
                  <button
                    onClick={() => setSortBy('crs')}
                    className={`px-2.5 py-1 rounded font-semibold ${sortBy === 'crs' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                  >
                    CRS 위험순
                  </button>
                  <button
                    onClick={() => setSortBy('fireSale')}
                    className={`px-2.5 py-1 rounded font-semibold ${sortBy === 'fireSale' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                  >
                    급매 확률순
                  </button>
                  <button
                    onClick={() => setSortBy('jeonseRatio')}
                    className={`px-2.5 py-1 rounded font-semibold ${sortBy === 'jeonseRatio' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                  >
                    전세가율순
                  </button>
                  <button
                    onClick={() => setSortBy('price')}
                    className={`px-2.5 py-1 rounded font-semibold ${sortBy === 'price' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                  >
                    매매가순
                  </button>
                </div>
              </div>

              <table className="w-full text-xs text-left text-gray-300">
                <thead className="text-gray-400 uppercase bg-gray-800/80 border-b border-gray-700">
                  <tr>
                    <th className="px-3.5 py-2.5">자치구</th>
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
              <div className="text-xl font-black">{Math.round(activeDistrict.risk.totalCrs)}점</div>
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

          {/* 맞춤형 리스크 총평 */}
          <div className="p-3 bg-gray-800/80 rounded-lg text-xs space-y-1.5 border border-gray-700">
            <div className="font-bold text-gray-200 flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-amber-400" />
              {activeDistrict.name} 핵심 리스크 요약
            </div>
            <p className="text-gray-400 leading-relaxed">
              {activeDistrict.risk.vulnerabilityType === '역전세 취약'
                ? `전세가율(${formatPercent(activeDistrict.jeonseRatio)})과 갭투자 비중이 높아, 전세가 하락 시 임대인의 유동성 경색 및 경매 출회 리스크가 높습니다.`
                : activeDistrict.risk.vulnerabilityType === '종부세 고부담'
                ? `고가 아파트 밀집 지역으로, 종부세율 인상 및 대출 규제(DSR) 강화 시 다주택자의 한계 매물 출회 압력이 큽니다.`
                : activeDistrict.risk.vulnerabilityType === '공급과잉 우려'
                ? `향후 3개년 대규모 신규 입주(${activeDistrict.supplyNext3Years.toLocaleString()}세대)로 인해 전세가 및 매매가의 하방 압력이 높습니다.`
                : `상대적으로 수급과 부채 부담이 균형을 이루고 있어 충격에 대한 방어력이 양호한 지역입니다.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
