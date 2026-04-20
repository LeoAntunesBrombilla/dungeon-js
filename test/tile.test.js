import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FLOOR, WALL } from "../src/world/tile.mjs";

describe("tiles", () => {
  it("FLOOR tile should have correct properties", () => {
    assert.strictEqual(FLOOR.glyph, ".");
    assert.strictEqual(FLOOR.walkable, true);
    assert.strictEqual(FLOOR.transparent, true);
  });

  it("WALL tile should have correct properties", () => {
    assert.strictEqual(WALL.glyph, "#");
    assert.strictEqual(WALL.walkable, false);
    assert.strictEqual(WALL.transparent, false);
  });
});
