<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import type { SessionUser } from '$lib/types';
	import AccountChip from './AccountChip.svelte';

	interface Props {
		user: SessionUser | null;
	}

	let { user }: Props = $props();

	const COMMUNITY_URL = 'https://fluxer.gg/dh9m2Iqo';
</script>

<main
	class="wip relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#0d0705] px-4 py-16 text-amber-50"
>
	<div class="relative flex max-w-lg flex-col items-center gap-6 text-center">
		<span
			class="rounded-full border border-amber-300/40 bg-amber-900/30 px-4 py-1 text-xs tracking-[0.2em] text-amber-200 uppercase"
		>
			{m.wip_badge()}
		</span>

		<h1
			class="font-serif text-5xl tracking-wide drop-shadow-[0_0_24px_rgba(255,160,70,0.55)] sm:text-6xl"
		>
			{m.title()}
		</h1>

		<p class="font-serif text-lg text-amber-100/85 italic">{m.wip_body()}</p>

		<div
			class="mt-2 flex w-full flex-col items-center gap-4 rounded-xl border border-amber-200/15 bg-black/30 p-6 backdrop-blur-sm"
		>
			<p class="text-sm text-amber-100/80">{m.wip_community()}</p>
			<a
				href={COMMUNITY_URL}
				target="_blank"
				rel="noopener noreferrer"
				class="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-amber-950 shadow-[0_0_24px_rgba(255,180,80,0.35)] transition hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
			>
				{m.wip_join()}
			</a>
		</div>

		{#if user}
			<p class="text-sm text-amber-100/70">{m.wip_not_listed({ name: user.displayName })}</p>
			<AccountChip />
		{:else}
			<div class="flex flex-col items-center gap-2">
				<span class="text-sm text-amber-100/70">{m.wip_tester_login()}</span>
				<AccountChip />
			</div>
		{/if}
	</div>
</main>

<style>
	/* Warm hearth glow from below and slow, sparse snowfall. */
	.wip {
		background-image:
			radial-gradient(ellipse at 50% 120%, rgba(255, 140, 50, 0.28), transparent 60%),
			radial-gradient(2px 2px at 20% 30%, rgba(255, 255, 255, 0.55), transparent),
			radial-gradient(2px 2px at 70% 15%, rgba(255, 255, 255, 0.4), transparent),
			radial-gradient(1.5px 1.5px at 40% 60%, rgba(255, 255, 255, 0.45), transparent),
			radial-gradient(2.5px 2.5px at 85% 70%, rgba(255, 255, 255, 0.35), transparent),
			radial-gradient(1.5px 1.5px at 10% 85%, rgba(255, 255, 255, 0.4), transparent);
		background-size:
			100% 100%,
			300px 300px,
			300px 300px,
			300px 300px,
			300px 300px,
			300px 300px;
		animation: snow 40s linear infinite;
	}

	@keyframes snow {
		to {
			background-position:
				0 0,
				40px 300px,
				-30px 300px,
				20px 300px,
				-50px 300px,
				30px 300px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.wip {
			animation: none;
		}
	}
</style>
