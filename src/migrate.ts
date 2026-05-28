import pool from './config/database';
import * as migration001 from './migrations/001_functions_and_schema';
import * as migration002 from './migrations/002_seed_data';

interface Migration {
  name: string;
  up: (client: any) => Promise<void>;
  down?: (client: any) => Promise<void>;
}

const migrations: Migration[] = [migration001, migration002];

async function ensureMigrationsTable(client: any): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id      SERIAL       PRIMARY KEY,
      name    VARCHAR(255) NOT NULL UNIQUE,
      run_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);
}

async function getRanMigrations(client: any): Promise<string[]> {
  const result = await client.query('SELECT name FROM _migrations ORDER BY id ASC');
  return result.rows.map((r: { name: string }) => r.name);
}

async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await ensureMigrationsTable(client);
    const ran = await getRanMigrations(client);

    let count = 0;
    for (const migration of migrations) {
      if (ran.includes(migration.name)) {
        console.log(`  skip  ${migration.name}`);
        continue;
      }
      console.log(`  run   ${migration.name}`);
      await migration.up(client);
      await client.query('INSERT INTO _migrations (name) VALUES ($1)', [migration.name]);
      count++;
    }

    await client.query('COMMIT');
    console.log(`\nMigrations complete. ${count} migration(s) applied.`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

async function rollback(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await ensureMigrationsTable(client);
    const ran = await getRanMigrations(client);

    if (ran.length === 0) {
      console.log('Nothing to roll back.');
      return;
    }

    const lastName = ran[ran.length - 1];
    const migration = [...migrations].reverse().find((m) => m.name === lastName);

    if (!migration) {
      console.log(`Migration file not found for: ${lastName}`);
      return;
    }
    if (!migration.down) {
      console.log(`No down() defined for: ${lastName}`);
      return;
    }

    console.log(`  rollback  ${migration.name}`);
    await migration.down(client);
    await client.query('DELETE FROM _migrations WHERE name = $1', [migration.name]);

    await client.query('COMMIT');
    console.log('Rollback complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

async function status(): Promise<void> {
  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);
    const ran = await getRanMigrations(client);

    console.log('\nMigration status:');
    for (const migration of migrations) {
      const applied = ran.includes(migration.name);
      console.log(`  [${applied ? 'x' : ' '}]  ${migration.name}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

const command = process.argv[2];
const actions: Record<string, () => Promise<void>> = {
  rollback,
  status,
};

const action = actions[command] ?? runMigrations;
action().catch((err) => {
  console.error(err);
  process.exit(1);
});
