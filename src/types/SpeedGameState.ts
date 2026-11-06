import type { SpeedGameStatus } from "./SpeedGameStatus";
import type { PlayerId } from "./PlayerId";
import type { FaceCardsListEntity } from "./FaceCardsListEntity";
import type { SpeedGameOptions } from "./SpeedGameOptions";

export type SpeedGameState = {
    status: SpeedGameStatus;
    winner?: PlayerId | undefined;
    options: SpeedGameOptions;
    readyToFlip: {
        player1: boolean;
        player2: boolean;
    };
    players: {
        player1: {
            hand: FaceCardsListEntity;
            drawPile: FaceCardsListEntity;
        };
        player2: {
            hand: FaceCardsListEntity;
            drawPile: FaceCardsListEntity;
        };
    };
    center: {
        leftActive: FaceCardsListEntity;
        rightActive: FaceCardsListEntity;
        leftFlip: FaceCardsListEntity;
        rightFlip: FaceCardsListEntity;
    };
};
