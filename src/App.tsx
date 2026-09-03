import React, { useState, useEffect } from 'react';
import { useSimStore } from './store/useSimStore';
import Header from './components/layout/Header';
import TabNavigation from './components/layout/TabNavigation';
import Footer from './components/layout/Footer';
import MacroSliderPanel from './components/controls/MacroSliderPanel';
import PropertyInputPanel from './components/controls/PropertyInputPanel';

import SeoulMapTab from './components/tabs/SeoulMapTab';
import TaxComparisonTab from './components/tabs/TaxComparisonTab';
import BubbleIndexTab from './components/tabs/BubbleIndexTab';
import SimulationTab from './components/tabs/SimulationTab';
import ReportTab from './components/tabs/ReportTab';
import { SlidersHorizontal, X } from 'lucide-react';

export default function App() {
  const { activeTab, params, setParams, selectedDistrict, setSelectedDistrict } = useSimStore();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // 1. URL Query 파라미터 초기 로딩 (공유 링크 복원)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const updates: any = {};

      if (searchParams.has('rate')) updates.baseRate = Number(searchParams.get('rate'));
      if (searchParams.has('fair')) updates.fairValueRatio = Number(searchParams.get('fair'));
      if (searchParams.has('cpt')) updates.cptMultiplier = Number(searchParams.get('cpt'));
      if (searchParams.has('surcharge')) updates.multiHomeSurcharge = searchParams.get('surcharge') === '1';
      if (searchParams.has('dsr')) updates.dsrLimit = Number(searchParams.get('dsr'));
      if (searchParams.has('ltv')) updates.ltvLimit = Number(searchParams.get('ltv'));
      if (searchParams.has('jeonse')) updates.jeonseChange = Number(searchParams.get('jeonse'));
      if (searchParams.has('price')) updates.propertyPrice = Number(searchParams.get('price'));
      if (searchParams.has('homes')) updates.numberOfHomes = Number(searchParams.get('homes'));
      if (searchParams.has('income')) updates.annualIncome = Number(searchParams.get('income'));

      if (Object.keys(updates).length > 0) {
        setParams(updates);
      }

      if (searchParams.has('district')) {
        setSelectedDistrict(searchParams.get('district'));
      }
    } catch (e) {
      console.warn('URL Query 파라미터 파싱 오류:', e);
    }
  }, [setParams, setSelectedDistrict]);

  // 2. 파라미터 변경 시 URL Query 자동 동기화
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('rate', params.baseRate.toString());
      searchParams.set('fair', params.fairValueRatio.toString());
      searchParams.set('cpt', params.cptMultiplier.toString());
      searchParams.set('surcharge', params.multiHomeSurcharge ? '1' : '0');
      searchParams.set('dsr', params.dsrLimit.toString());
      searchParams.set('ltv', params.ltvLimit.toString());
      searchParams.set('jeonse', params.jeonseChange.toString());
      searchParams.set('price', params.propertyPrice.toString());
      searchParams.set('homes', params.numberOfHomes.toString());
      searchParams.set('income', params.annualIncome.toString());
      if (selectedDistrict) searchParams.set('district', selectedDistrict);

      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.replaceState(null, '', newUrl);
    } catch (e) {
      // ignore
    }
  }, [params, selectedDistrict]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col text-gray-200 antialiased selection:bg-blue-600 selection:text-white">
      <Header />
      <TabNavigation />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* 데스크탑 좌측 사이드바 (md 이상) */}
        <aside className="hidden md:flex w-80 bg-gray-900 border-r border-gray-800 overflow-y-auto shrink-0 flex-col print:hidden">
          <MacroSliderPanel />
          <PropertyInputPanel />
        </aside>

        {/* 메인 콘텐츠 뷰 */}
        <main className="flex-1 overflow-y-auto bg-gray-950 pb-16 md:pb-0">
          {activeTab === 'tax' && <TaxComparisonTab />}
          {activeTab === 'map' && <SeoulMapTab />}
          {activeTab === 'simulation' && <SimulationTab />}
          {activeTab === 'bubble' && <BubbleIndexTab />}
          {activeTab === 'report' && <ReportTab />}
        </main>
      </div>

      {/* 모바일 전용 플로팅 조절 버튼 (< md) */}
      <div className="md:hidden fixed bottom-6 right-5 z-40 print:hidden">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-full shadow-2xl font-bold text-xs shadow-blue-600/50 border border-blue-400/40 active:scale-95 transition-all"
        >
          <SlidersHorizontal size={16} />
          <span>파라미터 조절</span>
        </button>
      </div>

      {/* 모바일 전용 슬라이드오버 서랍 (Drawer) */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-gray-900 border-t border-gray-700 rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800 bg-gray-950/80 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-blue-400" />
                <span className="font-extrabold text-sm text-gray-100">시뮬레이션 파라미터 설정</span>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-4">
              <MacroSliderPanel />
              <PropertyInputPanel />
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-950/80">
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-colors"
              >
                설정 완료 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
