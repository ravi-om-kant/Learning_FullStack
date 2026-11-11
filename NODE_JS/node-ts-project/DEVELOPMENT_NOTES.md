# Express + TypeScript Project - Development Notes

**Project**: ts-project  
**Date**: 2026-11-11  
**Status**: Initial Setup Phase  
**Framework**: Express.js with TypeScript  

---

## 📁 Current Project Structure

```
node-ts-project/
├── src/
│   ├── app.ts              ✅ (In Progress) Express app setup
│   ├── server.ts           ⏳ (Empty) Server startup
│   ├── config/
│   │   └── env.ts          ✅ (Implemented) Environment configuration
│   ├── middlewares/
│   │   ├── errorHandler.ts ✅ (Implemented) Global error handler
│   │   └── notFound.ts     ✅ (Implemented) 404 handler
│   └── libs/
│       └── logger.ts       ✅ (Implemented) Logging utility
├── package.json
├── tsconfig.json
└── node_modules/
```

---

## 📋 Detailed Code Analysis

### 1. **app.ts** - Express Application Setup

#### Current Code:
```typescript
import express from 'express';
import { errorhandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

export function createApp(){
    const app = express();

    app.use(express.json());
    app.use(errorhandler);
    app.use(notFound);
}
```

#### What This Does:
- Imports Express framework
- Imports custom middleware functions
- Creates a function `createApp()` that initializes Express
- Applies JSON body parser middleware
- Applies error handling middleware
- Applies 404 not found middleware

#### ⚠️ **ISSUES FOUND:**

1. **Missing Return Statement**
   ```typescript
   // ❌ WRONG - Function doesn't return app
   export function createApp(){
       const app = express();
       // ... setup ...
   }  // Returns undefined!

   // ✅ CORRECT
   export function createApp(){
       const app = express();
       // ... setup ...
       return app;  // Add this!
   }
   ```

2. **Middleware Order Issue**
   ```typescript
   // ❌ WRONG - Error handler should be LAST
   app.use(express.json());
   app.use(errorhandler);      // Should be last
   app.use(notFound);

   // ✅ CORRECT
   app.use(express.json());
   // ... other middlewares ...
   // ... routes ...
   app.use(notFound);          // Before error handler
   app.use(errorhandler);      // ALWAYS LAST (4 params)
   ```

#### What Needs to Be Added:
- Return statement
- Route definitions (GET, POST, etc.)
- Additional middleware (CORS, logging, etc.)

---

### 2. **server.ts** - Server Entry Point

#### Current Code:
```typescript
// main root file
```

#### What This Should Do:
- Start the Express server
- Listen on specified port
- Display startup messages

#### ✅ What Needs to Be Implemented:
```typescript
// ✅ EXAMPLE IMPLEMENTATION
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './libs/logger';

const app = createApp();

app.listen(env.port, () => {
    logger.info(`Server running at http://localhost:${env.port}`);
});
```

---

### 3. **config/env.ts** - Environment Configuration

#### Current Code:
```typescript
import dotenv from 'dotenv'

dotenv.config();

export const env = {
    port: Number(process.env.PORT ?? 4001),
    isProduction: (process.env.NODE_ENV ?? "development") == "production",
    nodeEnv: process.env.NODE_ENV ?? "development",
    logLevel: process.env.LOG_LEVEL ?? "info",
} as const;
```

#### What This Does:
✅ **Correctly Implemented**
- Loads `.env` file using dotenv
- Exports environment variables
- Provides default values
- Uses `as const` for type safety

#### Environment Variables Explanation:

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | 4001 | Server listening port |
| `NODE_ENV` | development | Environment (development/production) |
| `LOG_LEVEL` | info | Logging level (debug/info/warn/error) |

#### How to Use in `.env` file:
```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
```

---

### 4. **middlewares/errorHandler.ts** - Global Error Handler

#### Current Code:
```typescript
import { Request, Response, NextFunction } from "express";
import { logger } from "../libs/logger";

export function errorhandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    logger.info({err}, "Unhandled error");

    res.status(500).json({
        success: false,
        message: "Internal Server Error!!"
    })
}
```

#### What This Does:
✅ **Correctly Implemented**
- Catches all errors thrown in routes
- Logs error with logger
- Returns 500 status code
- Sends JSON error response

#### Important: 4 Parameters
```typescript
// ⚠️ MUST have exactly 4 parameters!
// Express recognizes error handlers by having 4 params
function errorhandler(
    err: Error,        // Error object
    _req: Request,     // Request (prefixed _ = unused)
    res: Response,
    _next: NextFunction
)
```

#### Enhanced Version (Best Practice):
```typescript
export function errorhandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    
    logger.error({err}, "Unhandled error");

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}
```

---

### 5. **middlewares/notFound.ts** - 404 Handler

#### Current Code:
```typescript
import { Request, Response } from "express"

export function notFound(_req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        message: "Route not found"
    })
}
```

#### What This Does:
✅ **Correctly Implemented**
- Handles routes that don't exist (404)
- Returns proper HTTP status code
- Sends JSON response

#### Important Usage:
```typescript
// Must be placed BEFORE error handler
// But AFTER all your actual routes
app.get('/', handler);
app.post('/user', handler);
// ... all routes ...
app.use(notFound);        // ← Place here
app.use(errorhandler);    // ← Error handler last
```

#### Usage Pattern:
```typescript
const app = express();
app.use(express.json());

// Route 1
app.get('/', (req, res) => {
    res.json({ message: 'Home' });
});

// Route 2
app.post('/api/users', (req, res) => {
    res.json({ message: 'Create user' });
});

// 404 Handler - catches all unmatched routes
app.use(notFound);

// Error Handler - catches all errors
app.use(errorhandler);
```

---

### 6. **libs/logger.ts** - Logging Utility

#### Current Code:
```typescript
import pino from "pino";
import { env } from "../config/env";

export const logger = pino({
    level: env.logLevel,
    transport: env.isProduction ? 
        undefined :
        {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: 'SYS:standard'
            }
        }
})
```

#### What This Does:
✅ **Correctly Implemented**
- Uses Pino logger (fast, structured logging)
- Sets log level from environment
- Pretty prints logs in development
- Production-optimized logging

#### Log Levels (in order of severity):
```
FATAL  (60)  - Application crashes
ERROR  (50)  - Errors
WARN   (40)  - Warnings
INFO   (30)  - General info
DEBUG  (20)  - Debugging info
TRACE  (10)  - Detailed trace
```

#### How to Use:
```typescript
import { logger } from './libs/logger';

logger.info('User created');
logger.error({err}, 'Database error');
logger.debug({ userId: 123 }, 'User details');
logger.warn('Low memory');
```

#### Output Examples:

**Development** (with pino-pretty):
```
[2026-11-11 10:30:45.123] INFO: User created
[2026-11-11 10:30:46.456] ERROR: Database error
```

**Production** (compact JSON):
```
{"level":30,"time":"2026-11-11T10:30:45.123Z","msg":"User created"}
{"level":50,"time":"2026-11-11T10:30:46.456Z","msg":"Database error"}
```

---

## ✅ What's Implemented

| Component | Status | Notes |
|-----------|--------|-------|
| Express setup | ⚠️ Partial | Missing return statement |
| Environment config | ✅ Complete | Ready to use |
| Error handler | ✅ Complete | Proper 4-param middleware |
| 404 handler | ✅ Complete | Correct placement needed |
| Logger setup | ✅ Complete | Production-ready |
| Server startup | ⏳ Empty | Needs implementation |
| Routes | ⏳ Missing | No routes defined yet |
| Database | ⏳ Missing | Not started |
| Authentication | ⏳ Missing | Not started |
| Validation | ⏳ Missing | Not started |

---

## 🔧 Issues to Fix

### Critical Issues:

1. **app.ts - Missing return statement**
   ```typescript
   // Add at the end of createApp()
   return app;
   ```

2. **Middleware order**
   - Routes should come before notFound
   - notFound should come before errorhandler
   - errorhandler MUST be last

3. **server.ts - Empty file**
   - Implement server startup logic
   - Listen on configured port

### Files Missing Pino Dependency:
```bash
npm install pino pino-pretty
```

---

## 📝 Next Steps (Implementation Roadmap)

### Phase 1: Core Setup (Now)
- [ ] Fix app.ts return statement
- [ ] Implement server.ts startup
- [ ] Create .env file
- [ ] Test basic server startup

### Phase 2: Routes
- [ ] Create routes folder
- [ ] Create user routes
- [ ] Create product routes
- [ ] Add route documentation

### Phase 3: Database
- [ ] Setup database connection
- [ ] Create models/schemas
- [ ] Setup migrations
- [ ] Create repositories

### Phase 4: Features
- [ ] User authentication (JWT)
- [ ] Input validation
- [ ] Request logging middleware
- [ ] CORS setup

### Phase 5: Testing & Deployment
- [ ] Unit tests
- [ ] Integration tests
- [ ] Docker setup
- [ ] CI/CD pipeline

---

## 🔍 Code Review Checklist

### app.ts
- [ ] Does it return the app instance?
- [ ] Are middlewares in correct order?
- [ ] Are routes defined?
- [ ] Is error handler last?

### server.ts
- [ ] Does it import createApp?
- [ ] Does it listen on env.port?
- [ ] Does it log startup message?
- [ ] Does it handle graceful shutdown?

### Middlewares
- [ ] Error handler has 4 parameters?
- [ ] notFound is placed before error handler?
- [ ] Both return proper JSON responses?

### Configuration
- [ ] All environment variables defined?
- [ ] Are defaults sensible?
- [ ] Is it using `as const` for type safety?

---

## 📚 Learning Points

### 1. **Middleware Order in Express**
```
Request
  ↓
Middleware 1 (json parser)
  ↓
Middleware 2 (logging)
  ↓
Route Handler
  ↓
Middleware 3 (notFound) ← If route not matched
  ↓
Middleware 4 (errorHandler) ← If error thrown
  ↓
Response Sent
```

### 2. **Error Handling Middleware**
- Must have exactly 4 parameters: (err, req, res, next)
- Express detects error handler by parameter count
- Must be registered last in middleware chain

### 3. **TypeScript in Express**
```typescript
// Proper typing
app.get('/', (req: Request, res: Response): void => {
    res.json({ message: 'Hello' });
});

// Async handlers
app.post('/user', async (req: Request, res: Response): Promise<void> => {
    // Handle async operations
});
```

### 4. **Environment Variables Pattern**
```typescript
// Export as const for type safety
export const env = {
    port: Number(process.env.PORT ?? 3000),
    isDev: process.env.NODE_ENV !== 'production'
} as const;  // ← This makes it readonly

// Usage
app.listen(env.port);  // Type-safe, autocomplete works
```

---

## 🎯 Common Patterns

### Pattern 1: Creating Routes
```typescript
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json({ data: [] });
});

export default router;
```

### Pattern 2: Async Route Handling
```typescript
app.get('/user/:id', async (req: Request, res: Response) => {
    try {
        const user = await getUserById(req.params.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### Pattern 3: Middleware Creation
```typescript
export function loggingMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    console.log(`${req.method} ${req.path}`);
    next();
}

// Usage
app.use(loggingMiddleware);
```

---

## 📦 Dependencies Installed

```json
{
  "dependencies": {
    "express": "^5.3.0",      // Web framework
    "dotenv": "^18.0.10"      // Environment variables
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^26.5.1",
    "typescript": "^7.0.2",
    "tsx": "^4.23.13"          // Run TypeScript directly
  }
}
```

### Additional Packages Needed:
```bash
npm install pino pino-pretty  # Logging
npm install cors               # CORS
npm install helmet             # Security headers
npm install express-validator  # Input validation
npm install jsonwebtoken       # JWT auth
```

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Create .env file
echo "PORT=3000
NODE_ENV=development
LOG_LEVEL=debug" > .env

# Run in development
npx tsx src/server.ts

# Watch for changes (install nodemon first)
npm install --save-dev nodemon
npx nodemon --exec tsx src/server.ts

# Compile TypeScript
npx tsc
```

---

## 📖 Reference Links

- [Express Documentation](https://expressjs.com/)
- [Pino Logger](https://getpino.io/)
- [TypeScript Express Guide](https://www.typescriptlang.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 💡 Tips & Best Practices

1. **Always return the app from createApp()**
   - Needed for testing and server startup

2. **Use `as const` on config objects**
   - Provides better type inference

3. **Place middleware in correct order**
   - General middlewares first
   - Routes in middle
   - Error handlers last

4. **Use structured logging**
   - Better for production debugging
   - Easier to parse in log aggregation tools

5. **Prefix unused parameters with underscore**
   - Example: `_req`, `_next`
   - Signals intentional unused parameter

6. **Always handle async errors**
   - Use try/catch in async routes
   - Or use error handling middleware

7. **Environment variables for all config**
   - Never hardcode values
   - Makes app portable

---

**Status**: Ready for next phase - Server startup implementation  
**Last Updated**: 2026-11-11
