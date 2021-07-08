// Angular Date Pipe (https://angular.io/api/common/DatePipe).
export const DATE_FORMAT = "dd/MM/yy hh:mm a";

// moment.js (https://momentjs.com/docs/)
export const MOMENT_DATE_FORMAT = "DD/MM/YY, hh:mm A";
export const TIME_FORMAT = "hh:mm a";
export const SPECIFIC_TIME_FORMAT = "hh:mm:ss a";

// Angular Decimal Pipe (https://angular.io/api/common/DecimalPipe).
export const DECIMAL_COST_FORMAT = {
  ingredient: "1.1-10",
  formula: "1.1-3"
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
