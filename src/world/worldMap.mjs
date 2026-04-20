import { WALL, FLOOR, DOOR } from "../world/tile.mjs";

export const createWorldMap = (width, height) => {
  const grid = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => WALL),
  );

  return {
    getTile(x, y) {
      if (x < 0 || x >= width || y < 0 || y >= height) {
        return null; // Out of bounds
      }
      return grid[y][x];
    },
    setTile(x, y, tile) {
      if (x < 0 || x >= width || y < 0 || y >= height) {
        return false; //Out of bounds
      }
      grid[y][x] = tile;
      return true;
    },
    isWalkable(x, y) {
      const tile = getTile(x, y);
      return tile === FLOOR || tile === DOOR;
    },
    getWidth() {
      return width;
    },
    getHeight() {
      return height;
    },
  };
};
