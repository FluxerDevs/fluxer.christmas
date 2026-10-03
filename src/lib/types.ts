/** The logged-in Fluxer user as the client sees it. */
export interface SessionUser {
	id: string;
	username: string;
	/** Display name, falling back to the username. */
	displayName: string;
	avatarUrl: string;
}
