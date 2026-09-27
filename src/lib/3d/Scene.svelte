<script lang="ts">
	import { Debug, World } from '@threlte/rapier';
	import { Vector3 } from 'three';
	import { page } from '$app/state';
	import { PLAYER } from '$lib/game/player';
	import { LAYOUT } from '$lib/game/world';
	import Camera from './Camera.svelte';
	import Environment from './Environment.svelte';
	import Player from './Player.svelte';
	import Room from './Room.svelte';
	import StaticColliders from './StaticColliders.svelte';
	import Bookshelves from './furniture/Bookshelves.svelte';
	import Chandelier from './furniture/Chandelier.svelte';
	import ChristmasTree from './furniture/ChristmasTree.svelte';
	import CoffeeTable from './furniture/CoffeeTable.svelte';
	import Fireplace from './furniture/Fireplace.svelte';
	import FloorLamp from './furniture/FloorLamp.svelte';
	import Presents from './furniture/Presents.svelte';
	import RockingChair from './furniture/RockingChair.svelte';
	import Rug from './furniture/Rug.svelte';
	import Sofa from './furniture/Sofa.svelte';

	/** Shared between Player (writes) and Camera (reads); starts at the spawn point. */
	const eye = new Vector3(...PLAYER.spawn);

	/** Add `?debug` to the URL to see the Rapier colliders. */
	const debug = $derived(page.url.searchParams.has('debug'));
</script>

<!-- Camera lives outside the physics world so the room is visible while Rapier loads. -->
<Camera follow={eye} />
<Environment />

<Room />
<Rug />
<Fireplace />
<ChristmasTree />
<Presents />
<Bookshelves />
<CoffeeTable />
<Sofa placement={LAYOUT.sofaLeft} blanketSide={-1} />
<Sofa placement={LAYOUT.sofaRight} blanketSide={1} fabric="#4a3a2a" />
<RockingChair />
<FloorLamp />
<Chandelier />

<World>
	<StaticColliders />
	<Player {eye} />
	{#if debug}
		<Debug />
	{/if}
</World>
