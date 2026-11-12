# User Task API - cURL Commands Guide

**Date**: 2026-11-12  
**Endpoint**: POST /api/task  
**Authentication**: Required (JWT Token)  
**Status**: Ready to Use

---

## 📋 Table of Contents

1. [Endpoint Details](#endpoint-details)
2. [How to Get a Token](#how-to-get-a-token)
3. [Basic cURL Command](#basic-curl-command)
4. [Advanced Examples](#advanced-examples)
5. [Request/Response Examples](#requestresponse-examples)
6. [Error Scenarios](#error-scenarios)
7. [Testing Checklist](#testing-checklist)

---

## 🔍 Endpoint Details

### Endpoint Information:

```
Method:      POST
Path:        /api/task
Full URL:    http://localhost:4001/api/task
Auth:        Required (JWT Bearer Token)
Content-Type: application/json
```

### Request Body:

```json
{
  "title": "Task title here"
}
```

### Validation Rules:

| Field | Required | Rules | Example |
|-------|----------|-------|---------|
| title | Yes | String, max 100 chars, not empty | "Complete Node.js project" |

### Response (Success - 201):

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Complete Node.js project",
      "status": "OPEN",
      "created_at": "2026-11-12T10:30:45.123Z",
      "updated_at": "2026-11-12T10:30:45.123Z"
    }
  }
}
```

### Response (Error - 400):

```json
{
  "success": false,
  "message": "Title is required"
}
```

---

## 🔐 How to Get a Token

### Step 1: Register User (if not already registered)

```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Response**:
```json
{
  "success": true,
  "message": "Registration successfull. Please login to continue."
}
```

---

### Step 2: Login to Get Token

```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Step 3: Copy the Token

```
accessToken = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Use this token in the `Authorization` header for protected routes!

---

## 🚀 Basic cURL Command

### Simple Task Creation:

```bash
curl -X POST http://localhost:4001/api/task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"title":"Complete Node.js project"}'
```

### Store Token in Variable:

```bash
# After login, store token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Use in curl command
curl -X POST http://localhost:4001/api/task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Complete Node.js project"}'
```

### One-Line Version (Copy & Paste):

```bash
curl -X POST http://localhost:4001/api/task -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN_HERE" -d '{"title":"Complete Node.js project"}'
```

---

## 📊 Advanced Examples

### Example 1: Pretty Print Response

```bash
TOKEN="your-token-here"

curl -X POST http://localhost:4001/api/task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Learn Express.js"}' \
  | jq '.'
```

**Output**:
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "uuid-here",
      "userId": "uuid-here",
      "title": "Learn Express.js",
      "status": "OPEN",
      "created_at": "2026-11-12T10:30:45.123Z",
      "updated_at": "2026-11-12T10:30:45.123Z"
    }
  }
}
```

---

### Example 2: Save Response to File

```bash
TOKEN="your-token-here"

curl -X POST http://localhost:4001/api/task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Create migration"}' \
  -o task_response.json

# View file
cat task_response.json
```

---

### Example 3: Verbose Mode (See All Details)

```bash
TOKEN="your-token-here"

curl -v -X POST http://localhost:4001/api/task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test task"}'
```

**Shows**:
```
*   Trying 127.0.0.1:4001...
* Connected to localhost (127.0.0.1) port 4001 (#0)
> POST /api/task HTTP/1.1
> Host: localhost:4001
> Authorization: Bearer eyJhbGc...
> Content-Type: application/json
> 
* upload completely sent off: 39 out of 39 bytes
< HTTP/1.1 201 Created
< Content-Type: application/json; charset=utf-8
< 
{
  "success": true,
  "data": {...}
}
```

---

### Example 4: Include Response Headers

```bash
TOKEN="your-token-here"

curl -i -X POST http://localhost:4001/api/task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Debug task"}'
```

**Shows Headers**:
```
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Content-Length: 250
Date: Wed, 12 Nov 2026 10:30:45 GMT
```

---

### Example 5: Get Status Code Only

```bash
TOKEN="your-token-here"

curl -s -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:4001/api/task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Status check"}'
```

**Output**: `201`

---

### Example 6: Create Multiple Tasks

```bash
TOKEN="your-token-here"

TASKS=(
  "Learn TypeScript"
  "Build REST API"
  "Setup database"
  "Write tests"
  "Deploy application"
)

for task in "${TASKS[@]}"; do
  echo "Creating task: $task"
  
  curl -s -X POST http://localhost:4001/api/task \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"title\":\"$task\"}" | jq '.data.task.id, .data.task.title'
done
```

---

### Example 7: Using External JSON File

```bash
# Create task_payload.json
cat > task_payload.json << EOF
{
  "title": "Complete project documentation"
}
EOF

TOKEN="your-token-here"

curl -X POST http://localhost:4001/api/task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @task_payload.json
```

---

### Example 8: Full Workflow Script

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "========== Task Creation Workflow =========="

# 1. Register or login
echo -e "${GREEN}1. Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}Login failed!${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo "Token: ${TOKEN:0:20}..."

# 2. Create task
echo -e "\n${GREEN}2. Creating task...${NC}"
TASK_RESPONSE=$(curl -s -X POST http://localhost:4001/api/task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Complete documentation"}')

TASK_ID=$(echo $TASK_RESPONSE | jq -r '.data.task.id')
TASK_TITLE=$(echo $TASK_RESPONSE | jq -r '.data.task.title')

if [ "$TASK_ID" == "null" ] || [ -z "$TASK_ID" ]; then
  echo -e "${RED}Task creation failed!${NC}"
  echo $TASK_RESPONSE | jq '.'
  exit 1
fi

echo -e "${GREEN}✓ Task created${NC}"
echo "Task ID: $TASK_ID"
echo "Title: $TASK_TITLE"

echo -e "\n${GREEN}========== Success! ==========${NC}"
```

**Run**:
```bash
bash create_task_workflow.sh
```

---

## 📥 Request/Response Examples

### Success: Valid Task Creation

**Request**:
```bash
curl -X POST http://localhost:4001/api/task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"title":"Complete API documentation"}'
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Complete API documentation",
      "status": "OPEN",
      "created_at": "2026-11-12T10:30:45.123Z",
      "updated_at": "2026-11-12T10:30:45.123Z"
    }
  }
}
```

---

### Error: Missing Token

**Request**:
```bash
curl -X POST http://localhost:4001/api/task \
  -H "Content-Type: application/json" \
  -d '{"title":"Task without token"}'
```

**Response** (401):
```json
{
  "success": false,
  "message": "Access token is required!"
}
```

---

### Error: Invalid Token

**Request**:
```bash
curl -X POST http://localhost:4001/api/task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token-here" \
  -d '{"title":"Task with bad token"}'
```

**Response** (401):
```json
{
  "success": false,
  "message": "Invalid or expired access token"
}
```

---

### Error: Empty Title

**Request**:
```bash
curl -X POST http://localhost:4001/api/task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":""}'
```

**Response** (400):
```json
{
  "success": false,
  "message": "Title is required"
}
```

---

### Error: Title Too Long

**Request**:
```bash
curl -X POST http://localhost:4001/api/task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"This is a very long title that exceeds 100 characters which is the maximum allowed length for task titles in this application"}'
```

**Response** (400):
```json
{
  "success": false,
  "message": "Title must be 100 char or less"
}
```

---

### Error: Missing Title Field

**Request**:
```bash
curl -X POST http://localhost:4001/api/task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{}'
```

**Response** (400):
```json
{
  "success": false,
  "message": "Title is required"
}
```

---

## 🐛 Error Scenarios

### Issue 1: "Access token is required!"

```
Error: 401 Unauthorized
Cause: Missing Authorization header
Solution: Add -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Issue 2: "Invalid or expired access token"

```
Error: 401 Unauthorized
Cause: Token invalid or expired (7 days old)
Solution: 
  1. Get new token by logging in again
  2. Use new token in request
```

---

### Issue 3: "Title is required"

```
Error: 400 Bad Request
Cause: Missing title field or empty string
Solution: 
  ✓ {"title":"My Task"}       ← Correct
  ✗ {}                         ← Wrong
  ✗ {"title":""}               ← Wrong
  ✗ {"title":"   "}            ← Wrong (whitespace only)
```

---

### Issue 4: "Title must be 100 char or less"

```
Error: 400 Bad Request
Cause: Title longer than 100 characters
Solution: Shorten title to max 100 chars
  ✓ 99 characters is OK
  ✓ 100 characters is OK
  ✗ 101 characters is rejected
```

---

### Issue 5: Connection Refused

```
Error: curl: (7) Failed to connect to localhost port 4001
Cause: Server not running
Solution:
  npm run dev
  # Wait for: "Server running on port http://localhost:4001"
```

---

## ✅ Testing Checklist

### Before Testing:

- [ ] Server is running (`npm run dev`)
- [ ] Database is connected
- [ ] User registered
- [ ] Got JWT token from login

### Test Cases:

- [ ] **Valid**: Create task with valid title
- [ ] **Valid**: Create task with 100 char title
- [ ] **Valid**: Create task with special chars
- [ ] **Error**: Missing token
- [ ] **Error**: Invalid token
- [ ] **Error**: Empty title
- [ ] **Error**: Title > 100 chars
- [ ] **Error**: No title field
- [ ] **Verify**: Response has task ID
- [ ] **Verify**: Response status is 201

---

## 📝 Step-by-Step Guide

### Complete Workflow:

```bash
# 1️⃣ Start server
npm run dev
# Wait for: "Server running on port http://localhost:4001"

# 2️⃣ In another terminal, register user
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"password123"}'

# 3️⃣ Login to get token
TOKEN=$(curl -s -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"password123"}' \
  | jq -r '.data.accessToken')

echo "Token: $TOKEN"

# 4️⃣ Create task
curl -X POST http://localhost:4001/api/task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"My first task"}' \
  | jq '.'

# 5️⃣ Response should be 201 with task data
```

---

## 🔑 Quick Reference

### Get Token:
```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  | jq -r '.data.accessToken'
```

### Create Task:
```bash
TOKEN="your-token"
curl -X POST http://localhost:4001/api/task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Task title"}'
```

### Create Task (Pretty):
```bash
TOKEN="your-token"
curl -X POST http://localhost:4001/api/task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Task title"}' | jq '.'
```

---

## 📚 Related Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Get token |
| POST | /api/task | Yes | Create task |
| GET | /api/health | No | Health check |

---

**Status**: ✅ Ready to Use!  
**Next**: Test with your token!

---

*Last Updated: 2026-11-12*
