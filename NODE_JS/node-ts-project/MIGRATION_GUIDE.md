# Custom Database Migration System - Complete Guide

**Project**: ts-project (Express + TypeScript + PostgreSQL)  
**Date**: 2026-11-11  
**Status**: Migration System Implemented ✅  
**Level**: Intermediate

---

## 📚 Table of Contents

1. [What Are Migrations?](#what-are-migrations)
2. [Line-by-Line Code Explanation](#line-by-line-explanation)
3. [How the Migration System Works](#how-migrations-work)
4. [File Structure](#file-structure)
5. [Creating Migration Files](#creating-migration-files)
6. [Running Migrations](#running-migrations)
7. [Input/Output Examples](#inputoutput-examples)
8. [Interview Questions](#interview-questions)
9. [Common Issues & Solutions](#common-issues--solutions)
10. [Best Practices](#best-practices)

---

## 🏗️ What Are Migrations?

### Definition:
**Migrations** are version-controlled SQL scripts that modify your database schema over time. They ensure consistency across all environments (dev, staging, production).

### Why Use Migrations?

```
❌ WITHOUT Migrations:
Developer A: Manually creates table
Developer B: Creates different table structure
Production: Uses yet another structure
Result: Data inconsistencies! 🔥

✅ WITH Migrations:
Developer A: Creates migration file
Developer B: Runs same migration
Production: Runs same migration
Result: Consistent database! ✅
```

### Key Benefits:

1. **Version Control**: Track all schema changes in Git
2. **Repeatability**: Same migrations run everywhere
3. **Rollback Capability**: Undo changes if needed
4. **Collaboration**: Multiple developers work safely
5. **Automation**: Run automatically in CI/CD pipelines
6. **Audit Trail**: Know who changed what and when

---

## 🔍 Line-by-Line Code Explanation

### File: `src/scripts/migrate.ts`

#### Lines 1-5: Imports

```typescript
import path from "node:path";
import { pool } from "../libs/db";
import fs from "node:fs";
import { logger } from "../libs/logger";
```

**Explanation**:

| Import | What It Does | Why We Need It |
|--------|------------|-----------------|
| `path` | Handle file paths (cross-platform) | Join paths correctly on Windows/Linux/Mac |
| `pool` | PostgreSQL connection pool | Execute SQL queries |
| `fs` | File system operations | Read .sql migration files |
| `logger` | Logging utility | Log migration progress |

**Example**:
```typescript
// path helps us build correct paths
const migrationPath = path.join('migration', 'users.sql');
// Windows: migration\users.sql
// Linux:   migration/users.sql
```

---

#### Lines 7-8: Migration Directory Setup

```typescript
const MIGRATION_DIR = path.join(process.cwd(), 'migration');
```

**Breakdown**:
- `process.cwd()` = Current working directory of Node.js process
- `path.join(...)` = Combines paths correctly
- `MIGRATION_DIR` = Absolute path to migration folder

**Example Output**:
```
process.cwd() = C:\RAVI_KANT_YADAV\Self_Study\Learning_FullStack\NODE_JS\node-ts-project

MIGRATION_DIR = C:\...\node-ts-project\migration
```

**Why?**: Ensures migrations folder is found regardless of where script runs from.

---

#### Lines 11-17: Create Migrations Table

```typescript
const CREATE_MIGRATIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS migrations(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP NOT NULL DEFAULT NOW()
)
`;
```

**What This Does**:

Creates a **migrations tracking table** to record which migrations have run.

**Table Structure**:

| Column | Type | Purpose |
|--------|------|---------|
| `id` | SERIAL (auto-increment) | Unique identifier |
| `name` | VARCHAR(255) UNIQUE | Migration filename (must be unique) |
| `executed_at` | TIMESTAMP | When migration ran |

**Example Data**:
```
id │          name           │      executed_at
───┼─────────────────────────┼──────────────────────
1  │ 001_create_users.sql    │ 2026-11-11 14:30:45
2  │ 002_create_posts.sql    │ 2026-11-11 14:31:20
3  │ 003_add_email_users.sql │ 2026-11-11 14:32:10
```

**Why UNIQUE?**: Ensures same migration never runs twice.

---

#### Lines 19-21: Type Definition

```typescript
type MigrationRow = {
    name: string
}
```

**What This Does**:
- Defines TypeScript type for migration table rows
- Used for type safety when querying database

**Why It Matters**:
```typescript
// Without type:
const result = await pool.query(...)
// result.rows is type: any[] (no autocomplete)

// With type:
const result = await pool.query<MigrationRow>(...)
// result.rows is type: MigrationRow[] (full autocomplete)
```

---

#### Lines 23-28: Get Executed Migrations

```typescript
async function getExecutedMigration(): Promise<string[]> {
    const result = await pool.query<MigrationRow>(
        "select name from migrations order by name;"
    )
    return result.rows.map((row: MigrationRow) => row.name);
}
```

**Step-by-Step Execution**:

```
1. Query migrations table
   ↓
2. Get all migration names
   ↓
3. Map to string array
   ↓
4. Return names list

Example:
Input:  (query migrations table)
Output: ['001_create_users.sql', '002_create_posts.sql']
```

**What Each Line Does**:

```typescript
const result = await pool.query<MigrationRow>(...)
// Execute SQL query and wait for result

"select name from migrations order by name;"
// Get migration names sorted alphabetically

result.rows.map((row: MigrationRow) => row.name)
// Extract just the name from each row
// { name: '001_create_users.sql' } → '001_create_users.sql'

return result.rows.map(...)
// Return array of names
```

**Return Type**: `Promise<string[]>`
- `Promise` = Async operation (takes time)
- `string[]` = Array of strings (migration names)

---

#### Lines 30-46: Run Individual Migration

```typescript
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
```

**This is the CORE of migrations! Let's break it down:**

##### Step 1: Read Migration File
```typescript
const sql = fs.readFileSync(path.join(MIGRATION_DIR, fileName), 'utf-8');
```

- `fs.readFileSync()` = Read file synchronously
- `path.join(MIGRATION_DIR, fileName)` = Full path to migration file
- `'utf-8'` = Read as text (not binary)
- `sql` = Contains all SQL commands from the file

**Example**:
```typescript
// If fileName = '001_create_users.sql'
// sql = `CREATE TABLE users (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(255)
//       );`
```

##### Step 2: Get Database Connection
```typescript
const client = await pool.connect();
```

- `pool.connect()` = Get one connection from connection pool
- Waits for available connection
- `client` = Single database connection object

**Why Connection Pool?**
```
Without Pool:
New connection per query
  → Slow (establishing connection takes time)
  → Resource intensive
  
With Pool:
Reuse connections
  → Fast (connection already available)
  → Efficient
```

##### Step 3: Transaction Begin

```typescript
try {
    await client.query('BEGIN');
```

- `BEGIN` = Start database transaction
- Groups all following queries together

**What's a Transaction?**

```
Without Transaction:
Query 1 ✅ succeeds
Query 2 ❌ fails
Result: Partial data (BAD!)

With Transaction:
Query 1 ✅ succeeds
Query 2 ❌ fails
Result: Both rolled back (GOOD!)
```

##### Step 4: Execute Migration

```typescript
await client.query(sql);
```

- Executes all SQL from migration file
- Example: `CREATE TABLE`, `ALTER TABLE`, etc.

##### Step 5: Record Migration

```typescript
await client.query('INSERT INTO migrations (name) values ($1)', [fileName]);
```

- Saves migration name to tracking table
- `$1` = Placeholder for parameter
- `[fileName]` = Actual value
- Prevents running same migration twice

##### Step 6: Commit Transaction

```typescript
await client.query('COMMIT');
logger.info(`migration completed: ${fileName}`);
```

- `COMMIT` = Finalize all changes
- Log success

##### Step 7: Error Handling

```typescript
catch (error) {
    await client.query('ROLLBACK');
    throw error;
}
```

- `ROLLBACK` = Undo all changes if error occurs
- `throw error` = Re-throw so caller knows it failed

##### Step 8: Cleanup

```typescript
finally {
    client.release();
}
```

- `release()` = Return connection to pool
- Runs whether success or failure
- Prevents connection leak

**Complete Flow Diagram**:

```
START runMigration('001_create_users.sql')
    ↓
1. Read file → CREATE TABLE users ...
    ↓
2. Get connection
    ↓
3. BEGIN transaction
    ↓
4. Execute: CREATE TABLE users ...  ✅
    ↓
5. INSERT into migrations table  ✅
    ↓
6. COMMIT transaction  ✅
    ↓
7. Release connection
    ↓
8. Log: "migration completed: 001_create_users.sql"
    ↓
END

If any step fails:
    ↓ Jump to catch
    ↓ ROLLBACK (undo everything)
    ↓ Release connection
    ↓ Throw error
```

---

#### Lines 48-52: Get Migration Files

```typescript
function getMigrationFiles(): string[] {
    return fs.readdirSync(MIGRATION_DIR)
        .filter((file) => file.endsWith('.sql'))
        .sort();
}
```

**Step by Step**:

```typescript
fs.readdirSync(MIGRATION_DIR)
// Read all files in migration folder
// Returns: ['001_create_users.sql', 'setup.txt', '002_posts.sql', ...]

.filter((file) => file.endsWith('.sql'))
// Keep only .sql files
// Returns: ['001_create_users.sql', '002_posts.sql']

.sort()
// Sort alphabetically (important for order!)
// Returns: ['001_create_users.sql', '002_posts.sql']
```

**Why Sort?**
```
Without sorting:
→ Random order
→ Dependencies might fail
  (create posts before users table exists)

With sorting:
→ Alphabetical order
→ Using numbers ensures correct sequence
  001_ → 002_ → 003_
```

**Returns**: Array of migration filenames ready to run

---

#### Lines 54-71: Main Migration Function

```typescript
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
```

**Line-by-Line**:

```typescript
await pool.query(CREATE_MIGRATIONS_TABLE_SQL);
```
- Create migrations table if it doesn't exist
- Safe because of "IF NOT EXISTS"

```typescript
const executed = new Set(await getExecutedMigration());
```
- Get all previously run migrations
- Store in `Set` for fast lookup
- Example: `Set {'001_create_users.sql', '002_posts.sql'}`

```typescript
const pending = getMigrationFiles()
    .filter(file => !executed.has(file))
```
- Get all migration files
- Filter to only pending ones (not executed)
- Example: `['003_add_email.sql', '004_users_index.sql']`

```typescript
if (pending.length === 0) {
    logger.info(`No pending migration`);
    return;
}
```
- If no pending migrations, exit early
- Prevents unnecessary processing

```typescript
for (let fileName of pending) {
    await runMigration(fileName);
}
```
- Run each pending migration in order
- Wait for each to complete before next
- Important: Sequential, not parallel!

```typescript
logger.info(`All migration completed`);
```
- Log final success

**Complete Flow**:

```
migrate() called
    ↓
Create migrations table
    ↓
Get executed migrations → Set {'001_...', '002_...'}
    ↓
Get all migration files → ['001_...', '002_...', '003_...', '004_...']
    ↓
Filter to pending → ['003_...', '004_...']
    ↓
Run 003_... → Log "migration completed: 003_..."
    ↓
Run 004_... → Log "migration completed: 004_..."
    ↓
Log "All migration completed"
    ↓
END
```

---

#### Lines 73-77: Error Handling & Cleanup

```typescript
migrate().catch((error) => {
    logger.error({ err: error }, 'Migration failed');
    process.exit(1);
})
    .finally(() => pool.end());
```

**What Each Part Does**:

```typescript
migrate().catch((error) => {
    // If migrate() throws error
    logger.error({ err: error }, 'Migration failed');
    // Log the error
    process.exit(1);
    // Exit with error code 1
})
```

- `catch()` = Handle if migration fails
- `logger.error()` = Log error details
- `process.exit(1)` = Exit with non-zero code (signals error to CLI)

```typescript
.finally(() => pool.end());
```

- Runs regardless of success/failure
- `pool.end()` = Close all database connections
- Cleanup before process exits

---

## 🔄 How Migrations Work

### Step-by-Step Execution Flow

```
npm run migrate (command)
    ↓
1. Load migrate.ts script
    ↓
2. Call migrate() function
    ↓
3. Create migrations table (if missing)
    ↓
4. Query: Which migrations have run?
    ↓
5. Scan: What .sql files exist?
    ↓
6. Compare: Which are pending?
    ↓
7. For each pending:
    - Read .sql file
    - Get database connection
    - Begin transaction
    - Run SQL
    - Record in migrations table
    - Commit
    - Log success
    ↓
8. Close database connection
    ↓
9. Exit process
```

### Visual Example

```
migrations/ folder:
├── 001_create_users.sql
├── 002_create_posts.sql
└── 003_add_email_column.sql

migrations table (initially empty):
(empty)

Step 1: Run migrate
    ↓
Create migrations table
    ↓
Query executed migrations → (empty)
    ↓
Pending: ['001_...', '002_...', '003_...']
    ↓
Run 001_create_users.sql ✅
    ↓
migrations table now:
id │              name              │  executed_at
───┼────────────────────────────────┼─────────────
1  │ 001_create_users.sql           │ 14:30:45
    ↓
Run 002_create_posts.sql ✅
    ↓
migrations table now:
id │              name              │  executed_at
───┼────────────────────────────────┼─────────────
1  │ 001_create_users.sql           │ 14:30:45
2  │ 002_create_posts.sql           │ 14:31:20
    ↓
Run 003_add_email_column.sql ✅
    ↓
migrations table now:
id │              name              │  executed_at
───┼────────────────────────────────┼─────────────
1  │ 001_create_users.sql           │ 14:30:45
2  │ 002_create_posts.sql           │ 14:31:20
3  │ 003_add_email_column.sql       │ 14:32:10
    ↓
Step 2: Run migrate again
    ↓
Query executed migrations → ['001_...', '002_...', '003_...']
    ↓
All files already executed
    ↓
Pending: (empty)
    ↓
Log: "No pending migration"
    ↓
Exit
```

---

## 📁 File Structure

### Directory Layout:

```
node-ts-project/
├── src/
│   ├── scripts/
│   │   └── migrate.ts           ← Main migration script
│   │
│   ├── libs/
│   │   ├── db.ts                ← Database connection pool
│   │   └── logger.ts
│   │
│   └── config/
│       └── env.ts               ← Database URL
│
├── migration/                   ← Migration files folder
│   ├── 001_create_users.sql
│   ├── 002_create_posts.sql
│   └── 003_add_email_column.sql
│
├── package.json
└── tsconfig.json
```

### Dependencies:

```json
{
  "dependencies": {
    "pg": "^8.x.x",           // PostgreSQL client
    "dotenv": "^18.x.x"       // Environment variables
  }
}
```

---

## 📝 Creating Migration Files

### Naming Convention:

```
NNN_description.sql
├── NNN: Sequence number (001, 002, 003, ...)
├── _: Separator
└── description: What the migration does
```

### Example Migration Files:

#### File: `migration/001_create_users.sql`

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

#### File: `migration/002_create_posts.sql`

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
```

#### File: `migration/003_add_email_column.sql`

```sql
ALTER TABLE users
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

UPDATE users SET email_verified = TRUE;
```

### Best Practices for Migration Files:

```sql
-- ✅ GOOD: Clear, commented, idempotent

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    -- Other columns...
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ❌ BAD: No comments, not idempotent

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255)
);

CREATE INDEX idx_users_email ON users(email);
```

---

## 🚀 Running Migrations

### Add npm Script

**In package.json**:
```json
{
  "scripts": {
    "migrate": "tsx src/scripts/migrate.ts",
    "migrate:dev": "NODE_ENV=development npm run migrate"
  }
}
```

### Run Migrations

```bash
# Run migrations
npm run migrate

# Output:
# [14:30:45.123] INFO: migration completed: 001_create_users.sql
# [14:31:20.456] INFO: migration completed: 002_create_posts.sql
# [14:32:10.789] INFO: migration completed: 003_add_email_column.sql
# [14:33:05.012] INFO: All migration completed
```

### Run Again (No Pending)

```bash
npm run migrate

# Output:
# [14:35:00.000] INFO: No pending migration
```

---

## 📊 Input/Output Examples

### Example 1: First Run

**Setup**:
- migrations/ folder has 2 files
- migrations table doesn't exist

**Command**:
```bash
npm run migrate
```

**Console Output**:
```
[2026-11-11T14:30:45.123Z] INFO: migration completed: 001_create_users.sql
[2026-11-11T14:31:20.456Z] INFO: migration completed: 002_create_posts.sql
[2026-11-11T14:32:10.789Z] INFO: All migration completed
```

**Database State**:
```
migrations table:
id │          name           │         executed_at
───┼─────────────────────────┼──────────────────────
1  │ 001_create_users.sql    │ 2026-11-11 14:30:45
2  │ 002_create_posts.sql    │ 2026-11-11 14:31:20

users table:
(created by migration)
id │ email │ username │ password │ created_at │ updated_at
───┼───────┼──────────┼──────────┼────────────┼───────────

posts table:
(created by migration)
id │ user_id │ title │ content │ published │ created_at │ updated_at
───┼─────────┼───────┼─────────┼───────────┼────────────┼───────────
```

---

### Example 2: Add New Migration

**Setup**:
- 2 migrations already run
- Developer adds 003_add_email_column.sql

**Command**:
```bash
npm run migrate
```

**Console Output**:
```
[2026-11-11T14:35:00.000Z] INFO: migration completed: 003_add_email_column.sql
[2026-11-11T14:35:05.123Z] INFO: All migration completed
```

**Database State**:
```
migrations table:
id │          name            │         executed_at
───┼──────────────────────────┼──────────────────────
1  │ 001_create_users.sql     │ 2026-11-11 14:30:45
2  │ 002_create_posts.sql     │ 2026-11-11 14:31:20
3  │ 003_add_email_column.sql │ 2026-11-11 14:35:00

users table:
id │ email │ username │ password │ email_verified │ created_at │ updated_at
───┼───────┼──────────┼──────────┼────────────────┼────────────┼───────────
(email_verified column added!)
```

---

### Example 3: Error Handling

**Setup**:
- Migration 003 has SQL syntax error

**Command**:
```bash
npm run migrate
```

**Console Output**:
```
[2026-11-11T14:40:00.000Z] INFO: migration completed: 001_create_users.sql
[2026-11-11T14:40:05.123Z] INFO: migration completed: 002_create_posts.sql
[2026-11-11T14:40:10.456Z] ERROR: Migration failed
  error: syntax error at or near "CRTEATE"
  file: 003_add_email_column.sql
```

**Database State**:
```
migrations table:
id │          name           │         executed_at
───┼─────────────────────────┼──────────────────────
1  │ 001_create_users.sql    │ 2026-11-11 14:30:45
2  │ 002_create_posts.sql    │ 2026-11-11 14:31:20
(Migration 3 NOT recorded - transaction rolled back!)

users & posts tables:
(Unmodified - changes rolled back)
```

**Why?**: Transaction rolled back, so 003 not recorded. Can fix and retry.

---

## ❓ Interview Questions

### Q1: Why use migrations instead of manually running SQL?

**Answer**:
```
Migrations provide:
1. Version control - Track changes in Git
2. Repeatability - Same changes across environments
3. Audit trail - Know who changed what
4. CI/CD automation - Deploy changes automatically
5. Rollback capability - Undo changes if needed
6. Team collaboration - No conflicting changes

Without migrations:
- Dev changes manually → Git has no record
- Staging different from production
- Hard to debug when schemas diverge
- No way to reverse bad changes
```

---

### Q2: What is a transaction and why does your migration use it?

**Answer**:
```typescript
// BEGIN starts transaction
// All following queries grouped together

try {
    await client.query('BEGIN');
    await client.query(sql);                    // If this fails...
    await client.query('INSERT migrations...'); // Neither runs!
    await client.query('COMMIT');               // Everything confirmed
} catch (error) {
    await client.query('ROLLBACK');             // Undo everything
    throw error;
}
```

**Why It Matters**:
```
Without transaction:
Query 1: ALTER TABLE users ...      ✅ Succeeds
Query 2: INSERT INTO migrations ... ❌ Fails
Result: Table changed but migration not recorded!

With transaction:
Query 1: ALTER TABLE users ...      ✅ Succeeds (buffered)
Query 2: INSERT INTO migrations ... ❌ Fails
Result: All rolled back, try again! ✅
```

**Benefits**:
- All or nothing
- No partial updates
- Safe to retry on failure
- Consistency guaranteed

---

### Q3: Why use a Set for executed migrations?

**Answer**:

```typescript
const executed = new Set(await getExecutedMigration());
// Set: O(1) lookup time
// Array: O(n) lookup time

// Example: 1000 migrations
executed.has('500_users.sql')
// Set: 1 operation
// Array: ~500 operations (on average)

// Finding pending migrations:
const pending = getMigrationFiles()
    .filter(file => !executed.has(file))
    // Fast lookup due to Set
```

**Why Set Over Array?**

| Operation | Set | Array |
|-----------|-----|-------|
| Add | O(1) | O(1) |
| Lookup | O(1) | O(n) |
| Has | O(1) | O(n) |
| Delete | O(1) | O(n) |

For 1000 migrations, Set is ~1000x faster!

---

### Q4: Why must migrations be run in order?

**Answer**:

```
Without order:
Migration 3 runs first
  → CREATE posts table ❌ (users table doesn't exist!)
  → FOREIGN KEY constraint fails
  → Error!

With order:
Migration 1 → CREATE users
Migration 2 → CREATE posts
Migration 3 → Add columns
  → Each migration builds on previous ✅
  → No dependency issues

Naming with numbers ensures order:
001_ → 002_ → 003_ → 004_
↑
Alphabetically sorted = correct order
```

---

### Q5: What happens if you manually edit a migration file?

**Answer**:

```
❌ BAD:
File: 001_create_users.sql (already run)
Content: CREATE TABLE users (id SERIAL)

Then later:
Edit file to: CREATE TABLE users (id SERIAL, email VARCHAR)
Run migrate again

Result:
- 001_create_users.sql already in migrations table
- Will skip it
- Changes never applied!

✅ GOOD:
Create new migration:
File: 002_add_email_column.sql
Content: ALTER TABLE users ADD COLUMN email VARCHAR

Run migrate
- New migration runs
- Changes applied ✅
```

**Rule**: Never edit migration files that have already run!

---

### Q6: How would you rollback a migration?

**Answer**:

```
Option 1: Manual rollback (Simple)
- Write down the SQL to undo
- Execute manually
- DELETE FROM migrations WHERE name = '003_...'

Option 2: Rollback migration (Better)
- Create new migration: 004_rollback_email_column.sql
- Content: ALTER TABLE users DROP COLUMN email;
- Run migrate
- This way, rollback is version controlled

// Not implemented in your script yet, but common pattern:
async function rollback() {
    const executed = await getExecutedMigration();
    const latest = executed[executed.length - 1];
    
    // Optionally run a "down" migration
    const downFile = latest.replace('.sql', '.down.sql');
    await runMigration(downFile);
    
    // Remove from migrations table
    await pool.query('DELETE FROM migrations WHERE name = $1', [latest]);
}
```

---

### Q7: Why use fs.readFileSync instead of async readFile?

**Answer**:

```typescript
// Current (Sync)
const sql = fs.readFileSync(path.join(MIGRATION_DIR, fileName), 'utf-8');
// Blocks thread until file loaded
// Simple to use

// Alternative (Async)
const sql = await fs.promises.readFile(path.join(MIGRATION_DIR, fileName), 'utf-8');
// Doesn't block thread
// More complex

// Why Sync is OK here:
- Migration is one-time setup
- Not in request handler (no concurrent requests)
- File sizes are small
- Simplicity vs performance tradeoff worth it
```

**When to Use Each**:
- **Sync**: Setup scripts, CLI tools, initialization
- **Async**: Web request handlers, real-time systems

---

### Q8: What if the migration script crashes halfway?

**Answer**:

```
Scenario: Script crashes during Query 3 of 5

With transaction:
1. BEGIN - ✅
2. Query A - ✅
3. Query B - ✅
4. Script crashes! ❌
5. COMMIT never called
6. Automatic ROLLBACK ✅

Result:
- All queries undone
- Migration NOT recorded
- Can retry safely

Without transaction:
1. Query A - ✅ (confirmed to disk)
2. Query B - ✅ (confirmed to disk)
3. Query C - ✅ (confirmed to disk)
4. Script crashes! ❌
5. Queries D & E never run
6. Inconsistent state! 🔥

Result:
- Partial data changed
- Migration NOT recorded
- Must manually fix
```

**Conclusion**: Transactions are essential for reliability!

---

### Q9: How would you add a "down" migration to rollback changes?

**Answer**:

```typescript
type Migration = {
    up: string,
    down: string
}

// Migrations could have both directions:
// 001_create_users.up.sql
// 001_create_users.down.sql

async function rollback(steps: number = 1) {
    const executed = await getExecutedMigration();
    const toRollback = executed.slice(-steps); // Last N migrations
    
    // Run in reverse order
    for (let i = toRollback.length - 1; i >= 0; i--) {
        const fileName = toRollback[i];
        const downFile = fileName.replace('.up.sql', '.down.sql');
        
        // Run down migration
        const sql = fs.readFileSync(path.join(MIGRATION_DIR, downFile), 'utf-8');
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            await client.query(sql);
            await client.query('DELETE FROM migrations WHERE name = $1', [fileName]);
            await client.query('COMMIT');
            logger.info(`rolled back: ${fileName}`);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}
```

---

### Q10: How do you handle database connection in development vs production?

**Answer**:

```typescript
// src/config/env.ts

export const env = {
    // Connection string built from environment variables
    databaseUrl: process.env.DATABASE_URL || 
        `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    // Falls back to individual env vars
}

// .env (development)
DATABASE_URL=postgresql://root:password@localhost:5432/dev_db

// Production (set by deployment system)
DATABASE_URL=postgresql://prod_user:encrypted_pass@prod.db.aws.com:5432/prod_db

// Benefits:
- Same code, different databases
- Production secrets from env vars
- No hardcoding
- Easy migration between environments
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "ENOENT: no such file or directory, scandir 'migration'"

**Cause**: Migration folder doesn't exist

**Solution**:
```bash
# Create migration folder
mkdir migration

# Create first migration
touch migration/001_initial_schema.sql
```

---

### Issue 2: "duplicate key value violates unique constraint"

**Cause**: Same migration ran twice

**Solution**:
```bash
# Check what was recorded
psql -U root -d test
SELECT * FROM migrations;

# If duplicate, delete the failed one
DELETE FROM migrations WHERE name = '003_...sql' AND id > 1;

# Fix migration file and retry
npm run migrate
```

---

### Issue 3: "relation 'users' does not exist"

**Cause**: Migrations not run or skipped

**Solution**:
```bash
# Check migration status
psql -U root -d test
SELECT * FROM migrations;

# If empty, migrations were skipped
# Run them:
npm run migrate

# Or manually:
npm run migrate -- --force
```

---

### Issue 4: "Migration failed - transaction rolled back"

**Cause**: SQL syntax error in migration file

**Solution**:
```bash
# Check the migration file for syntax errors
cat migration/003_add_column.sql

# Test SQL manually
psql -U root -d test < migration/003_add_column.sql

# Fix the SQL
vim migration/003_add_column.sql

# Try again (will find it as pending)
npm run migrate
```

---

### Issue 5: Connection pool timeout

**Cause**: Too many migrations, not releasing connections

**Solution**:
```typescript
// Ensure client.release() is always called
async function runMigration(fileName: string): Promise<void> {
    const client = await pool.connect();
    try {
        // queries...
    } catch (error) {
        // handle...
    } finally {
        client.release(); // ← Always release!
    }
}
```

---

## ✅ Best Practices

### 1. File Naming Convention

```
✅ GOOD
001_create_users.sql
002_create_posts.sql
003_add_email_column.sql

❌ BAD
init.sql
schema_changes.sql
users_table.sql
(No sequence, hard to order)
```

### 2. Use Descriptive Names

```
✅ GOOD
005_add_unique_constraint_email.sql
006_create_index_posts_user_id.sql

❌ BAD
005_misc.sql
006_updates.sql
(Unclear what changed)
```

### 3. One Logical Change Per Migration

```
✅ GOOD - File: 007_create_comments_table.sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    post_id INTEGER NOT NULL REFERENCES posts(id),
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

❌ BAD - File: 007_many_changes.sql
CREATE TABLE comments (...);
ALTER TABLE posts ADD COLUMN views_count INTEGER;
ALTER TABLE users ADD COLUMN bio TEXT;
DROP TABLE old_table;
(Too many unrelated changes)
```

### 4. Include Rollback Information

```sql
-- File: 008_add_description_posts.sql
-- To rollback: ALTER TABLE posts DROP COLUMN description;

ALTER TABLE posts
ADD COLUMN description TEXT;
```

### 5. Add Comments to Migrations

```sql
-- File: 009_create_tags_table.sql
-- Purpose: Support tagging system
-- Created: 2026-11-11
-- Author: John Doe

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Junction table for many-to-many relationship
CREATE TABLE post_tags (
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);
```

### 6. Test Migrations Locally First

```bash
# Test on local development database
npm run migrate

# Verify data
psql -U root -d test
SELECT * FROM users;
SELECT * FROM posts;

# Only then commit to git
git add migration/
git commit -m "Add new migration: create comments table"
```

### 7. Never Directly Modify Old Migrations

```
❌ WRONG:
Edit 001_create_users.sql after it's run
Changes won't apply (already recorded)

✅ RIGHT:
Create new migration 010_add_column.sql
Modify only in new migrations
Old migrations stay immutable
```

### 8. Document Database Schema

```bash
# After migrations run, document schema
psql -U root -d test -c "\d"

# Export schema to file
pg_dump -U root -d test --schema-only > schema.sql

# Commit to git for reference
git add schema.sql
```

---

## 📊 Summary Table

| Concept | What | Why | Example |
|---------|------|-----|---------|
| **Migration** | SQL change file | Track schema changes | `001_create_users.sql` |
| **Migration Table** | Records run migrations | Prevent duplicates | `migrations` table |
| **Transaction** | Group queries | All or nothing | BEGIN/COMMIT/ROLLBACK |
| **Connection Pool** | Reuse connections | Performance | `pool.connect()` |
| **Idempotent** | Safe to run multiple | No errors | `IF NOT EXISTS` |

---

## 🎓 Key Takeaways

1. **Migrations = Version Control for Database**
2. **Transactions = Data Integrity**
3. **Sequential Execution = Dependency Safety**
4. **One Change per File = Easy Debugging**
5. **Track Executed = Prevent Duplicates**
6. **Error Handling = Never Partial Updates**

---

## 🚀 Next Steps

### Phase 1: Understand (Now)
- [x] Read this guide
- [x] Understand code line by line
- [x] Study interview questions

### Phase 2: Practice
- [ ] Create first migration: `001_create_users.sql`
- [ ] Run: `npm run migrate`
- [ ] Verify in database
- [ ] Create second migration
- [ ] Run again (test pending detection)

### Phase 3: Extend
- [ ] Add `rollback()` function
- [ ] Create `.down.sql` files for rollback
- [ ] Add `--verbose` flag for logging
- [ ] Add `--rollback` command line option

---

**Status**: ✅ Migration System Implemented & Documented  
**Next**: Practice creating and running migrations  
**Time to Master**: 1-2 weeks with daily practice

---

*Last Updated: 2026-11-11*
