const FaceEnum = {
    Ace: "Ace",
    Two: "Two",
    Three: "Three",
    Four: "Four",
    Five: "Five",
    Six: "Six",
    Seven: "Seven",
    Eight: "Eight",
    Nine: "Nine",
    Ten: "Ten",
    Jack: "Jack",
    Queen: "Queen",
    King: "King"
} as const;

type Face = typeof FaceEnum[keyof typeof FaceEnum];

export type { Face };
export { FaceEnum };
