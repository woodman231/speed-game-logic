import { describe, it, expect } from "vitest";
import { FaceCardsListClass } from "./FaceCardsListClass";
import { FaceCardClass } from "./FaceCardClass";
import { FaceEnum, SuiteEnum } from "../types";

describe("FaceCardsListClass", () => {
    const cardA = new FaceCardClass(FaceEnum.Ace, SuiteEnum.Spades).faceCard;
    const cardB = new FaceCardClass(FaceEnum.King, SuiteEnum.Hearts).faceCard;
    const cardC = new FaceCardClass(FaceEnum.Queen, SuiteEnum.Diamonds).faceCard;

    it("should initialize with custom ID", () => {
        const list = new FaceCardsListClass("custom-deck-1");
        expect(list.faceCardsList.id).toBe("custom-deck-1");
        expect(list.faceCardsList.cards).toEqual([]);
    });

    it("should initialize with an auto-generated ID when none is provided", () => {
        const list1 = new FaceCardsListClass();
        const list2 = new FaceCardsListClass();

        expect(typeof list1.faceCardsList.id).toBe("string");
        expect(list1.faceCardsList.id.length).toBeGreaterThan(0);
        expect(list1.faceCardsList.id).not.toBe(list2.faceCardsList.id);
    });

    it("should add face cards", () => {
        const list = new FaceCardsListClass();
        list.addFaceCard(cardA);
        list.addFaceCard(cardB);

        expect(list.faceCardsList.cards).toHaveLength(2);
        expect(list.faceCardsList.cards).toEqual([cardA, cardB]);
    });

    it("should check if a card exists in the list", () => {
        const list = new FaceCardsListClass();
        list.addFaceCard(cardA);

        expect(list.isCardInList(cardA)).toBe(true);
        expect(list.isCardInList(cardB)).toBe(false);
    });

    it("should remove a card from the list by ID", () => {
        const list = new FaceCardsListClass();
        list.addFaceCard(cardA);
        list.addFaceCard(cardB);

        list.removeFaceCard(cardA);
        expect(list.faceCardsList.cards).toEqual([cardB]);
        expect(list.isCardInList(cardA)).toBe(false);
    });

    it("should get a card by its ID", () => {
        const list = new FaceCardsListClass();
        list.addFaceCard(cardA);
        list.addFaceCard(cardB);

        expect(list.getCardById(cardA.id)).toEqual(cardA);
        expect(list.getCardById("non-existent-id")).toBeUndefined();
    });

    it("should clear all cards from the list", () => {
        const list = new FaceCardsListClass();
        list.addFaceCard(cardA);
        list.addFaceCard(cardB);

        list.clearList();
        expect(list.faceCardsList.cards).toEqual([]);
    });

    describe("shuffleList", () => {
        it("should handle empty or single-element lists without error", () => {
            const emptyList = new FaceCardsListClass();
            expect(() => emptyList.shuffleList()).not.toThrow();

            const singleList = new FaceCardsListClass();
            singleList.addFaceCard(cardA);
            expect(() => singleList.shuffleList()).not.toThrow();
            expect(singleList.faceCardsList.cards).toEqual([cardA]);
        });

        it("should preserve all cards after shuffling (no loss, no duplicates)", () => {
            const list = new FaceCardsListClass();
            const faces = [
                FaceEnum.Ace,
                FaceEnum.Two,
                FaceEnum.Three,
                FaceEnum.Four,
                FaceEnum.Five,
                FaceEnum.Six,
                FaceEnum.Seven,
                FaceEnum.Eight,
                FaceEnum.Nine,
                FaceEnum.Ten,
            ];

            faces.forEach((face) => {
                list.addFaceCard(new FaceCardClass(face, SuiteEnum.Spades).faceCard);
            });

            const initialIds = list.faceCardsList.cards.map((c) => c.id).sort();

            list.shuffleList();

            const postShuffleIds = list.faceCardsList.cards.map((c) => c.id).sort();
            expect(postShuffleIds).toEqual(initialIds);
            expect(list.faceCardsList.cards).toHaveLength(faces.length);
        });

        it("should alter card order when shuffled", () => {
            const list = new FaceCardsListClass();
            const faces = [
                FaceEnum.Ace,
                FaceEnum.Two,
                FaceEnum.Three,
                FaceEnum.Four,
                FaceEnum.Five,
                FaceEnum.Six,
                FaceEnum.Seven,
                FaceEnum.Eight,
                FaceEnum.Nine,
                FaceEnum.Ten,
            ];

            faces.forEach((face) => {
                list.addFaceCard(new FaceCardClass(face, SuiteEnum.Spades).faceCard);
            });

            const initialOrder = list.faceCardsList.cards.map((c) => c.id).join(",");

            list.shuffleList();

            const postShuffleOrder = list.faceCardsList.cards.map((c) => c.id).join(",");
            // With 10 cards, the probability of returning to the exact same order is 1 in 3,628,800
            expect(postShuffleOrder).not.toBe(initialOrder);
        });
    });
});
