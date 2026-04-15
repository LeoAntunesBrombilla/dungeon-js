# Dungeon.js — A JavaScript Roguelike Game Engine

## Learn JS deeply by building a real game from scratch

> Pure JavaScript. No frameworks. No libraries (except for testing).
> Node.js only — runs in the terminal.

---

## What is a Roguelike?

Before anything else — you've never built a game, so here are the core ideas you need.

A roguelike is a dungeon-crawling game where:

- The **map** is a grid (2D array). Each cell is a wall, floor, door, trap, etc.
- The **player** moves tile by tile (up/down/left/right). No real-time physics.
- **Enemies** take turns after the player moves. This is called a **turn-based game loop**.
- **Dungeons are generated randomly** — every playthrough is different.
- The player has **stats** (HP, attack, defense) and an **inventory** (sword, potions, etc).
- When you die, it's over. No save scumming. This is called **permadeath**.

### The game loop (most important concept)

Every game works like this, forever:

```
1. Wait for player input
2. Process player action (move, attack, use item)
3. Process enemy actions (AI decides what each enemy does)
4. Update the world (traps trigger, effects tick, items decay)
5. Render the new state to the screen
6. Go to 1
```

That's it. Every game from Pong to Elden Ring follows this pattern. Yours will too.

### The grid

Your dungeon is a 2D array:

```
################
#..............#
#...G..........#
#..............#
#......@.......#    @ = player, G = goblin
#..............#    # = wall, . = floor
#..........$$..#    $ = gold
################
```

Each "thing" on the grid is an **entity** with a position `{x, y}` and properties.

### Turns, not frames

Unlike action games, nothing happens until the player presses a key.
When the player acts, every enemy gets one action too. Then the world waits again.
This is **much simpler** than real-time games and perfect for learning.

---

## Project Architecture

```
dungeon-js/
├── src/
│   ├── core/
│   │   ├── gameLoop.mjs          ← the main tick cycle
│   │   ├── eventBus.mjs          ← publish/subscribe system
│   │   └── logger.mjs            ← game log stream (Writable stream)
│   ├── world/
│   │   ├── dungeonGenerator.mjs  ← procedural map creation (generators)
│   │   ├── tile.mjs              ← tile types and properties
│   │   └── worldMap.mjs          ← the grid, FOV, pathfinding
│   ├── entities/
│   │   ├── entity.mjs            ← base prototype
│   │   ├── player.mjs            ← player-specific behavior
│   │   ├── monster.mjs           ← monster AI and behaviors
│   │   └── item.mjs              ← items, equipment, consumables
│   ├── systems/
│   │   ├── combat.mjs            ← damage calc, hits, crits
│   │   ├── inventory.mjs         ← item management
│   │   ├── effects.mjs           ← buffs, debuffs, poison, etc
│   │   └── movement.mjs         ← collision, interaction triggers
│   ├── io/
│   │   ├── renderer.mjs          ← draws the grid to terminal
│   │   ├── input.mjs             ← keyboard handling (stdin stream)
│   │   └── saveLoad.mjs          ← serialization to JSON (file streams)
│   └── index.mjs                 ← entry point, wires everything
├── test/
│   ├── combat.test.mjs
│   ├── dungeon.test.mjs
│   ├── entity.test.mjs
│   ├── inventory.test.mjs
│   ├── coercion.test.mjs         ← tests that prove you understand type quirks
│   └── references.test.mjs       ← tests for value vs reference traps
├── logs/
│   └── game.log                  ← written by the logger stream
├── saves/
│   └── (save files go here)
├── package.json
└── README.md
```

All files use **ES Modules** (`.mjs`, `import`/`export`). No CommonJS.

---

## Phase 1 — The Foundation (Week 1-2)

### Goal: A player walking around a hardcoded map

### Tasks

1. **Set up the project** — `package.json` with `"type": "module"`, install `node:test` (built-in), create the folder structure.

2. **Build `tile.mjs`** — Define tile types as plain objects. A tile has a `glyph` (character to display), `walkable` (boolean), `transparent` (boolean), `color` (string).

3. **Build `worldMap.mjs`** — The dungeon grid. A class that holds a 2D array of tiles. Methods: `getTile(x, y)`, `setTile(x, y, tile)`, `isWalkable(x, y)`, `getWidth()`, `getHeight()`. Start with a hardcoded 20x20 room.

4. **Build `entity.mjs`** — Base entity using **prototypal delegation** (not classes). An entity has `pos: {x, y}`, `glyph`, `name`, `stats: {hp, maxHp, attack, defense}`. Use `Object.create()` to build the prototype chain.

5. **Build `player.mjs`** — Delegates to Entity. Adds `inventory: []`, `level`, `xp`. Has a `move(dx, dy)` method that checks `worldMap.isWalkable()`.

6. **Build `renderer.mjs`** — Reads the map and entities, composites them into a string grid, prints to stdout. Use `process.stdout.write()` with ANSI escape codes for colors and cursor movement.

7. **Build `input.mjs`** — Listen to `process.stdin` in raw mode. Parse arrow keys and WASD. This is your first **readable stream** — stdin is a Node.js ReadableStream. Emit events via the event bus.

8. **Build `gameLoop.mjs`** — The core loop. Waits for input → processes action → renders. Wire everything together in `index.mjs`.

### JS Concepts You'll Hit

| Concept | Where it shows up |
|---|---|
| **ES Modules** | Every file. `import`/`export`, live bindings vs CommonJS copies, circular dependency traps |
| **Scope & Closures** | Input handler closes over game state. The renderer closes over the map reference |
| **`this` & Prototypes** | Entity system built with `Object.create()`, prototype delegation chain |
| **Value vs Reference** | Player position `{x, y}` is an object — passing it around means shared reference. Clone it or mutate it? |
| **Types & Coercion** | Tile lookups: `map[y][x]` where x/y might be strings from input parsing. `"3" + 1` vs `"3" - 1` |
| **Streams** | `process.stdin` as a Readable, `process.stdout` as a Writable |

### Unit Tests (using `node:test`)

- `worldMap`: `isWalkable` returns correct values for walls vs floors
- `entity`: prototype chain works — `player` delegates to `Entity` correctly
- `movement`: player can't walk through walls
- `coercion traps`: write tests that prove `"3" + 1 !== "3" - 1`, that `null == undefined` but `null !== undefined`, etc — a "type journal" in test form

---

## Phase 2 — Combat & Entities (Week 3-4)

### Goal: Player fights monsters, things die, loot drops

### Tasks

1. **Build `monster.mjs`** — Delegates to Entity. Has `behavior` (a closure that defines AI). Start simple: monsters that just chase the player. The `behavior` is a **factory function** that returns a `takeTurn()` function, closing over the monster's state.

2. **Build `combat.mjs`** — Damage formula: `damage = attacker.stats.attack - defender.stats.defense + roll(1,4)`. Handle edge cases: what if `attack` is a string? What if someone passes `undefined`? Use **explicit coercion** (`Number(x)`) and validate with `Number.isNaN()` and `Number.isFinite()`.

3. **Build `item.mjs`** — Items as objects with a prototype chain: `BaseItem → Weapon`, `BaseItem → Consumable`, `BaseItem → Armor`. Use `Symbol` for unique item IDs so no two items collide even if they have the same name.

4. **Build `inventory.mjs`** — The inventory is an **array** with fixed slots (like a real game inventory). Empty slots are `null` (explicitly empty). Slots that don't exist yet are `undefined` (the array is sparse). You'll directly hit the `null` vs `undefined` distinction from YDKJS.

5. **Build `effects.mjs`** — Buffs and debuffs. A poison effect is a **closure**: `createPoison(damage, turns)` returns a function that, each turn, decrements `turns` and applies `damage`. When `turns` hits 0, the effect removes itself. This is closures in action.

6. **Build `eventBus.mjs`** — A publish/subscribe system. `on(event, callback)`, `emit(event, data)`, `off(event, callback)`. The callbacks are stored in a `Map`. Use `WeakRef` for optional weak listeners that auto-cleanup when entities are garbage collected.

### JS Concepts You'll Hit

| Concept | Where it shows up |
|---|---|
| **Closures (deep)** | Monster AI behaviors, effect timers, event callbacks all close over state |
| **Coercion (explicit vs implicit)** | Combat math must handle bad inputs. `String(damage)` for the log vs `+inputStr` for parsing |
| **`null` vs `undefined`** | Inventory slots: `null` = empty slot, `undefined` = slot doesn't exist |
| **`NaN` and `Number.isNaN`** | Combat: what happens when you compute `undefined - 5`? You get `NaN`. Catch it. |
| **`Symbol`** | Unique item IDs. `Symbol("sword")` !== `Symbol("sword")` |
| **`WeakRef` / `WeakMap`** | Event listeners that don't prevent garbage collection of dead entities |
| **`Object.is()`** | Comparing special values in combat: is damage `-0`? is result `NaN`? |
| **`this` binding (all 4 rules)** | When you pass `monster.takeTurn` as a callback to the turn system, `this` breaks → fix with `.bind()` or arrow functions |

### Unit Tests

- `combat`: damage never returns `NaN`, always a finite number
- `combat`: defense higher than attack still does minimum 0 (not negative) damage
- `inventory`: adding to a `null` slot works, accessing `undefined` slot throws
- `effects`: poison ticks down correctly, removes itself at 0
- `eventBus`: listeners fire, `off` unsubscribes, events with no listeners don't crash

---

## Phase 3 — Procedural Generation & Streams (Week 5-6)

### Goal: Random dungeons, game logging, save/load

### Tasks

1. **Build `dungeonGenerator.mjs`** — This is the star. Use a **generator function** (`function*`) that yields rooms one at a time. The algorithm:
   - Start with a grid of walls
   - Pick a random point, carve a room (set tiles to floor)
   - `yield` the room data `{x, y, width, height}`
   - Pick a wall adjacent to an existing room, carve a corridor
   - Repeat N times
   - The caller controls how many rooms to generate by consuming the iterator

2. **Build `logger.mjs`** — A custom **Writable stream** that logs game events to a file. Extend `stream.Writable`, implement `_write()`. Every combat hit, item pickup, room entry gets piped here. Create a **Transform stream** that formats raw event objects into readable log lines before writing.

3. **Build `saveLoad.mjs`** — Serialize the entire game state to JSON and write it to disk using `fs.createWriteStream()`. Load it back with `fs.createReadStream()` and **pipe** it through a Transform that parses the JSON. This is where you hit value vs reference hard: when you serialize, references become copies. When you deserialize, you need to reconstruct the reference graph.

4. **Add fog of war to `worldMap.mjs`** — The player can only see tiles within a certain radius. Use **bitwise operators** (`| 0` for truncation, `<<` for flags) to store tile visibility states efficiently in a 32-bit integer per tile: bit 0 = explored, bit 1 = currently visible.

5. **Build a pipe chain** — `stdin → inputParser (Transform) → gameLoop → eventLogger (Transform) → logFile (Writable)`. Wire the game as a stream pipeline.

### JS Concepts You'll Hit

| Concept | Where it shows up |
|---|---|
| **Generators & Iterators** | Dungeon generation yields rooms lazily. `for...of` consumes the iterator. You control generation with `.next()` and can pass values back in |
| **Streams & Pipes** | Logger as Writable, input as Readable, formatters as Transform. `pipeline()` from `stream/promises` |
| **Bitwise operators** | Tile visibility flags using `&`, `|`, `<<`, `>>`. Forces you into 32-bit integer territory from YDKJS |
| **JSON serialization quirks** | `JSON.stringify(-0)` gives `"0"`. `undefined` properties vanish. `Symbol` keys disappear. Functions can't be serialized. You hit every gotcha from the book |
| **Value vs Reference (deep)** | After deserialization, two rooms that used to share a reference to the same loot table are now independent copies. You must rebuild references manually |
| **`void` operator** | Useful in stream callbacks where you need to ensure no return value: `return void callback()` |

### Unit Tests

- `dungeonGenerator`: generates exactly N rooms, all rooms are within bounds, no room overlaps
- `dungeonGenerator`: generator can be paused and resumed with `.next()`
- `logger`: writes correctly formatted lines to a mock stream
- `saveLoad`: round-trip — save and load produces identical game state
- `saveLoad`: special values survive serialization (or you document which ones don't and why)
- `bitwise`: visibility flags set and unset correctly

---

## Phase 4 — Advanced Patterns & Performance (Week 7-8)

### Goal: Smart enemies, reactive stats, optimized hot paths

### Tasks

1. **Pathfinding (A\* algorithm) in `worldMap.mjs`** — Enemies need to find the player. Implement A* pathfinding. This becomes your **performance lab**: profile it with `performance.now()`, optimize with typed arrays (`Int32Array` for the distance grid), benchmark different approaches.

2. **Reactive stats with `Proxy`** — Wrap entity stats in a `Proxy`. When HP drops to 0, automatically trigger death. When attack changes, recalculate damage preview. When an invalid value is set (like `NaN` or a string), the Proxy rejects it. This is **meta-programming**.

3. **Advanced monster AI** — State machine: `idle → patrol → chase → attack → flee`. Each state is a **closure** that returns the next state. The monster's `takeTurn()` calls the current state function, which returns either an action or a new state transition. Compose behaviors with **higher-order functions**: `compose(canSee(player), isLowHP)` to create complex decision logic.

4. **Memory optimization** — Use `WeakMap` to associate private data with entities without preventing garbage collection when entities die. Profile memory usage with `process.memoryUsage()`. Compare object shapes and hidden classes (V8 optimization).

5. **Benchmark suite** — Using `performance.now()` and `node:test`, build a benchmark for: pathfinding on small vs large maps, rendering speed, entity creation (prototype vs class vs factory). Understand why V8 optimizes certain patterns.

### JS Concepts You'll Hit

| Concept | Where it shows up |
|---|---|
| **Proxy & Reflect** | Reactive stats system, input validation at the property level |
| **Higher-order functions** | AI composition: functions that take functions and return functions |
| **Closures (advanced)** | State machine states are closures that capture the entity's context |
| **Performance** | Profiling A*, typed arrays, V8 optimization patterns, deoptimization traps |
| **`WeakMap`** | Private entity data that doesn't leak memory |
| **Prototypes (deep)** | Benchmark prototype delegation vs class vs factory — understand the actual performance difference |
| **Typed Arrays** | `Int32Array` for pathfinding grid — understand ArrayBuffer, views, and byte-level control |

### Unit Tests

- `pathfinding`: finds shortest path, handles no-path-exists, handles large maps within time budget
- `proxy`: rejects `NaN`, strings, negative-beyond-zero HP; triggers death event at HP 0
- `AI`: state transitions work correctly through full cycle
- `benchmark`: pathfinding completes in < X ms for a 100x100 map (performance regression test)

---

## Phase 5 — Polish & Integration (Week 9-10)

### Goal: A playable, complete game

### Tasks

1. **Multiple dungeon levels** — Stairs down generate a new floor using the generator. Stairs up take you back. Floors are cached in a `Map`.

2. **Full command system** — Parse complex commands: `/use potion on self`, `/throw sword at goblin`, `/inspect chest`. Build a recursive descent parser (great for understanding **grammar** from YDKJS Chapter 5).

3. **Leaderboard** — Track high scores. Read/write with streams. Use `Intl.NumberFormat` for locale-aware score display.

4. **Error boundaries** — Wrap subsystems in try/catch. No single bug should crash the game. Log errors to the stream logger. Use custom error types that extend `Error`.

5. **Full test suite** — Integration tests that simulate a full game: spawn player, generate dungeon, fight monster, pick up item, save, load, verify state. Use `describe`/`it` blocks from `node:test`.

6. **README with architecture docs** — Document your prototype chains, your stream pipelines, your closure patterns. This is where you prove you understand the concepts.

---

## Concept Checklist

Track your progress. Every concept from YDKJS and beyond:

| Concept | Phase | Confidence |
|---|---|---|
| Types (`typeof`, `null` bug, `undefined` vs undeclared) | 1-2 | ☐ |
| Values (arrays, strings, numbers, special values) | 1-2 | ☐ |
| Coercion (explicit vs implicit, `==` vs `===`, `ToNumber`, `ToString`) | 2 | ☐ |
| Scope (lexical, function vs block, hoisting) | 1 | ☐ |
| Closures (data privacy, factories, callbacks) | 2-4 | ☐ |
| `this` (default, implicit, explicit, `new`) | 1-2 | ☐ |
| Prototypes (`Object.create`, delegation, `__proto__`) | 1-2 | ☐ |
| ES Modules (live bindings, circular deps, `import`/`export`) | 1 | ☐ |
| Generators & Iterators (`function*`, `yield`, `for...of`) | 3 | ☐ |
| Promises & async patterns | 3-4 | ☐ |
| Streams (Readable, Writable, Transform, `pipeline`) | 3 | ☐ |
| Bitwise operators (`|`, `&`, `<<`, `>>`, `| 0` truncation) | 3 | ☐ |
| `Symbol` (unique keys, well-known symbols) | 2 | ☐ |
| `Proxy` & `Reflect` (meta-programming) | 4 | ☐ |
| `WeakMap` / `WeakRef` (memory-safe associations) | 2-4 | ☐ |
| Typed Arrays (`Int32Array`, `ArrayBuffer`) | 4 | ☐ |
| JSON quirks (`-0`, `undefined`, `Symbol`, `toJSON`) | 3 | ☐ |
| `Object.is()`, `Number.EPSILON`, `Number.isNaN` | 2 | ☐ |
| Value vs Reference (copy vs shared, `.slice()`, deep clone) | 1-5 | ☐ |
| Performance (profiling, V8 optimization, benchmarking) | 4 | ☐ |
| Error handling (custom errors, try/catch boundaries) | 5 | ☐ |
| Unit testing (`node:test`, assertions, mocking) | 1-5 | ☐ |

---

## Game Design Cheat Sheet

Things you need to know that aren't JavaScript:

**Entity-Component pattern (simplified)**: Everything in the game is an "entity" (player, goblin, sword, potion). Entities have properties that define what they can do. A sword has `{damage: 5}`. A potion has `{effect: healHP, amount: 10}`. A goblin has `{hp: 10, behavior: chase}`. You don't need a fancy ECS framework — plain objects and prototypes are enough.

**Tile-based movement**: The map is a grid. Moving means changing `entity.pos.x` or `entity.pos.y` by 1. Before moving, check if the target tile is walkable. If there's a monster there, attack instead. If there's an item, pick it up. Simple conditionals, no physics.

**Turn order**: After the player acts, loop through all monsters and call their `takeTurn()`. That's it. No complex timing, no frame rate, no delta time.

**Random number generation**: `Math.floor(Math.random() * (max - min + 1)) + min` gives a random integer in `[min, max]`. Use this for damage rolls, loot drops, dungeon generation.

**FOV (Field of View)**: The simplest approach is just distance-based: if `Math.sqrt(dx*dx + dy*dy) <= radius`, the tile is visible. Later you can add raycasting for wall blocking.

**Stat formulas**: Keep them simple. `damage = attack - defense + random(1, 4)`. If damage < 0, set to 0. HP = HP - damage. If HP <= 0, entity dies. Don't overthink this.

---

## How to Start

1. Create the folder structure
2. Build `tile.mjs` and `worldMap.mjs` with a hardcoded room
3. Build `renderer.mjs` — just print the grid to the terminal
4. Build `entity.mjs` and `player.mjs` with `Object.create()`
5. Build `input.mjs` — read arrow keys from stdin
6. Wire it all together in `gameLoop.mjs` and `index.mjs`
7. You should now see an `@` walking around a room

That first moment of seeing `@` move is when the project becomes real. Everything else builds from there.
