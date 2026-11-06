# @woodman231/speed-game-logic

A headless, zero-dependency game engine and state manager for the classic card game **[Speed](https://en.wikipedia.org/wiki/Speed_(card_game))** written in TypeScript.

Designed to be isomorphic and lightweight: works natively in **Node.js**, **browsers**, **edge runtimes**, and game servers over UDP/WebSockets.

---

## Features

- ⚡ **Complete Speed Game Rules**: 52-card distribution, circular rank adjacency (Ace connects to 2 and King), win detection, and active pile recycling.
- 🤝 **Social "I'm Stuck" Agreement**: Multi-player readiness tracking (`signalStuck`) before reserve flips occur.
- 🖐️ **Authentic Mechanics**: Supports both manual clicking to draw cards and automatic replenishing (`autoDraw`).
- 🌐 **Network Ready**: Deterministic action returns (`ActionResult`) with explicit success/failure reasons—never crashes your network loop with unhandled exceptions.
- 📦 **Dual ESM & CommonJS**: Shipped with complete TypeScript type declarations (`.d.ts` and `.d.cts`).
- 🧪 **Thoroughly Tested**: Comprehensive unit test suite with 100% rule coverage.

---

## Installation

```bash
npm install @woodman231/speed-game-logic
```

---

## Quickstart

```ts
import { SpeedGameManagerClass } from "@woodman231/speed-game-logic";

// 1. Create a game manager instance
const game = new SpeedGameManagerClass("game-123", {
  autoDraw: false, // Set to true for auto-replenishing hand
  maxHandSize: 5,
});

// 2. Start the game (deals all 52 cards)
game.start();

console.log("Game status:", game.state.status); // "PLAYING"
console.log("Left active top card:", game.state.center.leftActive.cards.at(-1));

// 3. Check playable moves for Player 1
const validMoves = game.getPlayableMoves("player1");
console.log("Available moves:", validMoves);

// 4. Play a card
if (validMoves.length > 0) {
  const move = validMoves[0]!;
  const result = game.playCard("player1", move.cardId, move.targetPile);

  if (result.success) {
    console.log("Card played! Updated state:", result.state);
  } else {
    console.warn("Play rejected:", result.reason);
  }
}

// 5. Draw a card from draw pile (when autoDraw is false)
const drawResult = game.drawCard("player1");
if (drawResult.success) {
  console.log("Drew a card into hand");
}

// 6. Handle "I'm Stuck" flip agreement
game.signalStuck("player1"); // player1 is ready to flip
const flipResult = game.signalStuck("player2"); // player2 agrees -> flips reserve cards!
console.log("Flipped reserve cards:", flipResult.flipped);
```

---

## Card Distribution Reference

A standard 52-card deck is distributed at the start of a match:

| Pile | Owner / Location | Initial Card Count |
| :--- | :--- | :--- |
| **Player 1 Hand** | Player 1 | 5 cards |
| **Player 1 Draw Pile** | Player 1 | 15 cards (face-down) |
| **Player 2 Hand** | Player 2 | 5 cards |
| **Player 2 Draw Pile** | Player 2 | 15 cards (face-down) |
| **Left Active Pile** | Center Table | 1 card (face-up) |
| **Right Active Pile** | Center Table | 1 card (face-up) |
| **Left Flip Pile** | Center Table | 5 cards (face-down) |
| **Right Flip Pile** | Center Table | 5 cards (face-down) |
| **Total** | | **52 cards** |

---

## API Reference

### `SpeedGameManagerClass`
The primary state container and rule engine implementing `ISpeedGameManager`.

- `start(options?, customDeck?)`: Resets and deals cards.
- `playCard(playerId, cardId, targetPile)`: Plays a card onto `"left"` or `"right"` active pile.
- `drawCard(playerId)`: Draws one card from player's draw pile to hand.
- `signalStuck(playerId)`: Declares player cannot move. Flips reserve piles when both players agree.
- `forceFlip()`: Administrative / timeout force flip.
- `canPlayerPlay(playerId)`: Returns `boolean` whether player has valid plays.
- `isStalled()`: Returns `boolean` whether neither player has valid moves.
- `getPlayableMoves(playerId)`: Returns array of valid `{ cardId, targetPile }`.

### Standalone Utilities
- `isCardPlayable(cardToPlay, targetCard)`: Returns `boolean` checking circular $\pm 1$ rank rule.
- `createStandardDeck()`: Generates a full standard 52-card deck entity.
- `generateId(prefix?)`: Universal, secure UUID / fallback generator.

---

## License

MIT © [woodman231](https://github.com/woodman231)
