/**
 * Generates a unique identifier.
 * Uses `globalThis.crypto.randomUUID()` when available (Node 19+, modern browsers, Bun, Deno).
 * Falls back to a timestamped pseudo-random string for non-secure browser contexts or legacy runtimes.
 *
 * @param prefix Optional prefix for the fallback ID format.
 */
export function generateId(prefix: string = "entity"): string {
    if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}
