export interface MigrationInfo {
	version: number;
}

export interface PersistedData<T> extends MigrationInfo {
	data: T;
}

export interface Migration {
	version: number;
	up: (data: unknown) => unknown;
}

export class MigrationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'MigrationError';
	}
}

export function migratePersistedData<T, O>(data: PersistedData<T>, migrations: Migration[]) {
	let migratedData: unknown = data.data;

	if (migrations.length === 0) {
		throw new MigrationError('No migrations provided');
	}

	const sortedMigrations = migrations
		.filter((migration) => migration.version > data.version)
		.sort((a, b) => a.version - b.version);

	let appliedVersion = data.version;

	sortedMigrations.forEach((migration) => {
		migratedData = migration.up(migratedData);

		appliedVersion = migration.version;
	});

	return { version: appliedVersion, data: migratedData as O };
}
