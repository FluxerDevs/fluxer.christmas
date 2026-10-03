import { game } from './state.svelte';
import { load, save } from './storage';

/** Mouse sensitivity range, in radians per pixel. */
export const SENSITIVITY = { min: 0.0006, max: 0.006, step: 0.0001 } as const;

/** Restores saved preferences that live outside the input module. */
export function loadSettings() {
	const sensitivity = load('sensitivity', game.sensitivity);
	if (
		typeof sensitivity === 'number' &&
		sensitivity >= SENSITIVITY.min &&
		sensitivity <= SENSITIVITY.max
	)
		game.sensitivity = sensitivity;
}

export function setSensitivity(value: number) {
	game.sensitivity = value;
	save('sensitivity', value);
}
