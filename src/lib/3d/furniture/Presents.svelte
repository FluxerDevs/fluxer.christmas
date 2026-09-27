<script lang="ts">
	import { T } from '@threlte/core';
	import { LAYOUT, type Vec3 } from '$lib/game/world';

	const { position, rotationY } = LAYOUT.presents;

	type Present = {
		/** Offset from the cluster's floor-level origin. */
		at: [number, number];
		size: Vec3;
		rotation: number;
		wrap: string;
		ribbon: string;
		/** Stack on top of another box: base height. */
		base?: number;
	};

	const presents: Present[] = [
		{
			at: [-0.45, 0.1],
			size: [0.5, 0.36, 0.42],
			rotation: 0.2,
			wrap: '#b3141f',
			ribbon: '#e9d18a'
		},
		{
			at: [0.15, 0.2],
			size: [0.42, 0.26, 0.42],
			rotation: -0.35,
			wrap: '#1f5a36',
			ribbon: '#c42a2a'
		},
		{ at: [0.58, -0.1], size: [0.3, 0.42, 0.3], rotation: 0.6, wrap: '#f2ede2', ribbon: '#b3141f' },
		{
			at: [-0.1, -0.25],
			size: [0.36, 0.2, 0.3],
			rotation: 0.1,
			wrap: '#c9a24a',
			ribbon: '#7a1a1a'
		},
		{
			at: [-0.45, 0.1],
			size: [0.32, 0.2, 0.28],
			rotation: -0.2,
			wrap: '#2a3f7a',
			ribbon: '#e9d18a',
			base: 0.36
		},
		{
			at: [0.2, 0.3],
			size: [0.22, 0.16, 0.22],
			rotation: 0.4,
			wrap: '#b3141f',
			ribbon: '#f2ede2',
			base: 0.26
		},
		// A few tucked under the tree itself
		{
			at: [-1.35, -0.1],
			size: [0.4, 0.3, 0.34],
			rotation: -0.5,
			wrap: '#8a1020',
			ribbon: '#e9d18a'
		},
		{
			at: [-1.2, 0.35],
			size: [0.28, 0.22, 0.28],
			rotation: 0.3,
			wrap: '#f2ede2',
			ribbon: '#1f5a36'
		}
	];

	const RIBBON_W = 0.045;
</script>

<T.Group {position} rotation.y={rotationY}>
	{#each presents as p, i (i)}
		{@const [w, h, d] = p.size}
		<T.Group position={[p.at[0], (p.base ?? 0) + h / 2, p.at[1]]} rotation.y={p.rotation}>
			<T.Mesh castShadow receiveShadow>
				<T.BoxGeometry args={p.size} />
				<T.MeshStandardMaterial color={p.wrap} roughness={0.55} />
			</T.Mesh>
			<!-- Ribbons wrapping both ways -->
			<T.Mesh>
				<T.BoxGeometry args={[w + 0.006, h + 0.006, RIBBON_W]} />
				<T.MeshStandardMaterial color={p.ribbon} roughness={0.35} metalness={0.2} />
			</T.Mesh>
			<T.Mesh>
				<T.BoxGeometry args={[RIBBON_W, h + 0.006, d + 0.006]} />
				<T.MeshStandardMaterial color={p.ribbon} roughness={0.35} metalness={0.2} />
			</T.Mesh>
			<!-- Bow -->
			{#each [-1, 1] as side (side)}
				<T.Mesh
					position={[side * 0.045, h / 2 + 0.025, 0]}
					rotation={[0, 0, side * 0.5]}
					castShadow
				>
					<T.TorusGeometry args={[0.04, 0.014, 8, 16]} />
					<T.MeshStandardMaterial color={p.ribbon} roughness={0.35} metalness={0.2} />
				</T.Mesh>
			{/each}
		</T.Group>
	{/each}
</T.Group>
