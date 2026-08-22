import React, { useMemo, useState } from 'react';
import { useSimStore } from '../../store/useSimStore';
import { seoulDistricts } from '../../data/seoulDistricts';
import {
  forecastDistrict,
  generateTimeSeriesProjection,
  DistrictData as ForecastDistrictData,
  ForecastParams
} from '../../engine/forecastEngine';
import { formatManWon, formatPercent } from '../../utils/formatters';
import { getCrashRiskColor } from '../../utils/colorScale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingDown, ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, Filter } from 'lucide-react';

export default function SimulationTab() {
  const { params, selectedDistrict, setSelectedDistrict } = useSimStore();
  const [regionFilter, setRegionFilter] = useState<string>('all');

  const forecastDistricts: ForecastDistrictData[] = useMemo(() => {
    return seoulDistricts.map(d => ({
      id: d.id,
      name: d.name,
      currentPrice: d.avgSalePrice,
      jeonseRatio: d.jeonseRatio,
      monthsOfSupply: 5.5,
      multiHomeRatio: d.gapInvestmentLevel === 'very_high' ? 0.45 : d.gapInvestmentLevel === 'high' ? 0.35 : d.gapInvestmentLevel === 'medium' ? 0.25 : 0.15,
      averageIncome: 7000
    }));
  }, []);

  const forecastParams: ForecastParams = useMemo(() => {
    return {
      baseRate: params.baseRate,
      jeonseChangeRate: params.jeonseChange / 100,
      dsrLimit: params.dsrLimit,
      ltvLimit: params.ltvLimit,
      taxBurdenChange: (params.cptMultiplier - 1.0) + (params.multiHomeSurcharge ? 0.4 : 0),
      supplyChange: 0
    };
  }, [params]);

  const targetDistrict = useMemo(() => {
    const id = selectedDistrict || 'gangnam';
    return forecastDistricts.find(d => d.id === id) || forecastDistricts[0];
  }, [selectedDistrict, forecastDistricts]);

  const timeSeries = useMemo(() => {
    return generateTimeSeriesProjection(targetDistrict, forecastParams, 12);
  }, [targetDistrict, forecastParams]);

  const allForecasts = useMemo(() => {
    return forecastDistricts.map(d => {
      const orig = seoulDistricts.find(x => x.id === d.id)!;
      const forecast = forecastDistrict(d, forecastParams, 0.6, 55);
      return {
        ...d,
        region: orig.region,
        forecast
      };
    });
  }, [forecastDistricts, forecastParams]);

  const filteredForecasts = useMemo(() => {
    if (regionFilter === 'all') return allForecasts;
    return allForecasts.filter(f => f.region === regionFilter);
  }, [allForecasts, regionFilter]);

  const regions = useMemo(() => {
    const set = new Set(seoulDistricts.map(d => d.region));
    return ['all', ...Array.from(set)];
  }, []);

  return (
    <div className="p-6 space-y-8 text-gray-200 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <TrendingDown className="text-blue-400" />
          시나리오 기반 주택가격 시계열 예측 & 시장 붕괴 시뮬레이션
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          금리·DSR 한도·세제·전세가 변동의 상호작용 피드백 루프를 적용하여 향후 12개 분기(3년) 동안의 매매가 및 전세가 궤적을 예측합니다.
        </p>
      </div>

      {/* 상단: 선택 구의 3개년 시계열 차트 */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              <span>{targetDistrict.name} 향후 3년(12분기) 가격 궤적 예측</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-normal">
                기준금리 {params.baseRate.toFixed(2)}% | 전세변동 {params.jeonseChange > 0 ? '+' : ''}{params.jeonseChange}%
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">아래 목록에서 다른 구를 클릭하면 즉시 해당 구의 예측 차트로 전환됩니다.</p>
          </div>

          <select
            value={targetDistrict.id}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {forecastDistricts.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeries} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="quarter" stroke="#9ca3af" tickFormatter={(q) => `${q}분기`} />
              <YAxis stroke="#9ca3af" tickFormatter={(v) => `${(v / 10000).toFixed(1)}억`} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                formatter={(val: number) => [formatManWon(val), '']}
                labelFormatter={(q) => `경과 기간: ${q}분기`}
              />
              <Legend wrapperStyle={{ color: '#d1d5db' }} />
              <Line type="monotone" dataKey="price" name="매매가 예측 경로" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="jeonse" name="전세가 예측 경로" stroke="#10b981" strokeWidth={2.5} dot={{ r: 2.5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 하단: 25개 자치구 종합 예측 그리드 */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-100">서울 25개 자치구별 예상 변동률 & 매도 압력</h3>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-md p-1.5"
            >
              <option value="all">전체 권역 보기</option>
              {regions.filter(r => r !== 'all').map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredForecasts.map(d => {
            const isSelected = targetDistrict.id === d.id;
            const changeRate = d.forecast.priceChangeRate;
            const isCrash = d.forecast.riskDirection === 'crash';
            const isDown = d.forecast.riskDirection === 'down';
            const isUp = d.forecast.riskDirection === 'up';

            return (
              <div
                key={d.id}
                onClick={() => setSelectedDistrict(d.id)}
                className={`bg-gray-800/80 p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/40 bg-gray-800'
                    : 'border-gray-700/80 hover:border-gray-600 hover:bg-gray-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-gray-400 font-medium">{d.region}</span>
                    <h4 className="font-bold text-gray-100 text-base">{d.name}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-0.5 ${
                      isCrash
                        ? 'bg-red-500/20 text-red-400'
                        : isDown
                        ? 'bg-orange-500/20 text-orange-400'
                        : isUp
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {isCrash ? <AlertTriangle size={12} /> : isDown ? <ArrowDownRight size={12} /> : isUp ? <ArrowUpRight size={12} /> : <Minus size={12} />}
                    {d.forecast.riskLabel}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>현재 매매 시세</span>
                    <span className="text-gray-200 font-semibold">{formatManWon(d.currentPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">예상 매매가 변동률</span>
                    <span className={`font-bold ${changeRate < 0 ? 'text-red-400' : changeRate > 0 ? 'text-blue-400' : 'text-gray-300'}`}>
                      {changeRate > 0 ? '+' : ''}{changeRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>다주택 매도 압력</span>
                    <span className="text-orange-400 font-semibold">{Math.round(d.forecast.sellPressure)}점</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>실수요 매수 여력</span>
                    <span className="text-emerald-400 font-semibold">{Math.round(d.forecast.buyingPower)}점</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
