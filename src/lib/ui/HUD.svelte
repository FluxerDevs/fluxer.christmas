<script lang="ts">
	import { fade } from 'svelte/transition';
	import { m } from '$lib/paraglide/messages.js';
	import { game } from '$lib/game/state.svelte';
	import { input, type Action } from '$lib/game/input.svelte';

	let showHints = $state(true);

	// Show the controls each time play (re)starts, then fade them out.
	$effect(() => {
		if (game.phase !== 'playing') return;
		showHints = true;
		const timeout = setTimeout(() => (showHints = false), 6000);
		return () => clearTimeout(timeout);
	});

	/** Label of the primary key bound to an action, as printed on the player's keyboard. */
	const key = (action: Action) => {
		const code = input.bindings[action][0];
		return code ? input.label(code) : '–';
	};

	const controls = $derived([
		{
			keys: [key('forward'), key('left'), key('backward'), key('right')],
			label: m.controls_move()
		},
		{ keys: [key('run')], label: m.controls_run() },
		{ keys: [m.key_mouse()], label: m.controls_look() },
		{ keys: ['Esc'], label: m.controls_pause() }
	]);
</script>

{#if game.phase === 'playing'}
	<!-- Crosshair -->
	<div
		class="pointer-events-none absolute top-1/2 left-1/2 size-1.5 -translate-1/2 rounded-full bg-amber-50/70 shadow-[0_0_6px_rgba(255,200,120,0.8)]"
	></div>

	{#if showHints}
		<ul
			class="pointer-events-none absolute bottom-6 left-6 flex flex-col gap-2 rounded-lg bg-black/35 p-4 text-sm text-amber-50/90 backdrop-blur-sm"
			transition:fade={{ duration: 600 }}
		>
			{#each controls as control (control.label)}
				<li class="flex items-center gap-3">
					<span class="flex gap-1">
						{#each control.keys as key, i (i)}
							<kbd
								class="rounded border border-amber-100/30 bg-amber-950/50 px-1.5 py-0.5 font-mono text-xs"
							>
								{key}
							</kbd>
						{/each}
					</span>
					<span>{control.label}</span>
				</li>
			{/each}
		</ul>
	{/if}
{/if}
