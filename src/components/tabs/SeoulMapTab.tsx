import React, { useMemo, useState } from 'react';
import { useSimStore } from '../../store/useSimStore';
import { seoulDistricts, DistrictData } from '../../data/seoulDistricts';
import { calculateCrashRiskScore, calculateHSI, calculateMortgagePayment, getHsiLevel } from '../../engine/stressEngine';
import { calculateAnnualHoldingTax } from '../../engine/taxEngine';
import { getCrashRiskColor, getCrashRiskLabel, getHsiColor } from '../../utils/colorScale';
import { formatManWon, formatPercent } from '../../utils/formatters';
import { MapPin, AlertOctagon, TrendingDown, Layers, ArrowUpDown } from 'lucide-react';

const GRID_LAYOUT: (string | null)[][] = [
  [null, null, 'dobong', null, null, null],
  ['eunpyeong', 'gangbuk', 'nowon', null, null, null],
  ['seodaemun', 'jongno', 'seongbuk', 'dongdaemun', 'jungnang', null],
  ['mapo', 'jung', 'yongsan', 'seongdong', 'gwangjin', 'gangdong'],
  ['yangcheon', 'yeongdeungpo', 'dongjak', 'seocho', 'gangnam', 'songpa'],
  ['gangseo', 'guro', 'gwanak', 'geumcheon', null, null]
];

export default function SeoulMapTab() {
  const { params, selectedDistrict, setSelectedDistrict } = useSimStore();
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [sortBy, setSortBy] = useState<'crs' | 'jeonseRatio' | 'price'>('crs');

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

      const gapScore = d.gapInvestmentLevel === 'very_high' ? 90 : d.gapInvestmentLevel === 'high' ? 65 : d.gapInvestmentLevel === 'medium' ? 35 : 10;

      const risk = calculateCrashRiskScore(
        {
          jeonseRatio: d.jeonseRatio,
          gapLevel: d.gapInvestmentLevel,
          supplyRisk: 50,
          populationTrend: d.population < 30 ? -2 : 0
        },
        { hsi },
        params.crsWeights
      );

      // 역전세 위험액 계산 (전세가 하락 시 임대인 부족 자금)
      const jeonseDropAmount = Math.round(d.avgJeonsePrice * Math.max(0, -params.jeonseChange / 100));

      return {
        ...d,
        hsi,
        risk,
        tax,
        mortgage,
        gapScore,
        jeonseDropAmount
      };
    });
  }, [params]);

  const activeDistrict = useMemo(() => {
    const id = selectedDistrict || 'gangnam';
    return districtAnalysis.find(d => d.id === id) || districtAnalysis[0];
  }, [selectedDistrict, districtAnalysis]);

  const sortedDistricts = useMemo(() => {
    const list = [...districtAnalysis];
    if (sortBy === 'crs') {
      return list.sort((a, b) => b.risk.totalCrs - a.risk.totalCrs);
    } else if (sortBy === 'jeonseRatio') {
      return list.sort((a, b) => b.jeonseRatio - a.jeonseRatio);
    } else {
      return list.sort((a, b) => b.avgSalePrice - a.avgSalePrice);
    }
  }, [districtAnalysis, sortBy]);

  return (
    <div className="p-6 space-y-6 text-gray-200 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <MapPin className="text-blue-400" />
            서울 25개 자치구별 부동산 붕괴 위험도 (CRS) 지도
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            전세가율, 갭투자 비중, 보유세 부담(HSI), 금리 인상에 따른 역전세 취약성을 종합하여 0~100점의 붕괴 위험 점수를 산출합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              viewMode === 'map' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            지도 그리드
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            순위 테이블
          </button>
        </div>
      </div>

      {/* 메인 뷰: 그리드 지도 or 테이블 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-800 flex flex-col justify-between">
          {viewMode === 'map' ? (
            <>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-gray-300">서울시 지리적 모식도 (구 클릭 시 우측 상세 분석)</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>안전</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>주의</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>위험</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>붕괴위기</span>
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
                      const color = getCrashRiskColor(d.risk.totalCrs);

                      return (
                        <button
                          key={districtId}
                          onClick={() => setSelectedDistrict(d.id)}
                          className={`aspect-[1.1] p-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
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
                            className="text-xs font-extrabold mt-1 px-1.5 py-0.5 rounded"
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
                <span>💡 <strong>노도강·금관구</strong>: 높은 전세가율로 역전세 위험 민감 | <strong>강남3구·용산</strong>: 종부세율 인상 시 세부담 급증</span>
                <span>서울 평균 전세가율: <strong>56.2%</strong></span>
              </div>
            </>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-400">정렬 기준을 클릭하여 변경할 수 있습니다.</span>
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => setSortBy('crs')}
                    className={`px-2.5 py-1 rounded ${sortBy === 'crs' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                  >
                    위험점수순
                  </button>
                  <button
                    onClick={() => setSortBy('jeonseRatio')}
                    className={`px-2.5 py-1 rounded ${sortBy === 'jeonseRatio' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                  >
                    전세가율순
                  </button>
                  <button
                    onClick={() => setSortBy('price')}
                    className={`px-2.5 py-1 rounded ${sortBy === 'price' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                  >
                    매매가순
                  </button>
                </div>
              </div>
              <table className="w-full text-xs text-left text-gray-300">
                <thead className="text-gray-400 uppercase bg-gray-800/80 border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-2.5">자치구</th>
                    <th className="px-4 py-2.5">위험 등급</th>
                    <th className="px-4 py-2.5">위험 점수(CRS)</th>
                    <th className="px-4 py-2.5">평균 매매가</th>
                    <th className="px-4 py-2.5">평균 전세가</th>
                    <th className="px-4 py-2.5">전세가율</th>
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
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-900/30' : 'hover:bg-gray-800/50'}`}
                      >
                        <td className="px-4 py-2.5 font-bold text-gray-100">{d.name}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded font-bold" style={{ backgroundColor: `${color}20`, color }}>
                            {d.risk.crsLevel}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-bold">{d.risk.totalCrs.toFixed(1)}점</td>
                        <td className="px-4 py-2.5">{formatManWon(d.avgSalePrice)}</td>
                        <td className="px-4 py-2.5">{formatManWon(d.avgJeonsePrice)}</td>
                        <td className="px-4 py-2.5 font-semibold">{formatPercent(d.jeonseRatio)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 우측 상세 분석 패널 */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-5">
          <div className="flex justify-between items-start border-b border-gray-800 pb-4">
            <div>
              <span className="text-xs text-blue-400 font-semibold">{activeDistrict.region}</span>
              <h3 className="text-2xl font-extrabold text-gray-100 mt-0.5">{activeDistrict.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{activeDistrict.characteristics}</p>
            </div>
            <div
              className="px-3 py-1.5 rounded-lg text-center"
              style={{
                backgroundColor: `${getCrashRiskColor(activeDistrict.risk.totalCrs)}25`,
                color: getCrashRiskColor(activeDistrict.risk.totalCrs)
              }}
            >
              <div className="text-[10px] uppercase font-bold">CRS 위험도</div>
              <div className="text-lg font-black">{Math.round(activeDistrict.risk.totalCrs)}점</div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">평균 매매가</span>
              <span className="font-bold text-gray-100">{formatManWon(activeDistrict.avgSalePrice)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">평균 전세가</span>
              <span className="font-semibold text-gray-200">{formatManWon(activeDistrict.avgJeonsePrice)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">전세가율 (Jeonse Ratio)</span>
              <span className={`font-bold ${activeDistrict.jeonseRatio >= 0.6 ? 'text-red-400' : 'text-emerald-400'}`}>
                {formatPercent(activeDistrict.jeonseRatio)}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">평균 월세 시세</span>
              <span className="text-gray-300">
                보증금 {formatManWon(activeDistrict.monthlyRentDeposit)} / 월 {formatManWon(activeDistrict.monthlyRent)}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">갭투자 레버리지 집중도</span>
              <span className="font-semibold text-orange-400">{activeDistrict.gapInvestmentLevel.toUpperCase()}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">조정대상지역 여부</span>
              <span className={activeDistrict.isRegulated ? 'text-red-400 font-bold' : 'text-gray-400'}>
                {activeDistrict.isRegulated ? '규제지역 (강남/서초/송파/용산)' : '비규제지역'}
              </span>
            </div>
            {activeDistrict.jeonseDropAmount > 0 && (
              <div className="flex justify-between border-b border-gray-800 pb-2 bg-red-950/30 p-2 rounded">
                <span className="text-red-300 font-medium">전세 하락 시 호당 반환 부족액</span>
                <span className="font-bold text-red-400">-{formatManWon(activeDistrict.jeonseDropAmount)}</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-800/60 rounded-lg text-xs space-y-1.5 border border-gray-700/60">
            <div className="font-semibold text-gray-300 flex items-center gap-1.5">
              <AlertOctagon size={14} className="text-yellow-400" />
              지역 취약성 종합 진단
            </div>
            <p className="text-gray-400 leading-relaxed">
              {activeDistrict.jeonseRatio >= 0.6
                ? `${activeDistrict.name}은 전세가율이 ${formatPercent(activeDistrict.jeonseRatio)}로 높아, 금리 상승 및 전세가 하락 시 갭투자자의 보증금 미반환(역전세) 리스크가 최상위권입니다.`
                : `${activeDistrict.name}은 전세가율이 ${formatPercent(activeDistrict.jeonseRatio)}로 낮아 역전세 위험은 낮으나, 고가 주택 밀집으로 종부세율 인상 및 DSR 규제 강화 시 매수세가 급격히 위축됩니다.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
