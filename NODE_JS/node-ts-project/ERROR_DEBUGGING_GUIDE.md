# Error Debugging Guide - Migration Failure Analysis

**Date**: 2026-11-11  
**Error Type**: SQL Syntax/Type Error  
**Status**: ✅ FIXED

---

## 🔴 Error You Got

### Error Message:
```
ERROR (38256): Migration failed
err: {
  "type": "DatabaseError",
  "message": "type \"carchar\" does not exist",
  ...
  "code": "42704"
}
```

### Root Cause:
**File**: `migration/002_create_users_table.sql`  
**Line 6**: `role carchar(20) not null default 'USER'`  
**Issue**: Typo in PostgreSQL data type

### The Problem:
```sql
-- ❌ WRONG - carchar doesn't exist
role carchar(20) not null default 'USER'
     ↑↑↑↑↑↑↑

-- ✅ CORRECT - use varchar
role varchar(20) not null default 'USER'
     ↑↑↑↑↑↑↑
```

---

## 🔍 How to Diagnose Migration Errors

### Error Message Breakdown:

```
ERROR (38256): Migration failed
│     │
│     └─ Process ID
└─ Error level (always ERROR for failures)

"type": "DatabaseError"
└─ Category of error (SQL/Connection/Permission)

"message": "type \"carchar\" does not exist"
└─ What went wrong (human readable)

"code": "42704"
└─ PostgreSQL error code (lookup in docs)

"position": "185"
└─ Character position in SQL where error occurred

"file": "parse_type.c", "line": "274", "routine": "typenameType"
└─ Where in PostgreSQL source code error originated
```

### PostgreSQL Error Codes:

| Code | Meaning | Example |
|------|---------|---------|
| 42704 | Unknown type | `carchar` type |
| 23505 | Unique violation | Duplicate email |
| 23503 | Foreign key violation | Invalid user_id |
| 42P01 | Undefined table | Wrong table name |
| 42601 | Syntax error | Invalid SQL syntax |

---

## 🔧 Migration Error Recovery Process

### Step 1: Identify the Problem

```bash
# Run migration with verbose output
npm run migrate

# Look for:
# 1. Error message (what went wrong)
# 2. Migration file name
# 3. Error code (PostgreSQL error)
```

### Step 2: Check Migration Status

```bash
# Connect to database
psql -h localhost -p 5432 -U postgres -d test

# Check what migrations were recorded
SELECT * FROM migrations;

# Output (example with error):
id │         name          │   executed_at
───┼───────────────────────┼─────────────────
1  │ 001_enable_pgcrypto   │ 2026-11-11 17:31
2  │ (not recorded)        │ (migration failed)
```

### Step 3: Fix the Issue

```bash
# Option A: Fix SQL syntax
vim migration/002_create_users_table.sql
# Make corrections

# Option B: Check PostgreSQL documentation
# Search for error code or data type
```

### Step 4: Clear Failed Migration (if needed)

```bash
# If migration partially executed and needs cleanup
# (Only if transaction wasn't used properly)

# Connect to database
psql -h localhost -p 5432 -U postgres -d test

# Check what was created
\dt  # List tables
\d users  # Describe users table

# If table exists but migration not recorded:
DELETE FROM migrations WHERE name = '002_create_users_table.sql';

# OR drop the table if it's malformed
DROP TABLE users;
```

### Step 5: Retry Migration

```bash
npm run migrate

# Should now run 002 successfully
```

---

## 📋 Your Specific Error Explained

### Error: "type 'carchar' does not exist"

#### PostgreSQL Data Types:

```sql
-- String/Text types:
VARCHAR(n)      -- Variable length string, max n chars
CHAR(n)         -- Fixed length string, exactly n chars
TEXT            -- Unlimited length string
carchar         -- ❌ DOES NOT EXIST

-- Numeric types:
INTEGER         -- Whole numbers
BIGINT          -- Larger integers
SERIAL          -- Auto-incrementing integer
DECIMAL(p,s)    -- Fixed point numbers
FLOAT           -- Floating point numbers

-- Date/Time types:
TIMESTAMP       -- Date and time with timezone
DATE            -- Date only
TIME            -- Time only

-- Boolean:
BOOLEAN         -- true/false

-- Special types:
UUID            -- Universally unique identifier
JSON            -- JSON document
JSONB           -- Binary JSON
ARRAY           -- Array of values
```

### Your Mistake:

```sql
-- What you wrote:
role carchar(20) not null default 'USER'

-- Analysis:
carchar = car + char
  → Probably meant: CHAR
  → Or maybe: VARCHAR
  → But definitely not: carchar (typo)

-- Correct version:
role varchar(20) not null default 'USER'
```

---

## 🎓 PostgreSQL Data Type Reference

### VARCHAR vs CHAR vs TEXT

```sql
-- VARCHAR - Variable length (recommended)
email VARCHAR(255)  -- Can be 1 to 255 chars
-- Storage: Only uses needed space
-- Best for: Most string fields

-- CHAR - Fixed length
code CHAR(5)       -- Always exactly 5 chars (pads with spaces)
-- Storage: Always 5 bytes
-- Best for: Fixed-length codes

-- TEXT - Unlimited length
biography TEXT     -- Can be any length
-- Storage: Only uses needed space
-- Best for: Long content

-- Example:
role VARCHAR(20)           -- Role name (short, variable)
status VARCHAR(50)         -- Status description
content TEXT               -- Long article content
zip_code CHAR(5)          -- ZIP codes are always 5 digits
```

### Your Migration - Data Types Used:

```sql
CREATE TABLE users(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- ↑ UUID: Unique identifier (36 chars)
    
    email varchar(225) not null unique,
    -- ↑ VARCHAR: String up to 225 chars
    
    password_hash text,
    -- ↑ TEXT: Unlimited length (for hashed passwords)
    
    google_id varchar(225) unique,
    -- ↑ VARCHAR: Google's ID format
    
    role varchar(20) not null default 'USER',
    -- ↑ VARCHAR: Role name (fixed options)
    
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
    -- ↑ TIMESTAMP: Date and time
)
```

---

## 🛠️ Common SQL Syntax Errors

### 1. Wrong Data Type

```sql
-- ❌ WRONG
age carchar(3)

-- ✅ CORRECT
age INTEGER  or  age VARCHAR(3)
```

### 2. Missing Data Type

```sql
-- ❌ WRONG
CREATE TABLE users(
    name,
    email
)

-- ✅ CORRECT
CREATE TABLE users(
    name VARCHAR(100),
    email VARCHAR(255)
)
```

### 3. Wrong Column Constraint

```sql
-- ❌ WRONG
email varchar(255) not null and unique

-- ✅ CORRECT
email varchar(255) not null unique
```

### 4. Missing Comma

```sql
-- ❌ WRONG
CREATE TABLE users(
    id INTEGER PRIMARY KEY
    name VARCHAR(100)
)
     ↑ Missing comma

-- ✅ CORRECT
CREATE TABLE users(
    id INTEGER PRIMARY KEY,
    name VARCHAR(100)
)
```

### 5. Reserved Keywords

```sql
-- ❌ WRONG (using reserved word)
CREATE TABLE users(
    data text
)
-- 'data' might be reserved

-- ✅ CORRECT (use different name)
CREATE TABLE users(
    data_value text,
    user_data text
)
```

---

## 🔍 How to Debug SQL Errors

### Method 1: Test SQL Directly

```bash
# Connect to database
psql -h localhost -p 5432 -U postgres -d test

# Paste your SQL
CREATE TABLE users(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role carchar(20) not null default 'USER'
);

# PostgreSQL shows: ERROR:  type "carchar" does not exist
# Now fix it and retry
```

### Method 2: Check PostgreSQL Docs

```bash
# Look up data types
psql

# Help command
\h CREATE TABLE

# List data types
SELECT typname FROM pg_type WHERE typtype = 'b' ORDER BY typname;
```

### Method 3: Use Online Tool

- PostgreSQL Syntax Validator: pgformatter.io
- Check data types: postgresql.org/docs/current/datatype.html

---

## 📊 Migration Error Scenarios

### Scenario 1: Syntax Error (Your Case)

```
Error: type "carchar" does not exist
Cause: Typo in data type
Fix: Change carchar → varchar
Migration: ROLLED BACK ✅
Solution: Fix file, retry
```

### Scenario 2: Foreign Key Violation

```sql
user_id UUID references users(id)
-- users table must exist first!

Error: relation "users" does not exist
Solution: Create users table in earlier migration
```

### Scenario 3: Duplicate Key

```sql
email varchar(255) unique
INSERT INTO users (email) values ('john@example.com');
INSERT INTO users (email) values ('john@example.com');
-- Second insert fails

Error: duplicate key value violates unique constraint
Solution: Check for duplicate data or fix logic
```

### Scenario 4: Column Type Mismatch

```sql
CREATE TABLE users(id UUID PRIMARY KEY)
CREATE TABLE posts(user_id INTEGER)

Error: Foreign key type mismatch
Solution: Make user_id UUID also
```

---

## ✅ Your Migrations - Complete & Fixed

### Migration 1: `001_enable_pgcrypto.sql`
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```
**Status**: ✅ Correct  
**Purpose**: Enable UUID generation with `gen_random_uuid()`

---

### Migration 2: `002_create_users_table.sql`
```sql
CREATE TABLE users(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(225) not null unique,
    password_hash text,
    google_id varchar(225) unique,
    role varchar(20) not null default 'USER'  -- ✅ FIXED (was carchar)
        check (role in ('USER', 'ADMIN')),
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
)
```
**Status**: ✅ Fixed  
**Purpose**: Create users table with proper schema

---

### Migration 3: `003_create_support_tasks_table.sql`
```sql
create table support_tasks(
    id UUID primary key default gen_random_uuid(),
    title varchar(150) not null,
    status varchar(20) not null default 'OPEN'
        check (status in ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
    user_id UUID not null references users(id) on delete cascade,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
)
```
**Status**: ✅ Correct  
**Purpose**: Create support_tasks table with FK to users

---

### Migration 4: `004_create_banners_table.sql`
```sql
create table banners(
    id UUID primary key default gen_random_uuid(),
    image_url text not null,
    cloudinary_public_id text not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
```
**Status**: ✅ Correct  
**Purpose**: Create banners table for media storage

---

## 🚀 How to Proceed Now

### Step 1: Verify Fix

```bash
# Check the fixed file
cat migration/002_create_users_table.sql

# Verify: role varchar(20) (not carchar)
```

### Step 2: Clear Failed Migration (if needed)

```bash
# Check what's recorded
psql -h localhost -p 5432 -U postgres -d test

SELECT * FROM migrations;

# If 002 not in list, safe to retry
# If 002 partially executed, delete and retry:
# DELETE FROM migrations WHERE name = '002_create_users_table.sql';
```

### Step 3: Run Migration Again

```bash
npm run migrate

# Should see:
# migration completed: 002_create_users_table.sql
# migration completed: 003_create_support_tasks_table.sql
# migration completed: 004_create_banners_table.sql
# All migration completed
```

### Step 4: Verify Database

```bash
# Connect to database
psql -h localhost -p 5432 -U postgres -d test

# List tables
\dt

# Should show:
#           List of relations
# Schema │      Name       │ Type  │ Owner
# ────────┼─────────────────┼───────┼────
# public │ banners         │ table │ postgres
# public │ migrations      │ table │ postgres
# public │ support_tasks   │ table │ postgres
# public │ users           │ table │ postgres

# Check users table structure
\d users

# Should show columns:
#   Column      │           Type
# ──────────────┼──────────────────────
#  id           │ uuid
#  email        │ character varying(225)
#  password_hash│ text
#  google_id    │ character varying(225)
#  role         │ character varying(20)  ← ✅ Fixed!
#  created_at   │ timestamp
#  updated_at   │ timestamp
```

---

## 🎓 Lessons Learned

### 1. Common Typos in SQL

| Correct | Common Typo | Type |
|---------|------------|------|
| VARCHAR | CARCHAR, VARCAR | Data type |
| CHAR | CARHR, CHR | Data type |
| TIMESTAMP | TIMESTMAP | Data type |
| NOT NULL | NOTNULL (no space) | Constraint |
| PRIMARY KEY | PRIMARYKEY | Constraint |
| FOREIGN KEY | FOREIGNKEY | Constraint |

### 2. Error Reading Strategy

```
Error Message
    ↓
Extract key info:
  - Type: DatabaseError
  - Code: 42704
  - Message: "type \"carchar\" does not exist"
    ↓
Search documentation/Google for error code
    ↓
Usually points to exact problem
    ↓
Fix file and retry
```

### 3. Transaction Safety

```
Benefits of your migration system with transactions:

Error happened → Transaction rolled back ✅
  - No partial table creation
  - No orphaned data
  - Migration not recorded
  - Can retry after fix

Without transactions:
  - Table might be created
  - Migration not recorded
  - Inconsistent state
  - Manual cleanup needed
```

---

## 📚 PostgreSQL Documentation Links

- Data Types: https://www.postgresql.org/docs/current/datatype.html
- CREATE TABLE: https://www.postgresql.org/docs/current/sql-createtable.html
- Error Codes: https://www.postgresql.org/docs/current/errcodes-appendix.html

---

## 🎯 Next Steps

- [x] Fix migration file (carchar → varchar)
- [x] Understand the error
- [ ] Run migration: `npm run migrate`
- [ ] Verify tables created in database
- [ ] Test application with database
- [ ] Create more migrations as needed

---

## ✅ Summary

| Issue | Status |
|-------|--------|
| Error Found | ✅ |
| Root Cause Identified | ✅ |
| File Fixed | ✅ |
| Ready to Run | ✅ |

**Next**: Run `npm run migrate` to apply all migrations successfully!

---

*Last Updated: 2026-11-11*
