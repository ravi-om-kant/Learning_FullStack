# Database Query Errors - Complete Debugging Guide

**Date**: 2026-11-11  
**Error Type**: PostgreSQL Query Errors  
**Status**: ✅ FIXED

---

## 🔴 Error You Got

### Error Message:
```
DatabaseError: column "name" does not exist
Error Code: 42703
```

### Root Causes Found:

**Issue 1 - Line 8**:
```sql
-- ❌ WRONG - Selecting non-existent "name" column
Select id, email, name, role, created_at FROM users where email = $1
                    ↑
                 Doesn't exist!

-- ✅ CORRECT - Only select existing columns
Select id, email, role, created_at FROM users where email = $1
```

**Issue 2 - Line 18**:
```sql
-- ❌ WRONG - Table name is singular
insert into user (email, password_hash) values ($1, $2)
           ↑
        Wrong table name!

-- ✅ CORRECT - Table name is plural
insert into users (email, password_hash) values ($1, $2)
           ↑
        Correct table name
```

---

## 🏗️ Understanding Your Database Schema

### Your Users Table Structure (from migration):

```sql
CREATE TABLE users(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(225) not null unique,
    password_hash text,
    google_id varchar(225) unique,
    role varchar(20) not null default 'USER'
        check (role in ('USER', 'ADMIN')),
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
)
```

### Actual Columns:
```
✅ id
✅ email
✅ password_hash
✅ google_id
✅ role
✅ created_at
✅ updated_at

❌ name (DOES NOT EXIST!)
```

---

## 📚 Common Database Query Errors

### Error Type 1: Column Not Found

```
Error Code: 42703
Message: column "xxx" does not exist
```

**Causes**:
- Typo in column name
- Column doesn't exist in table
- Wrong table name
- Case sensitivity issue

**Example**:
```typescript
// ❌ WRONG
SELECT id, email, name FROM users
                    ↑
             Column doesn't exist

// ✅ CORRECT
SELECT id, email, role FROM users
```

**Fix Checklist**:
- [ ] Check migration file for exact column names
- [ ] Verify table name (singular vs plural)
- [ ] Check for typos
- [ ] Use correct case (PostgreSQL is case-sensitive in quotes)

---

### Error Type 2: Table Not Found

```
Error Code: 42P01
Message: relation "xxx" does not exist
```

**Causes**:
- Wrong table name
- Table doesn't exist
- Migration not run
- Wrong schema

**Example**:
```typescript
// ❌ WRONG - Singular table name
SELECT * FROM user  // Table is "users" (plural)

// ✅ CORRECT
SELECT * FROM users
```

**Fix**:
- Verify table name in migration
- Run migrations: `npm run migrate`
- Check: `psql -U postgres -d test -c "\dt"`

---

### Error Type 3: Invalid Column Type

```
Error Code: 42804
Message: column "xxx" is of type xxx but expression is of type yyy
```

**Example**:
```typescript
// ❌ WRONG - Inserting string into UUID column
INSERT INTO users (id, email) VALUES ('not-a-uuid', 'user@example.com')

// ✅ CORRECT - UUID auto-generated or valid UUID
INSERT INTO users (email) VALUES ('user@example.com')
```

---

### Error Type 4: NOT NULL Violation

```
Error Code: 23502
Message: null value in column "xxx" violates not-null constraint
```

**Example**:
```typescript
// ❌ WRONG - Inserting NULL into NOT NULL column
INSERT INTO users (email, password_hash) VALUES ('user@example.com', NULL)
                                                                      ↑

// ✅ CORRECT - Provide required value
INSERT INTO users (email, password_hash) VALUES ('user@example.com', '$2b$10$hash...')
```

---

### Error Type 5: Duplicate Key Violation

```
Error Code: 23505
Message: duplicate key value violates unique constraint "users_email_key"
```

**Example**:
```typescript
// First insert
INSERT INTO users (email, password_hash) VALUES ('user@example.com', '...')
// ✅ Success

// Second insert with same email
INSERT INTO users (email, password_hash) VALUES ('user@example.com', '...')
// ❌ ERROR - email is unique!
```

**Fix**:
```typescript
// Check if email exists first
SELECT * FROM users WHERE email = 'user@example.com'

// Only insert if doesn't exist
if (!existingUser) {
    INSERT INTO users ...
}
```

---

### Error Type 6: Foreign Key Violation

```
Error Code: 23503
Message: insert or update on table "xxx" violates foreign key constraint
```

**Example**:
```typescript
// users table exists, posts table has user_id FK
// ❌ WRONG - Insert post with non-existent user_id
INSERT INTO posts (user_id, title) VALUES ('invalid-uuid', 'My Post')

// ✅ CORRECT - user_id must exist in users table
INSERT INTO posts (user_id, title) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'My Post')
```

---

## 🔍 How to Debug Database Queries

### Step 1: Check Actual Database Schema

```bash
# Connect to database
psql -h localhost -p 5432 -U postgres -d test

# List all tables
\dt

# Describe users table
\d users

# Output shows:
# Column         |           Type
# ───────────────┼──────────────────────
# id             | uuid
# email          | character varying(225)
# password_hash  | text
# google_id      | character varying(225)
# role           | character varying(20)
# created_at     | timestamp without time zone
# updated_at     | timestamp without time zone
```

### Step 2: Test Query Directly

```bash
# In psql, test the query
SELECT id, email, name, role, created_at FROM users WHERE email = 'test@example.com';

# PostgreSQL will show:
# ERROR: column "name" does not exist
```

### Step 3: Fix and Retry

```bash
# Correct query
SELECT id, email, role, created_at FROM users WHERE email = 'test@example.com';

# Should work!
```

### Step 4: Check Your Code

```typescript
// Find where you use that query and fix it
findUserByEmail() {
    // Update the SELECT statement
}
```

---

## 📋 Your Fixed Code

### Before:

```typescript
// ❌ WRONG
export async function findUserByEmail(email: string): Promise<User>{
    const result = await pool.query<DBUser>(
        `Select id, email, name, role, created_at FROM 
        users where email = $1`,[email]
    )
    return result.rows[0] ?? null;
}

export async function createUser(email:string, pass:string): Promise<User>{
    const result = await pool.query<DBUser>(
        `insert into user (email, password_hash)
        values ($1, $2) 
        returning id, email, role, created_at`,[email, pass]
    );
    return result.rows[0];
}
```

### After:

```typescript
// ✅ CORRECT
export async function findUserByEmail(email: string): Promise<User>{
    const result = await pool.query<DBUser>(
        `Select id, email, role, created_at FROM 
        users where email = $1`,[email]
    )
    return result.rows[0] ?? null;
}

export async function createUser(email:string, pass:string): Promise<User>{
    const result = await pool.query<DBUser>(
        `insert into users (email, password_hash)
        values ($1, $2) 
        returning id, email, role, created_at`,[email, pass]
    );
    return result.rows[0];
}
```

### Changes Made:

| Issue | Before | After |
|-------|--------|-------|
| Column name | `id, email, name, role, created_at` | `id, email, role, created_at` |
| Table name (insert) | `insert into user` | `insert into users` |

---

## 🛠️ PostgreSQL Error Codes Reference

### Most Common Errors:

| Code | Error | Cause |
|------|-------|-------|
| 42703 | column "xxx" does not exist | Typo in column name |
| 42P01 | relation "xxx" does not exist | Typo in table name |
| 42804 | column type mismatch | Wrong data type |
| 23502 | NOT NULL violation | Missing required value |
| 23505 | unique violation | Duplicate key |
| 23503 | foreign key violation | Invalid reference |
| 42601 | syntax error | Invalid SQL syntax |
| 08006 | connection failure | Database down |

---

## 🎓 Best Practices for Database Queries

### 1. Always Verify Column Names

```typescript
// ❌ BAD - Guessing column names
const result = await pool.query('SELECT name, username FROM users');

// ✅ GOOD - Check migration/schema first
const result = await pool.query('SELECT id, email, role FROM users');
```

### 2. Use Parameterized Queries (Already Doing!)

```typescript
// ✅ GOOD - Prevents SQL injection
const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]  // Parameter goes here
);

// ❌ BAD - Vulnerable to SQL injection
const result = await pool.query(
    `SELECT * FROM users WHERE email = '${email}'`
);
```

### 3. Handle NULL Values Properly

```typescript
// ✅ GOOD - Check for null
const user = result.rows[0] ?? null;
if (!user) {
    throw new AppError(404, "User not found");
}

// ❌ BAD - Assuming user exists
const user = result.rows[0];  // Could be undefined!
```

### 4. Use Transactions for Related Queries

```typescript
// ✅ GOOD - Atomic operation
const client = await pool.connect();
try {
    await client.query('BEGIN');
    await client.query('INSERT INTO users ...');
    await client.query('INSERT INTO user_profiles ...');
    await client.query('COMMIT');
} catch (error) {
    await client.query('ROLLBACK');
    throw error;
} finally {
    client.release();
}

// ❌ BAD - Could leave inconsistent data
await pool.query('INSERT INTO users ...');
await pool.query('INSERT INTO user_profiles ...');  // If this fails, users table has orphaned data
```

### 5. Log Queries During Development

```typescript
// ✅ GOOD - See what queries are running
console.log('Query:', sql);
console.log('Params:', [email]);
const result = await pool.query(sql, [email]);
console.log('Result:', result.rows);

// ❌ BAD - Silent failures
const result = await pool.query(sql, [email]);
```

---

## 🔄 Complete Query Debugging Process

### Flowchart:

```
Error occurs
    ↓
Read error message
    ↓
Identify error code (42703, 42P01, etc.)
    ↓
Check error details
    ↓
Look at your SQL query in code
    ↓
Connect to database (psql)
    ↓
Check actual table structure (\d table_name)
    ↓
Test query in psql directly
    ↓
PostgreSQL shows exact error
    ↓
Fix the SQL
    ↓
Test in psql again
    ↓
Update your code
    ↓
Run application
    ↓
Test with curl/Postman
```

---

## ✅ Testing After Fix

### Step 1: Verify Migration Ran

```bash
psql -h localhost -p 5432 -U postgres -d test -c "SELECT * FROM migrations;"

# Should show:
# id │         name          │  executed_at
# ───┼───────────────────────┼────────────
# 1  │ 001_enable_pgcrypto   │ ...
# 2  │ 002_create_users_table│ ...
```

### Step 2: Verify Table Schema

```bash
psql -h localhost -p 5432 -U postgres -d test -c "\d users"

# Should show columns without "name"
```

### Step 3: Test Registration

```bash
npm run dev
```

Then in another terminal:

```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"password123"}'
```

### Expected Output:

```json
{
  "success": true,
  "message": "Registration successfull. Please login to continue."
}
```

---

## 🎯 Common Mistakes to Avoid

| Mistake | Example | Fix |
|---------|---------|-----|
| Typo in column | `SELECT nam FROM users` | Check migration for exact name |
| Typo in table | `SELECT * FROM user` | Make sure it's plural: `users` |
| Case sensitivity | `SELECT Id FROM users` | PostgreSQL is case-sensitive |
| Missing parameters | `INSERT INTO users VALUES (...)` | Specify columns: `INSERT INTO users (email, password_hash) VALUES ...` |
| Wrong data type | `INSERT INTO users (id) VALUES ('string')` | Use correct type: `id UUID` |
| Missing NULL check | `user.email` when user is null | Use: `user?.email ?? null` |
| Hardcoded values | `WHERE email = 'test@example.com'` | Use parameters: `WHERE email = $1` |

---

## 📊 Query Structure Review

### SELECT Query Pattern:

```typescript
// Pattern
SELECT columns FROM table WHERE condition

// Your query
SELECT id, email, role, created_at FROM users WHERE email = $1

// Components:
// - SELECT: id, email, role, created_at (choose existing columns)
// - FROM: users (table name)
// - WHERE: email = $1 (condition with parameterized value)
```

### INSERT Query Pattern:

```typescript
// Pattern
INSERT INTO table (columns) VALUES (values) RETURNING columns

// Your query
INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role, created_at

// Components:
// - INTO: users (table name)
// - Columns: email, password_hash (must exist)
// - VALUES: $1, $2 (parameters)
// - RETURNING: what to return after insert
```

---

## 🚀 Your Code Is Now Fixed!

**Summary of Changes**:
- ✅ Removed non-existent `name` column from SELECT
- ✅ Fixed table name from `user` to `users`
- ✅ Both functions now use correct schema

**Ready to Test**:
1. Start server: `npm run dev`
2. Register user with curl
3. Should work without database errors!

---

## 📚 Related Topics to Study

1. **PostgreSQL Data Types**: int, varchar, uuid, timestamp, etc.
2. **Constraints**: NOT NULL, UNIQUE, PRIMARY KEY, FOREIGN KEY
3. **SQL Joins**: INNER, LEFT, RIGHT, FULL OUTER
4. **Indexes**: For query performance
5. **Transactions**: ACID properties
6. **Connection Pooling**: How `pg-pool` works

---

*Last Updated: 2026-11-11*
