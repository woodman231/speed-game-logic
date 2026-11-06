const SuiteEnum = {
    Hearts: "Hearts",
    Diamonds: "Diamonds",
    Clubs: "Clubs",
    Spades: "Spades"
} as const;

type Suite = typeof SuiteEnum[keyof typeof SuiteEnum];

export type { Suite };
export { SuiteEnum };
