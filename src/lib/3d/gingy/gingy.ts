/**
 * Gingy cookie meshes. The cookie is the outline from `shape.ts` extruded with a soft
 * bevel; the gumdrop buttons are separate geometries already offset onto its front,
 * so they can be instanced with the very same matrices as the cookies.
 */
import {
	Color,
	ExtrudeGeometry,
	InstancedMesh,
	MeshPhysicalMaterial,
	MeshStandardMaterial,
	Shape,
	SphereGeometry,
	type BufferGeometry,
	type Matrix4
} from 'three';
import { gingyTexture } from '../textures';
import { BUTTONS, gingyOutline } from './shape';

/** Height of a cookie in metres at scale 1. */
export const GINGY_HEIGHT = 0.2;
const DEPTH = 0.07;
const BEVEL = 0.025;

let cookieGeometry: ExtrudeGeometry | undefined;

function cookie() {
	if (cookieGeometry) return cookieGeometry;
	// The caps' UVs are the shape coordinates, which already span the unit square.
	cookieGeometry = new ExtrudeGeometry(new Shape(gingyOutline()), {
		depth: DEPTH,
		bevelEnabled: true,
		bevelThickness: BEVEL,
		bevelSize: BEVEL,
		bevelSegments: 3,
		curveSegments: 6
	});
	cookieGeometry.translate(-0.5, -0.5, -DEPTH / 2);
	cookieGeometry.scale(GINGY_HEIGHT, GINGY_HEIGHT, GINGY_HEIGHT);
	return cookieGeometry;
}

/** A small dome sitting on the cookie's front face at a button position. */
function gumdrop(x: number, y: number) {
	const front = (DEPTH / 2 + BEVEL) * GINGY_HEIGHT;
	return new SphereGeometry(0.008, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2)
		.rotateX(Math.PI / 2)
		.scale(1, 1, 0.8)
		.translate((x - 0.5) * GINGY_HEIGHT, (y - 0.5) * GINGY_HEIGHT, front - 0.0005);
}

let materials: [MeshStandardMaterial, MeshStandardMaterial] | undefined;

/** [front/back faces with the icing texture, plain dough for the sides and bevel]. */
function cookieMaterials() {
	materials ??= [
		new MeshStandardMaterial({ map: gingyTexture(), roughness: 0.75 }),
		new MeshStandardMaterial({ color: '#9c5a26', roughness: 0.85 })
	];
	return materials;
}

export interface GingyBatch {
	/** Every mesh in the batch; add them all to the scene. */
	meshes: InstancedMesh[];
	setMatrixAt(index: number, matrix: Matrix4): void;
}

/** Instanced Gingy cookies with their gumdrop buttons. */
export function gingyBatch(count: number): GingyBatch {
	const body = new InstancedMesh(cookie(), cookieMaterials(), count);
	body.castShadow = true;
	body.receiveShadow = true;

	const buttons = BUTTONS.map(({ x, y, color }) => {
		const geometry: BufferGeometry = gumdrop(x, y);
		const material = new MeshPhysicalMaterial({
			color: new Color(color),
			roughness: 0.35,
			clearcoat: 0.6,
			sheen: 0.4
		});
		return new InstancedMesh(geometry, material, count);
	});

	const meshes = [body, ...buttons];
	return {
		meshes,
		setMatrixAt(index, matrix) {
			for (const mesh of meshes) mesh.setMatrixAt(index, matrix);
		}
	};
}
