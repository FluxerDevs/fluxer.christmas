/**
 * Gingy's silhouette and face layout, shared by the cookie geometry and its icing
 * texture so the two line up. Coordinates are in a unit square (0..1 on both axes,
 * y up), which is also the UV space of the extruded front face.
 */
import { Path, Vector2 } from 'three';

/** Centre of the head; the face is laid out around it. */
export const HEAD = { x: 0.5, y: 0.78, r: 0.2 };

/** Gumdrop buttons, top to bottom. */
export const BUTTONS = [
	{ x: 0.5, y: 0.52, color: '#d81f2a' },
	{ x: 0.5, y: 0.39, color: '#2fa84a' }
];

/** Where the wavy icing crosses the wrists and ankles: centre, direction across the limb, half-length. */
export const ICING_BANDS = [0.29, -0.29]
	.map((x) => ({ cx: 0.5 + x, cy: 0.535, dx: 0, dy: 1, half: 0.06 }))
	.concat(
		[1, -1].map((side) => ({
			cx: 0.5 + side * 0.178,
			cy: 0.13,
			dx: 0.91 * side,
			dy: 0.41,
			half: 0.062
		}))
	);

/** Right half of the outline, from the top of the head down to the crotch (centred on x = 0). */
function rightHalf() {
	const path = new Path();
	path.moveTo(0, 0.48);
	// Big round head down to the neck
	path.absarc(0, 0.28, 0.2, Math.PI / 2, -1.1, true);
	// Shoulder and stubby arm, slightly raised, with a round hand
	path.quadraticCurveTo(0.14, 0.09, 0.2, 0.095);
	path.lineTo(0.33, 0.105);
	path.absarc(0.33, 0.035, 0.07, Math.PI / 2, -Math.PI / 2, true);
	path.lineTo(0.2, -0.04);
	path.quadraticCurveTo(0.17, -0.045, 0.17, -0.07);
	// Plump side down to the hip
	path.quadraticCurveTo(0.2, -0.12, 0.178, -0.189);
	// Splayed leg with a round foot
	path.lineTo(0.268, -0.389);
	path.absarc(0.2, -0.42, 0.075, 0.42, 0.42 - Math.PI, true);
	path.lineTo(0.042, -0.251);
	path.quadraticCurveTo(0.02, -0.2, 0, -0.2);
	return path.getPoints(10);
}

let outline: Vector2[] | undefined;

/** Closed outline (counter-clockwise) in the unit square. */
export function gingyOutline(): Vector2[] {
	if (outline) return outline;
	const right = rightHalf();
	const left = right
		.slice(1, -1)
		.reverse()
		.map((p) => new Vector2(-p.x, p.y));
	// Right half runs clockwise, so reverse the whole loop for a counter-clockwise shape.
	outline = [...right, ...left].map((p) => new Vector2(p.x + 0.5, p.y + 0.5)).reverse();
	return outline;
}
