import { Vector3 } from 'three';

/** Player capsule and movement tuning (meters, seconds). */
export const PLAYER = {
	spawn: [0, 0.85, 4.4] as [number, number, number],
	/** Initial yaw: 0 looks toward -z, i.e. at the fireplace. */
	spawnYaw: 0,
	radius: 0.28,
	/** Half-height of the capsule's cylindrical section. */
	halfHeight: 0.52,
	/** Camera height above the capsule center (eye ≈ 1.6 m above the floor). */
	eyeOffset: 0.75,
	walkSpeed: 2.6,
	runSpeed: 4.6,
	/** How quickly velocity approaches its target (higher = snappier). */
	acceleration: 12,
	maxPitch: Math.PI / 2 - 0.05
} as const;

/**
 * Mutable, non-reactive state updated every frame by the player and camera.
 * Kept out of `$state` on purpose: it changes at 60+ Hz and nothing in the UI reads it.
 */
export const look = { yaw: PLAYER.spawnYaw, pitch: -0.08 };

/**
 * Converts movement input (x = strafe right, y = forward) into a world-space
 * horizontal velocity for a camera facing `yaw`.
 */
export function inputToVelocity(
	input: { x: number; y: number },
	yaw: number,
	speed: number,
	out = new Vector3()
) {
	const sin = Math.sin(yaw);
	const cos = Math.cos(yaw);
	// Forward is -z at yaw 0; right is +x.
	out.set(-sin * input.y + cos * input.x, 0, -cos * input.y - sin * input.x);
	const length = out.length();
	if (length > 1) out.divideScalar(length);
	return out.multiplyScalar(speed);
}

/** Frame-rate independent exponential smoothing factor. */
export function damp(lambda: number, delta: number) {
	return 1 - Math.exp(-lambda * delta);
}
