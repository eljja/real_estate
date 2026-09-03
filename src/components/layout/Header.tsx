import React, { useState } from 'react';
import { useSimStore } from '../../store/useSimStore';
import { scenarioPresets } from '../../data/scenarioPresets';
import { Building2, RotateCcw, Printer, Sparkles, Percent, ShieldAlert, Share2, Check } from 'lucide-react';

export default function Header() {
  const { selectedScenario, setSelectedScenario, setParams, resetParams, params, setActiveTab } = useSimStore();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scenarioId = e.target.value;
    setSelectedScenario(scenarioId);

    if (scenarioId === 'custom') return;

    const preset = scenarioPresets.find(p => p.id === scenarioId);
    if (preset) {
      setParams(preset.params);
    }
  };

  const currentPreset = scenarioPresets.find(p => p.id === selectedScenario);

  return (
    <header className="bg-gray-950 border-b border-gray-800/80 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* 로고 및 서비스 타이틀 */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Building2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-white tracking-tight">부동산 시뮬레이터</h1>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                2026 PRO
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">서울 25개 구 스트레스 테스트 &amp; 시장 예측 분석기</p>
          </div>
        </div>

        {/* 거시 경제 라이브 뱃지 바 */}
        <div className="hidden lg:flex items-center gap-3 bg-gray-900/80 px-3 py-1.5 rounded-lg border border-gray-800 text-xs">
          <div className="flex items-center gap-1.5 text-gray-300">
            <Percent size={13} className="text-blue-400" />
            <span className="text-gray-400">기준금리:</span>
            <span className="font-bold text-gray-100">{params.baseRate.toFixed(2)}%</span>
          </div>
          <div className="w-px h-3.5 bg-gray-800" />
          <div className="flex items-center gap-1.5 text-gray-300">
            <span className="text-gray-400">대출 실효금리:</span>
            <span className="font-bold text-purple-400">{(params.baseRate + 1.5).toFixed(2)}%</span>
          </div>
          <div className="w-px h-3.5 bg-gray-800" />
          <div className="flex items-center gap-1.5 text-gray-300">
            <ShieldAlert size={13} className="text-orange-400" />
            <span className="text-gray-400">DSR 상한:</span>
            <span className="font-bold text-orange-400">{(params.dsrLimit * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* 우측 컨트롤: 시나리오 프리셋 & 빠른 실행 */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-gray-900 rounded-lg p-1 border border-gray-800">
            <Sparkles size={14} className="text-amber-400 ml-1.5" />
            <select
              value={selectedScenario}
              onChange={handleScenarioChange}
              className="bg-transparent text-gray-200 text-xs font-semibold rounded focus:outline-none focus:ring-0 cursor-pointer pr-1 py-1"
            >
              <option value="custom" className="bg-gray-900 text-gray-200">사용자 직접 설정</option>
              {scenarioPresets.map(preset => (
                <option key={preset.id} value={preset.id} className="bg-gray-900 text-gray-200">
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setActiveTab('report')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
            title="종합 진단 보고서 보기"
          >
            <Printer size={13} />
            <span className="hidden sm:inline">진단 리포트</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-xs font-semibold transition-all"
            title="현재 시뮬레이션 설정 링크 복사"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} className="text-blue-400" />}
            <span className="hidden sm:inline">{copied ? '복사완료!' : '공유'}</span>
          </button>

          <button
            onClick={resetParams}
            className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
            title="모든 파라미터 기본값 초기화"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {currentPreset && selectedScenario !== 'custom' && (
        <div className="bg-blue-950/40 border-t border-blue-900/30 px-4 py-1 text-center text-[11px] text-blue-300">
          <span className="font-semibold text-blue-200">[{currentPreset.name}]</span> {currentPreset.description}
        </div>
      )}
    </header>
  );
}
