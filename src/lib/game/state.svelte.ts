export type Phase = 'intro' | 'playing' | 'paused';

class GameState {
	/** Current high-level phase of the experience. */
	phase = $state<Phase>('intro');
	/** True once the physics world and player body exist. */
	ready = $state(false);
	/** Whether the mouse is currently captured by pointer lock. */
	pointerLocked = $state(false);
	/** Radians of rotation per pixel of mouse movement. */
	sensitivity = $state(0.0022);
}

export const game = new GameState();

/** Capture the mouse and start (or resume) playing. */
export async function enterRoom() {
	if (!game.ready) return;
	try {
		await document.body.requestPointerLock();
	} catch {
		// Browsers throttle re-locking right after Esc; the user can simply click again.
	}
}

/**
 * Keeps `game.phase` and `game.pointerLocked` in sync with the browser's pointer lock.
 * Returns a cleanup function.
 */
export function watchPointerLock() {
	const onChange = () => {
		const locked = document.pointerLockElement !== null;
		game.pointerLocked = locked;
		if (locked) game.phase = 'playing';
		else if (game.phase === 'playing') game.phase = 'paused';
	};
	document.addEventListener('pointerlockchange', onChange);
	return () => document.removeEventListener('pointerlockchange', onChange);
}
