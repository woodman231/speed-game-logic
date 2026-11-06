import { describe, it, expect } from "vitest";
import { SpeedGameManagerClass } from "./SpeedGameManagerClass";
import { FaceCardClass } from "./FaceCardClass";
import { FaceEnum, SuiteEnum, type FaceCardEntity } from "../types";

function createMockCard(face: any, suite: any): FaceCardEntity {
    return new FaceCardClass(face, suite).faceCard;
}

describe("SpeedGameManagerClass", () => {
    describe("Initialization and Start", () => {
        it("should initialize in INITIALIZING state with empty piles", () => {
            const manager = new SpeedGameManagerClass("custom-game-id");
            expect(manager.state.id).toBe("custom-game-id");
            expect(manager.state.status).toBe("INITIALIZING");
            expect(manager.state.players.player1.hand.cards).toHaveLength(0);
            expect(manager.state.center.leftActive.cards).toHaveLength(0);
        });

        it("should deal standard 52 cards with correct Speed pile distribution", () => {
            const manager = new SpeedGameManagerClass();
            manager.start();

            const state = manager.state;
            expect(state.status).toBe("PLAYING");

            // Verify pile sizes
            expect(state.players.player1.hand.cards).toHaveLength(5);
            expect(state.players.player1.drawPile.cards).toHaveLength(15);
            expect(state.players.player2.hand.cards).toHaveLength(5);
            expect(state.players.player2.drawPile.cards).toHaveLength(15);
            expect(state.center.leftActive.cards).toHaveLength(1);
            expect(state.center.rightActive.cards).toHaveLength(1);
            expect(state.center.leftFlip.cards).toHaveLength(5);
            expect(state.center.rightFlip.cards).toHaveLength(5);

            // Total cards must equal 52 unique cards
            const allCardIds = [
                ...state.players.player1.hand.cards,
                ...state.players.player1.drawPile.cards,
                ...state.players.player2.hand.cards,
                ...state.players.player2.drawPile.cards,
                ...state.center.leftActive.cards,
                ...state.center.rightActive.cards,
                ...state.center.leftFlip.cards,
                ...state.center.rightFlip.cards,
            ].map((c) => c.id);

            expect(allCardIds).toHaveLength(52);
            const uniqueCardIds = new Set(allCardIds);
            expect(uniqueCardIds.size).toBe(52);
        });
    });

    describe("playCard", () => {
        it("should reject play when game is not in progress", () => {
            const manager = new SpeedGameManagerClass();
            const result = manager.playCard("player1", "any-id", "left");
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.reason).toBe("GAME_NOT_IN_PROGRESS");
            }
        });

        it("should reject when card is not in player's hand", () => {
            const manager = new SpeedGameManagerClass();
            manager.start();

            const result = manager.playCard("player1", "non-existent-id", "left");
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.reason).toBe("CARD_NOT_IN_HAND");
            }
        });

        it("should reject play if card is not ±1 in rank from target active pile", () => {
            const manager = new SpeedGameManagerClass();
            manager.start();

            // Setup deterministic piles
            manager.state.center.leftActive.cards = [createMockCard(FaceEnum.Five, SuiteEnum.Hearts)];
            manager.state.players.player1.hand.cards = [createMockCard(FaceEnum.Seven, SuiteEnum.Clubs)];

            const cardToPlay = manager.state.players.player1.hand.cards[0]!;
            const result = manager.playCard("player1", cardToPlay.id, "left");

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.reason).toBe("CARD_NOT_PLAYABLE");
            }
        });

        it("should successfully play card and move it to top of target active pile", () => {
            const manager = new SpeedGameManagerClass();
            manager.start();

            // Set leftActive top card as 5-Hearts
            manager.state.center.leftActive.cards = [createMockCard(FaceEnum.Five, SuiteEnum.Hearts)];
            // Set player1 hand with 6-Spades
            const playableCard = createMockCard(FaceEnum.Six, SuiteEnum.Spades);
            manager.state.players.player1.hand.cards = [playableCard];

            const result = manager.playCard("player1", playableCard.id, "left");
            expect(result.success).toBe(true);

            expect(manager.state.players.player1.hand.cards).toHaveLength(0);
            const topCard = manager.state.center.leftActive.cards[manager.state.center.leftActive.cards.length - 1];
            expect(topCard?.id).toBe(playableCard.id);
        });

        it("should auto-draw from drawPile if autoDraw is true", () => {
            const manager = new SpeedGameManagerClass("game-1", { autoDraw: true });
            manager.start();

            // Setup active pile and hand
            manager.state.center.leftActive.cards = [createMockCard(FaceEnum.Five, SuiteEnum.Hearts)];
            const playableCard = createMockCard(FaceEnum.Six, SuiteEnum.Spades);
            manager.state.players.player1.hand.cards = [playableCard];
            manager.state.players.player1.drawPile.cards = [
                createMockCard(FaceEnum.Ten, SuiteEnum.Clubs),
                createMockCard(FaceEnum.Jack, SuiteEnum.Diamonds),
            ];

            const result = manager.playCard("player1", playableCard.id, "left");
            expect(result.success).toBe(true);

            // Hand should have auto-drawn 2 cards from drawPile
            expect(manager.state.players.player1.hand.cards).toHaveLength(2);
            expect(manager.state.players.player1.drawPile.cards).toHaveLength(0);
        });

        it("should trigger win condition when player empties hand and draw pile", () => {
            const manager = new SpeedGameManagerClass();
            manager.start();

            manager.state.center.leftActive.cards = [createMockCard(FaceEnum.Five, SuiteEnum.Hearts)];
            const finalCard = createMockCard(FaceEnum.Six, SuiteEnum.Spades);
            manager.state.players.player1.hand.cards = [finalCard];
            manager.state.players.player1.drawPile.cards = []; // Empty draw pile

            const result = manager.playCard("player1", finalCard.id, "left");
            expect(result.success).toBe(true);
            expect(manager.state.status).toBe("FINISHED");
            expect(manager.state.winner).toBe("player1");
        });
    });

    describe("drawCard", () => {
        it("should draw one card from drawPile into hand when hand < maxHandSize", () => {
            const manager = new SpeedGameManagerClass("game-1", { autoDraw: false });
            manager.start();

            // Drain hand to 4
            manager.state.players.player1.hand.cards.pop();
            expect(manager.state.players.player1.hand.cards).toHaveLength(4);
            const drawPileCountBefore = manager.state.players.player1.drawPile.cards.length;

            const result = manager.drawCard("player1");
            expect(result.success).toBe(true);
            expect(manager.state.players.player1.hand.cards).toHaveLength(5);
            expect(manager.state.players.player1.drawPile.cards).toHaveLength(drawPileCountBefore - 1);
        });

        it("should reject draw if hand is already full (maxHandSize)", () => {
            const manager = new SpeedGameManagerClass("game-1", { maxHandSize: 5 });
            manager.start();

            expect(manager.state.players.player1.hand.cards).toHaveLength(5);
            const result = manager.drawCard("player1");

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.reason).toBe("HAND_FULL");
            }
        });

        it("should reject draw if draw pile is empty", () => {
            const manager = new SpeedGameManagerClass();
            manager.start();

            manager.state.players.player1.hand.cards = [];
            manager.state.players.player1.drawPile.cards = [];

            const result = manager.drawCard("player1");
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.reason).toBe("DRAW_PILE_EMPTY");
            }
        });
    });

    describe("signalStuck and Flips", () => {
        it("should update readyToFlip for single player without flipping", () => {
            const manager = new SpeedGameManagerClass();
            manager.start();

            const result = manager.signalStuck("player1");
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.flipped).toBe(false);
            }
            expect(manager.state.readyToFlip.player1).toBe(true);
            expect(manager.state.readyToFlip.player2).toBe(false);
        });

        it("should reject duplicate signalStuck from same player", () => {
            const manager = new SpeedGameManagerClass();
            manager.start();

            manager.signalStuck("player1");
            const result2 = manager.signalStuck("player1");

            expect(result2.success).toBe(false);
            if (!result2.success) {
                expect(result2.reason).toBe("ALREADY_SIGNALED");
            }
        });

        it("should execute flip when both players signal stuck", () => {
            const manager = new SpeedGameManagerClass();
            manager.start();

            const leftFlipBefore = manager.state.center.leftFlip.cards.length;
            const rightFlipBefore = manager.state.center.rightFlip.cards.length;
            const leftActiveBefore = manager.state.center.leftActive.cards.length;
            const rightActiveBefore = manager.state.center.rightActive.cards.length;

            manager.signalStuck("player1");
            const result = manager.signalStuck("player2");

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.flipped).toBe(true);
            }

            // Both flip piles decremented by 1, active piles incremented by 1
            expect(manager.state.center.leftFlip.cards).toHaveLength(leftFlipBefore - 1);
            expect(manager.state.center.rightFlip.cards).toHaveLength(rightFlipBefore - 1);
            expect(manager.state.center.leftActive.cards).toHaveLength(leftActiveBefore + 1);
            expect(manager.state.center.rightActive.cards).toHaveLength(rightActiveBefore + 1);

            // Flags reset to false
            expect(manager.state.readyToFlip.player1).toBe(false);
            expect(manager.state.readyToFlip.player2).toBe(false);
        });

        it("should reset readyToFlip flags when any player plays a card", () => {
            const manager = new SpeedGameManagerClass();
            manager.start();

            manager.state.center.leftActive.cards = [createMockCard(FaceEnum.Five, SuiteEnum.Hearts)];
            const playableCard = createMockCard(FaceEnum.Six, SuiteEnum.Spades);
            manager.state.players.player1.hand.cards = [playableCard];

            manager.signalStuck("player1");
            expect(manager.state.readyToFlip.player1).toBe(true);

            manager.playCard("player1", playableCard.id, "left");
            expect(manager.state.readyToFlip.player1).toBe(false);
        });
    });

    describe("Queries and Helpers", () => {
        it("should correctly find playable moves", () => {
            const manager = new SpeedGameManagerClass();
            manager.start();

            manager.state.center.leftActive.cards = [createMockCard(FaceEnum.Five, SuiteEnum.Hearts)];
            manager.state.center.rightActive.cards = [createMockCard(FaceEnum.King, SuiteEnum.Diamonds)];

            const sixCard = createMockCard(FaceEnum.Six, SuiteEnum.Clubs);
            const aceCard = createMockCard(FaceEnum.Ace, SuiteEnum.Spades);
            const twoCard = createMockCard(FaceEnum.Two, SuiteEnum.Hearts);

            manager.state.players.player1.hand.cards = [sixCard, aceCard, twoCard];

            const moves = manager.getPlayableMoves("player1");
            // Six can play on Five (left), Ace can play on King (right)
            expect(moves).toContainEqual({ cardId: sixCard.id, targetPile: "left" });
            expect(moves).toContainEqual({ cardId: aceCard.id, targetPile: "right" });
            expect(manager.canPlayerPlay("player1")).toBe(true);
        });

        it("should detect stalled game when neither player can play", () => {
            const manager = new SpeedGameManagerClass();
            manager.start();

            manager.state.center.leftActive.cards = [createMockCard(FaceEnum.Five, SuiteEnum.Hearts)];
            manager.state.center.rightActive.cards = [createMockCard(FaceEnum.Five, SuiteEnum.Diamonds)];

            // Both players hold only 8s (neither 5 is adjacent to 8)
            manager.state.players.player1.hand.cards = [createMockCard(FaceEnum.Eight, SuiteEnum.Clubs)];
            manager.state.players.player2.hand.cards = [createMockCard(FaceEnum.Eight, SuiteEnum.Spades)];

            expect(manager.canPlayerPlay("player1")).toBe(false);
            expect(manager.canPlayerPlay("player2")).toBe(false);
            expect(manager.isStalled()).toBe(true);
        });
    });
});
