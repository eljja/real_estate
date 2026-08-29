import React from 'react';
import { useSimStore, TabId } from '../../store/useSimStore';
import { Calculator, Map, TrendingDown, AlertTriangle, FileText } from 'lucide-react';

interface TabItem {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

export default function TabNavigation() {
  const { activeTab, setActiveTab } = useSimStore();

  const tabs: TabItem[] = [
    { id: 'tax', label: '세부담 & 현금흐름 분석', shortLabel: '세부담 비교', icon: Calculator },
    { id: 'map', label: '서울 25개 구 붕괴위험도', shortLabel: '위험도 지도', icon: Map, badge: 'CRS 2.0' },
    { id: 'simulation', label: '3개년 시계열 가격 예측', shortLabel: '가격 예측', icon: TrendingDown, badge: '12Q' },
    { id: 'bubble', label: '글로벌 8대 버블 조기경보', shortLabel: '버블 지표', icon: AlertTriangle },
    { id: 'report', label: '종합 스트레스 진단 보고서', shortLabel: '진단 보고서', icon: FileText, badge: 'A4' }
  ];

  return (
    <nav className="bg-gray-900/90 border-b border-gray-800 px-4">
      <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 border border-transparent'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-blue-400' : 'text-gray-400'} />
              <span className="hidden md:inline">{tab.label}</span>
              <span className="md:hidden">{tab.shortLabel}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    isActive ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
