<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { useInputMap, useKeyboard } from '@threlte/extras';
	import { Collider, RigidBody } from '@threlte/rapier';
	import type { RigidBody as RapierRigidBody } from '@dimforge/rapier3d-compat';
	import { Vector3 } from 'three';
	import { game } from '$lib/game/state.svelte';
	import { damp, inputToVelocity, look, PLAYER } from '$lib/game/player';

	interface Props {
		/** Written every frame with the capsule center (+ head bob) for the camera to follow. */
		eye: Vector3;
	}

	let { eye }: Props = $props();

	let rigidBody = $state<RapierRigidBody>();

	const keyboard = useKeyboard();
	const input = useInputMap(
		({ key }) => ({
			forward: [key('w'), key('ArrowUp')],
			backward: [key('s'), key('ArrowDown')],
			left: [key('a'), key('ArrowLeft')],
			right: [key('d'), key('ArrowRight')],
			run: [key('Shift')]
		}),
		{ keyboard }
	);

	const target = new Vector3();
	let bobPhase = 0;
	let bob = 0;

	useTask((delta) => {
		if (!rigidBody) return;

		const move =
			game.phase === 'playing'
				? input.vector('left', 'right', 'backward', 'forward')
				: { x: 0, y: 0 };
		const speed = input.action('run').pressed ? PLAYER.runSpeed : PLAYER.walkSpeed;
		inputToVelocity(move, look.yaw, speed, target);

		const velocity = rigidBody.linvel();
		const k = damp(PLAYER.acceleration, delta);
		rigidBody.setLinvel(
			{
				x: velocity.x + (target.x - velocity.x) * k,
				y: velocity.y,
				z: velocity.z + (target.z - velocity.z) * k
			},
			true
		);

		const p = rigidBody.translation();

		// Safety net: never fall out of the world.
		if (p.y < -2) {
			rigidBody.setTranslation(
				{ x: PLAYER.spawn[0], y: PLAYER.spawn[1], z: PLAYER.spawn[2] },
				true
			);
			rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
			return;
		}

		// Gentle head bob proportional to walking speed.
		const horizontal = Math.hypot(velocity.x, velocity.z);
		bobPhase += horizontal * delta * 2.4;
		bob += ((horizontal > 0.2 ? Math.sin(bobPhase * 2) * 0.03 : 0) - bob) * damp(10, delta);

		eye.set(p.x, p.y + bob, p.z);
	});
</script>

<T.Group position={PLAYER.spawn}>
	<RigidBody
		bind:rigidBody
		type="dynamic"
		enabledRotations={[false, false, false]}
		canSleep={false}
		ccd
		oncreate={() => {
			game.ready = true;
			return () => (game.ready = false);
		}}
	>
		<Collider shape="capsule" args={[PLAYER.halfHeight, PLAYER.radius]} friction={0} />
	</RigidBody>
</T.Group>
