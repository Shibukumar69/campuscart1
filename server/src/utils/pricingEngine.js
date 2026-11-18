export const DEFAULT_PRINT_RATES = {
  baseCharge: 5.0, // base setup charge
  bwSinglePage: 1.5, // INR 1.5 per page
  bwDoublePage: 2.0, // INR 2.0 per sheet (both sides)
  colorSinglePage: 6.0, // INR 6 per page
  colorDoublePage: 10.0, // INR 10 per sheet
  a3Multiplier: 1.8,
  binding: {
    NONE: 0,
    STAPLE: 5,
    SPIRAL: 35,
    HARDBOUND: 120,
  },
};

/**
 * Calculates printing cost given options and page count
 */
export const calculatePrintPrice = ({
  pageCount = 1,
  copies = 1,
  printColor = 'BW',
  sides = 'DOUBLE',
  paperSize = 'A4',
  bindingType = 'NONE',
  customRates = null,
}) => {
  const rates = customRates || DEFAULT_PRINT_RATES;
  let pageCostPerCopy = 0;

  const isDouble = sides === 'DOUBLE';
  const isColor = printColor === 'COLOR';

  if (!isDouble) {
    // Single-sided: every page is one sheet
    const ratePerPage = isColor ? rates.colorSinglePage : rates.bwSinglePage;
    pageCostPerCopy = pageCount * ratePerPage;
  } else {
    // Double-sided: 2 pages per sheet
    const sheets = Math.ceil(pageCount / 2);
    const ratePerSheet = isColor ? rates.colorDoublePage : rates.bwDoublePage;
    pageCostPerCopy = sheets * ratePerSheet;
  }

  if (paperSize === 'A3') {
    pageCostPerCopy *= rates.a3Multiplier;
  }

  const bindingCharge = rates.binding[bindingType] || 0;
  const subtotalBeforeCopies = (pageCostPerCopy + bindingCharge) * copies;
  const total = rates.baseCharge + subtotalBeforeCopies;

  return {
    baseCharge: rates.baseCharge,
    pageCostPerCopy: Number(pageCostPerCopy.toFixed(2)),
    bindingCharge,
    copies,
    pageCount,
    totalPrice: Number(total.toFixed(2)),
  };
};
