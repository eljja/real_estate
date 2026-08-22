import React, { useMemo } from 'react';
import { useSimStore } from '../../store/useSimStore';
import { calculateAllIndicators, getOverallBubbleRisk, BubbleIndicatorResult } from '../../engine/bubbleIndicators';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTriangle, HelpCircle, ShieldCheck, Activity } from 'lucide-react';

export default function BubbleIndexTab() {
  const { params } = useSimStore();

  const indicators = useMemo(() => {
    return calculateAllIndicators({
      medianPrice: params.propertyPrice,
      medianIncome: params.annualIncome,
      annualRent: params.propertyPrice * (params.conversionRate / 100),
      mortgageRate: params.baseRate + 1.5,
      ltvRatio: params.ltvLimit,
      constructionCost: params.propertyPrice * 0.70
    });
  }, [params]);

  const overall = useMemo(() => getOverallBubbleRisk(indicators), [indicators]);

  const radarData = indicators.map(ind => ({
    subject: ind.nameEn,
    name: ind.name,
    score: Math.min(100, Math.max(0, Math.round((ind.value / ind.maxValue) * 100))),
    fullMark: 100
  }));

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
      case 'danger':
        return '#ef4444';
      case 'warning':
        return '#f97316';
      case 'caution':
        return '#eab308';
      default:
        return '#22c55e';
    }
  };

  return (
    <div className="p-6 space-y-8 text-gray-200 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Activity className="text-blue-400" />
            글로벌 8대 부동산 버블 & 금융위기 조기경보 지표
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            BIS(국제결제은행), World Bank, UN-Habitat, 주택금융공사에서 활용하는 계량 거시 지표를 한국 부동산에 적용하여 거품 수준을 진단합니다.
          </p>
        </div>

        <div
          className="px-4 py-2.5 rounded-xl border flex items-center gap-3 self-start sm:self-auto shrink-0 shadow-lg"
          style={{
            backgroundColor: `${getRiskColor(overall.level)}15`,
            borderColor: `${getRiskColor(overall.level)}50`
          }}
        >
          <AlertTriangle style={{ color: getRiskColor(overall.level) }} size={20} />
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">종합 버블 위험도</div>
            <div className="text-sm font-extrabold" style={{ color: getRiskColor(overall.level) }}>
              {overall.label} (위험 점수: {overall.score.toFixed(1)} / 4.0)
            </div>
          </div>
        </div>
      </div>

      {/* 레이더 차트 + 요약 진단 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center h-80 lg:col-span-1">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 self-start">
            8대 지표 위험도 레이더
          </h3>
          <ResponsiveContainer width="100%" height="90%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={11} tick={{ fill: '#9ca3af' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4b5563" />
              <Radar name="위험도 (0-100)" dataKey="score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.35} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                formatter={(val: number, name: string, props: any) => [`${val}점 (정규화)`, props.payload.name]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 8개 지표 카드 그리드 */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {indicators.map((ind, i) => {
            const color = getRiskColor(ind.riskLevel);

            return (
              <div
                key={i}
                className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col justify-between hover:border-gray-700 transition-colors"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-gray-500 tracking-wider">{ind.nameEn}</span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      {ind.riskLabel}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-100 mt-1">{ind.name}</h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed line-clamp-2">{ind.description}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-800">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-gray-400">지표 값</span>
                    <span className="text-base font-extrabold" style={{ color }}>
                      {ind.value.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (ind.value / ind.maxValue) * 100)}%`,
                        backgroundColor: color
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 지표 상세 가이드 테이블 */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h3 className="text-lg font-bold text-gray-100 mb-1">국제 표준 부동산 거품 경보 기준표 (Benchmarks)</h3>
        <p className="text-xs text-gray-400 mb-4">각 지표의 임계값을 초과할 경우 거시 건전성 위기 및 부동산 급락 위험이 급증합니다.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-300">
            <thead className="text-gray-400 uppercase bg-gray-800/80 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3">지표명</th>
                <th className="px-4 py-3">안전 구간 (Green)</th>
                <th className="px-4 py-3">주의 구간 (Yellow)</th>
                <th className="px-4 py-3">경고/위험 구간 (Red)</th>
                <th className="px-4 py-3">현재 산출치</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {indicators.map((ind, idx) => (
                <tr key={idx} className="hover:bg-gray-800/40">
                  <td className="px-4 py-3 font-semibold text-gray-100">
                    {ind.name} <span className="text-gray-500 font-normal">({ind.nameEn})</span>
                  </td>
                  <td className="px-4 py-3 text-emerald-400">≤ {ind.threshold.safe}</td>
                  <td className="px-4 py-3 text-yellow-400">{ind.threshold.safe} ~ {ind.threshold.warning}</td>
                  <td className="px-4 py-3 text-red-400 font-bold">≥ {ind.threshold.danger}</td>
                  <td className="px-4 py-3 font-extrabold" style={{ color: getRiskColor(ind.riskLevel) }}>
                    {ind.value.toFixed(2)} ({ind.riskLabel})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
