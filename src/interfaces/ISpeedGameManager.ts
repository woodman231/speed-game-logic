import type {
    PlayerId,
    SpeedGameStateEntity,
    SpeedGameOptions,
    CenterPileTarget,
    FaceCardsListEntity,
    ActionResult,
    PlayCardFailureReason,
    DrawCardFailureReason,
    SignalStuckFailureReason,
    ForceFlipFailureReason,
} from "../types";

export interface ISpeedGameManager {
    readonly state: SpeedGameStateEntity;

    /**
     * Starts a new game with optional custom deck and gameplay options.
     */
    start(
        options?: Partial<SpeedGameOptions>,
        customDeck?: FaceCardsListEntity
    ): SpeedGameStateEntity;

    /**
     * Plays a card from a player's hand onto a target center active pile.
     */
    playCard(
        playerId: PlayerId,
        cardId: string,
        targetPile: CenterPileTarget
    ): ActionResult<PlayCardFailureReason>;

    /**
     * Draws one card from the player's draw pile into their hand.
     */
    drawCard(playerId: PlayerId): ActionResult<DrawCardFailureReason>;

    /**
     * Signals that a player is stuck and requests a flip.
     * When both players signal stuck, reserve flip cards are automatically placed onto the active piles.
     */
    signalStuck(
        playerId: PlayerId
    ): ActionResult<SignalStuckFailureReason, { flipped: boolean }>;

    /**
     * Forces a flip from the side reserve piles onto the active piles (administrative / timeout).
     */
    forceFlip(): ActionResult<ForceFlipFailureReason>;

    /**
     * Checks whether a player can play any card from their hand.
     */
    canPlayerPlay(playerId: PlayerId): boolean;

    /**
     * Checks if neither player can make a legal play.
     */
    isStalled(): boolean;

    /**
     * Returns all legal plays available to a player.
     */
    getPlayableMoves(playerId: PlayerId): Array<{
        cardId: string;
        targetPile: CenterPileTarget;
    }>;
}
