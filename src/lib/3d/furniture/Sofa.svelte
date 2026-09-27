<script lang="ts">
	import { T } from '@threlte/core';
	import { RoundedBoxGeometry } from '@threlte/extras';
	import { SIZES, type Placement } from '$lib/game/world';
	import { blanketTexture } from '../textures';

	interface Props {
		placement: Placement;
		/** Which side (local -1 = left, 1 = right) the blanket is draped on. */
		blanketSide?: -1 | 1;
		fabric?: string;
	}

	let { placement, blanketSide = 1, fabric = '#3c4a33' }: Props = $props();

	const [width, height, depth] = SIZES.sofa;
	const blanket = blanketTexture();

	const LEG = 0.1;
	const ARM_W = 0.2;
	const BACK_D = 0.24;
	const seatW = width - ARM_W * 2;
	const seatTop = 0.47;
	const cushionCount = 2;
	const cushionW = seatW / cushionCount;
	const blanketW = 0.95;
	const bx = $derived(blanketSide * (seatW / 2 - blanketW / 2 - 0.05));
</script>

<T.Group position={placement.position} rotation.y={placement.rotationY}>
	<!-- Legs -->
	{#each [-1, 1] as sx (sx)}
		{#each [-1, 1] as sz (sz)}
			<T.Mesh position={[sx * (width / 2 - 0.1), LEG / 2, sz * (depth / 2 - 0.1)]}>
				<T.CylinderGeometry args={[0.03, 0.022, LEG, 8]} />
				<T.MeshStandardMaterial color="#1e120a" roughness={0.5} />
			</T.Mesh>
		{/each}
	{/each}

	<!-- Base frame -->
	<T.Mesh position={[0, LEG + 0.15, 0]} castShadow receiveShadow>
		<RoundedBoxGeometry args={[width, 0.3, depth]} radius={0.04} />
		<T.MeshStandardMaterial color={fabric} roughness={0.95} />
	</T.Mesh>

	<!-- Seat cushions -->
	{#each Array.from({ length: cushionCount }, (_, i) => i) as i (i)}
		<T.Mesh
			position={[-seatW / 2 + cushionW * (i + 0.5), seatTop - 0.06, BACK_D / 2 - 0.02]}
			castShadow
			receiveShadow
		>
			<RoundedBoxGeometry args={[cushionW - 0.02, 0.14, depth - BACK_D]} radius={0.05} />
			<T.MeshStandardMaterial color={fabric} roughness={1} />
		</T.Mesh>
	{/each}

	<!-- Back -->
	<T.Mesh
		position={[0, (LEG + height) / 2 + 0.02, -depth / 2 + BACK_D / 2]}
		castShadow
		receiveShadow
	>
		<RoundedBoxGeometry args={[width, height - LEG, BACK_D]} radius={0.06} />
		<T.MeshStandardMaterial color={fabric} roughness={0.95} />
	</T.Mesh>

	<!-- Arms -->
	{#each [-1, 1] as side (side)}
		<T.Mesh position={[side * (width / 2 - ARM_W / 2), LEG + 0.3, 0.02]} castShadow receiveShadow>
			<RoundedBoxGeometry args={[ARM_W, 0.6, depth - 0.02]} radius={0.07} />
			<T.MeshStandardMaterial color={fabric} roughness={0.95} />
		</T.Mesh>
	{/each}

	<!-- Red pillows leaning against the back -->
	{#each [-1, 1] as side (side)}
		<T.Mesh
			position={[side * (seatW / 2 - 0.28), seatTop + 0.2, -depth / 2 + BACK_D + 0.08]}
			rotation={[-0.25, side * -0.25, side * 0.12]}
			castShadow
		>
			<RoundedBoxGeometry args={[0.44, 0.42, 0.13]} radius={0.06} />
			<T.MeshStandardMaterial color="#a3141e" roughness={1} />
		</T.Mesh>
	{/each}

	<!-- Red & white blanket draped over the back, across the seat and down the front -->
	<T.Group position.x={bx}>
		<T.Mesh position={[0, height + 0.04, -depth / 2 + BACK_D / 2]} castShadow>
			<RoundedBoxGeometry args={[blanketW, 0.04, BACK_D + 0.06]} radius={0.015} />
			<T.MeshStandardMaterial map={blanket} roughness={1} />
		</T.Mesh>
		<T.Mesh
			position={[0, (height + seatTop) / 2 + 0.02, -depth / 2 + BACK_D + 0.03]}
			rotation.x={-0.12}
			castShadow
		>
			<RoundedBoxGeometry args={[blanketW, height - seatTop + 0.02, 0.04]} radius={0.015} />
			<T.MeshStandardMaterial map={blanket} roughness={1} />
		</T.Mesh>
		<T.Mesh position={[0, seatTop + 0.03, 0.08]} castShadow receiveShadow>
			<RoundedBoxGeometry args={[blanketW, 0.04, depth - BACK_D + 0.02]} radius={0.015} />
			<T.MeshStandardMaterial map={blanket} roughness={1} />
		</T.Mesh>
		<T.Mesh position={[0, seatTop - 0.18, depth / 2 + 0.02]} rotation.x={0.06} castShadow>
			<RoundedBoxGeometry args={[blanketW, 0.42, 0.04]} radius={0.015} />
			<T.MeshStandardMaterial map={blanket} roughness={1} />
		</T.Mesh>
	</T.Group>
</T.Group>
