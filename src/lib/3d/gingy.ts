/**
 * Instanced Gingy cookies from `static/models/gingy.glb` ("Gingy (shrek)" by
 * tannersprague938, CC BY 4.0, see README credits). The model loads once and every
 * batch picks it up; until then batches stay hidden.
 */
import { asset } from '$app/paths';
import { BufferGeometry, InstancedMesh, Vector3, type Material, type Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** Height of a cookie in metres at scale 1. */
export const GINGY_HEIGHT = 0.2;

interface GingyModel {
	geometry: BufferGeometry;
	material: Material;
}

let model: Promise<GingyModel> | undefined;

function loadModel() {
	model ??= new GLTFLoader().loadAsync(asset('/models/gingy.glb')).then((gltf) => {
		let source: Mesh | undefined;
		gltf.scene.traverse((object) => {
			if (!source && (object as Mesh).isMesh) source = object as Mesh;
		});
		if (!source) throw new Error('gingy.glb has no mesh');

		// The raw mesh is upside down and faces -Z: turn it upright facing +Z, centre it
		// and scale it to GINGY_HEIGHT (the file's root node would lay it flat instead).
		const geometry = source.geometry.clone().rotateX(Math.PI);
		geometry.computeBoundingBox();
		const box = geometry.boundingBox!;
		const center = box.getCenter(new Vector3());
		geometry.translate(-center.x, -center.y, -center.z);
		const scale = GINGY_HEIGHT / (box.max.y - box.min.y);
		geometry.scale(scale, scale, scale);
		geometry.computeBoundingSphere();

		return { geometry, material: source.material as Material };
	});
	return model;
}

/** `count` Gingy cookies placed with `setMatrixAt`; they appear once the model has loaded. */
export function gingyBatch(count: number) {
	const mesh = new InstancedMesh(new BufferGeometry(), undefined, count);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	mesh.visible = false;

	loadModel()
		.then(({ geometry, material }) => {
			mesh.geometry.dispose();
			mesh.geometry = geometry;
			mesh.material = material;
			mesh.computeBoundingSphere();
			mesh.visible = true;
		})
		.catch((error) => console.error('Could not load the Gingy model:', error));

	return mesh;
}
