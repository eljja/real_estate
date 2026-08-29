import React from 'react';
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

export default function App() {
  const { activeTab } = useSimStore();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col text-gray-200 antialiased selection:bg-blue-600 selection:text-white">
      <Header />
      <TabNavigation />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar (Controls) - Hidden during print */}
        <div className="w-full md:w-84 bg-gray-900 border-r border-gray-800 overflow-y-auto shrink-0 flex flex-col max-h-[45vh] md:max-h-none print:hidden">
          <MacroSliderPanel />
          <PropertyInputPanel />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          {activeTab === 'tax' && <TaxComparisonTab />}
          {activeTab === 'map' && <SeoulMapTab />}
          {activeTab === 'simulation' && <SimulationTab />}
          {activeTab === 'bubble' && <BubbleIndexTab />}
          {activeTab === 'report' && <ReportTab />}
        </main>
      </div>

      <Footer />
    </div>
  );
}
