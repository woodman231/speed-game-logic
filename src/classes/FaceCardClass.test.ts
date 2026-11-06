import { describe, it, expect } from "vitest";
import { FaceCardClass } from "./FaceCardClass";
import { FaceEnum, SuiteEnum } from "../types";

describe("FaceCardClass", () => {
    it("should initialize with correct id, face, and suite", () => {
        const cardInstance = new FaceCardClass(FaceEnum.Ace, SuiteEnum.Spades);
        const card = cardInstance.faceCard;

        expect(card).toEqual({
            id: "Ace-Spades",
            face: FaceEnum.Ace,
            suite: SuiteEnum.Spades,
        });
    });

    it("should generate deterministic IDs for identical cards", () => {
        const card1 = new FaceCardClass(FaceEnum.King, SuiteEnum.Hearts).faceCard;
        const card2 = new FaceCardClass(FaceEnum.King, SuiteEnum.Hearts).faceCard;

        expect(card1.id).toBe(card2.id);
        expect(card1.id).toBe("King-Hearts");
    });

    it("should generate different IDs for distinct cards", () => {
        const aceSpades = new FaceCardClass(FaceEnum.Ace, SuiteEnum.Spades).faceCard;
        const aceHearts = new FaceCardClass(FaceEnum.Ace, SuiteEnum.Hearts).faceCard;

        expect(aceSpades.id).not.toBe(aceHearts.id);
    });
});
