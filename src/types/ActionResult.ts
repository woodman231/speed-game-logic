import type { SpeedGameStateEntity } from "./SpeedGameStateEntity";

export type PlayCardFailureReason =
    | "GAME_NOT_IN_PROGRESS"
    | "PLAYER_NOT_FOUND"
    | "CARD_NOT_IN_HAND"
    | "TARGET_PILE_EMPTY"
    | "CARD_NOT_PLAYABLE";

export type DrawCardFailureReason =
    | "GAME_NOT_IN_PROGRESS"
    | "PLAYER_NOT_FOUND"
    | "HAND_FULL"
    | "DRAW_PILE_EMPTY";

export type SignalStuckFailureReason =
    | "GAME_NOT_IN_PROGRESS"
    | "PLAYER_NOT_FOUND"
    | "ALREADY_SIGNALED";

export type ForceFlipFailureReason =
    | "GAME_NOT_IN_PROGRESS"
    | "FLIP_PILES_EMPTY";

export type ActionResult<TReason = string, TExtra = {}> =
    | ({ success: true; state: SpeedGameStateEntity } & TExtra)
    | { success: false; reason: TReason };
