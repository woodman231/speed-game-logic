import type { ISpeedGameManager } from "../interfaces";
import type {
    PlayerId,
    SpeedGameStateEntity,
    SpeedGameOptions,
    CenterPileTarget,
    FaceCardsListEntity,
    FaceCardEntity,
    ActionResult,
    PlayCardFailureReason,
    DrawCardFailureReason,
    SignalStuckFailureReason,
    ForceFlipFailureReason,
} from "../types";
import { generateId, createStandardDeck, isCardPlayable } from "../utils";
import { FaceCardsListClass } from "./FaceCardsListClass";

export class SpeedGameManagerClass implements ISpeedGameManager {
    private gameState: SpeedGameStateEntity;

    constructor(
        id: string = generateId("speed-game"),
        options: Partial<SpeedGameOptions> = {}
    ) {
        this.gameState = {
            id,
            status: "INITIALIZING",
            options: {
                autoDraw: options.autoDraw ?? false,
                maxHandSize: options.maxHandSize ?? 5,
            },
            readyToFlip: {
                player1: false,
                player2: false,
            },
            players: {
                player1: {
                    hand: { id: generateId("p1-hand"), cards: [] },
                    drawPile: { id: generateId("p1-draw"), cards: [] },
                },
                player2: {
                    hand: { id: generateId("p2-hand"), cards: [] },
                    drawPile: { id: generateId("p2-draw"), cards: [] },
                },
            },
            center: {
                leftActive: { id: generateId("center-left-active"), cards: [] },
                rightActive: { id: generateId("center-right-active"), cards: [] },
                leftFlip: { id: generateId("center-left-flip"), cards: [] },
                rightFlip: { id: generateId("center-right-flip"), cards: [] },
            },
        };
    }

    public get state(): SpeedGameStateEntity {
        return this.gameState;
    }

    public start(
        options?: Partial<SpeedGameOptions>,
        customDeck?: FaceCardsListEntity
    ): SpeedGameStateEntity {
        if (options) {
            this.gameState.options = {
                ...this.gameState.options,
                ...options,
            };
        }

        // Prepare deck (either custom or fresh shuffled standard 52-card deck)
        let deckCards: FaceCardEntity[];
        if (customDeck) {
            deckCards = [...customDeck.cards];
        } else {
            const standardDeck = createStandardDeck();
            const deckList = new FaceCardsListClass();
            standardDeck.cards.forEach((card) => deckList.addFaceCard(card));
            deckList.shuffleList();
            deckCards = [...deckList.faceCardsList.cards];
        }

        // Deal cards according to Speed rules (52 total cards):
        // Player 1: 5 hand, 15 draw
        // Player 2: 5 hand, 15 draw
        // Center: 1 left active, 1 right active, 5 left flip, 5 right flip
        this.gameState.players.player1.hand.cards = deckCards.splice(0, 5);
        this.gameState.players.player1.drawPile.cards = deckCards.splice(0, 15);

        this.gameState.players.player2.hand.cards = deckCards.splice(0, 5);
        this.gameState.players.player2.drawPile.cards = deckCards.splice(0, 15);

        this.gameState.center.leftActive.cards = deckCards.splice(0, 1);
        this.gameState.center.rightActive.cards = deckCards.splice(0, 1);

        this.gameState.center.leftFlip.cards = deckCards.splice(0, 5);
        this.gameState.center.rightFlip.cards = deckCards.splice(0, 5);

        this.gameState.status = "PLAYING";
        this.gameState.winner = undefined;
        this.gameState.readyToFlip.player1 = false;
        this.gameState.readyToFlip.player2 = false;

        return this.gameState;
    }

    public playCard(
        playerId: PlayerId,
        cardId: string,
        targetPile: CenterPileTarget
    ): ActionResult<PlayCardFailureReason> {
        if (this.gameState.status !== "PLAYING") {
            return { success: false, reason: "GAME_NOT_IN_PROGRESS" };
        }

        const player = this.gameState.players[playerId];
        if (!player) {
            return { success: false, reason: "PLAYER_NOT_FOUND" };
        }

        const activePile =
            targetPile === "left"
                ? this.gameState.center.leftActive
                : this.gameState.center.rightActive;

        const topCard = activePile.cards[activePile.cards.length - 1];
        if (!topCard) {
            return { success: false, reason: "TARGET_PILE_EMPTY" };
        }

        const cardIndex = player.hand.cards.findIndex((c) => c.id === cardId);
        if (cardIndex === -1) {
            return { success: false, reason: "CARD_NOT_IN_HAND" };
        }

        const cardToPlay = player.hand.cards[cardIndex];
        if (!cardToPlay) {
            return { success: false, reason: "CARD_NOT_IN_HAND" };
        }

        if (!isCardPlayable(cardToPlay, topCard)) {
            return { success: false, reason: "CARD_NOT_PLAYABLE" };
        }

        // Execute play
        player.hand.cards.splice(cardIndex, 1);
        activePile.cards.push(cardToPlay);

        // Auto-draw if configured
        if (this.gameState.options.autoDraw) {
            while (
                player.hand.cards.length < this.gameState.options.maxHandSize &&
                player.drawPile.cards.length > 0
            ) {
                const drawn = player.drawPile.cards.pop();
                if (drawn) {
                    player.hand.cards.push(drawn);
                }
            }
        }

        // Board changed; reset stuck readiness for both players
        this.gameState.readyToFlip.player1 = false;
        this.gameState.readyToFlip.player2 = false;

        // Check win condition
        if (player.hand.cards.length === 0 && player.drawPile.cards.length === 0) {
            this.gameState.status = "FINISHED";
            this.gameState.winner = playerId;
        }

        return { success: true, state: this.gameState };
    }

    public drawCard(playerId: PlayerId): ActionResult<DrawCardFailureReason> {
        if (this.gameState.status !== "PLAYING") {
            return { success: false, reason: "GAME_NOT_IN_PROGRESS" };
        }

        const player = this.gameState.players[playerId];
        if (!player) {
            return { success: false, reason: "PLAYER_NOT_FOUND" };
        }

        if (player.hand.cards.length >= this.gameState.options.maxHandSize) {
            return { success: false, reason: "HAND_FULL" };
        }

        if (player.drawPile.cards.length === 0) {
            return { success: false, reason: "DRAW_PILE_EMPTY" };
        }

        const drawnCard = player.drawPile.cards.pop();
        if (!drawnCard) {
            return { success: false, reason: "DRAW_PILE_EMPTY" };
        }

        player.hand.cards.push(drawnCard);

        // Reset player's stuck status since hand state changed
        this.gameState.readyToFlip[playerId] = false;

        return { success: true, state: this.gameState };
    }

    public signalStuck(
        playerId: PlayerId
    ): ActionResult<SignalStuckFailureReason, { flipped: boolean }> {
        if (this.gameState.status !== "PLAYING") {
            return { success: false, reason: "GAME_NOT_IN_PROGRESS" };
        }

        if (this.gameState.readyToFlip[playerId]) {
            return { success: false, reason: "ALREADY_SIGNALED" };
        }

        this.gameState.readyToFlip[playerId] = true;

        // If both players signaled stuck, execute the flip
        if (
            this.gameState.readyToFlip.player1 &&
            this.gameState.readyToFlip.player2
        ) {
            const flipped = this.executeFlip();
            this.gameState.readyToFlip.player1 = false;
            this.gameState.readyToFlip.player2 = false;
            return { success: true, flipped, state: this.gameState };
        }

        return { success: true, flipped: false, state: this.gameState };
    }

    public forceFlip(): ActionResult<ForceFlipFailureReason> {
        if (this.gameState.status !== "PLAYING") {
            return { success: false, reason: "GAME_NOT_IN_PROGRESS" };
        }

        const flipped = this.executeFlip();
        if (!flipped) {
            return { success: false, reason: "FLIP_PILES_EMPTY" };
        }

        this.gameState.readyToFlip.player1 = false;
        this.gameState.readyToFlip.player2 = false;

        return { success: true, state: this.gameState };
    }

    public canPlayerPlay(playerId: PlayerId): boolean {
        return this.getPlayableMoves(playerId).length > 0;
    }

    public isStalled(): boolean {
        if (this.gameState.status !== "PLAYING") {
            return false;
        }
        return !this.canPlayerPlay("player1") && !this.canPlayerPlay("player2");
    }

    public getPlayableMoves(playerId: PlayerId): Array<{
        cardId: string;
        targetPile: CenterPileTarget;
    }> {
        const player = this.gameState.players[playerId];
        if (!player || this.gameState.status !== "PLAYING") {
            return [];
        }

        const leftTop =
            this.gameState.center.leftActive.cards[
                this.gameState.center.leftActive.cards.length - 1
            ];
        const rightTop =
            this.gameState.center.rightActive.cards[
                this.gameState.center.rightActive.cards.length - 1
            ];

        const moves: Array<{ cardId: string; targetPile: CenterPileTarget }> = [];

        for (const card of player.hand.cards) {
            if (leftTop && isCardPlayable(card, leftTop)) {
                moves.push({ cardId: card.id, targetPile: "left" });
            }
            if (rightTop && isCardPlayable(card, rightTop)) {
                moves.push({ cardId: card.id, targetPile: "right" });
            }
        }

        return moves;
    }

    /**
     * Executes flip from side reserve piles onto the active piles.
     * If flip piles are exhausted, recycles undercards from the active piles.
     */
    private executeFlip(): boolean {
        const { leftActive, rightActive, leftFlip, rightFlip } =
            this.gameState.center;

        if (leftFlip.cards.length > 0 && rightFlip.cards.length > 0) {
            const leftCard = leftFlip.cards.pop();
            const rightCard = rightFlip.cards.pop();
            if (leftCard) leftActive.cards.push(leftCard);
            if (rightCard) rightActive.cards.push(rightCard);
            return true;
        }

        // Both flip piles empty: recycle active discard piles (excluding top cards)
        if (leftActive.cards.length > 1 || rightActive.cards.length > 1) {
            const pool: FaceCardEntity[] = [];
            if (leftActive.cards.length > 1) {
                const underCards = leftActive.cards.splice(
                    0,
                    leftActive.cards.length - 1
                );
                pool.push(...underCards);
            }
            if (rightActive.cards.length > 1) {
                const underCards = rightActive.cards.splice(
                    0,
                    rightActive.cards.length - 1
                );
                pool.push(...underCards);
            }

            // Shuffle recycled pool
            for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const itemI = pool[i];
                const itemJ = pool[j];
                if (itemI && itemJ) {
                    pool[i] = itemJ;
                    pool[j] = itemI;
                }
            }

            const half = Math.ceil(pool.length / 2);
            leftFlip.cards.push(...pool.slice(0, half));
            rightFlip.cards.push(...pool.slice(half));

            if (leftFlip.cards.length > 0 && rightFlip.cards.length > 0) {
                const leftCard = leftFlip.cards.pop();
                const rightCard = rightFlip.cards.pop();
                if (leftCard) leftActive.cards.push(leftCard);
                if (rightCard) rightActive.cards.push(rightCard);
                return true;
            }
        }

        return false;
    }
}
