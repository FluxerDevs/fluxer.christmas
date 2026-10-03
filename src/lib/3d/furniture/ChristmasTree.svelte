<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { FakeGlowMaterial } from '@threlte/extras';
	import {
		CatmullRomCurve3,
		Color,
		ConeGeometry,
		DoubleSide,
		ExtrudeGeometry,
		InstancedMesh,
		MeshBasicMaterial,
		MeshStandardMaterial,
		Object3D,
		Shape,
		SphereGeometry,
		TubeGeometry,
		Vector3
	} from 'three';
	import { LAYOUT, seededRandom } from '$lib/game/world';
	import { gingyBatch } from '../gingy/gingy';

	const { position, rotationY } = LAYOUT.christmasTree;
	const rand = seededRandom(42);

	/** Stacked cone layers: [radius, height, centerY]. */
	const LAYERS: [number, number, number][] = [
		[1.35, 1.1, 0.85],
		[1.22, 1.0, 1.25],
		[1.08, 0.95, 1.65],
		[0.92, 0.9, 2.05],
		[0.76, 0.85, 2.42],
		[0.6, 0.75, 2.78],
		[0.44, 0.7, 3.1],
		[0.28, 0.55, 3.43]
	];
	const TOP = 3.7;

	/** Outer radius of the tree silhouette at height y. */
	function envelope(y: number) {
		let r = 0;
		for (const [radius, height, cy] of LAYERS) {
			const top = cy + height / 2;
			const bottom = cy - height / 2;
			if (y >= bottom && y <= top) r = Math.max(r, (radius * (top - y)) / height);
		}
		return r;
	}

	/** Cone with slightly jittered vertices for a fluffier, hand-made look. */
	function fluffyCone(radius: number, height: number) {
		const geometry = new ConeGeometry(radius, height, 28, 4, true);
		const pos = geometry.attributes.position;
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i);
			const y = pos.getY(i);
			const z = pos.getZ(i);
			// Hash the position so seam duplicates move identically.
			const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
			const n = (h - Math.floor(h) - 0.5) * 0.14 * (radius / 1.35 + 0.3);
			const len = Math.hypot(x, z) || 1;
			pos.setXYZ(i, x + (x / len) * n, y + n * 0.5, z + (z / len) * n);
		}
		geometry.computeVertexNormals();
		return geometry;
	}

	const needleMaterial = new MeshStandardMaterial({
		color: '#1c3a22',
		roughness: 0.9,
		flatShading: true,
		side: DoubleSide
	});
	const cones = LAYERS.map(([r, h, y]) => ({ geometry: fluffyCone(r, h), y }));

	const dummy = new Object3D();

	/* ---------- String lights: spiral strands of twinkling bulbs ---------- */
	const BULB_COUNT = 180;
	const bulbPalette = ['#ffcf6b', '#ffe3a3', '#ff6b4a', '#ffd27a', '#9fd8ff', '#ffb070'];
	const bulbs = new InstancedMesh(
		new SphereGeometry(0.028, 8, 8),
		new MeshBasicMaterial({ color: '#ffffff', toneMapped: false }),
		BULB_COUNT
	);
	const bulbBase: Color[] = [];
	const bulbPhase: number[] = [];
	const bulbSpeed: number[] = [];
	for (let i = 0; i < BULB_COUNT; i++) {
		const t = i / BULB_COUNT;
		const y = 0.4 + t * (TOP - 0.55);
		const angle = t * Math.PI * 2 * 11 + rand() * 0.3;
		const r = envelope(y) * 0.93 + 0.02;
		dummy.position.set(Math.sin(angle) * r, y, Math.cos(angle) * r);
		dummy.updateMatrix();
		bulbs.setMatrixAt(i, dummy.matrix);
		const color = new Color(bulbPalette[Math.floor(rand() * bulbPalette.length)]);
		bulbBase.push(color);
		bulbPhase.push(rand() * Math.PI * 2);
		bulbSpeed.push(0.8 + rand() * 2.2);
		bulbs.setColorAt(i, color);
	}

	/* ---------- Ornaments ---------- */
	const ORNAMENT_COUNT = 60;
	const ornamentPalette = ['#b3141f', '#c9a24a', '#d9d9d9', '#1f3f8a', '#8a1020'];
	const ornaments = new InstancedMesh(
		new SphereGeometry(0.06, 16, 12),
		new MeshStandardMaterial({ color: '#ffffff', metalness: 0.6, roughness: 0.25 }),
		ORNAMENT_COUNT
	);
	for (let i = 0; i < ORNAMENT_COUNT; i++) {
		const y = 0.5 + rand() * (TOP - 0.9);
		const angle = i * 2.39996 + rand() * 0.4;
		const r = envelope(y) * 0.95;
		const scale = 0.7 + rand() * 0.6;
		dummy.position.set(Math.sin(angle) * r, y, Math.cos(angle) * r);
		dummy.scale.setScalar(scale);
		dummy.updateMatrix();
		ornaments.setMatrixAt(i, dummy.matrix);
		ornaments.setColorAt(i, new Color(ornamentPalette[i % ornamentPalette.length]));
	}
	dummy.scale.setScalar(1);
	ornaments.castShadow = true;

	/* ---------- Gingy cookies ---------- */
	const GINGER_COUNT = 14;
	const gingy = gingyBatch(GINGER_COUNT);
	for (let i = 0; i < GINGER_COUNT; i++) {
		const y = 0.6 + (i / GINGER_COUNT) * (TOP - 1.1);
		const angle = i * 2.1 + 0.9;
		const r = envelope(y) * 0.97 + 0.06;
		dummy.position.set(Math.sin(angle) * r, y, Math.cos(angle) * r);
		// Face outwards, hang with a slight jaunty tilt and lean back against the branches.
		dummy.rotation.set(-0.3, angle, (rand() - 0.5) * 0.5, 'YXZ');
		dummy.scale.setScalar(0.9);
		dummy.updateMatrix();
		gingy.setMatrixAt(i, dummy.matrix);
	}
	dummy.rotation.set(0, 0, 0, 'XYZ');
	dummy.scale.setScalar(1);

	/* ---------- Gold tinsel spiral ---------- */
	const tinselPoints: Vector3[] = [];
	for (let i = 0; i <= 200; i++) {
		const t = i / 200;
		const y = 0.6 + t * (TOP - 0.8);
		const angle = -t * Math.PI * 2 * 6;
		const r = envelope(y) * 0.98 + 0.03;
		tinselPoints.push(new Vector3(Math.sin(angle) * r, y, Math.cos(angle) * r));
	}
	const tinsel = new TubeGeometry(new CatmullRomCurve3(tinselPoints), 400, 0.014, 5, false);

	/* ---------- Star topper ---------- */
	const starShape = new Shape();
	for (let i = 0; i < 10; i++) {
		const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
		const r = i % 2 === 0 ? 0.17 : 0.07;
		if (i === 0) starShape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
		else starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
	}
	const star = new ExtrudeGeometry(starShape, {
		depth: 0.04,
		bevelEnabled: true,
		bevelSize: 0.01,
		bevelThickness: 0.01
	}).center();

	/* ---------- Twinkle ---------- */
	const tmp = new Color();
	let time = 0;
	useTask((delta) => {
		time += delta;
		for (let i = 0; i < BULB_COUNT; i++) {
			const s = 0.5 + 0.5 * Math.sin(time * bulbSpeed[i] + bulbPhase[i]);
			tmp.copy(bulbBase[i]).multiplyScalar(0.35 + 0.65 * s * s);
			bulbs.setColorAt(i, tmp);
		}
		if (bulbs.instanceColor) bulbs.instanceColor.needsUpdate = true;
	});
</script>

<T.Group {position} rotation.y={rotationY}>
	<!-- Stand -->
	<T.Mesh position.y={0.14} castShadow receiveShadow>
		<T.CylinderGeometry args={[0.32, 0.26, 0.28, 20]} />
		<T.MeshStandardMaterial color="#7a1a1a" roughness={0.6} />
	</T.Mesh>
	<T.Mesh position.y={0.29}>
		<T.TorusGeometry args={[0.32, 0.02, 8, 24]} />
		<T.MeshStandardMaterial color="#b8903f" metalness={0.7} roughness={0.3} />
	</T.Mesh>
	<T.Mesh position.y={0.35}>
		<T.CylinderGeometry args={[0.07, 0.08, 0.3, 10]} />
		<T.MeshStandardMaterial color="#4a2c16" roughness={1} />
	</T.Mesh>

	<!-- Tree skirt -->
	<T.Mesh position.y={0.012} rotation.x={-Math.PI / 2} receiveShadow>
		<T.CircleGeometry args={[1.2, 40]} />
		<T.MeshStandardMaterial color="#8e1119" roughness={1} />
	</T.Mesh>
	<T.Mesh position.y={0.014} rotation.x={-Math.PI / 2}>
		<T.RingGeometry args={[1.08, 1.2, 40]} />
		<T.MeshStandardMaterial color="#f2ede2" roughness={1} />
	</T.Mesh>

	<!-- Foliage -->
	{#each cones as cone, i (i)}
		<T.Mesh
			geometry={cone.geometry}
			material={needleMaterial}
			position.y={cone.y}
			rotation.y={i * 0.7}
			castShadow
			receiveShadow
		/>
	{/each}

	<T.Mesh geometry={tinsel}>
		<T.MeshStandardMaterial color="#d8b24a" metalness={0.85} roughness={0.25} />
	</T.Mesh>
	<T is={ornaments} />
	{#each gingy.meshes as mesh (mesh.uuid)}
		<T is={mesh} />
	{/each}
	<T is={bulbs} />

	<!-- Star -->
	<T.Mesh geometry={star} position.y={TOP + 0.12}>
		<T.MeshBasicMaterial color="#ffd76a" toneMapped={false} />
	</T.Mesh>
	<T.Mesh position.y={TOP + 0.12}>
		<T.SphereGeometry args={[0.35, 16, 16]} />
		<FakeGlowMaterial
			glowColor="#ffcf6b"
			falloff={0.3}
			glowInternalRadius={6}
			glowSharpness={0.5}
		/>
	</T.Mesh>

	<!-- Soft glow from the lights onto the surroundings -->
	<T.PointLight position={[0.9, 1.3, 0.9]} color="#ffb870" intensity={1.6} distance={5} decay={2} />
	<T.PointLight position={[0.6, 2.6, 0.6]} color="#ffc98a" intensity={1.0} distance={4} decay={2} />
</T.Group>
