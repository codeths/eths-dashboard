import { Umzug } from 'umzug';

const ARGS = process.argv;

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
  });
  console.log('[createMigration]: Migration created successfully');
}
