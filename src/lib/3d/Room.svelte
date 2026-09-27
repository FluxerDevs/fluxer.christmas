<script lang="ts">
	import { T } from '@threlte/core';
	import { HALF_D, HALF_W, ROOM } from '$lib/game/world';
	import { floorTexture, wallpaperTexture, woodTexture } from './textures';

	const TILE = 0.8;
	const backWallpaper = wallpaperTexture(ROOM.width / TILE, ROOM.height / TILE);
	const sideWallpaper = wallpaperTexture(ROOM.depth / TILE, ROOM.height / TILE);
	const floor = floorTexture(ROOM.width / 2, ROOM.depth / 2);
	const wood = woodTexture();

	const TRIM = '#2e190e';

	type Wall = { position: [number, number, number]; rotationY: number; length: number };
	const walls: Wall[] = [
		{ position: [0, ROOM.height / 2, -HALF_D], rotationY: 0, length: ROOM.width },
		{ position: [0, ROOM.height / 2, HALF_D], rotationY: Math.PI, length: ROOM.width },
		{ position: [-HALF_W, ROOM.height / 2, 0], rotationY: Math.PI / 2, length: ROOM.depth },
		{ position: [HALF_W, ROOM.height / 2, 0], rotationY: -Math.PI / 2, length: ROOM.depth }
	];

	const beams = [-3, 0.2, 3.4];
</script>

<!-- Floor -->
<T.Mesh rotation.x={-Math.PI / 2} receiveShadow>
	<T.PlaneGeometry args={[ROOM.width, ROOM.depth]} />
	<T.MeshStandardMaterial map={floor} color="#b88a68" roughness={0.55} metalness={0.05} />
</T.Mesh>

<!-- Ceiling -->
<T.Mesh position.y={ROOM.height} rotation.x={Math.PI / 2} receiveShadow>
	<T.PlaneGeometry args={[ROOM.width, ROOM.depth]} />
	<T.MeshStandardMaterial color="#b9a58a" roughness={1} />
</T.Mesh>

<!-- Ceiling beams -->
{#each beams as z (z)}
	<T.Mesh position={[0, ROOM.height - 0.11, z]} castShadow receiveShadow>
		<T.BoxGeometry args={[ROOM.width, 0.22, 0.26]} />
		<T.MeshStandardMaterial map={wood} color={TRIM} roughness={0.8} />
	</T.Mesh>
{/each}

<!-- Walls with wallpaper, baseboards and crown molding -->
{#each walls as wall, i (i)}
	<T.Group position={wall.position} rotation.y={wall.rotationY}>
		<T.Mesh receiveShadow>
			<T.PlaneGeometry args={[wall.length, ROOM.height]} />
			<T.MeshStandardMaterial
				map={wall.length === ROOM.width ? backWallpaper : sideWallpaper}
				roughness={0.85}
			/>
		</T.Mesh>

		<!-- Baseboard -->
		<T.Mesh position={[0, -ROOM.height / 2 + 0.1, 0.025]} receiveShadow>
			<T.BoxGeometry args={[wall.length, 0.2, 0.05]} />
			<T.MeshStandardMaterial map={wood} color={TRIM} roughness={0.6} />
		</T.Mesh>
		<T.Mesh position={[0, -ROOM.height / 2 + 0.21, 0.035]}>
			<T.BoxGeometry args={[wall.length, 0.03, 0.03]} />
			<T.MeshStandardMaterial map={wood} color={TRIM} roughness={0.5} />
		</T.Mesh>

		<!-- Crown molding (stepped) -->
		<T.Mesh position={[0, ROOM.height / 2 - 0.09, 0.05]} receiveShadow>
			<T.BoxGeometry args={[wall.length, 0.18, 0.1]} />
			<T.MeshStandardMaterial map={wood} color={TRIM} roughness={0.6} />
		</T.Mesh>
		<T.Mesh position={[0, ROOM.height / 2 - 0.22, 0.03]}>
			<T.BoxGeometry args={[wall.length, 0.06, 0.06]} />
			<T.MeshStandardMaterial map={wood} color={TRIM} roughness={0.5} />
		</T.Mesh>

		<!-- Picture rail -->
		<T.Mesh position={[0, ROOM.height / 2 - 0.55, 0.015]}>
			<T.BoxGeometry args={[wall.length, 0.04, 0.03]} />
			<T.MeshStandardMaterial map={wood} color={TRIM} roughness={0.5} />
		</T.Mesh>
	</T.Group>
{/each}
