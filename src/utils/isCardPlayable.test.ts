import { describe, it, expect } from "vitest";
import { isCardPlayable } from "./isCardPlayable";
import { SuiteEnum, FaceEnum, type FaceCard } from "../types";
import { FaceCardClass } from "../classes";

describe("isCardPlayable", () => {
    it("should return true for cards that are ±1 in rank", () => {
        const five = new FaceCardClass(FaceEnum.Five, SuiteEnum.Hearts).faceCard;
        const six = new FaceCardClass(FaceEnum.Six, SuiteEnum.Spades).faceCard;

        expect(isCardPlayable(five, six)).toBe(true);
        expect(isCardPlayable(six, five)).toBe(true);
    });

    it("should return true for Ace and Two adjacency", () => {
        const ace = new FaceCardClass(FaceEnum.Ace, SuiteEnum.Hearts).faceCard;
        const two = new FaceCardClass(FaceEnum.Two, SuiteEnum.Spades).faceCard;

        expect(isCardPlayable(ace, two)).toBe(true);
        expect(isCardPlayable(two, ace)).toBe(true);
    });

    it("should return true for Ace wrapping around King bidirectionally", () => {
        const ace = new FaceCardClass(FaceEnum.Ace, SuiteEnum.Hearts).faceCard;
        const king = new FaceCardClass(FaceEnum.King, SuiteEnum.Spades).faceCard;

        expect(isCardPlayable(ace, king)).toBe(true);
        expect(isCardPlayable(king, ace)).toBe(true);
    });

    it("should return false for identical card ranks", () => {
        const fiveHearts = new FaceCardClass(FaceEnum.Five, SuiteEnum.Hearts).faceCard;
        const fiveSpades = new FaceCardClass(FaceEnum.Five, SuiteEnum.Spades).faceCard;

        expect(isCardPlayable(fiveHearts, fiveSpades)).toBe(false);
    });

    it("should return false for cards that are not ±1 in rank", () => {
        const five = new FaceCardClass(FaceEnum.Five, SuiteEnum.Hearts).faceCard;
        const seven = new FaceCardClass(FaceEnum.Seven, SuiteEnum.Spades).faceCard;

        expect(isCardPlayable(five, seven)).toBe(false);
    });

    it("should be playable regardless of whether suits match or differ", () => {
        const fiveHearts = new FaceCardClass(FaceEnum.Five, SuiteEnum.Hearts).faceCard;
        const sixHearts = new FaceCardClass(FaceEnum.Six, SuiteEnum.Hearts).faceCard;
        const sixClubs = new FaceCardClass(FaceEnum.Six, SuiteEnum.Clubs).faceCard;

        expect(isCardPlayable(fiveHearts, sixHearts)).toBe(true);
        expect(isCardPlayable(fiveHearts, sixClubs)).toBe(true);
    });

    it("should throw an error for invalid card ranks", () => {
        const badCard = { face: "Joker" as unknown, suite: SuiteEnum.Hearts } as FaceCard;
        const normalCard = new FaceCardClass(FaceEnum.Five, SuiteEnum.Hearts).faceCard;

        expect(() => isCardPlayable(badCard, normalCard)).toThrow("Invalid card rank");
        expect(() => isCardPlayable(normalCard, badCard)).toThrow("Invalid card rank");
    });
});
