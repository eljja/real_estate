import React from 'react';
import { Calculator, Map as MapIcon, TrendingDown, AlertTriangle } from 'lucide-react';
import { useSimStore, TabId } from '../../store/useSimStore';

const tabs: { id: TabId; label: string; icon: React.FC<any> }[] = [
  { id: 'tax', label: '세부담 비교', icon: Calculator },
  { id: 'map', label: '붕괴위험 지도', icon: MapIcon },
  { id: 'simulation', label: '시장 시뮬레이션', icon: TrendingDown },
  { id: 'bubble', label: '버블 지표', icon: AlertTriangle },
];

const TabNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useSimStore();

  return (
    <div className="flex border-b border-gray-800">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              isActive 
                ? 'border-b-2 border-blue-500 text-blue-400' 
                : 'text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            <Icon size={18} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
