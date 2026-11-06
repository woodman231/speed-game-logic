import { FaceEnum, SuiteEnum } from "../types";
import type { FaceCardsListEntity } from "../types";
import { FaceCardClass } from "../classes";

export function createStandardDeck(): FaceCardsListEntity {
    const id = "standard-deck";
    const results: FaceCardsListEntity = {
        id,
        cards: []
    };

    for (const suite of Object.values(SuiteEnum)) {
        for (const face of Object.values(FaceEnum)) {
            const card = new FaceCardClass(face, suite);
            results.cards.push(card.faceCard);
        }
    }
    return results;
}
