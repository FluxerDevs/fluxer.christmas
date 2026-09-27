<script lang="ts">
	import { T } from '@threlte/core';
	import { Collider } from '@threlte/rapier';
	import { COLLIDERS } from '$lib/game/world';
</script>

<!-- All static collision geometry comes from world.ts so visuals and physics stay in sync. -->
{#each COLLIDERS as box (box.name)}
	<T.Group position={box.center} rotation.y={box.rotationY ?? 0}>
		<Collider
			shape="cuboid"
			args={[box.size[0] / 2, box.size[1] / 2, box.size[2] / 2]}
			friction={0}
		/>
	</T.Group>
{/each}
