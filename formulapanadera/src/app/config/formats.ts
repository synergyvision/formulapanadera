// Angular Date Pipe (https://angular.io/api/common/DatePipe).
export const DATE_FORMAT = "short";

// moment.js (https://momentjs.com/docs/)
export const TIME_FORMAT = "hh:mm a";
export const SPECIFIC_TIME_FORMAT = "hh:mm:ss a";

// Angular Decimal Pipe (https://angular.io/api/common/DecimalPipe).
export const DECIMAL_COST_FORMAT = {
  ingredient: "1.1-10",
  formula: "1.1-2"
};
export const DECIMAL_BAKERS_PERCENTAGE_FORMAT = "1.1-2"

// Number of decimals required
export const DECIMALS = {
  temperature: 0,
  formula_percentage: 1,
  formula_grams: 1,
  hydration: 1,
  fat: 1,
  weight: 1,
};
