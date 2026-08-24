import React, { useMemo, useState } from 'react';
import { useSimStore } from '../../store/useSimStore';
import { calculateAnnualHoldingTax } from '../../engine/taxEngine';
import { calculateHSI, calculateMortgagePayment, getHsiLevel } from '../../engine/stressEngine';
import { formatManWon, formatManWonCompact, formatPercent } from '../../utils/formatters';
import { getHsiColor, getHsiLabel } from '../../utils/colorScale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  RotateCcw,
  Landmark,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

export default function TaxComparisonTab() {
  const { params } = useSimStore();

  // Y축 최대값 제어 (수동 조절 옵션)
  const [taxYMax, setTaxYMax] = useState<number>(0); // 0이면 자동(Auto)
  const [costYMax, setCostYMax] = useState<number>(0); // 0이면 자동(Auto)

  // 2026 현행 기준 상수 파라미터
  const BASELINE_2026 = useMemo(() => ({
    fairValueRatio: 0.60,
    cptMultiplier: 1.0,
    multiHomeSurcharge: false,
    baseRate: 3.0,
    conversionRate: 4.8
  }), []);

  const comparisonData = useMemo(() => {
    const scenarios = [
      { id: '1home', label: '1주택자 (실거주 기준)', shortLabel: '1주택자', homes: 1, desc: '1세대 1주택 단독명의 / 실거주 목적' },
      { id: '2home', label: '2주택자 (일시적/다주택)', shortLabel: '2주택자', homes: 2, desc: '2주택 보유 / 일반 세율 적용' },
      { id: '3home', label: '3주택 이상 (갭투자/임대)', shortLabel: '3주택 이상', homes: 3, desc: '다주택 레버리지 보유 / 중과세율 적용' }
    ];

    return scenarios.map(sc => {
      const officialPrice = params.propertyPrice * 0.69;
      const totalOfficialPrices = officialPrice * sc.homes;

      // 1. 현재 사용자 파라미터 기준 계산
      const holdingTax = calculateAnnualHoldingTax(
        officialPrice,
        totalOfficialPrices,
        sc.homes,
        params.ownerAge,
        params.holdingYears,
        {
          fairValueRatio: params.fairValueRatio,
          cptMultiplier: params.cptMultiplier,
          multiHomeSurcharge: params.multiHomeSurcharge
        }
      );

      const annualMortgage = calculateMortgagePayment(params.mortgagePrincipal, params.baseRate + 1.5, params.mortgageYears);
      const rentalIncomePerExtraHome = (params.propertyPrice * 0.5 * (params.conversionRate / 100));
      const rentalIncome = sc.homes > 1 ? Math.round(rentalIncomePerExtraHome * (sc.homes - 1)) : 0;
      const hsiResult = calculateHSI(holdingTax.totalAnnual, annualMortgage, rentalIncome, params.annualIncome);

      // 2. 2026 현행 기준 계산
      const baseHoldingTax = calculateAnnualHoldingTax(
        officialPrice,
        totalOfficialPrices,
        sc.homes,
        params.ownerAge,
        params.holdingYears,
        {
          fairValueRatio: BASELINE_2026.fairValueRatio,
          cptMultiplier: BASELINE_2026.cptMultiplier,
          multiHomeSurcharge: BASELINE_2026.multiHomeSurcharge
        }
      );
      const baseAnnualMortgage = calculateMortgagePayment(params.mortgagePrincipal, BASELINE_2026.baseRate + 1.5, params.mortgageYears);
      const baseRentalIncomePerExtra = (params.propertyPrice * 0.5 * (BASELINE_2026.conversionRate / 100));
      const baseRentalIncome = sc.homes > 1 ? Math.round(baseRentalIncomePerExtra * (sc.homes - 1)) : 0;
      const baseHsiResult = calculateHSI(baseHoldingTax.totalAnnual, baseAnnualMortgage, baseRentalIncome, params.annualIncome);

      return {
        ...sc,
        officialPrice,
        totalOfficialPrices,
        holdingTax,
        annualMortgage,
        rentalIncome,
        hsiResult,
        baseHoldingTax,
        baseAnnualMortgage,
        baseRentalIncome,
        baseHsiResult
      };
    });
  }, [params, BASELINE_2026]);

  // 차트 A 데이터: 보유세 (재산세 + 종부세)
  const taxChartData = comparisonData.map(d => ({
    name: d.shortLabel,
    '현재 재산세': Math.round(d.holdingTax.propertyTax.totalPropertyTax * d.homes),
    '현재 종부세': Math.round(d.holdingTax.comprehensiveTax.totalComprehensiveTax),
    '현행 재산세': Math.round(d.baseHoldingTax.propertyTax.totalPropertyTax * d.homes),
    '현행 종부세': Math.round(d.baseHoldingTax.comprehensiveTax.totalComprehensiveTax),
    currentTotal: Math.round(d.holdingTax.totalAnnual),
    baseTotal: Math.round(d.baseHoldingTax.totalAnnual),
    diff: Math.round(d.holdingTax.totalAnnual - d.baseHoldingTax.totalAnnual)
  }));

  // 차트 B 데이터: 연간 총 현금흐름 & 순보유비용
  const costChartData = comparisonData.map(d => {
    const currentNet = Math.max(0, d.hsiResult.totalAnnualCost - d.hsiResult.annualRentalIncome);
    const baseNet = Math.max(0, d.baseHsiResult.totalAnnualCost - d.baseHsiResult.annualRentalIncome);
    return {
      name: d.shortLabel,
      '현재 순보유비용': Math.round(currentNet),
      '현행 순보유비용': Math.round(baseNet),
      '현재 원리금': Math.round(d.annualMortgage),
      '현행 원리금': Math.round(d.baseAnnualMortgage),
      currentNet: Math.round(currentNet),
      baseNet: Math.round(baseNet),
      diff: Math.round(currentNet - baseNet)
    };
  });

  const stressPoints = [100000, 150000, 250000, 350000, 500000].map(price => {
    const offPrice = price * 0.69;
    const t1 = calculateAnnualHoldingTax(offPrice, offPrice, 1, params.ownerAge, params.holdingYears, params);
    const t3 = calculateAnnualHoldingTax(offPrice, offPrice * 3, 3, params.ownerAge, params.holdingYears, params);
    const mort = calculateMortgagePayment(params.mortgagePrincipal, params.baseRate + 1.5, params.mortgageYears);
    const hsi1 = calculateHSI(t1.totalAnnual, mort, 0, params.annualIncome).hsi;
    const hsi3 = calculateHSI(t3.totalAnnual, mort, Math.round(price * (params.conversionRate / 100)), params.annualIncome).hsi;
    return {
      price,
      hsi1,
      hsi3,
      tax1: t1.totalAnnual,
      tax3: t3.totalAnnual
    };
  });

  return (
    <div className="p-6 space-y-8 text-gray-200 max-w-7xl mx-auto">
      {/* 타이틀 및 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <TrendingUp className="text-blue-400" />
          1주택 vs 다주택 보유세 & 현금흐름 스트레스 분석
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          공시가격 현실화율 69% 기준, 종부세·재산세 누진공제 및 대출 원리금을 결합하여 가구 소득 대비 연간 보유 한계선(HSI)을 계산합니다.
        </p>
      </div>

      {/* 3개 주택유형별 핵심 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {comparisonData.map(d => {
          const color = getHsiColor(d.hsiResult.hsi);
          const isDanger = d.hsiResult.hsi >= 0.7;
          const taxDiff = d.holdingTax.totalAnnual - d.baseHoldingTax.totalAnnual;
          const netCost = Math.max(0, d.hsiResult.totalAnnualCost - d.hsiResult.annualRentalIncome);
          const baseNetCost = Math.max(0, d.baseHsiResult.totalAnnualCost - d.baseHsiResult.annualRentalIncome);
          const netDiff = netCost - baseNetCost;

          return (
            <div
              key={d.id}
              className={`bg-gray-900 rounded-xl p-6 border transition-all ${
                isDanger ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-gray-800'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-100">{d.label}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{d.desc}</p>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
                  style={{ backgroundColor: `${color}25`, color }}
                >
                  HSI: {formatPercent(d.hsiResult.hsi)}
                </span>
              </div>

              <div className="space-y-2.5 my-4 text-sm">
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span className="text-gray-400">총 공시가격</span>
                  <span className="font-semibold text-gray-300">{formatManWon(d.totalOfficialPrices)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span className="text-gray-400">연간 재산세</span>
                  <span className="font-semibold text-blue-400">{formatManWon(d.holdingTax.propertyTax.totalPropertyTax * d.homes)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span className="text-gray-400">연간 종합부동산세</span>
                  <span className="font-semibold text-orange-400">{formatManWon(d.holdingTax.comprehensiveTax.totalComprehensiveTax)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1.5 bg-gray-800/40 px-2 py-1 rounded">
                  <span className="text-gray-300 font-bold">총 보유세 합계</span>
                  <div className="text-right">
                    <span className="font-bold text-gray-100">{formatManWon(d.holdingTax.totalAnnual)}</span>
                    {taxDiff !== 0 && (
                      <div className={`text-[11px] font-bold flex items-center justify-end gap-0.5 ${taxDiff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {taxDiff > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        현행대비 {taxDiff > 0 ? `+${formatManWon(taxDiff)}` : `-${formatManWon(Math.abs(taxDiff))}`}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span className="text-gray-400">연간 대출 원리금</span>
                  <span className="font-semibold text-purple-400">{formatManWon(d.annualMortgage)}</span>
                </div>
                {d.homes > 1 && (
                  <div className="flex justify-between border-b border-gray-800 pb-1.5">
                    <span className="text-gray-400">임대 수익 (월세)</span>
                    <span className="font-semibold text-emerald-400">+{formatManWon(d.rentalIncome)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <span className="text-gray-200 font-bold">순 연간 지출 (Net Cost)</span>
                  <div className="text-right">
                    <span className="font-bold text-base text-red-400">{formatManWon(netCost)}</span>
                    {netDiff !== 0 && (
                      <div className={`text-[11px] font-bold flex items-center justify-end gap-0.5 ${netDiff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {netDiff > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        현행대비 {netDiff > 0 ? `+${formatManWon(netDiff)}` : `-${formatManWon(Math.abs(netDiff))}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="mt-4 p-3 rounded-lg flex items-center justify-between text-xs font-semibold"
                style={{ backgroundColor: `${color}15`, color }}
              >
                <span>보유 스트레스 진단</span>
                <span>{getHsiLabel(d.hsiResult.hsi)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* [안 1] 2개 분리형 차트 듀얼 뷰: 차트 A (보유세) & 차트 B (순현금흐름) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ===================== [차트 A] 연간 보유세 비교 (재산세 + 종부세) ===================== */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                  <Landmark size={18} className="text-orange-400" />
                  차트 A. 연간 보유세 비교 (재산세 · 종부세)
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  각 주택별 <strong className="text-gray-200">[현재 시나리오]</strong> vs <strong className="text-gray-400">[2026 현행]</strong> 누적 막대 비교
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setTaxYMax(taxYMax === 0 ? 5000 : 0)}
                  className={`px-2.5 py-1 rounded border transition-colors ${
                    taxYMax > 0 ? 'bg-blue-600/30 border-blue-500 text-blue-300' : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}
                >
                  {taxYMax > 0 ? `Y축 고정: ${formatManWonCompact(taxYMax)}` : 'Y축: 자동 스케일'}
                </button>
              </div>
            </div>

            {taxYMax > 0 && (
              <div className="mt-3 p-2.5 bg-gray-800/60 rounded-lg border border-gray-700/60 text-xs space-y-1">
                <div className="flex justify-between text-gray-300 font-semibold">
                  <span>보유세 Y축 최대값 조절</span>
                  <span className="text-orange-400">{formatManWon(taxYMax)}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={20000}
                  step={500}
                  value={taxYMax}
                  onChange={(e) => setTaxYMax(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
            )}
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taxChartData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#d1d5db', fontSize: 12 }} />
                <YAxis
                  stroke="#9ca3af"
                  domain={taxYMax > 0 ? [0, taxYMax] : [0, 'auto']}
                  tickFormatter={(v) => formatManWonCompact(v)}
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl text-xs space-y-2">
                          <div className="font-bold text-gray-100 border-b border-gray-800 pb-1">{label} 보유세 상세</div>
                          <div className="space-y-1">
                            <div className="flex justify-between gap-4 text-blue-400">
                              <span>• 현재 재산세</span>
                              <span className="font-semibold">{formatManWon(data['현재 재산세'])}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-orange-400">
                              <span>• 현재 종부세</span>
                              <span className="font-semibold">{formatManWon(data['현재 종부세'])}</span>
                            </div>
                            <div className="flex justify-between gap-4 font-bold text-gray-100 pt-1 border-t border-gray-800">
                              <span>= 현재 총보유세</span>
                              <span>{formatManWon(data.currentTotal)}</span>
                            </div>
                          </div>
                          <div className="pt-1.5 border-t border-gray-800 text-gray-400">
                            <div className="flex justify-between gap-4">
                              <span>• 2026 현행 총보유세</span>
                              <span className="text-gray-300 font-semibold">{formatManWon(data.baseTotal)}</span>
                            </div>
                            <div className="flex justify-between gap-4 pt-1 font-bold">
                              <span>변동 격차</span>
                              <span className={data.diff > 0 ? 'text-red-400' : data.diff < 0 ? 'text-emerald-400' : 'text-gray-300'}>
                                {data.diff > 0 ? `+${formatManWon(data.diff)} 증가` : data.diff < 0 ? `-${formatManWon(Math.abs(data.diff))} 감소` : '동일'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ color: '#d1d5db', fontSize: '11px' }} />
                {/* 현재 시나리오 누적 기둥 (왼쪽) */}
                <Bar dataKey="현재 재산세" stackId="current" fill="#3b82f6" name="현재 재산세" radius={[0, 0, 0, 0]} />
                <Bar dataKey="현재 종부세" stackId="current" fill="#f97316" name="현재 종부세" radius={[4, 4, 0, 0]} />
                
                {/* 2026 현행 기준 누적 기둥 (오른쪽 비교용) */}
                <Bar dataKey="현행 재산세" stackId="baseline" fill="#64748b" name="2026 현행 재산세" radius={[0, 0, 0, 0]} opacity={0.6} />
                <Bar dataKey="현행 종부세" stackId="baseline" fill="#c2410c" name="2026 현행 종부세" radius={[4, 4, 0, 0]} opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-2.5 bg-gray-800/40 rounded-lg text-[11px] text-gray-400 flex items-center justify-between border border-gray-800">
            <span>💡 <strong>진한 막대</strong>: 현재 시나리오 | <strong>연한/슬레이트 막대</strong>: 2026 현행 기준</span>
            <span className="text-orange-400 font-semibold">높이 차이 = 세금 증가분</span>
          </div>
        </div>

        {/* ===================== [차트 B] 연간 금융비용 & 순보유비용 ===================== */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                  <Wallet size={18} className="text-red-400" />
                  차트 B. 연간 순보유비용 & 대출원리금 비교
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  세금 + 대출이자 - 임대수입이 반영된 실제 가계 순부담액(Net Cost) 비교
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setCostYMax(costYMax === 0 ? 10000 : 0)}
                  className={`px-2.5 py-1 rounded border transition-colors ${
                    costYMax > 0 ? 'bg-purple-600/30 border-purple-500 text-purple-300' : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}
                >
                  {costYMax > 0 ? `Y축 고정: ${formatManWonCompact(costYMax)}` : 'Y축: 자동 스케일'}
                </button>
              </div>
            </div>

            {costYMax > 0 && (
              <div className="mt-3 p-2.5 bg-gray-800/60 rounded-lg border border-gray-700/60 text-xs space-y-1">
                <div className="flex justify-between text-gray-300 font-semibold">
                  <span>순지출 Y축 최대값 조절</span>
                  <span className="text-purple-400">{formatManWon(costYMax)}</span>
                </div>
                <input
                  type="range"
                  min={2000}
                  max={30000}
                  step={1000}
                  value={costYMax}
                  onChange={(e) => setCostYMax(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            )}
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costChartData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#d1d5db', fontSize: 12 }} />
                <YAxis
                  stroke="#9ca3af"
                  domain={costYMax > 0 ? [0, costYMax] : [0, 'auto']}
                  tickFormatter={(v) => formatManWonCompact(v)}
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl text-xs space-y-2">
                          <div className="font-bold text-gray-100 border-b border-gray-800 pb-1">{label} 지출 상세</div>
                          <div className="space-y-1">
                            <div className="flex justify-between gap-4 text-red-400 font-bold">
                              <span>• 현재 순보유비용</span>
                              <span>{formatManWon(data['현재 순보유비용'])}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-gray-400">
                              <span>• 2026 현행 순비용</span>
                              <span className="text-gray-300 font-semibold">{formatManWon(data['현행 순보유비용'])}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-purple-400">
                              <span>• 현재 대출 원리금</span>
                              <span className="font-semibold">{formatManWon(data['현재 원리금'])}</span>
                            </div>
                          </div>
                          <div className="pt-1.5 border-t border-gray-800 flex justify-between gap-4 font-bold">
                            <span>순부담 변동</span>
                            <span className={data.diff > 0 ? 'text-red-400' : data.diff < 0 ? 'text-emerald-400' : 'text-gray-300'}>
                              {data.diff > 0 ? `+${formatManWon(data.diff)} 부담 가중` : data.diff < 0 ? `-${formatManWon(Math.abs(data.diff))} 완화` : '동일'}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ color: '#d1d5db', fontSize: '11px' }} />
                <Bar dataKey="현재 순보유비용" fill="#ef4444" name="현재 순보유비용" radius={[4, 4, 0, 0]} />
                <Bar dataKey="현행 순보유비용" fill="#991b1b" opacity={0.5} name="2026 현행 순비용" radius={[4, 4, 0, 0]} />
                <Bar dataKey="현재 원리금" fill="#8b5cf6" name="현재 원리금" radius={[4, 4, 0, 0]} />
                <Bar dataKey="현행 원리금" fill="#5b21b6" opacity={0.5} name="2026 현행 원리금" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-2.5 bg-gray-800/40 rounded-lg text-[11px] text-gray-400 flex items-center justify-between border border-gray-800">
            <span>💡 <strong>순보유비용</strong> = 보유세 + 대출원리금 - 월세수입</span>
            <span className="text-red-400 font-semibold">빨간 막대 = 최종 순지출액</span>
          </div>
        </div>

      </div>

      {/* 주택 가격대별 HSI 스트레스 테이블 */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h3 className="text-lg font-bold mb-1 text-gray-100">주택 매매가별 보유 한계선(HSI) 비교</h3>
        <p className="text-xs text-gray-400 mb-4">
          가구 연소득({formatManWon(params.annualIncome)}) 기준, 주택 가격 상승 시 1주택자와 3주택자의 HSI 위험도 전이
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-800/60 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3">주택 매매가 (1채 기준)</th>
                <th className="px-6 py-3">1주택 연간세금</th>
                <th className="px-6 py-3">1주택 HSI</th>
                <th className="px-6 py-3">3주택 연간세금</th>
                <th className="px-6 py-3">3주택 HSI</th>
                <th className="px-6 py-3">다주택 매도 압력</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {stressPoints.map((row, idx) => {
                const color1 = getHsiColor(row.hsi1);
                const color3 = getHsiColor(row.hsi3);

                return (
                  <tr key={idx} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-100">{formatManWon(row.price)}</td>
                    <td className="px-6 py-4">{formatManWon(row.tax1)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded font-bold text-xs" style={{ backgroundColor: `${color1}20`, color: color1 }}>
                        {formatPercent(row.hsi1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-orange-400">{formatManWon(row.tax3)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded font-bold text-xs" style={{ backgroundColor: `${color3}20`, color: color3 }}>
                        {formatPercent(row.hsi3)} ({getHsiLabel(row.hsi3).split(' ')[0]})
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {row.hsi3 >= 1.0 ? (
                        <span className="text-red-500 font-bold flex items-center gap-1">
                          <AlertTriangle size={14} /> 패닉셀/급매 출회
                        </span>
                      ) : row.hsi3 >= 0.7 ? (
                        <span className="text-orange-400 font-medium">적극적 매도 검토</span>
                      ) : (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 size={14} /> 보유 여력 충분
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
