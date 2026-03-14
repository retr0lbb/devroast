export const VERDICT_ENUMS = {
  NEEDS_SERIOUS_HELP: "needs_serious_help",
  MIGHT_SURVIVE: "might_survive",
  ACTUALLY_DECENT: "actually_decent",
  CODE_GOD: "code_god",
} as const;

export type Verdict = typeof VERDICT_ENUMS[keyof typeof VERDICT_ENUMS];
