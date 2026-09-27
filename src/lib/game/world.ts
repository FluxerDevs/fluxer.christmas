/**
 * Room layout: a single source of truth for where everything sits and what blocks the player.
 *
 * Coordinates: x → right, y → up, z → toward the viewer. Floor at y = 0.
 * The fireplace wall is the back wall at z = -ROOM.depth / 2.
 */

export type Vec3 = [number, number, number];

export const ROOM = {
	width: 12,
	depth: 10,
	height: 4,
	wallThickness: 0.3
} as const;

export const HALF_W = ROOM.width / 2;
export const HALF_D = ROOM.depth / 2;
export const BACK_WALL_Z = -HALF_D;

export interface Placement {
	position: Vec3;
	/** Rotation around the y axis in radians. Local +z is the "front" of every piece. */
	rotationY: number;
}

const place = (position: Vec3, rotationY = 0): Placement => ({ position, rotationY });

/** Angle that makes local +z at `from` face toward `to` (xz plane). */
const facing = (from: Vec3, to: [number, number]) => Math.atan2(to[0] - from[0], to[1] - from[2]);

const rockingChairPos: Vec3 = [3.3, 0, -1.5];
const sofaLeftPos: Vec3 = [-3.0, 0, 2.55];

export const LAYOUT = {
	fireplace: place([0, 0, BACK_WALL_Z + 0.25]),
	christmasTree: place([-4.3, 0, -3.2]),
	presents: place([-2.4, 0, -3.9]),
	bookshelves: place([4.05, 0, BACK_WALL_Z + 0.21]),
	ladder: place([3.25, 0, -3.95]),
	rug: place([0, 0, 0.2]),
	coffeeTable: place([0, 0, 0.3]),
	// Foreground sofa, back to the viewer, angled toward the fireplace.
	sofaLeft: place(sofaLeftPos, facing(sofaLeftPos, [0, -4.5])),
	sofaRight: place([5.25, 0, 0.6], -Math.PI / 2),
	rockingChair: place(rockingChairPos, facing(rockingChairPos, [0, -4.2])),
	floorLamp: place([5.3, 0, -2.9]),
	chandelier: place([0, ROOM.height, 0.2])
} satisfies Record<string, Placement>;

/** Sizes shared between the visuals and their colliders (full extents in meters). */
export const SIZES = {
	fireplace: [2.8, 1.4, 0.5] as Vec3,
	hearth: [2.9, 0.06, 0.6] as Vec3,
	bookshelves: [3.6, 3.6, 0.42] as Vec3,
	coffeeTable: [1.6, 0.46, 0.8] as Vec3,
	sofa: [2.3, 0.85, 0.95] as Vec3,
	rug: [6, 4.4] as [number, number]
};

/** An axis-aligned (optionally y-rotated) static box collider. */
export interface ColliderBox {
	name: string;
	/** Center of the box in world space. */
	center: Vec3;
	/** Full extents. */
	size: Vec3;
	rotationY?: number;
}

const t = ROOM.wallThickness;

/** Boxes that describe the room shell. */
const SHELL: ColliderBox[] = [
	{ name: 'floor', center: [0, -t / 2, 0], size: [ROOM.width + 2 * t, t, ROOM.depth + 2 * t] },
	{
		name: 'ceiling',
		center: [0, ROOM.height + t / 2, 0],
		size: [ROOM.width + 2 * t, t, ROOM.depth + 2 * t]
	},
	{
		name: 'wall-back',
		center: [0, ROOM.height / 2, -HALF_D - t / 2],
		size: [ROOM.width, ROOM.height, t]
	},
	{
		name: 'wall-front',
		center: [0, ROOM.height / 2, HALF_D + t / 2],
		size: [ROOM.width, ROOM.height, t]
	},
	{
		name: 'wall-left',
		center: [-HALF_W - t / 2, ROOM.height / 2, 0],
		size: [t, ROOM.height, ROOM.depth]
	},
	{
		name: 'wall-right',
		center: [HALF_W + t / 2, ROOM.height / 2, 0],
		size: [t, ROOM.height, ROOM.depth]
	}
];

/** Place a box relative to a piece's floor-level origin, respecting its rotation. */
function localBox(name: string, p: Placement, offset: Vec3, size: Vec3): ColliderBox {
	const sin = Math.sin(p.rotationY);
	const cos = Math.cos(p.rotationY);
	return {
		name,
		center: [
			p.position[0] + offset[0] * cos + offset[2] * sin,
			p.position[1] + offset[1],
			p.position[2] - offset[0] * sin + offset[2] * cos
		],
		size,
		rotationY: p.rotationY
	};
}

const L = LAYOUT;
const [fw, fh, fd] = SIZES.fireplace;
const [sw, sh, sd] = SIZES.sofa;

/** Furniture colliders. Small decor (candles, ornaments, stockings) is intentionally walk-through. */
const FURNITURE: ColliderBox[] = [
	localBox('fireplace', L.fireplace, [0, fh / 2, 0.15], [fw + 0.1, fh, fd + 0.3]),
	localBox('hearth', L.fireplace, [0, 0.15, 0.55], [SIZES.hearth[0], 0.3, SIZES.hearth[2]]),
	localBox('christmas-tree', L.christmasTree, [0, 1.6, 0], [2.2, 3.2, 2.2]),
	localBox('presents', L.presents, [0, 0.25, 0], [1.5, 0.5, 0.9]),
	localBox('bookshelves', L.bookshelves, [0, 1.8, 0], SIZES.bookshelves),
	localBox('ladder', L.ladder, [0, 1.6, -0.35], [0.6, 3.2, 0.8]),
	localBox('coffee-table', L.coffeeTable, [0, 0.23, 0], SIZES.coffeeTable),
	localBox('sofa-left', L.sofaLeft, [0, sh / 2, 0], [sw, sh, sd]),
	localBox('sofa-right', L.sofaRight, [0, sh / 2, 0], [sw, sh, sd]),
	localBox('rocking-chair', L.rockingChair, [0, 0.55, 0], [0.7, 1.1, 0.9]),
	localBox('floor-lamp', L.floorLamp, [0, 0.8, 0], [0.5, 1.6, 0.5])
];

export const COLLIDERS: ColliderBox[] = [...SHELL, ...FURNITURE];

/** Tiny deterministic PRNG so procedural decoration looks the same on every load. */
export function seededRandom(seed: number) {
	let s = seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let r = Math.imul(s ^ (s >>> 15), 1 | s);
		r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
		return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
	};
}
