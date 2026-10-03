<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { ACESFilmicToneMapping, PCFShadowMap } from 'three';
	import { m } from '$lib/paraglide/messages.js';
	import { watchPointerLock } from '$lib/game/state.svelte';
	import { input } from '$lib/game/input.svelte';
	import { loadSettings } from '$lib/game/settings';
	import Scene from '$lib/3d/Scene.svelte';
	import HUD from '$lib/ui/HUD.svelte';
	import StartOverlay from '$lib/ui/StartOverlay.svelte';

	// `pointerlockchange` isn't in Svelte's typed document events, so subscribe manually.
	$effect(() => watchPointerLock());
	$effect(() => input.attach());
	loadSettings();
</script>

<svelte:head>
	<title>{m.title()}</title>
</svelte:head>

<div class="fixed inset-0 overflow-hidden bg-[#0d0705] select-none">
	<Canvas toneMapping={ACESFilmicToneMapping} shadows={PCFShadowMap} dpr={[1, 2]}>
		<Scene />
	</Canvas>
	<HUD />
	<StartOverlay />
</div>
