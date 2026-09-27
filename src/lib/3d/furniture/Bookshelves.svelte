<script lang="ts">
	import { T } from '@threlte/core';
	import { BoxGeometry, Color, InstancedMesh, MeshStandardMaterial, Object3D } from 'three';
	import { LAYOUT, SIZES, seededRandom } from '$lib/game/world';
	import { woodTexture } from '../textures';

	const shelves = LAYOUT.bookshelves;
	const ladder = LAYOUT.ladder;
	const [width, height, depth] = SIZES.bookshelves;
	const wood = woodTexture();
	const WOOD = '#3a2215';
	const BRASS = '#a8864a';
	const PANEL = 0.05;

	const BAYS = 3;
	const bayWidth = width / BAYS;
	const LEVELS = 7;
	const BASE = 0.12;
	const levelHeight = (height - BASE - 0.14) / LEVELS;
	const shelfYs = Array.from({ length: LEVELS + 1 }, (_, i) => BASE + i * levelHeight);
	const dividerXs = Array.from({ length: BAYS + 1 }, (_, i) => -width / 2 + i * bayWidth);

	/* ---------- Books: one instanced mesh, per-instance size + color ---------- */
	const palette = [
		'#6b1a1a',
		'#8a2a1f',
		'#1f3a2a',
		'#2a4a3a',
		'#1f2a4a',
		'#3a2a1a',
		'#5a3a1a',
		'#c9b48a',
		'#7a5a2a',
		'#4a1a2a',
		'#2a2a2a',
		'#9a8a6a'
	];
	const rand = seededRandom(1234);
	const matrices: Object3D[] = [];
	const colors: Color[] = [];
	for (let bay = 0; bay < BAYS; bay++) {
		for (let level = 0; level < LEVELS; level++) {
			const floorY = shelfYs[level] + 0.015;
			let x = dividerXs[bay] + PANEL / 2 + 0.02;
			const end = dividerXs[bay + 1] - PANEL / 2 - 0.02;
			// Leave the odd half-empty shelf for variety.
			const fill = rand() < 0.15 ? 0.55 : 1;
			const limit = x + (end - x) * fill;
			while (x < limit) {
				if (rand() < 0.05) {
					x += 0.08 + rand() * 0.1;
					continue;
				}
				const w = 0.025 + rand() * 0.04;
				if (x + w > limit) break;
				const h = Math.min(levelHeight - 0.05, 0.22 + rand() * 0.16);
				const d = 0.2 + rand() * 0.1;
				const o = new Object3D();
				o.position.set(x + w / 2, floorY + h / 2, depth / 2 - d / 2 - 0.03);
				o.scale.set(w, h, d);
				o.updateMatrix();
				matrices.push(o);
				colors.push(new Color(palette[Math.floor(rand() * palette.length)]));
				x += w + 0.002;
			}
		}
	}
	const books = new InstancedMesh(
		new BoxGeometry(1, 1, 1),
		new MeshStandardMaterial({ color: '#ffffff', roughness: 0.75 }),
		matrices.length
	);
	matrices.forEach((o, i) => {
		books.setMatrixAt(i, o.matrix);
		books.setColorAt(i, colors[i]);
	});
	books.castShadow = true;
	books.receiveShadow = true;

	/* ---------- Ladder geometry (leans from the floor up to the rail) ---------- */
	const RAIL_Y = 3.3;
	const railZ = shelves.position[2] + depth / 2 + 0.08;
	// Negative rotation about x tips the ladder's top toward -z (the wall).
	const lean = Math.atan2(railZ - ladder.position[2], RAIL_Y);
	const ladderLength = Math.hypot(ladder.position[2] - railZ, RAIL_Y);
	const rungs = Array.from(
		{ length: Math.floor((ladderLength - 0.3) / 0.3) },
		(_, i) => 0.3 + i * 0.3
	);
</script>

<T.Group position={shelves.position} rotation.y={shelves.rotationY}>
	<!-- Back panel -->
	<T.Mesh position={[0, height / 2, -depth / 2 + 0.01]} receiveShadow>
		<T.BoxGeometry args={[width, height, 0.02]} />
		<T.MeshStandardMaterial map={wood} color="#24140b" roughness={0.8} />
	</T.Mesh>

	<!-- Vertical dividers -->
	{#each dividerXs as x (x)}
		<T.Mesh position={[x, height / 2, 0]} castShadow receiveShadow>
			<T.BoxGeometry args={[PANEL, height, depth]} />
			<T.MeshStandardMaterial map={wood} color={WOOD} roughness={0.6} />
		</T.Mesh>
	{/each}

	<!-- Shelves -->
	{#each shelfYs as y (y)}
		<T.Mesh position={[0, y, 0]} castShadow receiveShadow>
			<T.BoxGeometry args={[width, 0.03, depth]} />
			<T.MeshStandardMaterial map={wood} color={WOOD} roughness={0.6} />
		</T.Mesh>
	{/each}

	<!-- Plinth and crown -->
	<T.Mesh position={[0, BASE / 2, 0.01]} receiveShadow>
		<T.BoxGeometry args={[width + 0.04, BASE, depth + 0.02]} />
		<T.MeshStandardMaterial map={wood} color={WOOD} roughness={0.6} />
	</T.Mesh>
	<T.Mesh position={[0, height - 0.05, 0.02]} castShadow>
		<T.BoxGeometry args={[width + 0.1, 0.1, depth + 0.06]} />
		<T.MeshStandardMaterial map={wood} color={WOOD} roughness={0.6} />
	</T.Mesh>

	<T is={books} />

	<!-- Ladder rail -->
	<T.Mesh position={[0, RAIL_Y, depth / 2 + 0.08]} rotation.z={Math.PI / 2}>
		<T.CylinderGeometry args={[0.015, 0.015, width - 0.1, 12]} />
		<T.MeshStandardMaterial color={BRASS} metalness={0.8} roughness={0.3} />
	</T.Mesh>
	{#each [-1, 0, 1] as s (s)}
		<T.Mesh position={[s * (width / 2 - 0.1), RAIL_Y, depth / 2 + 0.04]} rotation.x={Math.PI / 2}>
			<T.CylinderGeometry args={[0.012, 0.012, 0.08, 8]} />
			<T.MeshStandardMaterial color={BRASS} metalness={0.8} roughness={0.3} />
		</T.Mesh>
	{/each}
</T.Group>

<!-- Rolling library ladder -->
<T.Group position={ladder.position} rotation.y={ladder.rotationY}>
	<T.Group rotation.x={lean}>
		{#each [-1, 1] as side (side)}
			<T.Mesh position={[side * 0.25, ladderLength / 2, 0]} castShadow>
				<T.BoxGeometry args={[0.05, ladderLength, 0.07]} />
				<T.MeshStandardMaterial map={wood} color="#5a3620" roughness={0.55} />
			</T.Mesh>
			<!-- Wheel -->
			<T.Mesh position={[side * 0.25, 0.04, 0.02]} rotation.z={Math.PI / 2}>
				<T.CylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
				<T.MeshStandardMaterial color="#222" metalness={0.5} roughness={0.5} />
			</T.Mesh>
			<!-- Rail hook -->
			<T.Mesh position={[side * 0.25, ladderLength - 0.02, -0.05]} rotation.y={Math.PI / 2}>
				<T.TorusGeometry args={[0.035, 0.01, 6, 12, Math.PI]} />
				<T.MeshStandardMaterial color={BRASS} metalness={0.8} roughness={0.3} />
			</T.Mesh>
		{/each}
		{#each rungs as y (y)}
			<T.Mesh position={[0, y, 0]} rotation={[lean * -1, 0, Math.PI / 2]} castShadow>
				<T.BoxGeometry args={[0.03, 0.5, 0.08]} />
				<T.MeshStandardMaterial map={wood} color="#5a3620" roughness={0.55} />
			</T.Mesh>
		{/each}
	</T.Group>
</T.Group>
