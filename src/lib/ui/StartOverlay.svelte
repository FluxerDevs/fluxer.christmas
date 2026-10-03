<script lang="ts">
	import { fade } from 'svelte/transition';
	import { m } from '$lib/paraglide/messages.js';
	import { enterRoom, game } from '$lib/game/state.svelte';
	import SettingsPanel from './SettingsPanel.svelte';

	let settingsOpen = $state(false);

	const action = $derived(
		!game.ready ? m.loading() : game.phase === 'paused' ? m.resume() : m.enter()
	);
</script>

{#if game.phase !== 'playing'}
	<div
		class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(40,14,6,0.3)_0%,rgba(10,4,2,0.85)_75%)] text-amber-50"
		transition:fade={{ duration: 400 }}
	>
		<!-- The whole overlay is the click target -->
		<button
			type="button"
			class="absolute inset-0 cursor-pointer disabled:cursor-wait"
			aria-label={action}
			disabled={!game.ready}
			onclick={enterRoom}
		></button>

		<div
			class="pointer-events-none relative flex h-full flex-col items-center justify-center gap-6"
		>
			<h1
				class="text-center font-serif text-5xl tracking-wide drop-shadow-[0_0_24px_rgba(255,160,70,0.55)] sm:text-7xl"
			>
				{game.phase === 'paused' ? m.paused() : m.title()}
			</h1>
			{#if game.phase === 'intro'}
				<p class="max-w-md px-4 text-center font-serif text-lg text-amber-100/80 italic">
					{m.tagline()}
				</p>
			{/if}
			<span
				class="mt-4 rounded-full border border-amber-200/40 bg-amber-900/30 px-6 py-2 text-sm tracking-[0.2em] text-amber-100 uppercase backdrop-blur-sm"
				class:animate-pulse={game.ready}
			>
				{action}
			</span>
		</div>

		<button
			type="button"
			class="absolute top-4 right-4 rounded-full border border-amber-200/30 bg-amber-950/40 px-4 py-2 text-sm text-amber-100 backdrop-blur-sm hover:border-amber-200/60 hover:bg-amber-900/50 focus-visible:outline-2 focus-visible:outline-amber-300"
			onclick={() => (settingsOpen = true)}
		>
			{m.settings()}
		</button>
	</div>
{/if}

<SettingsPanel bind:open={settingsOpen} />
