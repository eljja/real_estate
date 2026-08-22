export interface PropertyTaxBracket {
  maxAmount: number; // 만원 (0 means infinity)
  rate: number;      // %
  deduction: number; // 만원
}

export interface PropertyTaxConfig {
  standardBrackets: PropertyTaxBracket[];
  special1HomeBrackets: PropertyTaxBracket[];
  fairMarketValueRatio: {
    standard: number; // %
    oneHomeUnder300M: number;
    oneHome300MTo600M: number;
    oneHomeOver600M: number;
  };
  urbanAreaTaxRate: number; // %
  localEducationTaxRate: number; // % of property tax
  taxBurdenCap: {
    under300M: number; // %
    between300MAnd600M: number; // %
    over600M: number; // %
  };
}

export const propertyTaxConfig: PropertyTaxConfig = {
  standardBrackets: [
    { maxAmount: 6000, rate: 0.10, deduction: 0 },
    { maxAmount: 15000, rate: 0.15, deduction: 3 },
    { maxAmount: 30000, rate: 0.25, deduction: 18 },
    { maxAmount: 0, rate: 0.40, deduction: 63 }
  ],
  special1HomeBrackets: [
    { maxAmount: 6000, rate: 0.05, deduction: 0 },
    { maxAmount: 15000, rate: 0.10, deduction: 3 },
    { maxAmount: 30000, rate: 0.20, deduction: 18 },
    { maxAmount: 0, rate: 0.35, deduction: 63 }
  ],
  fairMarketValueRatio: {
    standard: 60,
    oneHomeUnder300M: 43,
    oneHome300MTo600M: 44,
    oneHomeOver600M: 45
  },
  urbanAreaTaxRate: 0.14,
  localEducationTaxRate: 20,
  taxBurdenCap: {
    under300M: 105,
    between300MAnd600M: 110,
    over600M: 130
  }
};

export interface CRTBrakcet {
  maxAmount: number; // 만원
  rate: number;      // %
  deduction: number; // 만원
}

export interface ComprehensiveRealEstateTaxConfig {
  basicDeduction: {
    oneHome: number; // 만원
    multiHome: number;
    corp: number;
  };
  fairMarketValueRatio: number; // %
  standardBrackets: CRTBrakcet[];
  multiHomeBrackets: CRTBrakcet[];
  taxCredit1Home: {
    age60to65: number; // %
    age65to70: number; // %
    age70plus: number; // %
    hold5to10yr: number; // %
    hold10to15yr: number; // %
    hold15yrPlus: number; // %
    maxTotalCredit: number; // %
  };
  specialRuralTaxRate: number; // %
  taxBurdenCap: number; // %
}

export const crtConfig: ComprehensiveRealEstateTaxConfig = {
  basicDeduction: {
    oneHome: 120000, // 12억
    multiHome: 90000, // 9억
    corp: 0
  },
  fairMarketValueRatio: 60,
  standardBrackets: [
    { maxAmount: 30000, rate: 0.5, deduction: 0 },
    { maxAmount: 60000, rate: 0.7, deduction: 60 },
    { maxAmount: 120000, rate: 1.0, deduction: 240 },
    { maxAmount: 250000, rate: 1.3, deduction: 600 },
    { maxAmount: 500000, rate: 1.5, deduction: 1100 },
    { maxAmount: 940000, rate: 2.0, deduction: 3600 },
    { maxAmount: 0, rate: 2.7, deduction: 10180 }
  ],
  multiHomeBrackets: [
    { maxAmount: 30000, rate: 0.5, deduction: 0 },
    { maxAmount: 60000, rate: 0.7, deduction: 60 },
    { maxAmount: 120000, rate: 1.0, deduction: 240 },
    { maxAmount: 250000, rate: 2.0, deduction: 1440 },
    { maxAmount: 500000, rate: 3.0, deduction: 3940 },
    { maxAmount: 940000, rate: 4.0, deduction: 8940 },
    { maxAmount: 0, rate: 5.0, deduction: 18340 }
  ],
  taxCredit1Home: {
    age60to65: 20,
    age65to70: 30,
    age70plus: 40,
    hold5to10yr: 20,
    hold10to15yr: 40,
    hold15yrPlus: 50,
    maxTotalCredit: 80
  },
  specialRuralTaxRate: 20,
  taxBurdenCap: 150
};

export interface AcquisitionTaxConfig {
  oneHome: {
    under600M: number; // %
    between600MAnd900MFormula: (price: number) => number; // price in 만원
    over900M: number; // %
  };
  twoHomes: {
    regulated: number; // %
    nonRegulated: (price: number) => number; // % (same as 1 home)
  };
  threeHomes: {
    regulated: number; // %
    nonRegulated: number; // %
  };
  fourPlusOrCorp: number; // %
  surtax: {
    localEducation: {
      standard: [number, number]; // [0.1, 0.3]
      surcharge8: number; // %
      surcharge12: number; // %
    };
    specialRural: {
      over85sqm: number; // %
      surcharge8: number; // %
      surcharge12: number; // %
    };
  };
}

export const acquisitionTaxConfig: AcquisitionTaxConfig = {
  oneHome: {
    under600M: 1.0,
    between600MAnd900MFormula: (price: number) => (price * 2 / 30000) - 3,
    over900M: 3.0
  },
  twoHomes: {
    regulated: 8.0,
    nonRegulated: (price: number) => {
      if (price <= 60000) return 1.0;
      if (price <= 90000) return (price * 2 / 30000) - 3;
      return 3.0;
    }
  },
  threeHomes: {
    regulated: 12.0,
    nonRegulated: 8.0
  },
  fourPlusOrCorp: 12.0,
  surtax: {
    localEducation: {
      standard: [0.1, 0.3],
      surcharge8: 0.4,
      surcharge12: 0.4
    },
    specialRural: {
      over85sqm: 0.2,
      surcharge8: 0.6,
      surcharge12: 1.0
    }
  }
};

export interface CGTBracket {
  maxAmount: number; // 만원
  rate: number;      // %
  deduction: number; // 만원
}

export interface CapitalGainsTaxConfig {
  standardBrackets: CGTBracket[];
  longTermHoldingDeduction: {
    oneHome: {
      perYearHolding: number; // %
      maxHolding: number; // %
      perYearResidence: number; // %
      maxResidence: number; // %
      maxTotal: number; // %
    };
    standard: {
      perYearHolding: number; // %
      maxHolding: number; // %
    };
  };
  oneHomeExemptionLimit: number; // 만원
  basicDeduction: number; // 만원
}

export const cgtConfig: CapitalGainsTaxConfig = {
  standardBrackets: [
    { maxAmount: 1400, rate: 6, deduction: 0 },
    { maxAmount: 5000, rate: 15, deduction: 126 },
    { maxAmount: 8800, rate: 24, deduction: 576 },
    { maxAmount: 15000, rate: 35, deduction: 1544 },
    { maxAmount: 30000, rate: 38, deduction: 1994 },
    { maxAmount: 50000, rate: 40, deduction: 2594 },
    { maxAmount: 100000, rate: 42, deduction: 3594 },
    { maxAmount: 0, rate: 45, deduction: 6594 }
  ],
  longTermHoldingDeduction: {
    oneHome: {
      perYearHolding: 4,
      maxHolding: 40,
      perYearResidence: 4,
      maxResidence: 40,
      maxTotal: 80
    },
    standard: {
      perYearHolding: 2,
      maxHolding: 30
    }
  },
  oneHomeExemptionLimit: 120000, // 12억
  basicDeduction: 250 // 250만원
};

export interface LoanRegulationsConfig {
  dsr: {
    bank: number; // %
    nonBank: number; // %
    stressCapitalArea: number; // %p
  };
  ltv: {
    regulated: {
      noHomeOrOneHome: number; // %
      multiHome: number; // %
    };
    nonRegulated: {
      noHomeOrOneHome: number; // %
      multiHome: number; // %
    };
    firstTimeBuyer: {
      rate: number; // %
      limit: number; // 만원
    };
  };
}

export const loanRegulationsConfig: LoanRegulationsConfig = {
  dsr: {
    bank: 40,
    nonBank: 50,
    stressCapitalArea: 1.2
  },
  ltv: {
    regulated: {
      noHomeOrOneHome: 50,
      multiHome: 0
    },
    nonRegulated: {
      noHomeOrOneHome: 70,
      multiHome: 60
    },
    firstTimeBuyer: {
      rate: 80,
      limit: 60000 // 6억
    }
  }
};
