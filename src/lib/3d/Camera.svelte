<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Euler, type PerspectiveCamera, type Vector3 } from 'three';
	import { game } from '$lib/game/state.svelte';
	import { look, PLAYER } from '$lib/game/player';

	interface Props {
		/** World position of the player's capsule center; read every frame. */
		follow: Vector3;
	}

	let { follow }: Props = $props();

	let camera = $state<PerspectiveCamera>();
	const euler = new Euler(0, 0, 0, 'YXZ');

	// Mouse look while the pointer is locked.
	function onMouseMove(event: MouseEvent) {
		if (!game.pointerLocked) return;
		// Some browsers report occasional huge spikes right after locking; clamp them.
		const dx = Math.max(-150, Math.min(150, event.movementX));
		const dy = Math.max(-150, Math.min(150, event.movementY));
		look.yaw -= dx * game.sensitivity;
		look.pitch = Math.max(
			-PLAYER.maxPitch,
			Math.min(PLAYER.maxPitch, look.pitch - dy * game.sensitivity)
		);
	}

	useTask(() => {
		if (!camera) return;
		camera.position.set(follow.x, follow.y + PLAYER.eyeOffset, follow.z);
		euler.set(look.pitch, look.yaw, 0);
		camera.quaternion.setFromEuler(euler);
	});
</script>

<svelte:document onmousemove={onMouseMove} />

<T.PerspectiveCamera makeDefault fov={70} near={0.05} far={60} bind:ref={camera} />
