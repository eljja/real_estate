import React from 'react';
import { useSimStore } from '../../store/useSimStore';
import { scenarioPresets } from '../../data/scenarioPresets';
import { BarChart2, Settings } from 'lucide-react';

export default function Header() {
  const { selectedScenario, setSelectedScenario, setParams } = useSimStore();

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scenarioId = e.target.value;
    setSelectedScenario(scenarioId);
    
    if (scenarioId === 'custom') return;
    
    const preset = scenarioPresets.find(p => p.id === scenarioId);
    if (preset) {
      setParams(preset.params);
    }
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 p-4">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-blue-500">
          <BarChart2 className="w-6 h-6" />
          <h1 className="text-xl font-bold text-gray-100">부동산 시뮬레이터</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">시나리오</span>
            <select 
              value={selectedScenario} 
              onChange={handleScenarioChange}
              className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-48 p-2"
            >
              <option value="custom">사용자 정의</option>
              {scenarioPresets.map(preset => (
                <option key={preset.id} value={preset.id}>{preset.name}</option>
              ))}
            </select>
          </div>
          
          <button className="p-2 text-gray-400 hover:text-gray-200 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
