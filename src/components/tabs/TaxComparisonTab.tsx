import React, { useMemo } from 'react';
import { useSimStore } from '../../store/useSimStore';
import { calculateAnnualHoldingTax } from '../../engine/taxEngine';
import { calculateHSI, calculateMortgagePayment, getHsiLevel } from '../../engine/stressEngine';
import { formatManWon, formatPercent } from '../../utils/formatters';
import { getHsiColor, getHsiLabel } from '../../utils/colorScale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ShieldAlert, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function TaxComparisonTab() {
  const { params } = useSimStore();

  const comparisonData = useMemo(() => {
    const scenarios = [
      { id: '1home', label: '1주택자 (실거주 기준)', homes: 1, desc: '1세대 1주택 단독명의 / 실거주 목적' },
      { id: '2home', label: '2주택자 (일시적/다주택)', homes: 2, desc: '2주택 보유 / 일반 세율 적용' },
      { id: '3home', label: '3주택 이상 (갭투자/임대)', homes: 3, desc: '다주택 레버리지 보유 / 중과세율 적용 대상' }
    ];

    return scenarios.map(sc => {
      const officialPrice = params.propertyPrice * 0.69;
      const totalOfficialPrices = officialPrice * sc.homes;

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
      // 다주택자의 경우 1채당 예상 월세 수입 (전월세전환율 반영)
      const rentalIncomePerExtraHome = (params.propertyPrice * 0.5 * (params.conversionRate / 100));
      const rentalIncome = sc.homes > 1 ? Math.round(rentalIncomePerExtraHome * (sc.homes - 1)) : 0;

      const hsiResult = calculateHSI(holdingTax.totalAnnual, annualMortgage, rentalIncome, params.annualIncome);

      return {
        ...sc,
        officialPrice,
        totalOfficialPrices,
        holdingTax,
        annualMortgage,
        rentalIncome,
        hsiResult
      };
    });
  }, [params]);

  const chartData = comparisonData.map(d => ({
    name: d.label.split(' ')[0],
    '재산세': Math.round(d.holdingTax.propertyTax.totalPropertyTax * d.homes),
    '종합부동산세': Math.round(d.holdingTax.comprehensiveTax.totalComprehensiveTax),
    '대출 원리금': Math.round(d.annualMortgage),
    '순보유비용': Math.round(Math.max(0, d.hsiResult.totalAnnualCost - d.hsiResult.annualRentalIncome))
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
                  <span className="font-semibold text-blue-400">{formatManWon(d.holdingTax.propertyTax.totalPropertyTax * d.homes)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span className="text-gray-400">연간 종합부동산세</span>
                  <span className="font-semibold text-orange-400">{formatManWon(d.holdingTax.comprehensiveTax.totalComprehensiveTax)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-1.5">
                  <span className="text-gray-400">총 연간 보유세</span>
                  <span className="font-bold text-gray-100">{formatManWon(d.holdingTax.totalAnnual)}</span>
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

      {/* 연간 세부담 차트 */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h3 className="text-lg font-bold mb-1 text-gray-100">항목별 연간 지출 비교</h3>
        <p className="text-xs text-gray-400 mb-6">주택 수에 따른 세금(재산세·종부세) 및 금융비용의 비대칭적 증가</p>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(v) => `${Math.round(v / 10000)}억`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                formatter={(val: number) => [formatManWon(val), '']}
              />
              <Legend wrapperStyle={{ color: '#d1d5db' }} />
              <Bar dataKey="재산세" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="종합부동산세" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="대출 원리금" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="순보유비용" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
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
