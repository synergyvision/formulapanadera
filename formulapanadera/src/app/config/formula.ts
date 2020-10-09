export const BAKERY_STEPS = 12;
export const FERMENTATION_STEP = 3;
export const MANIPULATION_STEP = 4;
export const OVEN_STEP = 11;

// Oven start minutes, before first formula gets in the oven
export const OVEN_START_TIME = 30;
// OVen change temperature minutes
export const FORMULA_WARMING_TIME = 10;

// Minutes to start or change oven temperature
export const OVEN_STARTING_TIME = 1;

export const PROPORTION_FACTOR = ["flour", "dough", "ingredient"] as const;

export const PRODUCTION_STEP_STATUS = [
  "PENDING",
  "IN PROCESS",
  "DONE",
] as const;

// Classification names need to be a key on "formulas.hydration" i18n files
// Values need to be from 0-1
export const HYDRATION_CLASSIFICATION = [
  {
    name: "hard",
    values: { min: 0, max: 0.57 },
  },
  {
    name: "standard",
    values: { min: 0.57, max: 0.65 },
  },
  {
    name: "rustic",
    values: { min: 0.65, max: 1 },
  },
];
