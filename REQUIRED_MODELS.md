# Required models

Every object in the Christmas room is currently built from primitive geometries and procedural canvas textures. The table below lists the assets to replace them with.

**Conventions for delivered models**

- Format: `.glb` (glTF binary), Draco/Meshopt compression welcome. Place in `static/models/`.
- Units: **meters**, **Y up**, and the object's **front facing +Z**.
- Origin: **centered on X/Z, resting on the floor (y = 0)** unless noted otherwise.
- Keep materials PBR (metal/rough). Emissive parts (bulbs, flames, lamp shade) should be separate meshes/materials so they can glow.
- Target sizes below match the current placeholders and their colliders in [`src/lib/game/world.ts`](src/lib/game/world.ts). If a model differs, update `SIZES`/`LAYOUT` there.

## Furniture

| Asset                         | Placeholder component                                             | Target size (W × H × D) | Notes                                                                                                                        |
| ----------------------------- | ----------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Sofa (×2, one model is fine)  | [`Sofa.svelte`](src/lib/3d/furniture/Sofa.svelte)                 | 2.3 × 0.85 × 0.95       | Plush, classic. Pillows and blanket as separate meshes if possible.                                                          |
| Rocking chair                 | [`RockingChair.svelte`](src/lib/3d/furniture/RockingChair.svelte) | 0.7 × 1.1 × 0.9         | Wooden spindle back. Origin at the **rocker curve's center** helps the rocking animation (or at the floor and we'll offset). |
| Coffee table                  | [`CoffeeTable.svelte`](src/lib/3d/furniture/CoffeeTable.svelte)   | 1.6 × 0.46 × 0.8        | Dark wood, rectangular, lower shelf.                                                                                         |
| Bookshelves                   | [`Bookshelves.svelte`](src/lib/3d/furniture/Bookshelves.svelte)   | 3.6 × 3.6 × 0.42        | Tall wall unit with 3 bays and 7 levels. Books can be baked in or come as a separate model.                                  |
| Rolling library ladder + rail | [`Bookshelves.svelte`](src/lib/3d/furniture/Bookshelves.svelte)   | ~0.55 wide, 3.35 long   | Hooks onto a brass rail at y ≈ 3.3. Wheels at the bottom.                                                                    |
| Floor lamp                    | [`FloorLamp.svelte`](src/lib/3d/furniture/FloorLamp.svelte)       | 0.4 × 1.75 × 0.4        | Classic brass pole with a fabric shade. Shade as its own mesh.                                                               |
| Chandelier                    | [`Chandelier.svelte`](src/lib/3d/furniture/Chandelier.svelte)     | ~0.9 Ø, ~1.1 tall       | Brass, 6 candle arms. **Origin at the ceiling mount point**.                                                                 |

## Fireplace & mantel

| Asset                                             | Placeholder component                                           | Target size                                   | Notes                                                                                        |
| ------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| White fireplace surround + mantel                 | [`Fireplace.svelte`](src/lib/3d/furniture/Fireplace.svelte)     | 2.8 × 1.4 × 0.5 (mantel shelf 3.0 × 0.8 deep) | Firebox opening ~1.0 × 0.85. Hearth slab 2.9 × 0.6. Origin at the floor, center of the body. |
| Logs + fire                                       | [`Fireplace.svelte`](src/lib/3d/furniture/Fireplace.svelte)     | fits the 1.0 × 0.85 opening                   | Logs as a model. Flames could stay procedural or become an animated sprite/flipbook.         |
| Mantel clock                                      | [`MantelDecor.svelte`](src/lib/3d/furniture/MantelDecor.svelte) | 0.34 × 0.55 × 0.14                            | Wooden, arched top.                                                                          |
| Framed picture                                    | [`MantelDecor.svelte`](src/lib/3d/furniture/MantelDecor.svelte) | 1.1 × 0.8                                     | Gilded frame. The painting can be a texture (a winter landscape).                            |
| Christmas stockings (×5)                          | [`MantelDecor.svelte`](src/lib/3d/furniture/MantelDecor.svelte) | ~0.26 × 0.5                                   | Red & white, knitted variants. Origin at the hanging loop.                                   |
| Small mantel ornaments, candlesticks, nutcrackers | [`MantelDecor.svelte`](src/lib/3d/furniture/MantelDecor.svelte) | 0.1 to 0.45 tall                              |                                                                                              |
| Evergreen garland                                 | [`MantelDecor.svelte`](src/lib/3d/furniture/MantelDecor.svelte) | ~3.1 long                                     | Scalloped. Small bulbs as separate emissive mesh.                                            |

## Christmas tree & presents

| Asset                              | Placeholder component                                               | Target size                    | Notes                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Christmas tree                     | [`ChristmasTree.svelte`](src/lib/3d/furniture/ChristmasTree.svelte) | ~2.7 Ø × 3.85 tall (with star) | Floor-to-ceiling. Ideally undecorated, so the current instanced lights and ornaments can still be placed. |
| Tree stand / skirt                 | [`ChristmasTree.svelte`](src/lib/3d/furniture/ChristmasTree.svelte) | 2.4 Ø skirt                    |                                                                                                           |
| Ornament baubles                   | [`ChristmasTree.svelte`](src/lib/3d/furniture/ChristmasTree.svelte) | ~0.12 Ø                        | One model, recolored via instancing.                                                                      |
| Gingerbread-man ornament           | [`ChristmasTree.svelte`](src/lib/3d/furniture/ChristmasTree.svelte) | ~0.18 tall                     | Flat cookie with icing.                                                                                   |
| Star topper                        | [`ChristmasTree.svelte`](src/lib/3d/furniture/ChristmasTree.svelte) | ~0.36                          | Emissive.                                                                                                 |
| Wrapped presents (4 to 6 variants) | [`Presents.svelte`](src/lib/3d/furniture/Presents.svelte)           | 0.2 to 0.5 cubes               | Ribbons and bows. Varied wrapping.                                                                        |

## Coffee-table decor

| Asset                                         | Placeholder component                                           | Target size         | Notes                             |
| --------------------------------------------- | --------------------------------------------------------------- | ------------------- | --------------------------------- |
| Red pillar candles (×3)                       | [`CoffeeTable.svelte`](src/lib/3d/furniture/CoffeeTable.svelte) | 0.1 Ø × 0.16 to 0.3 | Melted-wax tops are a nice touch. |
| Plate of cookies                              | [`CoffeeTable.svelte`](src/lib/3d/furniture/CoffeeTable.svelte) | 0.3 Ø               |                                   |
| Plate of cupcakes / treats                    | [`CoffeeTable.svelte`](src/lib/3d/furniture/CoffeeTable.svelte) | 0.26 Ø              |                                   |
| Holiday figurines (snowman, mini tree, Santa) | [`CoffeeTable.svelte`](src/lib/3d/furniture/CoffeeTable.svelte) | 0.1 to 0.2 tall     |                                   |

## Soft furnishings

| Asset                                | Placeholder component                | Notes                                                                  |
| ------------------------------------ | ------------------------------------ | ---------------------------------------------------------------------- |
| Red & white Nordic blankets (draped) | `Sofa.svelte`, `RockingChair.svelte` | Ideally modeled draped over each specific piece (or a cloth sim bake). |
| Red throw pillows                    | `Sofa.svelte`                        | ~0.44 × 0.42.                                                          |

## Textures (optional, PBR)

These are procedural in [`src/lib/3d/textures.ts`](src/lib/3d/textures.ts) now:

- **Wallpaper**: dark, intricate damask. Tileable, ~0.8 m repeat.
- **Rug**: reddish-brown with light swirling circular patterns, 6 × 4.4 m.
- **Blanket knit**: red/white Nordic pattern, tileable.
- **Wood floor planks**: tileable, with normal and roughness maps.
- **Dark wood** for the trim, shelves and table.
