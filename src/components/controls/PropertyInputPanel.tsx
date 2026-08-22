import React from 'react';
import { useSimStore } from '../../store/useSimStore';

const PropertyInputPanel: React.FC = () => {
  const { params, setParams } = useSimStore();

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-bold text-gray-100">가구/주택 정보</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">매매가 (만원)</label>
          <input 
            type="number" 
            value={params.propertyPrice} 
            onChange={(e) => setParams({ propertyPrice: parseInt(e.target.value) || 0 })}
            className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">보유 주택수</label>
          <div className="flex gap-4">
            {[1, 2, 3].map(num => (
              <label key={num} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="homes" 
                  value={num} 
                  checked={params.numberOfHomes === num || (num === 3 && params.numberOfHomes >= 3)}
                  onChange={() => setParams({ numberOfHomes: num })}
                  className="accent-blue-500"
                />
                <span className="text-sm text-gray-200">{num === 3 ? '3주택+' : `${num}주택`}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">가구 연소득 (만원)</label>
          <input 
            type="number" 
            value={params.annualIncome} 
            onChange={(e) => setParams({ annualIncome: parseInt(e.target.value) || 0 })}
            className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-1">소유자 나이 (세)</label>
          <input 
            type="number" 
            value={params.ownerAge} 
            onChange={(e) => setParams({ ownerAge: parseInt(e.target.value) || 0 })}
            className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm text-gray-300">보유 기간 (년)</label>
            <span className="text-sm font-medium text-cyan-400">{params.holdingYears}년</span>
          </div>
          <input 
            type="range" min="0" max="30" step="1" 
            value={params.holdingYears} 
            onChange={(e) => setParams({ holdingYears: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm text-gray-300">거주 기간 (년)</label>
            <span className="text-sm font-medium text-cyan-400">{params.residenceYears}년</span>
          </div>
          <input 
            type="range" min="0" max="30" step="1" 
            value={params.residenceYears} 
            onChange={(e) => setParams({ residenceYears: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
          />
        </div>

        <hr className="border-gray-800" />

        <div>
          <label className="block text-sm text-gray-300 mb-1">대출 원금 (만원)</label>
          <input 
            type="number" 
            value={params.mortgagePrincipal} 
            onChange={(e) => setParams({ mortgagePrincipal: parseInt(e.target.value) || 0 })}
            className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm text-gray-300">대출 기간 (년)</label>
            <span className="text-sm font-medium text-cyan-400">{params.mortgageYears}년</span>
          </div>
          <input 
            type="range" min="5" max="40" step="1" 
            value={params.mortgageYears} 
            onChange={(e) => setParams({ mortgageYears: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyInputPanel;
