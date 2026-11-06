import { describe, it, expect } from "vitest";
import { createStandardDeck } from "./createStandardDeck";

describe("createStandardDeck", () => {
    it("should create a standard deck with 52 cards", () => {
        const deck = createStandardDeck();
        expect(deck.cards).toHaveLength(52);
    });
});
