import React, { useMemo, useState } from 'react';
import { useSimStore } from '../../store/useSimStore';
import { calculateAnnualHoldingTax } from '../../engine/taxEngine';
import { calculateHSI, calculateMortgagePayment, getHsiLevel } from '../../engine/stressEngine';
import { formatManWon, formatManWonCompact, formatPercent } from '../../utils/formatters';
import { getHsiColor, getHsiLabel } from '../../utils/colorScale';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle2, Sliders, RotateCcw, Eye } from 'lucide-react';

export default function TaxComparisonTab() {
  const { params } = useSimStore();

  // Y축 최대값 제어 (단위: 만원)
  // 좌측 Y축 기본값: 40억 (400,000만원)
  // 우측 Y축 기본값: 5천만원 (5,000만원)
  const [leftYMax, setLeftYMax] = useState<number>(400000);
  const [rightYMax, setRightYMax] = useState<number>(5000);
  const [show2026Baseline, setShow2026Baseline] = useState<boolean>(true);

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
      { id: '1home', label: '1주택자 (실거주 기준)', homes: 1, desc: '1세대 1주택 단독명의 / 실거주 목적' },
      { id: '2home', label: '2주택자 (일시적/다주택)', homes: 2, desc: '2주택 보유 / 일반 세율 적용' },
      { id: '3home', label: '3주택 이상 (갭투자/임대)', homes: 3, desc: '다주택 레버리지 보유 / 중과세율 적용 대상' }
    ];

    return scenarios.map(sc => {
      const officialPrice = params.propertyPrice * 0.69;
      const totalOfficialPrices = officialPrice * sc.homes;

      // 1. 현재 사용자가 조절한 파라미터 기준 계산
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

      // 2. [2026 현행 기준] Benchmark 계산
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

  const chartData = comparisonData.map(d => ({
    name: d.label.split(' ')[0],
    
    // 현재 시나리오 (실제 막대 그래프)
    '재산세': Math.round(d.holdingTax.propertyTax.totalPropertyTax * d.homes),
    '종합부동산세': Math.round(d.holdingTax.comprehensiveTax.totalComprehensiveTax),
    '대출 원리금': Math.round(d.annualMortgage),
    '순보유비용': Math.round(Math.max(0, d.hsiResult.totalAnnualCost - d.hsiResult.annualRentalIncome)),

    // 2026 현행 기준 (점선 Reference Line)
    '2026 현행 재산세': Math.round(d.baseHoldingTax.propertyTax.totalPropertyTax * d.homes),
    '2026 현행 종부세': Math.round(d.baseHoldingTax.comprehensiveTax.totalComprehensiveTax),
    '2026 현행 원리금': Math.round(d.baseAnnualMortgage),
    '2026 현행 순보유비용': Math.round(Math.max(0, d.baseHsiResult.totalAnnualCost - d.baseHsiResult.annualRentalIncome))
  }));

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

  const handleResetYAxis = () => {
    setLeftYMax(400000);
    setRightYMax(5000);
  };

  return (
    <div className="p-6 space-y-8 text-gray-200 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <TrendingUp className="text-blue-400" />
          1주택 vs 다주택 보유세 & 현금흐름 스트레스 분석
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          공시가격 현실화율 69% 기준, 종부세·재산세 누진공제 및 대출 원리금을 결합하여 가구 소득 대비 연간 보유 한계선(HSI)을 계산합니다.
        </p>
      </div>

      {/* 3개 시나리오 비교 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {comparisonData.map(d => {
          const color = getHsiColor(d.hsiResult.hsi);
          const isDanger = d.hsiResult.hsi >= 0.7;
          const taxDiff = d.holdingTax.totalAnnual - d.baseHoldingTax.totalAnnual;

          return (
            <div
              key={d.id}
              className={`bg-gray-900 rounded-xl p-6 border transition-all ${
                isDanger ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-gray-800'
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
                  <span className="text-gray-400">연간 재산세 합계</span>
                  <div className="text-right">
                    <span className="font-semibold text-blue-400">{formatManWon(d.holdingTax.propertyTax.totalPropertyTax * d.homes)}</span>
                    <div className="text-[10px] text-gray-400">현행: {formatManWon(d.baseHoldingTax.propertyTax.totalPropertyTax * d.homes)}</div>
                  </div>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span className="text-gray-400">연간 종합부동산세</span>
                  <div className="text-right">
                    <span className="font-semibold text-orange-400">{formatManWon(d.holdingTax.comprehensiveTax.totalComprehensiveTax)}</span>
                    <div className="text-[10px] text-gray-400">현행: {formatManWon(d.baseHoldingTax.comprehensiveTax.totalComprehensiveTax)}</div>
                  </div>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span className="text-gray-400">총 연간 보유세</span>
                  <div className="text-right">
                    <span className="font-bold text-gray-100">{formatManWon(d.holdingTax.totalAnnual)}</span>
                    {taxDiff !== 0 && (
                      <div className={`text-[10px] font-semibold ${taxDiff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        2026 현행 대비 {taxDiff > 0 ? `+${formatManWon(taxDiff)}` : `-${formatManWon(Math.abs(taxDiff))}`}
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
                    <span className="text-gray-400">임대 수익 (월세 수입)</span>
                    <span className="font-semibold text-emerald-400">+{formatManWon(d.rentalIncome)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <span className="text-gray-300 font-bold">순 연간 지출 (Net Cost)</span>
                  <span className="font-bold text-base text-red-400">
                    {formatManWon(Math.max(0, d.hsiResult.totalAnnualCost - d.hsiResult.annualRentalIncome))}
                  </span>
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

      {/* 이중 Y축 연간 세부담 & 지출 차트 (2026 현행 점선 Reference 포함) */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              <span>항목별 연간 지출 비교 (이중 Y축 & 2026 현행 점선 Reference)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              <span className="inline-block w-3 h-2 bg-gray-500 rounded-sm mr-1"></span><strong>막대(Bar)</strong>: 현재 조절된 시나리오 | 
              <span className="inline-block w-3 h-0.5 border-t border-dashed border-gray-300 mx-1"></span><strong>점선(Dashed Line)</strong>: 2026 현행 기준선
            </p>
          </div>
          
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShow2026Baseline(!show2026Baseline)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                show2026Baseline
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'
              }`}
            >
              <Eye size={13} />
              2026 현행 점선 {show2026Baseline ? '표시 중' : '숨김'}
            </button>
            <button
              onClick={handleResetYAxis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-300 transition-colors border border-gray-700"
            >
              <RotateCcw size={13} />
              Y축 초기화
            </button>
          </div>
        </div>

        {/* Y축 최대값 조절 슬라이더 패널 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-gray-800/60 border border-gray-700/60 text-xs">
          {/* 좌측 Y축 슬라이더 (원리금/순보유비용 - 최대 40억 기준) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                <Sliders size={13} className="text-purple-400" />
                좌측 Y축 최대값 (원리금·순비용)
              </span>
              <span className="font-bold text-purple-300 text-sm">{formatManWon(leftYMax)}</span>
            </div>
            <input
              type="range"
              min={10000}
              max={500000}
              step={10000}
              value={leftYMax}
              onChange={(e) => setLeftYMax(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>1억</span>
              <span>20억</span>
              <span>40억 (기본)</span>
              <span>50억</span>
            </div>
          </div>

          {/* 우측 Y축 슬라이더 (재산세/종부세 - 최대 5천만원 기준) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                <Sliders size={13} className="text-orange-400" />
                우측 Y축 최대값 (재산세·종부세)
              </span>
              <span className="font-bold text-orange-300 text-sm">{formatManWon(rightYMax)}</span>
            </div>
            <input
              type="range"
              min={1000}
              max={20000}
              step={500}
              value={rightYMax}
              onChange={(e) => setRightYMax(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>1,000만</span>
              <span>5,000만 (기본)</span>
              <span>1억</span>
              <span>2억</span>
            </div>
          </div>
        </div>

        {/* 차트 영역 */}
        <div className="h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 35, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#d1d5db' }} />
              
              {/* 좌측 Y축: 원리금 및 순보유비용 */}
              <YAxis
                yAxisId="left"
                orientation="left"
                domain={[0, leftYMax]}
                stroke="#a78bfa"
                tickFormatter={(v) => formatManWonCompact(v)}
                label={{ value: '원리금/순보유비용', angle: -90, position: 'insideLeft', fill: '#a78bfa', fontSize: 11 }}
              />

              {/* 우측 Y축: 재산세 및 종합부동산세 */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, rightYMax]}
                stroke="#fb923c"
                tickFormatter={(v) => formatManWonCompact(v)}
                label={{ value: '재산세/종합부동산세', angle: 90, position: 'insideRight', fill: '#fb923c', fontSize: 11 }}
              />

              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: number, name: string) => [formatManWon(val), name]}
              />
              <Legend wrapperStyle={{ color: '#d1d5db', paddingTop: '10px', fontSize: '12px' }} />
              
              {/* 1. 현재 시나리오 막대 그래프 (Solid Bars) */}
              <Bar yAxisId="right" dataKey="재산세" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="종합부동산세" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="대출 원리금" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="순보유비용" fill="#ef4444" radius={[4, 4, 0, 0]} />

              {/* 2. [2026 현행] 점선 Reference Lines (Dashed Overlays) */}
              {show2026Baseline && (
                <>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="2026 현행 재산세"
                    stroke="#93c5fd"
                    strokeDasharray="6 6"
                    strokeWidth={2.5}
                    dot={{ r: 4.5, strokeWidth: 2, fill: '#1d4ed8', stroke: '#93c5fd' }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="2026 현행 종부세"
                    stroke="#fdba74"
                    strokeDasharray="6 6"
                    strokeWidth={2.5}
                    dot={{ r: 4.5, strokeWidth: 2, fill: '#c2410c', stroke: '#fdba74' }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="2026 현행 원리금"
                    stroke="#d8b4fe"
                    strokeDasharray="6 6"
                    strokeWidth={2.5}
                    dot={{ r: 4.5, strokeWidth: 2, fill: '#6b21a8', stroke: '#d8b4fe' }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="2026 현행 순보유비용"
                    stroke="#fca5a5"
                    strokeDasharray="6 6"
                    strokeWidth={2.5}
                    dot={{ r: 5, strokeWidth: 2, fill: '#991b1b', stroke: '#fca5a5' }}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
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
