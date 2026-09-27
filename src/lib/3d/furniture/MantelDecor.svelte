<script lang="ts">
	import { T } from '@threlte/core';
	import { RoundedBoxGeometry } from '@threlte/extras';
	import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';
	import { blanketTexture, clockFaceTexture, paintingTexture } from '../textures';

	interface Props {
		/** Local y of the mantel shelf's top surface. */
		mantelTop: number;
	}

	let { mantelTop }: Props = $props();

	const knit = blanketTexture();
	const clockFace = clockFaceTexture();
	const painting = paintingTexture();

	const RED = '#b3141f';
	const WHITE = '#f2ede2';
	const BRASS = '#b8903f';
	const FRONT = 0.5;

	type Stocking = { x: number; body: 'red' | 'white' | 'knit'; cuff: string };
	const stockings: Stocking[] = [
		{ x: -1.1, body: 'red', cuff: WHITE },
		{ x: -0.55, body: 'knit', cuff: WHITE },
		{ x: 0, body: 'white', cuff: RED },
		{ x: 0.55, body: 'knit', cuff: RED },
		{ x: 1.1, body: 'red', cuff: WHITE }
	];

	// Evergreen garland draped in scallops along the front edge of the shelf.
	const garland = $derived.by(() => {
		const points: Vector3[] = [];
		const y = mantelTop - 0.14;
		for (let i = 0; i <= 48; i++) {
			const t = i / 48;
			const x = -1.55 + t * 3.1;
			const sag = Math.pow(Math.sin(t * Math.PI * 6), 2) * 0.09;
			points.push(new Vector3(x, y - sag, FRONT + 0.04));
		}
		return new TubeGeometry(new CatmullRomCurve3(points), 160, 0.045, 6, false);
	});

	const garlandBulbs = $derived(
		Array.from({ length: 13 }, (_, i) => {
			const t = (i + 0.5) / 13;
			return {
				x: -1.55 + t * 3.1,
				y: mantelTop - 0.14 - Math.pow(Math.sin(t * Math.PI * 6), 2) * 0.09 - 0.03,
				color: ['#ffcf6b', '#ff5a4a', '#8fd0ff', '#9cff8a'][i % 4]
			};
		})
	);
</script>

<!-- Framed picture resting on the mantel, leaning against the wall -->
<T.Group position={[0, mantelTop + 0.48, -0.14]} rotation.x={-0.07}>
	<T.Mesh castShadow>
		<T.BoxGeometry args={[1.1, 0.8, 0.05]} />
		<T.MeshStandardMaterial color={BRASS} metalness={0.6} roughness={0.35} />
	</T.Mesh>
	<T.Mesh position.z={0.026}>
		<T.PlaneGeometry args={[0.94, 0.64]} />
		<T.MeshStandardMaterial map={painting} roughness={0.8} />
	</T.Mesh>
</T.Group>

<!-- Mantel clock -->
<T.Group position={[0, mantelTop, 0.2]}>
	<T.Mesh position.y={0.19} castShadow>
		<RoundedBoxGeometry args={[0.34, 0.38, 0.14]} radius={0.03} />
		<T.MeshStandardMaterial color="#3a2012" roughness={0.45} />
	</T.Mesh>
	<T.Mesh position={[0, 0.38, 0]} rotation.x={-Math.PI / 2} castShadow>
		<T.CylinderGeometry args={[0.17, 0.17, 0.14, 24, 1, false, -Math.PI / 2, Math.PI]} />
		<T.MeshStandardMaterial color="#3a2012" roughness={0.45} />
	</T.Mesh>
	<T.Mesh position={[0, 0.25, 0.072]}>
		<T.CircleGeometry args={[0.12, 32]} />
		<T.MeshStandardMaterial map={clockFace} roughness={0.5} />
	</T.Mesh>
	<T.Mesh position={[0, 0.25, 0.073]}>
		<T.RingGeometry args={[0.12, 0.135, 32]} />
		<T.MeshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
	</T.Mesh>
</T.Group>

<!-- Small ornaments flanking the clock -->
{#each [-1, 1] as side (side)}
	<T.Group position={[side * 0.36, mantelTop, 0.22]}>
		<T.Mesh position.y={0.02}>
			<T.CylinderGeometry args={[0.035, 0.045, 0.04, 12]} />
			<T.MeshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
		</T.Mesh>
		<T.Mesh position.y={0.1} castShadow>
			<T.SphereGeometry args={[0.065, 20, 16]} />
			<T.MeshStandardMaterial color={side < 0 ? RED : '#c9a24a'} metalness={0.5} roughness={0.25} />
		</T.Mesh>
	</T.Group>

	<!-- Brass candlestick -->
	<T.Group position={[side * 0.72, mantelTop, 0.2]}>
		<T.Mesh position.y={0.12} castShadow>
			<T.CylinderGeometry args={[0.02, 0.05, 0.24, 12]} />
			<T.MeshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
		</T.Mesh>
		<T.Mesh position.y={0.33}>
			<T.CylinderGeometry args={[0.022, 0.022, 0.18, 12]} />
			<T.MeshStandardMaterial color={WHITE} roughness={0.6} />
		</T.Mesh>
		<T.Mesh position.y={0.44}>
			<T.SphereGeometry args={[0.018, 8, 8]} />
			<T.MeshBasicMaterial color="#ffd27a" toneMapped={false} />
		</T.Mesh>
	</T.Group>

	<!-- Nutcracker placeholder -->
	<T.Group position={[side * 1.2, mantelTop, 0.2]}>
		<T.Mesh position.y={0.1} castShadow>
			<T.CylinderGeometry args={[0.045, 0.05, 0.2, 12]} />
			<T.MeshStandardMaterial color={side < 0 ? RED : '#1f4a7a'} roughness={0.5} />
		</T.Mesh>
		<T.Mesh position.y={0.24}>
			<T.SphereGeometry args={[0.045, 12, 12]} />
			<T.MeshStandardMaterial color="#f0c8a0" roughness={0.6} />
		</T.Mesh>
		<T.Mesh position.y={0.32}>
			<T.CylinderGeometry args={[0.04, 0.045, 0.1, 12]} />
			<T.MeshStandardMaterial color="#111111" roughness={0.6} />
		</T.Mesh>
	</T.Group>
{/each}

<!-- Garland along the front of the shelf -->
<T.Mesh geometry={garland} castShadow>
	<T.MeshStandardMaterial color="#1e4a2a" roughness={0.9} />
</T.Mesh>
{#each garlandBulbs as bulb, i (i)}
	<T.Mesh position={[bulb.x, bulb.y, FRONT + 0.08]}>
		<T.SphereGeometry args={[0.02, 8, 8]} />
		<T.MeshBasicMaterial color={bulb.color} toneMapped={false} />
	</T.Mesh>
{/each}

<!-- Five stockings hanging from the mantel -->
{#each stockings as stocking (stocking.x)}
	<T.Group position={[stocking.x, mantelTop - 0.18, FRONT + 0.06]}>
		<!-- Hook -->
		<T.Mesh position.y={0.03}>
			<T.BoxGeometry args={[0.03, 0.08, 0.03]} />
			<T.MeshStandardMaterial color={BRASS} metalness={0.8} roughness={0.3} />
		</T.Mesh>
		<!-- Cuff -->
		<T.Mesh position.y={-0.06} castShadow>
			<RoundedBoxGeometry args={[0.22, 0.12, 0.09]} radius={0.03} />
			<T.MeshStandardMaterial color={stocking.cuff} roughness={1} />
		</T.Mesh>
		<!-- Leg -->
		<T.Mesh position.y={-0.27} castShadow>
			<RoundedBoxGeometry args={[0.17, 0.32, 0.07]} radius={0.03} />
			{#if stocking.body === 'knit'}
				<T.MeshStandardMaterial map={knit} roughness={1} />
			{:else}
				<T.MeshStandardMaterial color={stocking.body === 'red' ? RED : WHITE} roughness={1} />
			{/if}
		</T.Mesh>
		<!-- Foot -->
		<T.Mesh position={[0.05, -0.44, 0]} castShadow>
			<RoundedBoxGeometry args={[0.26, 0.13, 0.07]} radius={0.04} />
			{#if stocking.body === 'knit'}
				<T.MeshStandardMaterial map={knit} roughness={1} />
			{:else}
				<T.MeshStandardMaterial color={stocking.body === 'red' ? RED : WHITE} roughness={1} />
			{/if}
		</T.Mesh>
	</T.Group>
{/each}
