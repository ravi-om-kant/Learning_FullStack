
import path from "node:path";
import { pool } from "../libs/db";
import fs from "node:fs";
import { logger } from "../libs/logger";

// This will get the directory of migration 
const MIGRATION_DIR = path.join(process.cwd(), 'migration');


const CREATE_MIGRATIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS migrations(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP NOT NULL DEFAULT NOW()
)
`;

type MigrationRow = {
    name: string
}

async function getExecutedMigration(): Promise<string[]> {
    const result = await pool.query<MigrationRow>(
        "select name from migrations order by name;"
    )
    return result.rows.map((row: MigrationRow) => row.name);
}

async function runMigration(fileName: string): Promise<void> {
    const sql = fs.readFileSync(path.join(MIGRATION_DIR, fileName), 'utf-8');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO migrations (name) values ($1)', [fileName]);
        await client.query('COMMIT');

        logger.info(`migration completed: ${fileName}`);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

function getMigrationFiles(): string[] {
    return fs.readdirSync(MIGRATION_DIR)
        .filter((file) => file.endsWith('.sql'))
        .sort();
}

async function migrate(): Promise<void> {
    await pool.query(CREATE_MIGRATIONS_TABLE_SQL);

    const executed = new Set(await getExecutedMigration());
    const pending = getMigrationFiles()
        .filter(file => !executed.has(file))

    if (pending.length === 0) {
        logger.info(`No pending migration`);
        return;
    }

    for (let fileName of pending) {
        await runMigration(fileName);
    }

    logger.info(`All migration completed`);
}

migrate()
    .catch((error) => {
        logger.error({ err: error }, 'Migration failed');
        process.exit(1);
    })
    .finally(() => pool.end());
