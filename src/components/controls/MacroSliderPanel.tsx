import React from 'react';
import { useSimStore } from '../../store/useSimStore';

const MacroSliderPanel: React.FC = () => {
  const { params, setParams } = useSimStore();

  return (
    <div className="p-4 border-b border-gray-800 space-y-6">
      <h2 className="text-lg font-bold text-gray-100">거시/정책 변수</h2>
      
      {/* 거시 경제 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">거시 경제</h3>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm text-gray-300">기준금리 (%)</label>
            <span className="text-sm font-medium text-cyan-400">{params.baseRate.toFixed(2)}%</span>
          </div>
          <input 
            type="range" min="1.0" max="6.0" step="0.25" 
            value={params.baseRate} 
            onChange={(e) => setParams({ baseRate: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
          />
        </div>
      </div>

      {/* 보유세 정책 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">보유세 정책</h3>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm text-gray-300">공정시장가액비율</label>
            <span className="text-sm font-medium text-cyan-400">{Math.round(params.fairValueRatio * 100)}%</span>
          </div>
          <input 
            type="range" min="0.4" max="1.0" step="0.05" 
            value={params.fairValueRatio} 
            onChange={(e) => setParams({ fairValueRatio: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
          />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm text-gray-300">종부세 세율 배율</label>
            <span className="text-sm font-medium text-cyan-400">{params.cptMultiplier.toFixed(1)}x</span>
          </div>
          <input 
            type="range" min="0.5" max="2.0" step="0.1" 
            value={params.cptMultiplier} 
            onChange={(e) => setParams({ cptMultiplier: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-300">다주택 중과</label>
          <div 
            className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${params.multiHomeSurcharge ? 'bg-blue-600' : 'bg-gray-700'}`}
            onClick={() => setParams({ multiHomeSurcharge: !params.multiHomeSurcharge })}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${params.multiHomeSurcharge ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </div>
        </div>
      </div>

      {/* 대출 규제 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">대출 규제</h3>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm text-gray-300">LTV 상한</label>
            <span className="text-sm font-medium text-cyan-400">{Math.round(params.ltvLimit * 100)}%</span>
          </div>
          <input 
            type="range" min="0.1" max="0.9" step="0.05" 
            value={params.ltvLimit} 
            onChange={(e) => setParams({ ltvLimit: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
          />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm text-gray-300">DSR 상한</label>
            <span className="text-sm font-medium text-cyan-400">{Math.round(params.dsrLimit * 100)}%</span>
          </div>
          <input 
            type="range" min="0.2" max="0.6" step="0.05" 
            value={params.dsrLimit} 
            onChange={(e) => setParams({ dsrLimit: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
          />
        </div>
      </div>

      {/* 전세 시장 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">전세 시장</h3>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm text-gray-300">전세가 증감률 (%)</label>
            <span className="text-sm font-medium text-cyan-400">{params.jeonseChange > 0 ? '+' : ''}{params.jeonseChange}%</span>
          </div>
          <input 
            type="range" min="-30" max="30" step="1" 
            value={params.jeonseChange} 
            onChange={(e) => setParams({ jeonseChange: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
          />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm text-gray-300">전월세전환율 (%)</label>
            <span className="text-sm font-medium text-cyan-400">{params.conversionRate.toFixed(1)}%</span>
          </div>
          <input 
            type="range" min="2.0" max="10.0" step="0.1" 
            value={params.conversionRate} 
            onChange={(e) => setParams({ conversionRate: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
          />
        </div>
      </div>
    </div>
  );
};

export default MacroSliderPanel;
