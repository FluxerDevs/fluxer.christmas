<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { game } from '$lib/game/state.svelte';
	import { ACTIONS, input, LAYOUTS, type Action, type Layout } from '$lib/game/input.svelte';
	import { SENSITIVITY, setSensitivity } from '$lib/game/settings';

	interface Props {
		open: boolean;
	}

	let { open = $bindable() }: Props = $props();

	let dialog = $state<HTMLDialogElement>();
	/** The binding slot waiting for a key press, if any. */
	let listening = $state<{ action: Action; slot: number }>();

	const actionLabels: Record<Action, () => string> = {
		forward: m.action_forward,
		backward: m.action_backward,
		left: m.action_left,
		right: m.action_right,
		run: m.action_run
	};

	const layoutLabel = (layout: Layout) =>
		layout === 'auto' ? m.settings_layout_auto() : layout.toUpperCase();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});

	// While rebinding, grab the next key before the game or the dialog sees it.
	$effect(() => {
		if (!listening) return;
		const target = listening;
		const onKeyDown = (event: KeyboardEvent) => {
			event.preventDefault();
			event.stopPropagation();
			if (event.code !== 'Escape') input.bind(target.action, target.slot, event.code);
			listening = undefined;
		};
		window.addEventListener('keydown', onKeyDown, { capture: true });
		return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
	});
</script>

<dialog
	bind:this={dialog}
	onclose={() => {
		open = false;
		listening = undefined;
	}}
	aria-labelledby="settings-title"
	class="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-amber-200/20 bg-[#1d0f09]/95 p-0 text-amber-50 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
>
	<div class="flex max-h-[calc(100dvh-2rem)] flex-col gap-6 overflow-y-auto p-6">
		<header class="flex items-center justify-between">
			<h2 id="settings-title" class="font-serif text-2xl">{m.settings()}</h2>
			<button
				type="button"
				class="rounded-md px-3 py-1 text-sm text-amber-100/80 hover:bg-amber-100/10 focus-visible:outline-2 focus-visible:outline-amber-300"
				onclick={() => (open = false)}
			>
				{m.settings_close()}
			</button>
		</header>

		<label class="flex flex-col gap-2">
			<span class="text-sm font-medium">{m.settings_sensitivity()}</span>
			<input
				type="range"
				min={SENSITIVITY.min}
				max={SENSITIVITY.max}
				step={SENSITIVITY.step}
				value={game.sensitivity}
				oninput={(event) => setSensitivity(event.currentTarget.valueAsNumber)}
				class="accent-amber-400"
			/>
		</label>

		<label class="flex flex-col gap-2">
			<span class="text-sm font-medium">{m.settings_layout()}</span>
			<select
				value={input.layout}
				onchange={(event) => input.setLayout(event.currentTarget.value as Layout)}
				class="rounded-md border border-amber-200/25 bg-black/40 px-3 py-2 text-amber-50"
			>
				{#each LAYOUTS as layout (layout)}
					<option value={layout}>{layoutLabel(layout)}</option>
				{/each}
			</select>
			<span class="text-xs text-amber-100/65">{m.settings_layout_hint()}</span>
		</label>

		<section class="flex flex-col gap-3">
			<div>
				<h3 class="text-sm font-medium">{m.settings_controls()}</h3>
				<p class="text-xs text-amber-100/65">{m.settings_rebind_hint()}</p>
			</div>
			<ul class="flex flex-col gap-2">
				{#each ACTIONS as action (action)}
					<li class="flex items-center justify-between gap-4">
						<span class="text-sm">{actionLabels[action]()}</span>
						<span class="flex gap-2">
							{#each [0, 1] as slot (slot)}
								{@const code = input.bindings[action][slot]}
								{@const waiting = listening?.action === action && listening.slot === slot}
								<button
									type="button"
									class="min-w-16 rounded-md border border-amber-200/25 bg-amber-950/50 px-2 py-1 font-mono text-xs hover:border-amber-300/60 focus-visible:outline-2 focus-visible:outline-amber-300"
									class:animate-pulse={waiting}
									onclick={() => (listening = { action, slot })}
								>
									{waiting
										? m.settings_press_key()
										: code
											? input.label(code)
											: m.settings_unbound()}
								</button>
							{/each}
						</span>
					</li>
				{/each}
			</ul>
			<button
				type="button"
				class="self-start rounded-md px-3 py-1 text-sm text-amber-100/80 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-amber-300"
				onclick={() => input.resetBindings()}
			>
				{m.settings_reset()}
			</button>
		</section>

		<footer class="border-t border-amber-200/15 pt-4 text-xs text-amber-100/65">
			<h3 class="mb-1 font-medium text-amber-100/85">{m.credits()}</h3>
			<p>
				<a
					href="https://sketchfab.com/3d-models/gingy-shrek-cea352f1dd9848cdbdb748d1926c05be"
					target="_blank"
					rel="noopener noreferrer"
					class="underline underline-offset-2 hover:text-amber-50"
				>
					{m.credits_gingy({ author: 'tannersprague938' })}
				</a>
			</p>
		</footer>
	</div>
</dialog>
