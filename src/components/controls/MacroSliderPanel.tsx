import React from 'react';
import { useSimStore } from '../../store/useSimStore';
import { formatPercent } from '../../utils/formatters';
import { TrendingDown, Landmark, ShieldCheck, KeyRound, HelpCircle } from 'lucide-react';

const MacroSliderPanel: React.FC = () => {
  const { params, setParams } = useSimStore();

  return (
    <div className="p-4 border-b border-gray-800 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-200 flex items-center gap-1.5">
          <Landmark size={16} className="text-blue-400" />
          거시 경제 &amp; 조세 정책 변수
        </h2>
        <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded">실시간 반영</span>
      </div>

      {/* 1. 거시 금융 & 금리 */}
      <div className="bg-gray-900/90 rounded-lg p-3 border border-gray-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
          <span className="flex items-center gap-1.5 text-blue-400">
            <TrendingDown size={14} /> 한국은행 기준금리
          </span>
          <span className="font-bold text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
            {params.baseRate.toFixed(2)}%
          </span>
        </div>
        <input
          type="range"
          min="1.0"
          max="6.0"
          step="0.25"
          value={params.baseRate}
          onChange={(e) => setParams({ baseRate: parseFloat(e.target.value) })}
          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>1.0% (초저금리)</span>
          <span>3.0% (현행)</span>
          <span>6.0% (고금리 충격)</span>
        </div>
        <div className="text-[11px] text-gray-400 bg-gray-800/50 p-2 rounded flex justify-between">
          <span>시중 주담대 실효금리:</span>
          <span className="font-bold text-purple-300">{(params.baseRate + 1.5).toFixed(2)}%</span>
        </div>
      </div>

      {/* 2. 보유세 정책 (공정시장가액 & 종부세율) */}
      <div className="bg-gray-900/90 rounded-lg p-3 border border-gray-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
          <span className="text-orange-400">보유세 공정시장가액비율</span>
          <span className="font-bold text-orange-300 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-800/40">
            {Math.round(params.fairValueRatio * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.4"
          max="1.0"
          step="0.05"
          value={params.fairValueRatio}
          onChange={(e) => setParams({ fairValueRatio: parseFloat(e.target.value) })}
          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>40% (대폭 인하)</span>
          <span>60% (2026 현행)</span>
          <span>100% (법정 최대)</span>
        </div>

        <div className="pt-2 border-t border-gray-800 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-gray-300">
            <span>종부세 누진세율 배율</span>
            <span className="font-bold text-orange-400">{params.cptMultiplier.toFixed(1)}배</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={params.cptMultiplier}
            onChange={(e) => setParams({ cptMultiplier: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>

        <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-300 font-medium">다주택자 중과세율 적용</span>
          <button
            type="button"
            onClick={() => setParams({ multiHomeSurcharge: !params.multiHomeSurcharge })}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
              params.multiHomeSurcharge
                ? 'bg-red-600 text-white shadow-sm shadow-red-500/30'
                : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}
          >
            {params.multiHomeSurcharge ? '중과 ON (최대 5%)' : '중과 유예 OFF'}
          </button>
        </div>
      </div>

      {/* 3. 대출 규제 (LTV & DSR) */}
      <div className="bg-gray-900/90 rounded-lg p-3 border border-gray-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck size={14} /> DSR 상한 (스트레스 DSR)
          </span>
          <span className="font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            {Math.round(params.dsrLimit * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.2"
          max="0.6"
          step="0.05"
          value={params.dsrLimit}
          onChange={(e) => setParams({ dsrLimit: parseFloat(e.target.value) })}
          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>20% (초강력 규제)</span>
          <span>40% (현행 1금융)</span>
          <span>60% (완화)</span>
        </div>

        <div className="pt-2 border-t border-gray-800 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-gray-300">
            <span>LTV 상한 비율</span>
            <span className="font-bold text-emerald-400">{Math.round(params.ltvLimit * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={params.ltvLimit}
            onChange={(e) => setParams({ ltvLimit: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      {/* 4. 전세 시장 변동률 */}
      <div className="bg-gray-900/90 rounded-lg p-3 border border-gray-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
          <span className="flex items-center gap-1 text-cyan-400">
            <KeyRound size={14} /> 전세가 충격 변동률
          </span>
          <span
            className={`font-bold px-2 py-0.5 rounded text-xs ${
              params.jeonseChange < 0
                ? 'bg-red-950/80 text-red-400 border border-red-800/40'
                : params.jeonseChange > 0
                ? 'bg-blue-950/80 text-blue-400 border border-blue-800/40'
                : 'bg-gray-800 text-gray-300'
            }`}
          >
            {params.jeonseChange > 0 ? `+${params.jeonseChange}% (상승)` : params.jeonseChange < 0 ? `${params.jeonseChange}% (역전세)` : '0% (변동 없음)'}
          </span>
        </div>
        <input
          type="range"
          min="-30"
          max="30"
          step="1"
          value={params.jeonseChange}
          onChange={(e) => setParams({ jeonseChange: parseFloat(e.target.value) })}
          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>-30% (역전세 패닉)</span>
          <span>0%</span>
          <span>+30% (전세 품귀)</span>
        </div>

        <div className="pt-2 border-t border-gray-800 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-gray-300">
            <span>전월세 전환율</span>
            <span className="font-bold text-cyan-400">{params.conversionRate.toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min="2.0"
            max="9.0"
            step="0.1"
            value={params.conversionRate}
            onChange={(e) => setParams({ conversionRate: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
      </div>
    </div>
  );
};

export default MacroSliderPanel;
