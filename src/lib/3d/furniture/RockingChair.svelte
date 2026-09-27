<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { RoundedBoxGeometry } from '@threlte/extras';
	import type { Group } from 'three';
	import { LAYOUT } from '$lib/game/world';
	import { blanketTexture, woodTexture } from '../textures';

	const { position, rotationY } = LAYOUT.rockingChair;
	const wood = woodTexture();
	const blanket = blanketTexture();
	const WOOD = '#6b4226';

	/** Rocker curve radius; the pivot group sits at the curve's center. */
	const R = 1.3;
	const ARC = 0.72;
	const SEAT_Y = 0.47;
	const spindles = [-0.16, -0.08, 0, 0.08, 0.16];

	let rock = $state<Group>();
	let time = 0;
	useTask((delta) => {
		if (!rock) return;
		time += delta;
		const a = Math.sin(time * 1.1) * 0.045;
		// Rolling without slipping: rotate about the curve center and translate by R·a.
		rock.rotation.x = a;
		rock.position.z = R * a;
	});
</script>

<T.Group {position} rotation.y={rotationY}>
	<T.Group bind:ref={rock} position.y={R}>
		<!-- Curved rockers -->
		{#each [-1, 1] as side (side)}
			<T.Group position.x={side * 0.26} rotation.y={Math.PI / 2}>
				<T.Mesh rotation.z={-Math.PI / 2 - ARC / 2} castShadow>
					<T.TorusGeometry args={[R - 0.02, 0.022, 8, 32, ARC]} />
					<T.MeshStandardMaterial map={wood} color={WOOD} roughness={0.55} />
				</T.Mesh>
			</T.Group>
		{/each}

		<T.Group position.y={-R}>
			<!-- Legs -->
			{#each [-1, 1] as sx (sx)}
				{#each [-1, 1] as sz (sz)}
					<T.Mesh position={[sx * 0.26, (SEAT_Y + 0.04) / 2, sz * 0.2]} castShadow>
						<T.CylinderGeometry args={[0.022, 0.022, SEAT_Y - 0.04, 8]} />
						<T.MeshStandardMaterial map={wood} color={WOOD} roughness={0.55} />
					</T.Mesh>
				{/each}
			{/each}

			<!-- Seat -->
			<T.Mesh position.y={SEAT_Y} castShadow receiveShadow>
				<RoundedBoxGeometry args={[0.58, 0.05, 0.52]} radius={0.02} />
				<T.MeshStandardMaterial map={wood} color={WOOD} roughness={0.5} />
			</T.Mesh>

			<!-- Arms -->
			{#each [-1, 1] as side (side)}
				<T.Mesh position={[side * 0.3, SEAT_Y + 0.23, 0]} castShadow>
					<RoundedBoxGeometry args={[0.06, 0.03, 0.54]} radius={0.012} />
					<T.MeshStandardMaterial map={wood} color={WOOD} roughness={0.5} />
				</T.Mesh>
				<T.Mesh position={[side * 0.3, SEAT_Y + 0.11, 0.2]} castShadow>
					<T.CylinderGeometry args={[0.016, 0.016, 0.22, 8]} />
					<T.MeshStandardMaterial map={wood} color={WOOD} roughness={0.5} />
				</T.Mesh>
			{/each}

			<!-- Back, leaning slightly -->
			<T.Group position={[0, SEAT_Y, -0.23]} rotation.x={-0.18}>
				{#each [-1, 1] as side (side)}
					<T.Mesh position={[side * 0.26, 0.42, 0]} castShadow>
						<T.CylinderGeometry args={[0.022, 0.022, 0.84, 8]} />
						<T.MeshStandardMaterial map={wood} color={WOOD} roughness={0.55} />
					</T.Mesh>
				{/each}
				<T.Mesh position.y={0.8} castShadow>
					<RoundedBoxGeometry args={[0.6, 0.09, 0.04]} radius={0.015} />
					<T.MeshStandardMaterial map={wood} color={WOOD} roughness={0.5} />
				</T.Mesh>
				{#each spindles as x (x)}
					<T.Mesh position={[x, 0.4, 0]} castShadow>
						<T.CylinderGeometry args={[0.011, 0.011, 0.72, 6]} />
						<T.MeshStandardMaterial map={wood} color={WOOD} roughness={0.55} />
					</T.Mesh>
				{/each}

				<!-- Blanket draped over the back -->
				<T.Mesh position={[0.02, 0.86, -0.005]} castShadow>
					<RoundedBoxGeometry args={[0.5, 0.04, 0.1]} radius={0.015} />
					<T.MeshStandardMaterial map={blanket} roughness={1} />
				</T.Mesh>
				<T.Mesh position={[0.02, 0.62, 0.045]} castShadow>
					<RoundedBoxGeometry args={[0.5, 0.5, 0.03]} radius={0.012} />
					<T.MeshStandardMaterial map={blanket} roughness={1} />
				</T.Mesh>
				<T.Mesh position={[0.02, 0.45, -0.05]} castShadow>
					<RoundedBoxGeometry args={[0.5, 0.84, 0.03]} radius={0.012} />
					<T.MeshStandardMaterial map={blanket} roughness={1} />
				</T.Mesh>
			</T.Group>

			<!-- Folded end of the blanket on the seat -->
			<T.Mesh position={[0.04, SEAT_Y + 0.045, 0.02]} rotation.y={0.12} castShadow>
				<RoundedBoxGeometry args={[0.42, 0.04, 0.36]} radius={0.015} />
				<T.MeshStandardMaterial map={blanket} roughness={1} />
			</T.Mesh>
		</T.Group>
	</T.Group>
</T.Group>
