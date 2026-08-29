import React from 'react';
import { useSimStore } from '../../store/useSimStore';
import { seoulDistricts } from '../../data/seoulDistricts';
import { formatManWon } from '../../utils/formatters';
import { Home, User, DollarSign, CreditCard, Building } from 'lucide-react';

const PropertyInputPanel: React.FC = () => {
  const { params, setParams, selectedDistrict, setSelectedDistrict } = useSimStore();

  const handleDistrictSelect = (districtId: string) => {
    setSelectedDistrict(districtId);
    const dist = seoulDistricts.find(d => d.id === districtId);
    if (dist) {
      setParams({
        propertyPrice: dist.avgSalePrice,
        mortgagePrincipal: Math.round(dist.avgSalePrice * 0.4),
        annualIncome: dist.avgHouseholdIncome
      });
    }
  };

  const ltvCalculated = params.propertyPrice > 0 ? (params.mortgagePrincipal / params.propertyPrice) * 100 : 0;

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-200 flex items-center gap-1.5">
          <Home size={16} className="text-purple-400" />
          가구 및 보유주택 상세 설정
        </h2>
        <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded">시뮬레이션 대상</span>
      </div>

      {/* 서울 자치구 실거래가 빠른 적용 드롭다운 */}
      <div className="bg-gray-900/90 rounded-lg p-3 border border-gray-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
          <span className="flex items-center gap-1 text-purple-400">
            <Building size={13} /> 자치구 시세 불러오기
          </span>
        </div>
        <select
          value={selectedDistrict || ''}
          onChange={(e) => handleDistrictSelect(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-md p-2 focus:border-purple-500 focus:outline-none cursor-pointer"
        >
          {seoulDistricts.map(d => (
            <option key={d.id} value={d.id}>
              {d.name} ({formatManWon(d.avgSalePrice)} / {d.region})
            </option>
          ))}
        </select>
        <p className="text-[10px] text-gray-400">선택 시 해당 구의 평균 매매가, 추천 대출금, 평균 연소득이 자동 세팅됩니다.</p>
      </div>

      {/* 1. 매매가 및 보유 주택수 */}
      <div className="bg-gray-900/90 rounded-lg p-3 border border-gray-800 space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-gray-300 font-semibold">1채당 매매가</label>
            <span className="text-xs font-bold text-blue-400">{formatManWon(params.propertyPrice)}</span>
          </div>
          <input
            type="number"
            step="1000"
            value={params.propertyPrice}
            onChange={(e) => setParams({ propertyPrice: parseInt(e.target.value) || 0 })}
            className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-gray-100 font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>공시가격 추정(69%): {formatManWon(params.propertyPrice * 0.69)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-300 font-semibold mb-2">보유 주택 수</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: 1, label: '1주택 (실거주)' },
              { num: 2, label: '2주택 (일반)' },
              { num: 3, label: '3주택+ (다주택)' }
            ].map(item => (
              <button
                key={item.num}
                type="button"
                onClick={() => setParams({ numberOfHomes: item.num })}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                  params.numberOfHomes === item.num
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-sm'
                    : 'bg-gray-800/80 border-gray-700 text-gray-400 hover:text-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. 가구 소득 & 인적 정보 */}
      <div className="bg-gray-900/90 rounded-lg p-3 border border-gray-800 space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-gray-300 font-semibold flex items-center gap-1">
              <DollarSign size={13} className="text-emerald-400" /> 가구 연소득 (세전)
            </label>
            <span className="text-xs font-bold text-emerald-400">{formatManWon(params.annualIncome)}</span>
          </div>
          <input
            type="number"
            step="500"
            value={params.annualIncome}
            onChange={(e) => setParams({ annualIncome: parseInt(e.target.value) || 0 })}
            className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-gray-100 font-semibold focus:border-emerald-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <label className="text-gray-400 block text-[11px] mb-1">소유자 나이</label>
            <input
              type="number"
              value={params.ownerAge}
              onChange={(e) => setParams({ ownerAge: parseInt(e.target.value) || 0 })}
              className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-center text-gray-200"
            />
          </div>
          <div>
            <label className="text-gray-400 block text-[11px] mb-1">보유 기간</label>
            <input
              type="number"
              value={params.holdingYears}
              onChange={(e) => setParams({ holdingYears: parseInt(e.target.value) || 0 })}
              className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-center text-gray-200"
            />
          </div>
          <div>
            <label className="text-gray-400 block text-[11px] mb-1">거주 기간</label>
            <input
              type="number"
              value={params.residenceYears}
              onChange={(e) => setParams({ residenceYears: parseInt(e.target.value) || 0 })}
              className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-center text-gray-200"
            />
          </div>
        </div>
      </div>

      {/* 3. 대출 원금 & 기간 */}
      <div className="bg-gray-900/90 rounded-lg p-3 border border-gray-800 space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-gray-300 font-semibold flex items-center gap-1">
              <CreditCard size={13} className="text-purple-400" /> 주택담보대출 잔액
            </label>
            <span className="text-xs font-bold text-purple-400">{formatManWon(params.mortgagePrincipal)}</span>
          </div>
          <input
            type="number"
            step="1000"
            value={params.mortgagePrincipal}
            onChange={(e) => setParams({ mortgagePrincipal: parseInt(e.target.value) || 0 })}
            className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-gray-100 font-semibold focus:border-purple-500 outline-none"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>실질 LTV: {ltvCalculated.toFixed(1)}%</span>
            <span className={ltvCalculated > 70 ? 'text-red-400 font-bold' : 'text-gray-400'}>
              {ltvCalculated > 70 ? '규제 상한 초과' : '규제 범위 내'}
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs text-gray-300">대출 만기 기간</label>
            <span className="text-xs font-semibold text-purple-300">{params.mortgageYears}년 상환</span>
          </div>
          <input
            type="range"
            min="5"
            max="40"
            step="5"
            value={params.mortgageYears}
            onChange={(e) => setParams({ mortgageYears: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyInputPanel;
