<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { FakeGlowMaterial, Sparkles } from '@threlte/extras';
	import { AdditiveBlending, type Mesh, type PointLight } from 'three';
	import { LAYOUT, SIZES } from '$lib/game/world';
	import MantelDecor from './MantelDecor.svelte';

	const { position, rotationY } = LAYOUT.fireplace;
	const [width, height, depth] = SIZES.fireplace;

	const MANTEL = '#ece6da';
	const SOOT = '#140b07';
	const opening = { width: 1.0, height: 0.85 };
	const pillarWidth = (width - opening.width) / 2;

	let light = $state<PointLight>();
	const flames: Mesh[] = $state([]);

	const flameDefs = [
		{ x: -0.22, h: 0.42, r: 0.11, color: '#ff7a1a', speed: 7.1 },
		{ x: 0.0, h: 0.55, r: 0.14, color: '#ffae3d', speed: 8.3 },
		{ x: 0.2, h: 0.4, r: 0.1, color: '#ff7a1a', speed: 6.4 },
		{ x: -0.08, h: 0.32, r: 0.08, color: '#ffd27a', speed: 9.7 },
		{ x: 0.1, h: 0.3, r: 0.08, color: '#ffd27a', speed: 10.9 }
	];

	let time = 0;
	useTask((delta) => {
		time += delta;
		if (light) {
			// Layered sines give an organic, non-repeating flicker.
			const flicker =
				Math.sin(time * 9.1) * 0.12 + Math.sin(time * 23.7) * 0.07 + Math.sin(time * 3.3) * 0.1;
			light.intensity = 11 * (1 + flicker);
			light.position.x = Math.sin(time * 5.3) * 0.04;
		}
		flames.forEach((flame, i) => {
			if (!flame) return;
			const def = flameDefs[i];
			flame.scale.y =
				1 + Math.sin(time * def.speed + i) * 0.18 + Math.sin(time * def.speed * 2.3) * 0.08;
			flame.scale.x = flame.scale.z = 1 - Math.sin(time * def.speed + i) * 0.08;
			flame.rotation.y = time * (0.6 + i * 0.2);
		});
	});
</script>

<T.Group {position} rotation.y={rotationY}>
	<!-- Pillars -->
	{#each [-1, 1] as side (side)}
		<T.Mesh
			position={[side * (opening.width / 2 + pillarWidth / 2), height / 2 - 0.05, 0]}
			castShadow
			receiveShadow
		>
			<T.BoxGeometry args={[pillarWidth, height - 0.1, depth]} />
			<T.MeshStandardMaterial color={MANTEL} roughness={0.45} />
		</T.Mesh>
		<!-- Fluted pilaster detail -->
		<T.Mesh
			position={[side * (opening.width / 2 + pillarWidth / 2), 0.62, depth / 2 + 0.02]}
			castShadow
		>
			<T.BoxGeometry args={[0.22, 1.0, 0.04]} />
			<T.MeshStandardMaterial color="#f6f1e7" roughness={0.4} />
		</T.Mesh>
		<!-- Base plinth -->
		<T.Mesh
			position={[side * (opening.width / 2 + pillarWidth / 2), 0.07, 0.03]}
			castShadow
			receiveShadow
		>
			<T.BoxGeometry args={[pillarWidth + 0.06, 0.14, depth + 0.06]} />
			<T.MeshStandardMaterial color={MANTEL} roughness={0.5} />
		</T.Mesh>
	{/each}

	<!-- Lintel above the opening -->
	<T.Mesh position={[0, (opening.height + height - 0.1) / 2, 0]} castShadow receiveShadow>
		<T.BoxGeometry args={[opening.width, height - 0.1 - opening.height, depth]} />
		<T.MeshStandardMaterial color={MANTEL} roughness={0.45} />
	</T.Mesh>
	<T.Mesh position={[0, opening.height + 0.03, depth / 2 + 0.01]}>
		<T.BoxGeometry args={[opening.width + 0.08, 0.06, 0.04]} />
		<T.MeshStandardMaterial color="#f6f1e7" roughness={0.4} />
	</T.Mesh>

	<!-- Mantel shelf -->
	<T.Mesh position={[0, height - 0.05, 0.1]} castShadow receiveShadow>
		<T.BoxGeometry args={[width + 0.2, 0.1, depth + 0.3]} />
		<T.MeshStandardMaterial color={MANTEL} roughness={0.4} />
	</T.Mesh>
	<T.Mesh position={[0, height - 0.13, 0.08]} castShadow>
		<T.BoxGeometry args={[width + 0.05, 0.06, depth + 0.2]} />
		<T.MeshStandardMaterial color={MANTEL} roughness={0.45} />
	</T.Mesh>

	<!-- Firebox (sooty interior) -->
	<T.Mesh position={[0, opening.height / 2, -depth / 2 + 0.03]}>
		<T.BoxGeometry args={[opening.width, opening.height, 0.06]} />
		<T.MeshStandardMaterial color={SOOT} roughness={1} />
	</T.Mesh>
	{#each [-1, 1] as side (side)}
		<T.Mesh position={[side * (opening.width / 2 - 0.02), opening.height / 2, 0]}>
			<T.BoxGeometry args={[0.04, opening.height, depth]} />
			<T.MeshStandardMaterial color="#2a130a" roughness={1} />
		</T.Mesh>
	{/each}

	<!-- Hearth -->
	<T.Mesh position={[0, SIZES.hearth[1] / 2, depth / 2 + SIZES.hearth[2] / 2 - 0.05]} receiveShadow>
		<T.BoxGeometry args={SIZES.hearth} />
		<T.MeshStandardMaterial color="#7a6a60" roughness={0.7} />
	</T.Mesh>

	<!-- Logs -->
	<T.Group position={[0, 0.08, 0]}>
		<T.Mesh rotation={[0, 0.25, Math.PI / 2]} position={[0, 0, 0.02]} castShadow>
			<T.CylinderGeometry args={[0.07, 0.08, 0.75, 10]} />
			<T.MeshStandardMaterial color="#3b2413" roughness={1} />
		</T.Mesh>
		<T.Mesh rotation={[0, -0.3, Math.PI / 2]} position={[0.03, 0.06, -0.08]} castShadow>
			<T.CylinderGeometry args={[0.06, 0.07, 0.7, 10]} />
			<T.MeshStandardMaterial color="#4a2c16" roughness={1} />
		</T.Mesh>
		<!-- Embers bed -->
		<T.Mesh position={[0, -0.05, 0]} rotation.x={-Math.PI / 2}>
			<T.CircleGeometry args={[0.36, 24]} />
			<T.MeshBasicMaterial color="#ff4a0a" toneMapped={false} />
		</T.Mesh>
	</T.Group>

	<!-- Flames -->
	<T.Group position={[0, 0.1, -0.02]}>
		{#each flameDefs as def, i (i)}
			<T.Mesh bind:ref={flames[i]} position={[def.x, def.h / 2, 0]}>
				<T.ConeGeometry args={[def.r, def.h, 8, 1, true]} />
				<T.MeshBasicMaterial
					color={def.color}
					transparent
					opacity={0.85}
					blending={AdditiveBlending}
					depthWrite={false}
					toneMapped={false}
				/>
			</T.Mesh>
		{/each}
		<T.Mesh position={[0, 0.2, 0.05]}>
			<T.SphereGeometry args={[0.45, 24, 24]} />
			<FakeGlowMaterial
				glowColor="#ff8a2a"
				falloff={0.2}
				glowInternalRadius={6}
				glowSharpness={0.6}
			/>
		</T.Mesh>
	</T.Group>

	<!-- Rising embers -->
	<Sparkles
		position={[0, 0.5, 0]}
		scale={[0.8, 0.8, 0.3]}
		count={40}
		size={3}
		speed={0.6}
		color="#ffb347"
		noise={[0.4, 1, 0.4]}
	/>

	<!-- Warm key light -->
	<T.PointLight
		bind:ref={light}
		position={[0, 0.45, 0.55]}
		color="#ff8c3b"
		intensity={9}
		distance={0}
		decay={1.6}
		castShadow
		shadow.mapSize.width={1024}
		shadow.mapSize.height={1024}
		shadow.bias={-0.002}
		shadow.normalBias={0.03}
		shadow.camera.near={0.1}
		shadow.camera.far={14}
	/>

	<MantelDecor mantelTop={height} />
</T.Group>
