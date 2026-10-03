<script lang="ts">
	// The whole 3D experience. Browser-only (WebGL, canvas textures, Rapier WASM), so the
	// page imports it lazily and only for visitors who are allowed in.
	import { Canvas } from '@threlte/core';
	import { ACESFilmicToneMapping, PCFShadowMap } from 'three';
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

<div class="fixed inset-0 overflow-hidden bg-[#0d0705] select-none">
	<Canvas toneMapping={ACESFilmicToneMapping} shadows={PCFShadowMap} dpr={[1, 2]}>
		<Scene />
	</Canvas>
	<HUD />
	<StartOverlay />
</div>
