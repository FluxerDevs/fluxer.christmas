<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	// `page.url.pathname` includes the base path, which `resolve` adds again.
	const base = resolve('/').slice(0, -1);
	const path = $derived(page.url.pathname.slice(base.length) || '/');
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(path, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
