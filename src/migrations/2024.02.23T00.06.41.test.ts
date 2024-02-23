import type { MigrationFn } from 'umzug';

export const up: MigrationFn = async (params) => {
  console.log('test');
};
export const down: MigrationFn = async (params) => {};
