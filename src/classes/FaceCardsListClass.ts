import type { FaceCardEntity, FaceCardsListEntity } from "../types";
import { generateId } from "../utils";

export class FaceCardsListClass {
    private faceCardsListEntity: FaceCardsListEntity;

    constructor(id: string = generateId("cards-list")) {
        this.faceCardsListEntity = { id, cards: [] };
    }

    public get faceCardsList(): FaceCardsListEntity {
        return this.faceCardsListEntity;
    }

    public addFaceCard(faceCard: FaceCardEntity) {
        this.faceCardsListEntity.cards.push(faceCard);
    }

    public isCardInList(faceCard: FaceCardEntity): boolean {
        return this.faceCardsListEntity.cards.some(
            (card) => card.id === faceCard.id
        );
    }

    public removeFaceCard(faceCard: FaceCardEntity) {
        this.faceCardsListEntity.cards = this.faceCardsListEntity.cards.filter(
            (card) => card.id !== faceCard.id
        );
    }

    public clearList() {
        this.faceCardsListEntity.cards = [];
    }

    public getCardById(id: string): FaceCardEntity | undefined {
        return this.faceCardsListEntity.cards.find(
            (card) => card.id === id
        );
    }

    public shuffleList() {
        const cards = this.faceCardsListEntity.cards;
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const cardI = cards[i];
            const cardJ = cards[j];

            if (cardI !== undefined && cardJ !== undefined) {
                cards[i] = cardJ;
                cards[j] = cardI;
            }
        }
    }
}
