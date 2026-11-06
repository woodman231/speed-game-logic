import { describe, it, expect } from "vitest";
import { generateId } from "./generateId";

describe("generateId", () => {
    it("should generate non-empty unique string IDs", () => {
        const id1 = generateId();
        const id2 = generateId();

        expect(typeof id1).toBe("string");
        expect(id1.length).toBeGreaterThan(0);
        expect(id1).not.toBe(id2);
    });

    it("should accept custom prefix for fallback formatting", () => {
        const id = generateId("deck");
        expect(typeof id).toBe("string");
        expect(id.length).toBeGreaterThan(0);
    });
});
