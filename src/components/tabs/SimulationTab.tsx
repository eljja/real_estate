import React, { useMemo, useState } from 'react';
import { useSimStore, RegionFilter } from '../../store/useSimStore';
import { seoulDistricts } from '../../data/seoulDistricts';
import {
  forecastDistrict,
  generateTimeSeriesProjection,
  DistrictForecast
} from '../../engine/forecastEngine';
import { formatManWon, formatManWonCompact } from '../../utils/formatters';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertTriangle,
  Flame,
  Search,
  Sparkles
} from 'lucide-react';

export default function SimulationTab() {
  const { params, selectedDistrict, setSelectedDistrict, regionFilter, setRegionFilter } = useSimStore();
  const [searchQuery, setSearchQuery] = useState('');

  const targetDistrict = useMemo(() => {
    const id = selectedDistrict || 'gangnam';
    return seoulDistricts.find(d => d.id === id) || seoulDistricts[0];
  }, [selectedDistrict]);

  const forecastParams = useMemo(() => {
    return {
      baseRate: params.baseRate,
      jeonseChangeRate: params.jeonseChange / 100,
      dsrLimit: params.dsrLimit,
      ltvLimit: params.ltvLimit,
      taxBurdenChange: (params.cptMultiplier - 1.0) + (params.multiHomeSurcharge ? 0.4 : 0),
      supplyChange: 0
    };
  }, [params]);

  const timeSeries = useMemo(() => {
    return generateTimeSeriesProjection(targetDistrict, forecastParams, 12);
  }, [targetDistrict, forecastParams]);

  const allForecasts = useMemo(() => {
    return seoulDistricts.map(d => {
      const forecast = forecastDistrict(d, forecastParams, 0.65, 60);
      return {
        ...d,
        forecast
      };
    });
  }, [forecastParams]);

  const filteredForecasts = useMemo(() => {
    return allForecasts.filter(d => {
      const matchRegion = regionFilter === 'all' || d.region.includes(regionFilter);
      const matchSearch = d.name.includes(searchQuery) || d.region.includes(searchQuery);
      return matchRegion && matchSearch;
    });
  }, [allForecasts, regionFilter, searchQuery]);

  const currentForecast = useMemo(() => {
    return forecastDistrict(targetDistrict, forecastParams, 0.65, 60);
  }, [targetDistrict, forecastParams]);

  return (
    <div className="p-6 space-y-8 text-gray-200 max-w-7xl mx-auto">
      {/* 탭 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <TrendingDown className="text-blue-400" />
              시나리오 기반 3개년(12분기) 주택가격 궤적 &amp; 붕괴 시뮬레이션
            </h2>
            <span className="bg-blue-950/80 text-blue-400 border border-blue-800/40 text-[11px] font-bold px-2 py-0.5 rounded-full">
              Bull/Bear 신뢰구간 모델
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            금리 &middot; DSR 규제 &middot; 보유세 &middot; 전세가 변동의 다변량 상호작용 피드백 루프를 적용하여 분기별 매매&middot;전세가 경로를 예측합니다.
          </p>
        </div>

        {/* 자치구 선택 셀렉터 */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-gray-900 p-1 rounded-lg border border-gray-800">
          <span className="text-xs text-gray-400 ml-2">분석 대상:</span>
          <select
            value={targetDistrict.id}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-100 text-xs font-bold rounded-md px-3 py-1.5 focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            {seoulDistricts.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({formatManWon(d.avgSalePrice)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 상단: 12분기 시계열 밴드 차트 & 핵심 요약 지표 */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-gray-100">{targetDistrict.name} 향후 3개년 시계열 궤적</h3>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                currentForecast.riskDirection === 'crash'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : currentForecast.riskDirection === 'down'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                  : currentForecast.riskDirection === 'up'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  : 'bg-gray-700 text-gray-200'
              }`}>
                {currentForecast.riskLabel}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{currentForecast.riskSummary}</p>
          </div>

          {/* 3개 핵심 예측 수치 칩 */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-gray-800/80 p-2.5 rounded-lg border border-gray-700 text-center">
              <div className="text-[11px] text-gray-400">현재 시세</div>
              <div className="text-sm font-bold text-gray-100">{formatManWon(targetDistrict.avgSalePrice)}</div>
            </div>
            <div className="bg-gray-800/80 p-2.5 rounded-lg border border-gray-700 text-center">
              <div className="text-[11px] text-gray-400">1년 후 예상</div>
              <div className={`text-sm font-extrabold ${currentForecast.priceChangeRate1Year < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                {formatManWon(currentForecast.predicted1YearPrice)}
                <span className="text-[10px] ml-1">({currentForecast.priceChangeRate1Year > 0 ? '+' : ''}{currentForecast.priceChangeRate1Year}%)</span>
              </div>
            </div>
            <div className="bg-gray-800/80 p-2.5 rounded-lg border border-gray-700 text-center">
              <div className="text-[11px] text-gray-400">3년 후 누적</div>
              <div className={`text-sm font-black ${currentForecast.priceChangeRate3Year < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                {formatManWon(currentForecast.predicted3YearPrice)}
                <span className="text-[10px] ml-1">({currentForecast.priceChangeRate3Year > 0 ? '+' : ''}{currentForecast.priceChangeRate3Year}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recharts Area/Line Chart */}
        <div className="h-88 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeries} margin={{ top: 15, right: 30, left: 15, bottom: 5 }}>
              <defs>
                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="quarterLabel" stroke="#9ca3af" tick={{ fill: '#d1d5db', fontSize: 12 }} />
              <YAxis
                stroke="#9ca3af"
                domain={['auto', 'auto']}
                tickFormatter={(v) => formatManWonCompact(v)}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl text-xs space-y-1.5">
                        <div className="font-bold text-gray-100 border-b border-gray-800 pb-1">
                          경과 시점: {label}
                        </div>
                        <div className="flex justify-between gap-4 text-blue-400 font-bold">
                          <span>• 기준 예측 매매가</span>
                          <span>{formatManWon(data.basePrice)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-emerald-400">
                          <span>• 예상 전세가</span>
                          <span>{formatManWon(data.jeonsePrice)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-gray-400 text-[11px] pt-1 border-t border-gray-800">
                          <span>예측 신뢰구간</span>
                          <span>{formatManWon(data.bearPrice)} ~ {formatManWon(data.bullPrice)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ color: '#d1d5db', fontSize: '11px', paddingTop: '10px' }} />
              
              {/* Bull/Bear 신뢰구간 영역 */}
              <Area type="monotone" dataKey="bullPrice" stroke="#60a5fa" strokeDasharray="4 4" fillOpacity={1} fill="url(#bandGrad)" name="낙관 상한선 (Bull)" />
              <Area type="monotone" dataKey="bearPrice" stroke="#f87171" strokeDasharray="4 4" fillOpacity={0} name="비관 하한선 (Bear)" />

              {/* 기준 매매가 및 전세가 실선 */}
              <Line type="monotone" dataKey="basePrice" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#1d4ed8' }} name="기준 예측 매매가" />
              <Line type="monotone" dataKey="jeonsePrice" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#047857' }} name="예상 전세가" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3 bg-gray-800/40 rounded-lg text-xs text-gray-400 flex flex-wrap items-center justify-between gap-2 border border-gray-800">
          <span>💡 <strong>음영 밴드</strong>: 거시 충격에 따른 상/하방 불확실성 신뢰구간 | <strong>파란 실선</strong>: 복합 피드백 기준 궤적</span>
          <span>다주택 매도 압력: <strong className="text-orange-400">{currentForecast.sellPressure}점</strong></span>
        </div>
      </div>

      {/* 하단: 25개 구 전체 예측 매트릭스 그리드 */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-100">서울 25개 자치구별 3개년 시나리오 예측 매트릭스</h3>
            <p className="text-xs text-gray-400 mt-0.5">구를 클릭하면 상단 시계열 궤적 차트가 즉시 전환됩니다.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="구 이름 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500 w-36"
              />
            </div>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value as RegionFilter)}
              className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg p-1.5 cursor-pointer"
            >
              <option value="all">전체 권역</option>
              <option value="동남권">동남권</option>
              <option value="도심">도심/한강</option>
              <option value="서남권">서남권</option>
              <option value="동북권">동북권</option>
              <option value="서북권">서북권</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredForecasts.map(d => {
            const isSelected = targetDistrict.id === d.id;
            const change3Y = d.forecast.priceChangeRate3Year;
            const isCrash = d.forecast.riskDirection === 'crash';
            const isDown = d.forecast.riskDirection === 'down';
            const isUp = d.forecast.riskDirection === 'up';

            return (
              <div
                key={d.id}
                onClick={() => setSelectedDistrict(d.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/40 bg-blue-950/20'
                    : 'bg-gray-800/70 border-gray-700/70 hover:border-gray-600 hover:bg-gray-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-gray-400 font-medium">{d.region.split(' ')[0]}</span>
                    <h4 className="font-extrabold text-gray-100 text-base">{d.name}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-0.5 ${
                      isCrash
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : isDown
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : isUp
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {isCrash ? <AlertTriangle size={12} /> : isDown ? <ArrowDownRight size={12} /> : isUp ? <ArrowUpRight size={12} /> : <Minus size={12} />}
                    {d.forecast.riskLabel}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>현재가 &rarr; 3년 후</span>
                    <span className="text-gray-200 font-semibold">{formatManWon(d.forecast.predicted3YearPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">3년 누적 변동률</span>
                    <span className={`font-black ${change3Y < 0 ? 'text-red-400' : change3Y > 0 ? 'text-blue-400' : 'text-gray-300'}`}>
                      {change3Y > 0 ? '+' : ''}{change3Y.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400 pt-1 border-t border-gray-700/60">
                    <span>매도 압력 / 매수 여력</span>
                    <span className="text-gray-300 font-medium">
                      <span className="text-orange-400">{d.forecast.sellPressure}</span> / <span className="text-emerald-400">{d.forecast.buyingPower}</span>
                    </span>
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
