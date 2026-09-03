import { propertyTaxConfig, crtConfig, acquisitionTaxConfig, cgtConfig } from '../data/taxBrackets';

export interface PropertyTaxResult {
  taxBase: number;
  baseTax: number;
  urbanAreaTax: number;
  localEducationTax: number;
  totalPropertyTax: number;
}

export interface ComprehensiveTaxResult {
  taxBase: number;
  baseTax: number;
  propertyTaxDeduction: number; // 재산세 중복과세 공제액
  ageDeduction: number;
  holdingDeduction: number;
  totalDeduction: number;
  ruralSpecialTax: number;
  totalComprehensiveTax: number;
}

export interface AcquisitionTaxResult {
  baseRate: number;
  baseTax: number;
  localEducationTax: number;
  ruralSpecialTax: number;
  totalAcquisitionTax: number;
}

export interface CapitalGainsTaxResult {
  gain: number;
  taxableGain: number;
  longTermDeduction: number;
  taxableIncome: number;
  baseTax: number;
  localIncomeTax: number;
  totalCapitalGainsTax: number;
}

export interface TaxOverrides {
  fairValueRatio?: number;
  cptMultiplier?: number;
  multiHomeSurcharge?: boolean;
}

export function calculatePropertyTax(officialPrice: number, numberOfHomes: number, overrides?: TaxOverrides): PropertyTaxResult {
  const isOneHome = numberOfHomes === 1;
  let ratio = 0.60;
  if (isOneHome) {
    if (officialPrice <= 30000) ratio = propertyTaxConfig.fairMarketValueRatio.oneHomeUnder300M / 100;
    else if (officialPrice <= 60000) ratio = propertyTaxConfig.fairMarketValueRatio.oneHome300MTo600M / 100;
    else ratio = propertyTaxConfig.fairMarketValueRatio.oneHomeOver600M / 100;
  }
  if (overrides?.fairValueRatio !== undefined) {
    ratio = overrides.fairValueRatio;
  }

  const taxBase = officialPrice * ratio;
  const isSpecial = isOneHome && officialPrice <= 90000;
  const brackets = isSpecial ? propertyTaxConfig.special1HomeBrackets : propertyTaxConfig.standardBrackets;

  let selectedBracket = brackets[brackets.length - 1];
  for (const b of brackets) {
    if (b.maxAmount > 0 && taxBase <= b.maxAmount) {
      selectedBracket = b;
      break;
    }
  }

  const baseTax = Math.max(0, taxBase * (selectedBracket.rate / 100) - selectedBracket.deduction);
  const urbanAreaTax = taxBase * (propertyTaxConfig.urbanAreaTaxRate / 100);
  const localEducationTax = baseTax * (propertyTaxConfig.localEducationTaxRate / 100);
  const totalPropertyTax = baseTax + urbanAreaTax + localEducationTax;

  return { taxBase, baseTax, urbanAreaTax, localEducationTax, totalPropertyTax };
}

export function calculateComprehensiveTax(
  totalOfficialPrices: number,
  numberOfHomes: number,
  ownerAge: number,
  holdingYears: number,
  overrides?: TaxOverrides
): ComprehensiveTaxResult {
  const deduction = numberOfHomes === 1 ? crtConfig.basicDeduction.oneHome : crtConfig.basicDeduction.multiHome;
  const fairRatio = overrides?.fairValueRatio ?? (crtConfig.fairMarketValueRatio / 100);
  const taxBase = Math.max(0, totalOfficialPrices - deduction) * fairRatio;

  if (taxBase <= 0) {
    return {
      taxBase: 0,
      baseTax: 0,
      propertyTaxDeduction: 0,
      ageDeduction: 0,
      holdingDeduction: 0,
      totalDeduction: 0,
      ruralSpecialTax: 0,
      totalComprehensiveTax: 0
    };
  }

  const isMultiSurcharge = numberOfHomes >= 3 && overrides?.multiHomeSurcharge !== false;
  const brackets = isMultiSurcharge ? crtConfig.multiHomeBrackets : crtConfig.standardBrackets;

  let selectedBracket = brackets[brackets.length - 1];
  for (const b of brackets) {
    if (b.maxAmount > 0 && taxBase <= b.maxAmount) {
      selectedBracket = b;
      break;
    }
  }

  const multiplier = overrides?.cptMultiplier ?? 1.0;
  // 종부세 누진공제액 스케일링: 세율에 배율이 곱해지면 누진공제액도 동일 배율로 스케일링되어야 누진세 곡선이 유지됨
  const scaledDeduction = selectedBracket.deduction * multiplier;
  let rawTax = (taxBase * (selectedBracket.rate / 100) * multiplier) - scaledDeduction;
  let baseTax = Math.max(0, rawTax);

  // 재산세 중복과세액 공제 (종부세법 제9조 제3항)
  // 종부세 과세표준에 이미 부과된 재산세 상당액을 차감 (표준 가중 재산세율 약 0.24% 적용)
  const propertyTaxDeduction = Math.round(taxBase * 0.0024);
  baseTax = Math.max(0, baseTax - propertyTaxDeduction);

  let ageDeductionRate = 0;
  let holdingDeductionRate = 0;

  if (numberOfHomes === 1) {
    if (ownerAge >= 70) ageDeductionRate = crtConfig.taxCredit1Home.age70plus / 100;
    else if (ownerAge >= 65) ageDeductionRate = crtConfig.taxCredit1Home.age65to70 / 100;
    else if (ownerAge >= 60) ageDeductionRate = crtConfig.taxCredit1Home.age60to65 / 100;

    if (holdingYears >= 15) holdingDeductionRate = crtConfig.taxCredit1Home.hold15yrPlus / 100;
    else if (holdingYears >= 10) holdingDeductionRate = crtConfig.taxCredit1Home.hold10to15yr / 100;
    else if (holdingYears >= 5) holdingDeductionRate = crtConfig.taxCredit1Home.hold5to10yr / 100;
  }

  const maxTotalDeductionRate = crtConfig.taxCredit1Home.maxTotalCredit / 100;
  const totalDeductionRate = Math.min(ageDeductionRate + holdingDeductionRate, maxTotalDeductionRate);

  const ageDeduction = baseTax * ageDeductionRate;
  const holdingDeduction = baseTax * holdingDeductionRate;
  const totalDeduction = baseTax * totalDeductionRate;

  baseTax = Math.max(0, baseTax - totalDeduction);
  const ruralSpecialTax = baseTax * (crtConfig.specialRuralTaxRate / 100);
  const totalComprehensiveTax = baseTax + ruralSpecialTax;

  return {
    taxBase,
    baseTax,
    propertyTaxDeduction,
    ageDeduction,
    holdingDeduction,
    totalDeduction,
    ruralSpecialTax,
    totalComprehensiveTax
  };
}

export function calculateAcquisitionTax(
  salePrice: number,
  numberOfHomes: number,
  isRegulated: boolean,
  area: number = 84
): AcquisitionTaxResult {
  let baseRate = 0.01;
  if (numberOfHomes === 1) {
    if (salePrice <= 60000) baseRate = 0.01;
    else if (salePrice <= 90000) baseRate = ((salePrice * 2 / 30000) - 3) / 100;
    else baseRate = 0.03;
  } else if (numberOfHomes === 2) {
    if (isRegulated) {
      baseRate = 0.08;
    } else {
      if (salePrice <= 60000) baseRate = 0.01;
      else if (salePrice <= 90000) baseRate = ((salePrice * 2 / 30000) - 3) / 100;
      else baseRate = 0.03;
    }
  } else if (numberOfHomes === 3) {
    baseRate = isRegulated ? 0.12 : 0.08;
  } else {
    baseRate = 0.12;
  }

  const baseTax = salePrice * baseRate;
  const localEducationTax = baseTax * (baseRate >= 0.08 ? 0.004 : 0.001);
  const ruralSpecialTax = (area > 85 || baseRate >= 0.08) ? salePrice * (baseRate >= 0.12 ? 0.01 : baseRate >= 0.08 ? 0.006 : 0.002) : 0;
  const totalAcquisitionTax = baseTax + localEducationTax + ruralSpecialTax;

  return { baseRate, baseTax, localEducationTax, ruralSpecialTax, totalAcquisitionTax };
}

export function calculateCapitalGainsTax(
  salePrice: number,
  acquisitionPrice: number,
  numberOfHomes: number,
  holdingYears: number,
  residenceYears: number
): CapitalGainsTaxResult {
  const gain = Math.max(0, salePrice - acquisitionPrice - (acquisitionPrice * 0.02));
  let taxableGain = gain;

  if (numberOfHomes === 1 && holdingYears >= 2) {
    if (salePrice <= cgtConfig.oneHomeExemptionLimit) {
      taxableGain = 0;
    } else {
      taxableGain = gain * ((salePrice - cgtConfig.oneHomeExemptionLimit) / salePrice);
    }
  }

  let longTermDeductionRate = 0;
  if (numberOfHomes === 1 && holdingYears >= 3) {
    const holdingRate = Math.min(holdingYears * (cgtConfig.longTermHoldingDeduction.oneHome.perYearHolding / 100), cgtConfig.longTermHoldingDeduction.oneHome.maxHolding / 100);
    const residenceRate = Math.min(residenceYears * (cgtConfig.longTermHoldingDeduction.oneHome.perYearResidence / 100), cgtConfig.longTermHoldingDeduction.oneHome.maxResidence / 100);
    longTermDeductionRate = Math.min(holdingRate + residenceRate, cgtConfig.longTermHoldingDeduction.oneHome.maxTotal / 100);
  } else if (holdingYears >= 3) {
    const holdingRate = Math.min(Math.max(holdingYears - 2, 0) * (cgtConfig.longTermHoldingDeduction.standard.perYearHolding / 100), cgtConfig.longTermHoldingDeduction.standard.maxHolding / 100);
    longTermDeductionRate = holdingRate;
  }

  const longTermDeduction = taxableGain * longTermDeductionRate;
  const taxableIncome = Math.max(0, taxableGain - longTermDeduction - cgtConfig.basicDeduction);

  let baseTax = 0;
  if (taxableIncome > 0) {
    const brackets = cgtConfig.standardBrackets;
    let selectedBracket = brackets[brackets.length - 1];
    for (const b of brackets) {
      if (b.maxAmount > 0 && taxableIncome <= b.maxAmount) {
        selectedBracket = b;
        break;
      }
    }
    baseTax = Math.max(0, taxableIncome * (selectedBracket.rate / 100) - selectedBracket.deduction);
  }

  const localIncomeTax = baseTax * 0.10;
  const totalCapitalGainsTax = baseTax + localIncomeTax;

  return { gain, taxableGain, longTermDeduction, taxableIncome, baseTax, localIncomeTax, totalCapitalGainsTax };
}

export function calculateAnnualHoldingTax(
  officialPrice: number,
  totalOfficialPrices: number,
  numberOfHomes: number,
  ownerAge: number,
  holdingYears: number,
  overrides?: TaxOverrides
): { propertyTax: PropertyTaxResult; comprehensiveTax: ComprehensiveTaxResult; totalAnnual: number } {
  const propertyTax = calculatePropertyTax(officialPrice, numberOfHomes, overrides);
  let totalProp = propertyTax.totalPropertyTax;
  if (numberOfHomes > 1) {
    totalProp = totalProp * numberOfHomes;
  }
  const comprehensiveTax = calculateComprehensiveTax(totalOfficialPrices, numberOfHomes, ownerAge, holdingYears, overrides);
  const totalAnnual = totalProp + comprehensiveTax.totalComprehensiveTax;
  return { propertyTax, comprehensiveTax, totalAnnual };
}
