import React, { useMemo } from 'react';
import { useSimStore } from '../../store/useSimStore';
import { seoulDistricts } from '../../data/seoulDistricts';
import { calculateAnnualHoldingTax } from '../../engine/taxEngine';
import { calculateHSI, calculateMortgagePayment, calculateCrashRiskScore, getHsiLevel, getCrsLevel } from '../../engine/stressEngine';
import { forecastDistrict } from '../../engine/forecastEngine';
import { calculateAllIndicators, getOverallBubbleRisk } from '../../engine/bubbleIndicators';
import { formatManWon, formatPercent } from '../../utils/formatters';
import { getCrashRiskColor, getHsiColor } from '../../utils/colorScale';
import {
  Printer,
  FileText,
  Building,
  CheckCircle2,
  AlertTriangle,
  Flame,
  TrendingDown,
  ShieldAlert,
  Percent,
  Landmark
} from 'lucide-react';

export default function ReportTab() {
  const { params, selectedDistrict } = useSimStore();

  const activeDistrict = useMemo(() => {
    const id = selectedDistrict || 'gangnam';
    return seoulDistricts.find(d => d.id === id) || seoulDistricts[0];
  }, [selectedDistrict]);

  // 1. 보유세 및 HSI 계산 (1주택 vs 2주택 vs 3주택)
  const taxSummary = useMemo(() => {
    const offPrice = params.propertyPrice * 0.69;
    const mortgage = calculateMortgagePayment(params.mortgagePrincipal, params.baseRate + 1.5, params.mortgageYears);

    const t1 = calculateAnnualHoldingTax(offPrice, offPrice, 1, params.ownerAge, params.holdingYears, params);
    const t2 = calculateAnnualHoldingTax(offPrice, offPrice * 2, 2, params.ownerAge, params.holdingYears, params);
    const t3 = calculateAnnualHoldingTax(offPrice, offPrice * 3, 3, params.ownerAge, params.holdingYears, params);

    const rentIncomePer = params.propertyPrice * 0.5 * (params.conversionRate / 100);

    const hsi1 = calculateHSI(t1.totalAnnual, mortgage, 0, params.annualIncome);
    const hsi2 = calculateHSI(t2.totalAnnual, mortgage, Math.round(rentIncomePer), params.annualIncome);
    const hsi3 = calculateHSI(t3.totalAnnual, mortgage, Math.round(rentIncomePer * 2), params.annualIncome);

    return { t1, t2, t3, hsi1, hsi2, hsi3, mortgage };
  }, [params]);

  // 2. 25개 구 CRS 산출 및 랭킹
  const districtRisks = useMemo(() => {
    return seoulDistricts.map(d => {
      const off = d.avgSalePrice * 0.69;
      const tax = calculateAnnualHoldingTax(off, off * 3, 3, params.ownerAge, params.holdingYears, params);
      const mort = calculateMortgagePayment(params.mortgagePrincipal, params.baseRate + 1.5, params.mortgageYears);
      const hsi = calculateHSI(tax.totalAnnual, mort, d.monthlyRent * 12, params.annualIncome).hsi;
      const risk = calculateCrashRiskScore(d, hsi, params.jeonseChange / 100, params.crsWeights);
      return { ...d, risk, hsi };
    }).sort((a, b) => b.risk.totalCrs - a.risk.totalCrs);
  }, [params]);

  const topDangerous = districtRisks.slice(0, 5);
  const topSafe = [...districtRisks].reverse().slice(0, 5);

  // 3. 3년 시계열 예측 (선택 구)
  const forecast = useMemo(() => {
    return forecastDistrict(
      activeDistrict,
      {
        baseRate: params.baseRate,
        jeonseChangeRate: params.jeonseChange / 100,
        dsrLimit: params.dsrLimit,
        ltvLimit: params.ltvLimit,
        taxBurdenChange: (params.cptMultiplier - 1.0) + (params.multiHomeSurcharge ? 0.4 : 0),
        supplyChange: 0
      },
      taxSummary.hsi3.hsi,
      60
    );
  }, [activeDistrict, params, taxSummary]);

  // 4. 거시 버블 지표
  const bubbleIndicators = useMemo(() => {
    return calculateAllIndicators({
      medianPrice: params.propertyPrice,
      medianIncome: params.annualIncome,
      annualRent: params.propertyPrice * (params.conversionRate / 100),
      mortgageRate: params.baseRate + 1.5,
      ltvRatio: params.ltvLimit
    });
  }, [params]);

  const bubbleOverall = useMemo(() => getOverallBubbleRisk(bubbleIndicators), [bubbleIndicators]);

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="p-6 space-y-6 text-gray-200 max-w-5xl mx-auto print:bg-white print:text-black print:p-0">
      {/* 인쇄 및 액션 바 */}
      <div className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-800 print:hidden">
        <div>
          <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
            <FileText className="text-blue-400" />
            서울 부동산 스트레스 종합 진단 리포트 (Executive Briefing)
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">현재 시뮬레이션 설정값을 반영한 종합 분석 보고서입니다.</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
        >
          <Printer size={15} />
          리포트 출력 / PDF 저장
        </button>
      </div>

      {/* 리포트 본문 (A4 형태 디자인) */}
      <div className="bg-gray-900/95 border border-gray-800 rounded-2xl p-8 space-y-8 shadow-2xl print:bg-white print:border-none print:shadow-none print:p-0">
        
        {/* 리포트 헤더 */}
        <div className="border-b border-gray-800 pb-6 print:border-gray-300">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-extrabold text-blue-400 tracking-wider uppercase">Real Estate Stress Test Platform</span>
              <h1 className="text-2xl font-black text-gray-100 mt-1 print:text-gray-900">
                서울 부동산 세제·역전세 스트레스 및 시장 예측 종합 보고서
              </h1>
              <p className="text-xs text-gray-400 mt-1 print:text-gray-600">
                발행일: {currentDate} | 분석 대상 기준지역: <strong className="text-gray-200 print:text-gray-900">{activeDistrict.name}</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-950/80 text-blue-300 border border-blue-800 print:bg-gray-100 print:text-black">
                2026 OFFICIAL MODEL
              </span>
            </div>
          </div>
        </div>

        {/* 1. 거시 정책 및 가구 분석 전제조건 */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-200 print:text-gray-900 flex items-center gap-1.5 border-l-4 border-blue-500 pl-2">
            1. 시뮬레이션 거시 경제 및 가계 전제 조건
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/60 print:bg-gray-50 print:border-gray-200">
              <div className="text-gray-400">한국은행 기준금리</div>
              <div className="text-base font-bold text-gray-100 print:text-gray-900 mt-0.5">{params.baseRate.toFixed(2)}%</div>
              <div className="text-[10px] text-gray-400">시중 실효: {(params.baseRate + 1.5).toFixed(2)}%</div>
            </div>
            <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/60 print:bg-gray-50 print:border-gray-200">
              <div className="text-gray-400">종부세 공정시장가액비율</div>
              <div className="text-base font-bold text-orange-400 mt-0.5">{Math.round(params.fairValueRatio * 100)}%</div>
              <div className="text-[10px] text-gray-400">세율 배율: {params.cptMultiplier.toFixed(1)}배</div>
            </div>
            <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/60 print:bg-gray-50 print:border-gray-200">
              <div className="text-gray-400">DSR / LTV 상한</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">{Math.round(params.dsrLimit * 100)}% / {Math.round(params.ltvLimit * 100)}%</div>
              <div className="text-[10px] text-gray-400">스트레스 가산금리 적용</div>
            </div>
            <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/60 print:bg-gray-50 print:border-gray-200">
              <div className="text-gray-400">가구 연소득 / 주택시세</div>
              <div className="text-base font-bold text-blue-400 mt-0.5">{formatManWon(params.annualIncome)}</div>
              <div className="text-[10px] text-gray-400">매매가: {formatManWon(params.propertyPrice)}</div>
            </div>
          </div>
        </div>

        {/* 2. 주택 보유 수별 세부담 및 가계 주거부담(HSI) 진단 */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-200 print:text-gray-900 flex items-center gap-1.5 border-l-4 border-blue-500 pl-2">
            2. 주택 보유 수별 연간 보유세 및 가계 주거부담(HSI) 진단
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-300 print:text-gray-800 border border-gray-800 print:border-gray-300">
              <thead className="bg-gray-800/80 text-gray-400 print:bg-gray-100 print:text-gray-700">
                <tr>
                  <th className="px-4 py-2.5">보유 유형</th>
                  <th className="px-4 py-2.5">총 공시가격</th>
                  <th className="px-4 py-2.5">연간 재산세</th>
                  <th className="px-4 py-2.5">연간 종부세</th>
                  <th className="px-4 py-2.5">총 연간 보유세</th>
                  <th className="px-4 py-2.5">순보유비용(Net)</th>
                  <th className="px-4 py-2.5">HSI (소득대비)</th>
                  <th className="px-4 py-2.5">진단 결과</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 print:divide-gray-200">
                <tr>
                  <td className="px-4 py-2.5 font-bold text-gray-100 print:text-gray-900">1주택자 (실거주)</td>
                  <td className="px-4 py-2.5">{formatManWon(params.propertyPrice * 0.69)}</td>
                  <td className="px-4 py-2.5">{formatManWon(taxSummary.t1.propertyTax.totalPropertyTax)}</td>
                  <td className="px-4 py-2.5">{formatManWon(taxSummary.t1.comprehensiveTax.totalComprehensiveTax)}</td>
                  <td className="px-4 py-2.5 font-bold text-gray-100 print:text-gray-900">{formatManWon(taxSummary.t1.totalAnnual)}</td>
                  <td className="px-4 py-2.5 text-red-400 font-bold">{formatManWon(taxSummary.hsi1.netAnnualCost)}</td>
                  <td className="px-4 py-2.5 font-bold text-blue-400">{formatPercent(taxSummary.hsi1.hsi)}</td>
                  <td className="px-4 py-2.5">{taxSummary.hsi1.hsiLabel}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-bold text-gray-100 print:text-gray-900">2주택자 (일반)</td>
                  <td className="px-4 py-2.5">{formatManWon(params.propertyPrice * 0.69 * 2)}</td>
                  <td className="px-4 py-2.5">{formatManWon(taxSummary.t2.propertyTax.totalPropertyTax * 2)}</td>
                  <td className="px-4 py-2.5 text-orange-400 font-semibold">{formatManWon(taxSummary.t2.comprehensiveTax.totalComprehensiveTax)}</td>
                  <td className="px-4 py-2.5 font-bold text-gray-100 print:text-gray-900">{formatManWon(taxSummary.t2.totalAnnual)}</td>
                  <td className="px-4 py-2.5 text-red-400 font-bold">{formatManWon(taxSummary.hsi2.netAnnualCost)}</td>
                  <td className="px-4 py-2.5 font-bold text-yellow-400">{formatPercent(taxSummary.hsi2.hsi)}</td>
                  <td className="px-4 py-2.5">{taxSummary.hsi2.hsiLabel}</td>
                </tr>
                <tr className="bg-red-950/20 print:bg-red-50">
                  <td className="px-4 py-2.5 font-bold text-red-300 print:text-red-900">3주택 이상 (다주택)</td>
                  <td className="px-4 py-2.5">{formatManWon(params.propertyPrice * 0.69 * 3)}</td>
                  <td className="px-4 py-2.5">{formatManWon(taxSummary.t3.propertyTax.totalPropertyTax * 3)}</td>
                  <td className="px-4 py-2.5 text-orange-400 font-bold">{formatManWon(taxSummary.t3.comprehensiveTax.totalComprehensiveTax)}</td>
                  <td className="px-4 py-2.5 font-black text-red-400">{formatManWon(taxSummary.t3.totalAnnual)}</td>
                  <td className="px-4 py-2.5 text-red-400 font-bold">{formatManWon(taxSummary.hsi3.netAnnualCost)}</td>
                  <td className="px-4 py-2.5 font-black text-red-400">{formatPercent(taxSummary.hsi3.hsi)}</td>
                  <td className="px-4 py-2.5 font-bold text-red-400">{taxSummary.hsi3.hsiLabel}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. 서울 25개 구 CRS 2.0 붕괴위험도 분석 */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-200 print:text-gray-900 flex items-center gap-1.5 border-l-4 border-blue-500 pl-2">
            3. 서울 25개 자치구 붕괴위험도 (CRS 2.0) 취약 구 vs 안전 구
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Top 5 위험 구 */}
            <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-4 space-y-2 print:bg-gray-50 print:border-red-300">
              <div className="font-bold text-red-400 flex items-center gap-1.5">
                <Flame size={14} /> 붕괴 위험도(CRS) 상위 5개 자치구
              </div>
              <div className="space-y-1.5">
                {topDangerous.map((d, i) => (
                  <div key={d.id} className="flex justify-between items-center border-b border-red-900/20 pb-1">
                    <span className="font-bold text-gray-200 print:text-gray-900">{i + 1}. {d.name} ({d.region})</span>
                    <span className="font-black text-red-400">{d.risk.totalCrs.toFixed(1)}점 ({d.risk.crsLevel})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 안전 구 */}
            <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 space-y-2 print:bg-gray-50 print:border-emerald-300">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> 붕괴 위험도(CRS) 상대적 안정 5개 자치구
              </div>
              <div className="space-y-1.5">
                {topSafe.map((d, i) => (
                  <div key={d.id} className="flex justify-between items-center border-b border-emerald-900/20 pb-1">
                    <span className="font-bold text-gray-200 print:text-gray-900">{i + 1}. {d.name} ({d.region})</span>
                    <span className="font-bold text-emerald-400">{d.risk.totalCrs.toFixed(1)}점 ({d.risk.crsLevel})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. 3개년 시계열 가격 예측 및 종합 결언 */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-200 print:text-gray-900 flex items-center gap-1.5 border-l-4 border-blue-500 pl-2">
            4. {activeDistrict.name} 향후 3개년 시나리오 예측 &amp; 행동 가이드
          </h3>
          <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/60 space-y-3 text-xs print:bg-gray-50 print:border-gray-300">
            <div className="grid grid-cols-3 gap-3 text-center border-b border-gray-700 pb-3 print:border-gray-300">
              <div>
                <div className="text-gray-400">현재 매매가</div>
                <div className="text-sm font-bold text-gray-100 print:text-gray-900 mt-0.5">{formatManWon(activeDistrict.avgSalePrice)}</div>
              </div>
              <div>
                <div className="text-gray-400">1년 후 예상 (변동률)</div>
                <div className={`text-sm font-extrabold mt-0.5 ${forecast.priceChangeRate1Year < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                  {formatManWon(forecast.predicted1YearPrice)} ({forecast.priceChangeRate1Year > 0 ? '+' : ''}{forecast.priceChangeRate1Year}%)
                </div>
              </div>
              <div>
                <div className="text-gray-400">3년 후 누적 (변동률)</div>
                <div className={`text-sm font-black mt-0.5 ${forecast.priceChangeRate3Year < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                  {formatManWon(forecast.predicted3YearPrice)} ({forecast.priceChangeRate3Year > 0 ? '+' : ''}{forecast.priceChangeRate3Year}%)
                </div>
              </div>
            </div>

            <div>
              <div className="font-bold text-gray-200 print:text-gray-900 mb-1">💡 종합 분석 진단 및 대응 권고</div>
              <p className="text-gray-400 print:text-gray-700 leading-relaxed">
                현재 거시 경제 및 금리 환경 하에서 <strong>{activeDistrict.name}</strong>은{' '}
                <strong className="text-blue-400 print:text-blue-700">[{forecast.riskLabel}]</strong> 흐름이 예상됩니다.{' '}
                {forecast.riskSummary} 글로벌 8대 버블 지표는 <strong className="text-orange-400">[{bubbleOverall.label}]</strong> 단계로, 
                다주택자의 경우 레버리지 축소 및 부채 상환 계획을 우선적으로 재점검할 필요가 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 리포트 푸터 */}
        <div className="pt-4 border-t border-gray-800 text-center text-[10px] text-gray-400 print:border-gray-300 print:text-gray-600">
          본 시뮬레이션 보고서는 서울 실거래 통계 및 세법 계량 모형에 근거한 학술·교육 목적의 분석 자료이며, 법적 투자 자문이 아닙니다.
        </div>

      </div>
    </div>
  );
}
