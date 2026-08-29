import React, { useMemo, useState } from 'react';
import { useSimStore } from '../../store/useSimStore';
import { calculateAllIndicators, getOverallBubbleRisk, BubbleIndicatorResult } from '../../engine/bubbleIndicators';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Building,
  Info,
  TrendingUp,
  Landmark,
  X
} from 'lucide-react';

export default function BubbleIndexTab() {
  const { params } = useSimStore();
  const [selectedIndicator, setSelectedIndicator] = useState<BubbleIndicatorResult | null>(null);

  const indicators = useMemo(() => {
    return calculateAllIndicators({
      medianPrice: params.propertyPrice,
      medianIncome: params.annualIncome,
      annualRent: params.propertyPrice * (params.conversionRate / 100),
      mortgageRate: params.baseRate + 1.5,
      ltvRatio: params.ltvLimit,
      constructionCost: params.propertyPrice * 0.68
    });
  }, [params]);

  const overall = useMemo(() => getOverallBubbleRisk(indicators), [indicators]);

  const radarData = indicators.map(ind => ({
    subject: ind.nameEn.split(' ')[0],
    fullName: ind.name,
    score: Math.min(100, Math.max(10, Math.round((ind.value / ind.maxValue) * 100))),
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
      {/* 탭 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <Activity className="text-blue-400" />
              글로벌 8대 부동산 버블 &amp; 금융위기 조기경보 지표
            </h2>
            <span className="bg-purple-950/80 text-purple-400 border border-purple-800/40 text-[11px] font-bold px-2 py-0.5 rounded-full">
              BIS &middot; IMF &middot; OECD 표준
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            국제결제은행(BIS), 국제통화기금(IMF), 한국주택금융공사의 계량 거시 펀더멘털 모델을 기반으로 버블 붕괴 임계선을 진단합니다.
          </p>
        </div>

        {/* 종합 위험도 뱃지 카드 */}
        <div
          className="px-4 py-2.5 rounded-xl border flex items-center gap-3 self-start md:self-auto shrink-0 shadow-xl"
          style={{
            backgroundColor: `${getRiskColor(overall.level)}15`,
            borderColor: `${getRiskColor(overall.level)}50`
          }}
        >
          <AlertTriangle style={{ color: getRiskColor(overall.level) }} size={22} />
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">종합 거시 버블 판정</div>
            <div className="text-sm font-extrabold" style={{ color: getRiskColor(overall.level) }}>
              {overall.label} (위험 지표: {overall.dangerCount}/8개)
            </div>
          </div>
        </div>
      </div>

      {/* 레이더 차트 + 종합 진단 총평 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex flex-col justify-between lg:col-span-1 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-bold text-gray-200">8대 지표 위험도 레이더</h3>
              <span className="text-[10px] text-gray-400">정규화 0~100점</span>
            </div>
            <p className="text-[11px] text-gray-400">바깥쪽(100)으로 갈수록 역사적 고점 및 위기 임계선 초과</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={11} tick={{ fill: '#d1d5db' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4b5563" tick={false} />
                <Radar name="위험도 (0-100)" dataKey="score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.35} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(val: number, name: string, props: any) => [`${val}점`, props.payload.fullName]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-gray-800/60 rounded-lg text-xs border border-gray-700/60">
            <div className="font-bold text-gray-200 mb-1">거시 건전성 총평</div>
            <p className="text-gray-400 text-[11px] leading-relaxed">{overall.summary}</p>
          </div>
        </div>

        {/* 8개 세부 지표 카드 그리드 (2x4) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {indicators.map((ind, i) => {
            const color = getRiskColor(ind.riskLevel);

            return (
              <div
                key={i}
                onClick={() => setSelectedIndicator(ind)}
                className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col justify-between hover:border-gray-600 transition-all cursor-pointer group"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-blue-400 tracking-wider">{ind.nameEn.split(' ')[0]}</span>
                    <span
                      className="text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm"
                      style={{ backgroundColor: `${color}25`, color }}
                    >
                      {ind.riskLabel.split(' ')[0]}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-100 mt-1.5 group-hover:text-blue-300 transition-colors">{ind.name}</h4>
                  <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <Landmark size={11} className="text-gray-400" />
                    <span>{ind.institution}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 leading-relaxed line-clamp-2">{ind.description}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-800/80">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] text-gray-400">현재 산출치</span>
                    <span className="text-base font-black" style={{ color }}>
                      {ind.value.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (ind.value / ind.maxValue) * 100)}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>10년 평균: {ind.historical10YrAvg}</span>
                    <span>상위 {ind.historicalPercentile}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 국제 표준 벤치마크 가이드 테이블 */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-100 mb-0.5">국제 표준 부동산 거품 경보 기준표 (Global Benchmarks)</h3>
          <p className="text-xs text-gray-400">각 지표의 임계값을 초과할 경우 거시 건전성 위기 및 부동산 급락 위험이 급증합니다.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-300">
            <thead className="text-gray-400 uppercase bg-gray-800/80 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3">지표명 / 권고 기관</th>
                <th className="px-4 py-3">산출 공식</th>
                <th className="px-4 py-3">안전 (Safe)</th>
                <th className="px-4 py-3">주의 (Caution)</th>
                <th className="px-4 py-3">위험/경고 (Danger)</th>
                <th className="px-4 py-3">현재 산출치</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {indicators.map((ind, idx) => (
                <tr key={idx} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-100">{ind.name}</div>
                    <div className="text-[10px] text-gray-400">{ind.institution}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-[11px]">{ind.formula}</td>
                  <td className="px-4 py-3 text-emerald-400 font-semibold">&le; {ind.threshold.safe}</td>
                  <td className="px-4 py-3 text-yellow-400">{ind.threshold.safe} ~ {ind.threshold.warning}</td>
                  <td className="px-4 py-3 text-red-400 font-bold">&ge; {ind.threshold.danger}</td>
                  <td className="px-4 py-3 font-black text-sm" style={{ color: getRiskColor(ind.riskLevel) }}>
                    {ind.value.toFixed(1)} <span className="text-[10px] font-normal text-gray-400">({ind.riskLabel.split(' ')[0]})</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 지표 상세 설명 모달 */}
      {selectedIndicator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-gray-800 pb-3">
              <div>
                <span className="text-xs text-blue-400 font-bold">{selectedIndicator.institution}</span>
                <h3 className="text-lg font-black text-gray-100 mt-0.5">{selectedIndicator.name}</h3>
                <div className="text-xs text-gray-400">{selectedIndicator.nameEn}</div>
              </div>
              <button
                onClick={() => setSelectedIndicator(null)}
                className="p-1 rounded-lg bg-gray-800 text-gray-400 hover:text-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-800/80 p-3 rounded-lg border border-gray-700 space-y-1">
                <div className="text-[11px] font-bold text-gray-300">지표 산출 공식</div>
                <div className="font-mono text-blue-300">{selectedIndicator.formula}</div>
              </div>

              <div>
                <div className="font-bold text-gray-300 mb-1">지표 개요 및 경제적 의미</div>
                <p className="text-gray-400 leading-relaxed">{selectedIndicator.description}</p>
              </div>

              <div className="p-3 bg-red-950/30 rounded-lg border border-red-900/40 text-red-300 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle size={14} className="text-red-400" />
                  위험 구간 진입 시 거시 파급 충격
                </div>
                <p className="text-gray-300 leading-relaxed">{selectedIndicator.dangerImplication}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedIndicator(null)}
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
