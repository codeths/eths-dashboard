import { Umzug } from 'umzug';

const ARGS = process.argv;

const migrationTemplate = `import type { MigrationAction } from 'src/migrations.service';

export const up: MigrationAction = async ({ context }) => {};
export const down: MigrationAction = async ({ context }) => {};
`;

switch (ARGS[2]) {
  case 'createMigration':
    if (!ARGS[3]) {
      console.log('[createMigration]: Please specify a name for the migration');
      break;
    }
    await createMigration(ARGS[3]);
    break;
  default:
    console.log('no command given');
    break;
}

async function createMigration(name) {
  const FOLDER = 'src/migrations';
  const umzug = new Umzug({
    migrations: { glob: `${FOLDER}/*.js` },
  });

  const res = await umzug.create({
    name: `${name}.ts`,
    folder: FOLDER,
    skipVerify: true,
    content: migrationTemplate,
  });
  console.log('[createMigration]: Migration created successfully');
}
