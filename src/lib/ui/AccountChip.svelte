<script lang="ts">
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages.js';

	const user = $derived(page.data.user);
	// `/login` is a server endpoint that redirects to Fluxer, so it needs a full page load.
	const loginHref = $derived(`/login?returnTo=${encodeURIComponent(page.url.pathname)}`);

	const errors: Record<string, () => string> = {
		denied: m.login_error_denied,
		expired: m.login_error_expired,
		failed: m.login_error_failed
	};
	const error = $derived(errors[page.url.searchParams.get('login_error') ?? '']);
</script>

<!-- The static GitHub Pages build has no server to log in with. -->
{#if !__STATIC_SITE__}
	<div class="flex flex-col items-start gap-2">
		{#if user}
			<div
				class="flex items-center gap-3 rounded-full border border-amber-200/30 bg-amber-950/40 py-1 pr-1 pl-1 backdrop-blur-sm"
			>
				<img src={user.avatarUrl} alt="" class="size-8 rounded-full bg-amber-900/60 object-cover" />
				<span class="max-w-40 truncate text-sm text-amber-50">{user.displayName}</span>
				<form method="POST" action="/logout">
					<button
						type="submit"
						class="rounded-full px-3 py-1.5 text-xs text-amber-100/80 hover:bg-amber-100/10 focus-visible:outline-2 focus-visible:outline-amber-300"
					>
						{m.logout()}
					</button>
				</form>
			</div>
		{:else}
			<!-- eslint-disable svelte/no-navigation-without-resolve -- server endpoint, not a page -->
			<a
				href={loginHref}
				data-sveltekit-reload
				class="rounded-full border border-amber-200/30 bg-amber-950/40 px-4 py-2 text-sm text-amber-100 backdrop-blur-sm hover:border-amber-200/60 hover:bg-amber-900/50 focus-visible:outline-2 focus-visible:outline-amber-300"
			>
				{m.login()}
			</a>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		{/if}
		{#if error}
			<p role="status" class="rounded-md bg-red-950/70 px-3 py-1.5 text-xs text-red-100">
				{error()}
			</p>
		{/if}
	</div>
{/if}
