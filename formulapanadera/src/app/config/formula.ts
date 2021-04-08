/* FORMULA STEPS */
  // Total oven steps and important steps
  export const BAKERY_STEPS = 12;
  export const FERMENTATION_STEP = 3;
  export const MANIPULATION_STEP = 4;
  export const DIVITION_STEP = 5;
  export const OVEN_STEP = 11;
  // Steps status
  export const PRODUCTION_STEP_STATUS = [
    "PENDING",
    "IN PROCESS",
    "DONE",
  ] as const;

/* OVEN TIMES */
  // Oven start minutes, before first formula gets in the oven (min)
  export const OVEN_START_TIME = 30;
  // Oven temperature change change (min)
  export const FORMULA_WARMING_TIME = 10;
  // Time required to change temperature (min)
  export const OVEN_STARTING_TIME = 1;

/* COMPOUND INGREDIENTS */
// Compound ingredients proportion factor (e.g. The ingledient calculates from the total flour of the formula)
export const PROPORTION_FACTOR = ["flour", "dough", "ingredient"] as const;

/* FORMULA CLASSIFICATIONS */
// Classification names need to be a key on "formulas.hydration" i18n files
// Values need to be from 0-1
export const HYDRATION_CLASSIFICATION = [
  {
    name: "low",
    values: { min: 0, max: 0.49 },
  },
  {
    name: "normal",
    values: { min: 0.49, max: 0.65 },
  },
  {
    name: "high",
    values: { min: 0.65, max: 1 },
  },
];
