import { describe, expect, it, vi } from 'vitest';
import {
	migratePersistedData,
	MigrationError,
	type Migration,
	type PersistedData
} from './persistence';

describe('persistence', () => {
	it('should throw on no migrations', () => {
		const migrations: Migration[] = [];

		expect(() => {
			migratePersistedData(
				{
					version: 1,
					data: {}
				},
				migrations
			);
		}).toThrowError(MigrationError);
	});

	it('should apply migrations in order', () => {
		const initialData: PersistedData<{ count: number }> = {
			version: 1,
			data: { count: 0 }
		};

		const migrations: Migration[] = [
			{
				version: 3,
				up: (data) => {
					return {
						...(data as { count: number; name: string }),
						migratedToV3: true
					};
				}
			},
			{
				version: 2,
				up: (data) => {
					return {
						...(data as { count: number }),
						name: 'migrated to v2'
					};
				}
			}
		];

		const migrated = migratePersistedData<
			{ count: number },
			{ count: number; name: string; migratedToV3: boolean }
		>(initialData, migrations);

		expect(migrated.version).toBe(3);
		expect(migrated.data).toEqual({
			count: 0,
			name: 'migrated to v2',
			migratedToV3: true
		});
	});

	it('should skip migrations for versions already applied', () => {
		const initialData: PersistedData<{ count: number; name: string }> = {
			version: 2,
			data: { count: 5, name: 'existing data' }
		};

		const upFn = vi.fn((data: unknown) => {
			return {
				...(data as { count: number }),
				name: 'migrated to v2'
			};
		});

		const migrations: Migration[] = [
			{
				version: 2,
				up: upFn
			},
			{
				version: 3,
				up: (data) => {
					return {
						...(data as { count: number; name: string }),
						migratedToV3: true
					};
				}
			}
		];

		const migrated = migratePersistedData<
			{ count: number; name: string },
			{ count: number; name: string; migratedToV3: boolean }
		>(initialData, migrations);

		expect(migrated.version).toBe(3);
		expect(migrated.data).toEqual({
			count: 5,
			name: 'existing data',
			migratedToV3: true
		});
		expect(upFn).not.toHaveBeenCalled();
	});
});
