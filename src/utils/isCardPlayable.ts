import { FaceEnum, type Face, type FaceCard } from "../types";

const RANK_VALUES: Record<Face, number> = {
    [FaceEnum.Ace]: 0,
    [FaceEnum.Two]: 1,
    [FaceEnum.Three]: 2,
    [FaceEnum.Four]: 3,
    [FaceEnum.Five]: 4,
    [FaceEnum.Six]: 5,
    [FaceEnum.Seven]: 6,
    [FaceEnum.Eight]: 7,
    [FaceEnum.Nine]: 8,
    [FaceEnum.Ten]: 9,
    [FaceEnum.Jack]: 10,
    [FaceEnum.Queen]: 11,
    [FaceEnum.King]: 12,
};

const TOTAL_RANKS = 13;

/**
 * In Speed, cards can be played if they are ±1 in rank.
 * Crucial Rule: Ace wraps around! Ace connects to Two and King (... Q -> K -> A -> 2 -> 3 ...).
 * Suits do not matter in Speed. 
 */
export function isCardPlayable(cardToPlay: FaceCard, targetCard: FaceCard): boolean {
    const cardRank = RANK_VALUES[cardToPlay.face];
    const targetRank = RANK_VALUES[targetCard.face];

    if (cardRank === undefined || targetRank === undefined) {
        throw new Error("Invalid card rank");
    }

    const diff = Math.abs(cardRank - targetRank);
    return diff === 1 || diff === TOTAL_RANKS - 1;
}
