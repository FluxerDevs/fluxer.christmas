/**
 * Keyboard input bound to physical key positions (`KeyboardEvent.code`), so WASD
 * stays under the left hand on AZERTY, QWERTZ, Dvorak, Colemak and so on. Labels
 * shown to the player are translated back to whatever their layout prints on the key.
 */
import { load, save } from './storage';

export type Action = 'forward' | 'backward' | 'left' | 'right' | 'run';

export const ACTIONS: Action[] = ['forward', 'backward', 'left', 'right', 'run'];

export const DEFAULT_BINDINGS: Record<Action, string[]> = {
	forward: ['KeyW', 'ArrowUp'],
	backward: ['KeyS', 'ArrowDown'],
	left: ['KeyA', 'ArrowLeft'],
	right: ['KeyD', 'ArrowRight'],
	run: ['ShiftLeft', 'ShiftRight']
};

export const LAYOUTS = ['auto', 'qwerty', 'azerty', 'qwertz', 'dvorak', 'colemak'] as const;
export type Layout = (typeof LAYOUTS)[number];

/** Characters printed on the keys that differ from QWERTY, by physical position. */
const LAYOUT_KEYS: Record<Exclude<Layout, 'auto' | 'qwerty'>, Record<string, string>> = {
	azerty: { KeyQ: 'A', KeyA: 'Q', KeyW: 'Z', KeyZ: 'W', Semicolon: 'M', KeyM: ',' },
	qwertz: { KeyY: 'Z', KeyZ: 'Y' },
	dvorak: {
		KeyQ: "'",
		KeyW: ',',
		KeyE: '.',
		KeyR: 'P',
		KeyT: 'Y',
		KeyY: 'F',
		KeyU: 'G',
		KeyI: 'C',
		KeyO: 'R',
		KeyP: 'L',
		KeyS: 'O',
		KeyD: 'E',
		KeyF: 'U',
		KeyG: 'I',
		KeyH: 'D',
		KeyJ: 'H',
		KeyK: 'T',
		KeyL: 'N',
		Semicolon: 'S',
		KeyZ: ';',
		KeyX: 'Q',
		KeyC: 'J',
		KeyV: 'K',
		KeyB: 'X',
		KeyN: 'B',
		Comma: 'W',
		Period: 'V',
		Slash: 'Z'
	},
	colemak: {
		KeyE: 'F',
		KeyR: 'P',
		KeyT: 'G',
		KeyY: 'J',
		KeyU: 'L',
		KeyI: 'U',
		KeyO: 'Y',
		KeyP: ';',
		KeyS: 'R',
		KeyD: 'S',
		KeyF: 'T',
		KeyG: 'D',
		KeyJ: 'N',
		KeyK: 'E',
		KeyL: 'I',
		Semicolon: 'O',
		KeyN: 'K'
	}
};

const NAMED_KEYS: Record<string, string> = {
	ArrowUp: '↑',
	ArrowDown: '↓',
	ArrowLeft: '←',
	ArrowRight: '→',
	ShiftLeft: 'Shift',
	ShiftRight: 'Shift',
	ControlLeft: 'Ctrl',
	ControlRight: 'Ctrl',
	AltLeft: 'Alt',
	AltRight: 'AltGr',
	Space: 'Space',
	Enter: 'Enter',
	Tab: 'Tab',
	Backspace: '⌫',
	CapsLock: 'Caps'
};

/** Best guess when the browser can't tell us the layout and the player hasn't pressed the key yet. */
function guessLayout(): Exclude<Layout, 'auto'> {
	const language = (navigator.language ?? '').toLowerCase();
	if (language === 'fr-ca') return 'qwerty';
	if (language === 'fr-ch') return 'qwertz';
	if (language.startsWith('fr')) return 'azerty';
	if (['de', 'cs', 'sk', 'hu', 'sl', 'hr', 'sq'].includes(language.split('-')[0])) return 'qwertz';
	return 'qwerty';
}

function isTyping(target: EventTarget | null) {
	return (
		target instanceof HTMLElement &&
		(target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
	);
}

class Input {
	bindings = $state<Record<Action, string[]>>(structuredClone(DEFAULT_BINDINGS));
	/** Keyboard layout used for labels; 'auto' detects it. */
	layout = $state<Layout>('auto');
	/** Labels learned from the browser's layout map and from keys the player pressed. */
	#detected = $state<Record<string, string>>({});

	/** Physical keys currently held. Not reactive: read every frame. */
	#down = new Set<string>();

	isDown(action: Action) {
		return this.bindings[action].some((code) => this.#down.has(code));
	}

	/** Movement input: x = strafe right, y = forward. */
	vector() {
		const x = Number(this.isDown('right')) - Number(this.isDown('left'));
		const y = Number(this.isDown('forward')) - Number(this.isDown('backward'));
		return { x, y };
	}

	/** Releases every key, e.g. when the window loses focus mid-press. */
	clear() {
		this.#down.clear();
	}

	/** What the player's keyboard prints on the key at this physical position. */
	label(code: string) {
		if (NAMED_KEYS[code]) return NAMED_KEYS[code];
		const layout = this.layout === 'auto' ? undefined : this.layout;
		if (layout && layout !== 'qwerty' && LAYOUT_KEYS[layout][code])
			return LAYOUT_KEYS[layout][code];
		if (!layout && this.#detected[code]) return this.#detected[code];
		if (!layout) {
			const guess = guessLayout();
			if (guess !== 'qwerty' && LAYOUT_KEYS[guess][code]) return LAYOUT_KEYS[guess][code];
		}
		if (code.startsWith('Key')) return code.slice(3);
		if (code.startsWith('Digit')) return code.slice(5);
		return code;
	}

	bind(action: Action, slot: number, code: string) {
		// A key drives a single action: take it away from every other binding first.
		for (const other of ACTIONS) {
			if (other !== action) this.bindings[other] = this.bindings[other].filter((c) => c !== code);
		}
		const index = Math.min(slot, this.bindings[action].length);
		const codes = [...this.bindings[action]];
		codes[index] = code;
		this.bindings[action] = codes.filter((c, i) => i === index || c !== code);
		save('bindings', this.bindings);
	}

	resetBindings() {
		this.bindings = structuredClone(DEFAULT_BINDINGS);
		save('bindings', this.bindings);
	}

	setLayout(layout: Layout) {
		this.layout = layout;
		save('layout', layout);
	}

	#remember(event: KeyboardEvent) {
		// A single printable character tells us exactly what this key is on the player's layout.
		if (event.key.length !== 1 || event.key === ' ') return;
		const label = event.key.toUpperCase();
		if (this.#detected[event.code] !== label) this.#detected[event.code] = label;
	}

	/** Starts listening to the keyboard. Returns a cleanup function. */
	attach() {
		const stored = load<Partial<Record<Action, string[]>>>('bindings', {});
		for (const action of ACTIONS) {
			const codes = stored[action];
			if (Array.isArray(codes) && codes.every((code) => typeof code === 'string'))
				this.bindings[action] = codes;
		}
		const layout = load<Layout>('layout', 'auto');
		if (LAYOUTS.includes(layout)) this.layout = layout;

		// Chromium can report the whole layout up front.
		const keyboard = (
			navigator as Navigator & {
				keyboard?: { getLayoutMap?: () => Promise<Map<string, string>> };
			}
		).keyboard;
		keyboard
			?.getLayoutMap?.()
			.then((map) => {
				for (const [code, key] of map) {
					if (key.length === 1 && !this.#detected[code]) this.#detected[code] = key.toUpperCase();
				}
			})
			.catch(() => {});

		const onKeyDown = (event: KeyboardEvent) => {
			if (isTyping(event.target)) return;
			this.#down.add(event.code);
			this.#remember(event);
		};
		const onKeyUp = (event: KeyboardEvent) => this.#down.delete(event.code);
		const onBlur = () => this.clear();

		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);
		window.addEventListener('blur', onBlur);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
			window.removeEventListener('blur', onBlur);
			this.clear();
		};
	}
}

export const input = new Input();
