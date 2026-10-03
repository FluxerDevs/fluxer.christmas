/**
 * SQLite database in `DATA_DIR` (a mounted volume in production). Opened lazily so
 * that building the app never touches the file system.
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { config } from './env';

/** Schema changes, applied in order. Never edit a released entry; append a new one. */
const MIGRATIONS = [
	`
	CREATE TABLE users (
		id TEXT PRIMARY KEY,
		username TEXT NOT NULL,
		global_name TEXT,
		avatar TEXT,
		-- Player model customization (AvatarConfig JSON), set from the game
		avatar_config TEXT,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL
	);

	CREATE TABLE sessions (
		-- SHA-256 of the session cookie value; the raw value is never stored
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
		access_token TEXT NOT NULL,
		refresh_token TEXT,
		access_expires_at INTEGER NOT NULL,
		expires_at INTEGER NOT NULL,
		created_at INTEGER NOT NULL
	);
	CREATE INDEX sessions_user ON sessions (user_id);

	CREATE TABLE rooms (
		owner_id TEXT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
		-- RoomState JSON
		layout TEXT NOT NULL,
		updated_at INTEGER NOT NULL
	);

	CREATE TABLE invites (
		code TEXT PRIMARY KEY,
		owner_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
		password_hash TEXT,
		expires_at INTEGER,
		revoked_at INTEGER,
		created_at INTEGER NOT NULL
	);
	CREATE INDEX invites_owner ON invites (owner_id);
	`
];

function migrate(db: DatabaseSync) {
	const { user_version: version } = db.prepare('PRAGMA user_version').get() as {
		user_version: number;
	};
	for (let i = version; i < MIGRATIONS.length; i++) {
		db.exec('BEGIN');
		try {
			db.exec(MIGRATIONS[i]);
			db.exec(`PRAGMA user_version = ${i + 1}`);
			db.exec('COMMIT');
		} catch (error) {
			db.exec('ROLLBACK');
			throw error;
		}
	}
}

let db: DatabaseSync | undefined;

export function getDb() {
	if (db) return db;
	mkdirSync(config.dataDir, { recursive: true });
	db = new DatabaseSync(join(config.dataDir, 'fluxer-christmas.db'));
	db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
	migrate(db);
	return db;
}
