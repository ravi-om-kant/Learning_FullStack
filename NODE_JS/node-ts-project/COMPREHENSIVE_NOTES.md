# Express.js + TypeScript Project - Comprehensive Implementation Notes

**Project Name**: ts-project  
**Framework**: Express.js 5.3.0 with TypeScript 7.0.2  
**Status**: ✅ Basic Server Setup Complete  
**Date**: 2026-11-11  
**Level**: Beginner to Intermediate  

---

## 📊 Project Completion Status

### ✅ Completed (100%)
- [x] Basic Express server setup
- [x] Environment configuration
- [x] Error handling middleware
- [x] 404 not found handling
- [x] Logging system (Pino)
- [x] CORS configuration
- [x] JSON body parsing
- [x] URL encoded parsing
- [x] Basic routing structure
- [x] Health check endpoint
- [x] Server startup on specified port

### ⏳ Not Yet Implemented
- [ ] Database connection (MongoDB/PostgreSQL)
- [ ] User authentication (JWT)
- [ ] Request validation
- [ ] Advanced error handling with custom error classes
- [ ] Rate limiting
- [ ] Request logging middleware
- [ ] File upload handling
- [ ] API documentation (Swagger)
- [ ] Unit & integration tests
- [ ] Docker containerization

---

## 📁 Complete Project Structure

```
node-ts-project/
│
├── src/
│   ├── app.ts                      ✅ Express app initialization
│   ├── server.ts                   ✅ Server startup
│   │
│   ├── config/
│   │   └── env.ts                  ✅ Environment configuration
│   │
│   ├── libs/
│   │   └── logger.ts               ✅ Pino logger setup
│   │
│   ├── middlewares/
│   │   ├── errorHandler.ts         ✅ Global error handler
│   │   └── notFound.ts             ✅ 404 handler
│   │
│   └── routes/
│       ├── index.ts                ✅ Route aggregator
│       └── health.routes.ts        ✅ Health check endpoint
│
├── package.json                    ✅ Dependencies
├── tsconfig.json                   ✅ TypeScript config
├── .env                            (Optional)
├── .gitignore
└── node_modules/
```

---

## 🔍 Detailed Code Explanation

### 1️⃣ app.ts - Express Application Factory

#### Current Implementation:
```typescript
import express from 'express';
import { errorhandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import cors from 'cors';
import { apiRouter } from './routes';

export function createApp(){
    const app = express();

    // Middleware setup
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    // Routes
    app.use("/api", apiRouter);

    // Error handling (MUST be last)
    app.use(errorhandler);
    app.use(notFound);

    return app;
}
```

#### Line-by-Line Explanation:

| Line | Code | What It Does |
|------|------|-------------|
| 4-6 | `import express...` | Imports Express and middleware |
| 10 | `export function createApp()` | Exports factory function for app creation |
| 11 | `const app = express();` | Creates Express application instance |
| 13 | `app.use(cors());` | Enables Cross-Origin Resource Sharing |
| 14 | `app.use(express.json());` | Parses incoming JSON requests |
| 15 | `app.use(express.urlencoded(...))` | Parses form data |
| 17 | `app.use("/api", apiRouter);` | Mounts routes at `/api` path |
| 19-20 | `app.use(errorhandler);` | Error handling (4 params = error handler) |
| 20 | `app.use(notFound);` | 404 handler |
| 22 | `return app;` | Returns configured app instance |

#### Why This Pattern?
- **Factory Function**: `createApp()` makes testing easier
- **Separation of Concerns**: App creation separate from server startup
- **Reusability**: Can create multiple app instances if needed
- **Testability**: Easy to inject dependencies

#### Input/Output Examples:

**Input** (Client Request):
```bash
POST /api/health
Content-Type: application/json

{
  "name": "Test"
}
```

**Output** (Server Response):
```json
{
  "success": "true",
  "message": "Health Route is working"
}
```

---

### 2️⃣ server.ts - Server Entry Point

#### Current Implementation:
```typescript
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./libs/logger";

const app = createApp();

app.listen(env.port, () => {
    logger.info(`Server is running on port http://localhost:${env.port}`)
});
```

#### What Each Part Does:

```typescript
// Step 1: Import dependencies
import { createApp } from "./app";      // Get app factory
import { env } from "./config/env";    // Get config
import { logger } from "./libs/logger";// Get logger

// Step 2: Create app instance
const app = createApp();               // Initialize Express app

// Step 3: Start listening
app.listen(env.port, () => {          // Listen on PORT from .env
    logger.info(...)                   // Log startup message
});
```

#### Execution Flow:
```
Node process starts
    ↓
server.ts imports modules
    ↓
createApp() returns configured Express app
    ↓
app.listen() starts HTTP server
    ↓
Console logs: "Server is running on port http://localhost:4001"
    ↓
Server ready to accept requests
```

#### Console Output Examples:

**Development Mode** (with pino-pretty):
```
[2026-11-11 14:30:45.123] INFO: Server is running on port http://localhost:4001
```

**Production Mode** (JSON format):
```json
{"level":30,"time":"2026-11-11T14:30:45.123Z","msg":"Server is running on port http://localhost:4001"}
```

---

### 3️⃣ config/env.ts - Environment Configuration

#### Current Implementation:
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

#### Environment Variables Explained:

| Variable | Default | Purpose | Example |
|----------|---------|---------|---------|
| `PORT` | 4001 | Server port | `3000` |
| `NODE_ENV` | development | Environment type | `production` |
| `LOG_LEVEL` | info | Logging verbosity | `debug` |

#### How to Use (.env file):
```env
# .env file
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
```

#### Type Safety with `as const`:
```typescript
// Without "as const" - wider types
const env1 = {
    port: Number(process.env.PORT ?? 4001)  // type: number
};

// With "as const" - exact literal types
const env2 = {
    port: 4001 as const  // type: 4001 (literal)
};

// Benefit: Better autocomplete and type inference
```

---

### 4️⃣ middlewares/errorHandler.ts

#### Current Implementation:
```typescript
import { Request,Response, NextFunction } from "express";
import { logger } from "../libs/logger";

export function errorhandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void{
    logger.info({err}, "Unhandled error");

    res.status(500).json({
        success: false,
        message: "Internal Server Error!!"
    })
}
```

#### How Error Handling Works:

```
Route Handler
    ↓
Throws Error or calls next(error)
    ↓
Express catches error
    ↓
Routes to errorhandler middleware
(because it has 4 parameters)
    ↓
Logs error
    ↓
Sends 500 response
```

#### Input/Output Example:

**Input** (Route throws error):
```typescript
app.get('/error', (req, res) => {
    throw new Error('Something went wrong!');
});
```

**Output** (Response to client):
```json
{
  "success": false,
  "message": "Internal Server Error!!"
}
```

**Server Log** (Console):
```
{
  "level": 50,
  "time": "2026-11-11T14:30:45.123Z",
  "err": {
    "type": "Error",
    "message": "Something went wrong!"
  },
  "msg": "Unhandled error"
}
```

#### Why 4 Parameters?
Express uses parameter count to detect middleware type:
- **2 params** → Route handler
- **3 params** → Regular middleware
- **4 params** → Error handler (SPECIAL)

---

### 5️⃣ middlewares/notFound.ts

#### Current Implementation:
```typescript
import { Request, Response } from "express"

export function notFound(_req: Request, res: Response):void{
    res.status(404).json({
        success: false,
        message: "Route not found"
    })
}
```

#### What Happens:

```
Client Request
    ↓
Does any route match?
    ↓ No match found
    ↓
notFound middleware executes
    ↓
Returns 404 response
```

#### Input/Output Example:

**Input** (Request to non-existent route):
```bash
GET /api/nonexistent
```

**Output** (HTTP Response):
```
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "success": false,
  "message": "Route not found"
}
```

#### Important: Placement
```typescript
// ❌ WRONG PLACEMENT
app.use(notFound);
app.get('/user', handler);  // Will never be reached!

// ✅ CORRECT PLACEMENT
app.get('/user', handler);
app.use(notFound);          // Catches unmatched routes
```

---

### 6️⃣ libs/logger.ts - Logging System

#### Current Implementation:
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

#### Logger Behavior:

| Environment | Format | Output |
|-------------|--------|--------|
| Development | Pretty | Colored, readable, timestamp |
| Production | JSON | Compact, machine-readable |

#### Usage Examples:

```typescript
import { logger } from './libs/logger';

// Log information
logger.info('User created');
// Output: [2026-11-11 14:30:45.123] INFO: User created

// Log with data
logger.info({ userId: 123, email: 'user@example.com' }, 'User created');
// Output: [2026-11-11 14:30:45.123] INFO (userId=123): User created

// Log errors
logger.error({ err }, 'Database error');
// Output: [2026-11-11 14:30:45.123] ERROR: Database error

// Log warnings
logger.warn('Low memory warning');
// Output: [2026-11-11 14:30:45.123] WARN: Low memory warning

// Log debug info
logger.debug({ query }, 'SQL Query');
// Output: (only if LOG_LEVEL=debug)
```

#### Log Levels (Hierarchy):
```
FATAL (60) — Critical failures
ERROR (50) — Errors
WARN  (40) — Warnings
INFO  (30) — General information ← Default
DEBUG (20) — Debugging details
TRACE (10) — Detailed traces
```

---

### 7️⃣ routes/index.ts - Route Aggregator

#### Current Implementation:
```typescript
import { Router } from "express";
import { healthRoute } from "./health.routes"; 

export const apiRouter = Router();

apiRouter.use(healthRoute);
```

#### Purpose:
- Central place to aggregate all routes
- Makes it easy to add new route groups
- Keeps routes organized

#### How It Works:
```
Client Request to /api/health
    ↓
app.ts: app.use("/api", apiRouter)
    ↓
routes/index.ts: apiRouter aggregates routes
    ↓
routes/health.routes.ts: Handles the request
```

#### Adding More Routes:
```typescript
// ✅ Easy to extend
import { userRoute } from "./user.routes";
import { productRoute } from "./product.routes";

export const apiRouter = Router();

apiRouter.use(healthRoute);
apiRouter.use("/users", userRoute);      // Add new route
apiRouter.use("/products", productRoute); // Add new route
```

---

### 8️⃣ routes/health.routes.ts - Health Check Endpoint

#### Current Implementation:
```typescript
import { Router } from "express";

export const healthRoute = Router();

healthRoute.get("/health", (_req, res) => {
    res.status(200).json({
        success: "true",
        message: "Health Route is working"
    })
})
```

#### What This Does:
- Provides health check endpoint for monitoring
- Returns 200 status if server is running
- Used by load balancers, monitoring tools, etc.

#### Usage Examples:

**Request**:
```bash
curl http://localhost:4001/api/health
```

**Response**:
```json
{
  "success": "true",
  "message": "Health Route is working"
}
```

**With curl verbose**:
```bash
$ curl -v http://localhost:4001/api/health
> GET /api/health HTTP/1.1
> Host: localhost:4001

< HTTP/1.1 200 OK
< Content-Type: application/json
< 
{
  "success": "true",
  "message": "Health Route is working"
}
```

#### ⚠️ Issue Found:
```typescript
// ❌ ISSUE: success is string instead of boolean
success: "true"  // String "true" (always truthy)

// ✅ SHOULD BE:
success: true    // Boolean true
```

**Why This Matters**:
```javascript
// String comparison
if ("true") {  // ✅ Truthy (even "false" string is truthy!)
    console.log('This runs');
}

if ("false") {  // ✅ Also truthy!
    console.log('This also runs!');
}

// Boolean comparison
if (true) {    // ✅ Truthy
    console.log('Correct');
}

if (false) {   // ❌ Falsy
    console.log('This does not run');
}
```

---

## 🎯 Interview Questions with Answers

### Q1: Explain the middleware flow in your Express application.

**Answer**:
```
Client Request
    ↓
CORS Middleware (app.use(cors()))
    ↓
JSON Parser (express.json())
    ↓
URL Encoded Parser (express.urlencoded())
    ↓
Route Handlers (app.use("/api", apiRouter))
    ↓
Error Handler (errorhandler - 4 params)
    ↓
404 Handler (notFound - 3 params)
    ↓
Response Sent
```

**Why This Order Matters**:
- Parsers must come before routes
- Error handler must be last
- 404 handler between routes and error handler

---

### Q2: What's the difference between `app.use()` and `app.get()`, `app.post()`, etc.?

**Answer**:

| Method | Applies To | Use Case |
|--------|-----------|----------|
| `app.use()` | All HTTP methods | Middleware, routers |
| `app.get()` | Only GET requests | Retrieve data |
| `app.post()` | Only POST requests | Create data |
| `app.put()` | Only PUT requests | Full update |
| `app.delete()` | Only DELETE requests | Remove data |

**Example**:
```typescript
// Applied to all methods
app.use(express.json());

// Applied only to GET
app.get('/user', (req, res) => {
    res.json({ users: [] });
});

// Applied only to POST
app.post('/user', (req, res) => {
    res.json({ created: true });
});
```

---

### Q3: Why does the error handler have 4 parameters instead of 3?

**Answer**:
Express uses the number of parameters to determine the middleware type:
- **3 params** → Regular middleware
- **4 params** → Error handler (special type)

```typescript
// ❌ WRONG - Only 3 params
function errorHandler(err, req, res) {
    res.json({ error: err.message });
}
// Express won't recognize this as error handler!

// ✅ CORRECT - Exactly 4 params
function errorHandler(err, req, res, next) {
    res.json({ error: err.message });
}
// Express recognizes by parameter count
```

When an error occurs:
```typescript
app.get('/test', (req, res) => {
    throw new Error('Oops!');  // Error thrown
});
// Express looks for 4-param middleware
// Finds errorHandler and calls it
```

---

### Q4: What is CORS and why do we need it?

**Answer**:
**CORS** = Cross-Origin Resource Sharing

**Problem**: Browser security feature blocks cross-origin requests
```
Frontend: http://localhost:3000
Backend: http://localhost:4001
Different origins → Blocked by browser
```

**Solution**: CORS middleware allows it
```typescript
app.use(cors());  // Allows all origins

// Or be specific
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));
```

**Example**:
```javascript
// Frontend (localhost:3000)
fetch('http://localhost:4001/api/health')
    .then(res => res.json());
    
// Without CORS: Blocked
// With app.use(cors()): Allowed
```

---

### Q5: Why export a factory function `createApp()` instead of directly exporting app?

**Answer**:

**Benefit 1: Testing**
```typescript
// ✅ Easy to test
const app = createApp();
const request = await supertest(app)
    .get('/api/health');
```

**Benefit 2: Multiple instances**
```typescript
// Can create multiple independent apps
const app1 = createApp();
const app2 = createApp();

app1.listen(3000);
app2.listen(3001);
```

**Benefit 3: Configuration**
```typescript
// Can pass config to factory
export function createApp(config = {}) {
    const app = express();
    if (config.enableAuth) {
        app.use(authMiddleware);
    }
    return app;
}
```

---

### Q6: What happens when you request a non-existent route?

**Answer**:
```
GET /api/nonexistent
    ↓
Express checks all routes
    ↓
No match found
    ↓
Continues to next middleware
    ↓
Hits notFound middleware
    ↓
Sends 404 response
```

**Response**:
```json
{
  "success": false,
  "message": "Route not found"
}
```

---

### Q7: How does the logging system work in development vs production?

**Answer**:

**Development** (`NODE_ENV=development`):
```typescript
// Pino Pretty is enabled
transport: {
    target: "pino-pretty",
    options: {
        colorize: true,
        translateTime: 'SYS:standard'
    }
}

// Output:
[2026-11-11 14:30:45.123] INFO: Server running
[2026-11-11 14:30:46.456] ERROR: Database error
```

**Production** (`NODE_ENV=production`):
```typescript
// Pino Pretty is disabled
transport: undefined

// Output (JSON):
{"level":30,"time":"2026-11-11T14:30:45.123Z","msg":"Server running"}
{"level":50,"time":"2026-11-11T14:30:46.456Z","msg":"Database error"}
```

**Why**: Production systems parse JSON logs with tools like ELK, Splunk, etc.

---

## 🚀 What Can Be Done Better

### 1. Fix Boolean Type in Health Route

**Current** (❌):
```typescript
healthRoute.get("/health", (_req, res) => {
    res.status(200).json({
        success: "true",  // String!
        message: "Health Route is working"
    })
})
```

**Better** (✅):
```typescript
healthRoute.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,     // Boolean
        message: "Health Route is working",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.nodeEnv
    })
})
```

**Why**: Proper types make response consistent with other endpoints

---

### 2. Add Request Logging Middleware

**Add to app.ts**:
```typescript
// Before routes
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});
```

**Benefits**:
- Track all incoming requests
- Debug issues
- Monitor API usage

---

### 3. Create Custom Error Class

**Create** `src/utils/AppError.ts`:
```typescript
export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500
    ) {
        super(message);
        this.name = 'AppError';
    }
}
```

**Use in errorHandler**:
```typescript
export function errorhandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err instanceof AppError ? err.message : 'Internal Server Error';
    
    logger.error({err}, message);

    res.status(statusCode).json({
        success: false,
        message: message,
        ...(env.nodeEnv === 'development' && { stack: err.stack })
    });
}
```

**Use in routes**:
```typescript
app.get('/user/:id', (req, res, next) => {
    try {
        const user = findUser(req.params.id);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
});
```

---

### 4. Add Request Validation

**Install**:
```bash
npm install express-validator
```

**Example**:
```typescript
import { body, validationResult } from 'express-validator';

app.post('/user', 
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Min 6 chars'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Process valid request
    }
);
```

---

### 5. Add Rate Limiting

**Install**:
```bash
npm install express-rate-limit
```

**Add to app.ts**:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use("/api", apiRouter);
```

---

### 6. Add Helmet for Security Headers

**Install**:
```bash
npm install helmet
```

**Add to app.ts**:
```typescript
import helmet from 'helmet';

app.use(helmet()); // Adds security headers

app.use(cors());
app.use(express.json());
```

---

### 7. Separate Routes Better

**Create** `src/routes/user.routes.ts`:
```typescript
import { Router } from "express";

const userRouter = Router();

userRouter.get("/", (req, res) => {
    res.json({ users: [] });
});

userRouter.post("/", (req, res) => {
    res.json({ created: true });
});

userRouter.get("/:id", (req, res) => {
    res.json({ id: req.params.id });
});

export { userRouter };
```

**Update** `src/routes/index.ts`:
```typescript
import { Router } from "express";
import { healthRoute } from "./health.routes";
import { userRouter } from "./user.routes";

export const apiRouter = Router();

apiRouter.use(healthRoute);
apiRouter.use("/users", userRouter);
```

---

### 8. Add Environment Variables for CORS

**Update** `.env`:
```env
PORT=4001
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

**Update** `src/config/env.ts`:
```typescript
export const env = {
    port: Number(process.env.PORT ?? 4001),
    isProduction: (process.env.NODE_ENV ?? "development") === "production",
    nodeEnv: process.env.NODE_ENV ?? "development",
    logLevel: process.env.LOG_LEVEL ?? "info",
    corsOrigin: process.env.CORS_ORIGIN ?? "*",
} as const;
```

**Update** `src/app.ts`:
```typescript
app.use(cors({
    origin: env.corsOrigin.split(','),
    credentials: true
}));
```

---

### 9. Add Graceful Shutdown

**Update** `src/server.ts`:
```typescript
const app = createApp();

const server = app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});
```

---

### 10. Add TypeScript Response Types

**Create** `src/types/index.ts`:
```typescript
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    total: number;
    page: number;
    limit: number;
}
```

**Use in routes**:
```typescript
import { ApiResponse } from '../types';

healthRoute.get("/health", (_req, res) => {
    const response: ApiResponse = {
        success: true,
        message: "Health Route is working"
    };
    res.status(200).json(response);
});
```

---

## 📊 Summary of Improvements

| Issue | Current | Better | Priority |
|-------|---------|--------|----------|
| Success field type | String "true" | Boolean true | High |
| Error handling | Basic | Custom error class | High |
| Input validation | None | express-validator | Medium |
| Security headers | None | Helmet | High |
| Rate limiting | None | express-rate-limit | Medium |
| Request logging | None | Logger middleware | Medium |
| CORS config | Allows all | Configurable | Medium |
| Graceful shutdown | None | Process handlers | Low |
| Type safety | Basic | Full ApiResponse types | Medium |
| Route organization | Basic | Modular structure | Low |

---

## 🏃 Next Steps

### Phase 1: Bug Fixes (High Priority)
- [ ] Fix boolean type in health route
- [ ] Add error handling middleware

### Phase 2: Security (High Priority)
- [ ] Install and use Helmet
- [ ] Configure CORS properly
- [ ] Add Rate limiting

### Phase 3: Features (Medium Priority)
- [ ] Add request validation
- [ ] Create user routes
- [ ] Add database connection

### Phase 4: Polish (Low Priority)
- [ ] Add comprehensive logging
- [ ] Add tests
- [ ] Add API documentation

---

## 🔗 Useful Commands

```bash
# Development
npm run dev

# Check compilation
npx tsc --noEmit

# Format code
npx prettier --write src

# Lint code
npx eslint src

# Run tests (when added)
npm test

# Production build
npm run build
npm start
```

---

## 📚 Package.json Scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src",
    "format": "prettier --write src",
    "test": "jest"
  }
}
```

---

## 🎓 Key Learnings

1. **Middleware Order Matters**: Parsers → Routes → Error handlers
2. **Error Handler Needs 4 Params**: Express detects by parameter count
3. **Factory Pattern**: Better for testing and reusability
4. **Environment Configuration**: Always externalize config
5. **Logging is Critical**: Especially in production
6. **Type Safety**: Use TypeScript properly for better code

---

**Project Status**: ✅ Functional Basic Server Ready for Enhancement  
**Next Priority**: Add input validation and security features  
**Estimated Time to Production-Ready**: 2-3 weeks with regular development  

---

*Last Updated: 2026-11-11 by Your Learning Journey*
