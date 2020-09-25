export const BAKERY_STEPS = 12;
// Oven step needs to be less than the total bakery steps
export const OVEN_STEP = 11;

export const PROPORTION_FACTOR = ["flour", "dough", "ingredient"] as const;

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
