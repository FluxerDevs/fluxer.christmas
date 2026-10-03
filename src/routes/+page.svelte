<script lang="ts">
	import { browser } from '$app/environment';
	import { m } from '$lib/paraglide/messages.js';
	import WipScreen from '$lib/ui/WipScreen.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Only download the 3D bundle for visitors who will see it.
	const experience = $derived(
		browser && data.allowed ? import('$lib/Experience.svelte') : undefined
	);
</script>

<svelte:head>
	<title>{m.title()}</title>
</svelte:head>

{#if !data.allowed}
	<WipScreen user={data.user} />
{:else}
	<div class="fixed inset-0 bg-[#0d0705]">
		{#await experience then module}
			{#if module}
				<module.default />
			{/if}
		{/await}
	</div>
{/if}
