import type {
    FaceCardEntity,
    Suite,
    Face,
} from "../types";

export class FaceCardClass {
    private faceCardEntity: FaceCardEntity;

    constructor(face: Face, suite: Suite) {
        const id = `${face}-${suite}`;
        this.faceCardEntity = { id, face, suite };
    }

    public get faceCard(): FaceCardEntity {
        return this.faceCardEntity;
    }
}
