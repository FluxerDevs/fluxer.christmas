<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { FakeGlowMaterial } from '@threlte/extras';
	import type { PointLight } from 'three';
	import { LAYOUT, SIZES } from '$lib/game/world';
	import { woodTexture } from '../textures';

	const { position, rotationY } = LAYOUT.coffeeTable;
	const [width, height, depth] = SIZES.coffeeTable;
	const wood = woodTexture();
	const WOOD = '#2c1a10';
	const top = height;

	const candles = [
		{ x: -0.6, z: -0.12, h: 0.3 },
		{ x: -0.48, z: 0.05, h: 0.22 },
		{ x: -0.64, z: 0.14, h: 0.16 }
	];

	const cookies = Array.from({ length: 7 }, (_, i) => {
		const a = (i / 7) * Math.PI * 2;
		return { x: Math.cos(a) * 0.07, z: Math.sin(a) * 0.07, tilt: (i % 3) * 0.15 };
	});

	let candleLight = $state<PointLight>();
	let time = 0;
	useTask((delta) => {
		time += delta;
		if (candleLight)
			candleLight.intensity = 0.5 + Math.sin(time * 13) * 0.06 + Math.sin(time * 7.3) * 0.05;
	});
</script>

<T.Group {position} rotation.y={rotationY}>
	<!-- Table top -->
	<T.Mesh position.y={top - 0.03} castShadow receiveShadow>
		<T.BoxGeometry args={[width, 0.06, depth]} />
		<T.MeshStandardMaterial map={wood} color={WOOD} roughness={0.35} />
	</T.Mesh>
	<T.Mesh position.y={top - 0.09}>
		<T.BoxGeometry args={[width - 0.08, 0.06, depth - 0.08]} />
		<T.MeshStandardMaterial map={wood} color={WOOD} roughness={0.5} />
	</T.Mesh>
	<!-- Legs -->
	{#each [-1, 1] as sx (sx)}
		{#each [-1, 1] as sz (sz)}
			<T.Mesh
				position={[sx * (width / 2 - 0.08), (top - 0.06) / 2, sz * (depth / 2 - 0.08)]}
				castShadow
			>
				<T.BoxGeometry args={[0.07, top - 0.06, 0.07]} />
				<T.MeshStandardMaterial map={wood} color={WOOD} roughness={0.5} />
			</T.Mesh>
		{/each}
	{/each}
	<!-- Lower shelf -->
	<T.Mesh position.y={0.1} castShadow receiveShadow>
		<T.BoxGeometry args={[width - 0.12, 0.03, depth - 0.12]} />
		<T.MeshStandardMaterial map={wood} color={WOOD} roughness={0.5} />
	</T.Mesh>
	<!-- A couple of old books on the shelf -->
	<T.Mesh position={[0.35, 0.145, 0]} rotation.y={0.1} castShadow>
		<T.BoxGeometry args={[0.32, 0.06, 0.24]} />
		<T.MeshStandardMaterial color="#5a1a1a" roughness={0.8} />
	</T.Mesh>
	<T.Mesh position={[0.36, 0.2, 0.01]} rotation.y={-0.15} castShadow>
		<T.BoxGeometry args={[0.28, 0.05, 0.2]} />
		<T.MeshStandardMaterial color="#1f3a2a" roughness={0.8} />
	</T.Mesh>

	<!-- Pillar candles -->
	{#each candles as c, i (i)}
		<T.Group position={[c.x, top, c.z]}>
			<T.Mesh position.y={c.h / 2} castShadow>
				<T.CylinderGeometry args={[0.05, 0.05, c.h, 20]} />
				<T.MeshStandardMaterial color="#a8111b" roughness={0.6} />
			</T.Mesh>
			<T.Mesh position.y={c.h + 0.03} scale={[1, 1.8, 1]}>
				<T.SphereGeometry args={[0.014, 8, 8]} />
				<T.MeshBasicMaterial color="#ffd48a" toneMapped={false} />
			</T.Mesh>
			<T.Mesh position.y={c.h + 0.035}>
				<T.SphereGeometry args={[0.07, 12, 12]} />
				<FakeGlowMaterial
					glowColor="#ffb347"
					falloff={0.3}
					glowInternalRadius={5}
					glowSharpness={0.5}
				/>
			</T.Mesh>
		</T.Group>
	{/each}
	<T.PointLight
		bind:ref={candleLight}
		position={[-0.55, top + 0.4, 0.02]}
		color="#ffa150"
		intensity={0.5}
		distance={3}
		decay={2}
	/>

	<!-- Plate of cookies -->
	<T.Group position={[0.05, top, 0.08]}>
		<T.Mesh position.y={0.008} receiveShadow>
			<T.CylinderGeometry args={[0.15, 0.12, 0.016, 32]} />
			<T.MeshStandardMaterial color="#f4efe6" roughness={0.3} />
		</T.Mesh>
		{#each cookies as cookie, i (i)}
			<T.Mesh position={[cookie.x, 0.025, cookie.z]} rotation.x={cookie.tilt} castShadow>
				<T.CylinderGeometry args={[0.035, 0.035, 0.012, 16]} />
				<T.MeshStandardMaterial color={i % 2 ? '#b07a3a' : '#8a4f22'} roughness={0.9} />
			</T.Mesh>
		{/each}
	</T.Group>

	<!-- Plate of cupcakes / treats -->
	<T.Group position={[0.45, top, -0.15]}>
		<T.Mesh position.y={0.008} receiveShadow>
			<T.CylinderGeometry args={[0.13, 0.1, 0.016, 32]} />
			<T.MeshStandardMaterial color="#f4efe6" roughness={0.3} />
		</T.Mesh>
		{#each [-0.05, 0.05] as x (x)}
			<T.Mesh position={[x, 0.04, 0]} castShadow>
				<T.CylinderGeometry args={[0.035, 0.028, 0.05, 12]} />
				<T.MeshStandardMaterial color="#c42a2a" roughness={0.7} />
			</T.Mesh>
			<T.Mesh position={[x, 0.075, 0]}>
				<T.SphereGeometry args={[0.036, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
				<T.MeshStandardMaterial color="#f7f3ea" roughness={0.9} />
			</T.Mesh>
		{/each}
	</T.Group>

	<!-- Small holiday figurines: snowman, mini tree, santa -->
	<T.Group position={[0.62, top, 0.2]}>
		<T.Mesh position.y={0.045} castShadow>
			<T.SphereGeometry args={[0.045, 16, 12]} />
			<T.MeshStandardMaterial color="#f5f5f5" roughness={0.8} />
		</T.Mesh>
		<T.Mesh position.y={0.11} castShadow>
			<T.SphereGeometry args={[0.032, 16, 12]} />
			<T.MeshStandardMaterial color="#f5f5f5" roughness={0.8} />
		</T.Mesh>
		<T.Mesh position={[0, 0.112, 0.03]} rotation.x={Math.PI / 2}>
			<T.ConeGeometry args={[0.006, 0.03, 6]} />
			<T.MeshStandardMaterial color="#ff7a1a" />
		</T.Mesh>
		<T.Mesh position.y={0.15}>
			<T.CylinderGeometry args={[0.022, 0.022, 0.035, 12]} />
			<T.MeshStandardMaterial color="#111" />
		</T.Mesh>
	</T.Group>
	<T.Group position={[0.25, top, 0.26]}>
		<T.Mesh position.y={0.08} castShadow>
			<T.ConeGeometry args={[0.045, 0.14, 10]} />
			<T.MeshStandardMaterial color="#1f5a36" roughness={0.8} />
		</T.Mesh>
		<T.Mesh position.y={0.005}>
			<T.CylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
			<T.MeshStandardMaterial color="#4a2c16" />
		</T.Mesh>
	</T.Group>
	<T.Group position={[-0.25, top, 0.24]}>
		<T.Mesh position.y={0.05} castShadow>
			<T.ConeGeometry args={[0.04, 0.1, 12]} />
			<T.MeshStandardMaterial color="#b3141f" roughness={0.6} />
		</T.Mesh>
		<T.Mesh position.y={0.11}>
			<T.SphereGeometry args={[0.022, 12, 12]} />
			<T.MeshStandardMaterial color="#f0c8a0" />
		</T.Mesh>
		<T.Mesh position.y={0.14}>
			<T.ConeGeometry args={[0.02, 0.05, 10]} />
			<T.MeshStandardMaterial color="#b3141f" />
		</T.Mesh>
	</T.Group>
</T.Group>
