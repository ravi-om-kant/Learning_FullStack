# cURL Commands - Registration & API Testing Guide

**Date**: 2026-11-11  
**Endpoint**: POST /api/auth/register  
**Level**: Beginner to Intermediate

---

## 📚 Table of Contents

1. [What is cURL?](#what-is-curl)
2. [Registration Endpoint Details](#registration-endpoint-details)
3. [Basic cURL Command](#basic-curl-command)
4. [Advanced cURL Examples](#advanced-curl-examples)
5. [Understanding cURL Flags](#understanding-curl-flags)
6. [Expected Responses](#expected-responses)
7. [Common Issues & Solutions](#common-issues--solutions)
8. [Testing Scenarios](#testing-scenarios)
9. [cURL vs Postman vs Code](#curl-vs-postman-vs-code)

---

## 🔗 What is cURL?

**cURL** = Client URL  
A command-line tool to send HTTP requests.

### Why Use cURL?

```
✅ Quick testing from terminal
✅ No GUI needed (works on servers)
✅ Easy to automate
✅ Great for learning HTTP
✅ Works on Windows, Mac, Linux
✅ No additional software needed
```

### Installation:

```bash
# Windows
# Usually pre-installed in PowerShell/Git Bash

# Mac
brew install curl

# Linux
sudo apt-get install curl
```

---

## 📋 Registration Endpoint Details

### Endpoint Information:

```
Method:     POST
Path:       /api/auth/register
Full URL:   http://localhost:4001/api/auth/register
Content-Type: application/json
```

### Request Body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response (Success - 201):

```json
{
  "success": true,
  "message": "Registration successfull. Please login to continue."
}
```

### Response (Error - 400):

```json
{
  "success": false,
  "message": "Email already exist!"
}
```

### Validation Rules:

| Field | Required | Rules | Example |
|-------|----------|-------|---------|
| email | Yes | Must be valid email | user@example.com |
| password | Yes | Minimum 6 characters | password123 |

---

## 🚀 Basic cURL Command

### Simple Registration:

```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### One-Line Version (Copy & Paste):

```bash
curl -X POST http://localhost:4001/api/auth/register -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"password123"}'
```

### Windows (PowerShell):

```powershell
curl -X POST http://localhost:4001/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"user@example.com","password":"password123"}'
```

### Windows (CMD) - Escape Quotes:

```cmd
curl -X POST http://localhost:4001/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"user@example.com\",\"password\":\"password123\"}"
```

---

## 📊 Advanced cURL Examples

### Example 1: Pretty Print Response

```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' \
  | jq '.'
```

**Requirements**: `jq` installed (`brew install jq`)

**Output**:
```json
{
  "success": true,
  "message": "Registration successfull. Please login to continue."
}
```

---

### Example 2: Save Response to File

```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"password123"}' \
  -o response.json
```

**Creates**: `response.json` with the response

---

### Example 3: Verbose Mode (See All Details)

```bash
curl -v -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Shows**:
```
*   Trying 127.0.0.1:4001...
* Connected to localhost (127.0.0.1) port 4001 (#0)
> POST /api/auth/register HTTP/1.1
> Host: localhost:4001
> User-Agent: curl/7.64.1
> Accept: */*
> Content-Type: application/json
> Content-Length: 59
> 
* upload completely sent off: 59 out of 59 bytes
< HTTP/1.1 201 Created
< Content-Type: application/json; charset=utf-8
< Content-Length: 89
< 
{
  "success": true,
  "message": "Registration successfull. Please login to continue."
}
```

---

### Example 4: Include Response Headers

```bash
curl -i -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

**Shows Headers**:
```
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Content-Length: 89
Date: Wed, 11 Nov 2026 17:45:30 GMT

{
  "success": true,
  "message": "Registration successfull. Please login to continue."
}
```

---

### Example 5: Test Error Scenario (Duplicate Email)

```bash
# First registration
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"duplicate@example.com","password":"password123"}'

# Second registration with same email (should fail)
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"duplicate@example.com","password":"differentpass"}'
```

**Second Response (Error)**:
```json
{
  "success": false,
  "message": "Email already exist!"
}
```

---

### Example 6: Test Invalid Password (Too Short)

```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"short@example.com","password":"123"}'
```

**Response (Error)**:
```json
{
  "success": false,
  "message": "Password mush be at least 6 character"
}
```

---

### Example 7: Test Missing Fields

```bash
# Missing password
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"nopw@example.com"}'
```

**Response**:
```json
{
  "success": false,
  "message": "Email and Password is required!"
}
```

---

### Example 8: Get Response Status Code Only

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"status@example.com","password":"password123"}'
```

**Output**: `201`

---

### Example 9: Multiple Registrations with Variables

```bash
# Store credentials in variables
EMAIL="user1@example.com"
PASSWORD="password123"

curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
```

---

### Example 10: Using External JSON File

```bash
# Create payload.json
cat > payload.json << EOF
{
  "email": "fromfile@example.com",
  "password": "password123"
}
EOF

# Send using the file
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d @payload.json
```

---

## 🔧 Understanding cURL Flags

### Common Flags:

| Flag | Full Name | Purpose | Example |
|------|-----------|---------|---------|
| `-X` | --request | HTTP method | `-X POST` |
| `-H` | --header | Add header | `-H "Content-Type: application/json"` |
| `-d` | --data | Request body | `-d '{"key":"value"}'` |
| `-i` | --include | Show headers | `-i` |
| `-v` | --verbose | Verbose output | `-v` |
| `-s` | --silent | Silent mode | `-s` |
| `-o` | --output | Save to file | `-o response.json` |
| `-w` | --write-out | Print info | `-w "%{http_code}"` |
| `-u` | --user | Basic auth | `-u username:password` |
| `-b` | --cookie | Send cookies | `-b "session=abc123"` |
| `-A` | --user-agent | User agent | `-A "MyApp/1.0"` |
| `-L` | --location | Follow redirects | `-L` |

---

## 📥 Expected Responses

### Success Response (201 Created):

```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"secure123"}'
```

**Response**:
```
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "message": "Registration successfull. Please login to continue."
}
```

---

### Error: Missing Fields (400):

```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response**:
```
HTTP/1.1 400 Bad Request

{
  "success": false,
  "message": "Email and Password is required!"
}
```

---

### Error: Duplicate Email (408):

```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"existing@example.com","password":"password123"}'
```

**Response**:
```
HTTP/1.1 408 Request Timeout

{
  "success": false,
  "message": "Email already exist!"
}
```

---

### Error: Invalid Password Length (400):

```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"12345"}'
```

**Response**:
```
HTTP/1.1 400 Bad Request

{
  "success": false,
  "message": "Password mush be at least 6 character"
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Connection refused"

```
Error: curl: (7) Failed to connect to localhost port 4001: Connection refused
```

**Cause**: Server not running

**Solution**:
```bash
# Start the server
npm run dev

# Wait for: "Server running on port http://localhost:4001"

# Then run curl command in another terminal
```

---

### Issue 2: Invalid JSON in request body

```
Error: Unexpected token } in JSON at position 59
```

**Cause**: Malformed JSON

**Example (Wrong)**:
```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass",}'
  # ↑ Trailing comma!
```

**Solution**: Fix the JSON
```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'
```

---

### Issue 3: Wrong Content-Type header

```
Error: Email and Password is required!
```

**Cause**: Missing Content-Type header

**Wrong**:
```bash
curl -X POST http://localhost:4001/api/auth/register \
  -d '{"email":"user@example.com","password":"pass"}'
  # Missing: -H "Content-Type: application/json"
```

**Correct**:
```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'
```

---

### Issue 4: Quote Issues on Windows

```
Error: The filename, directory name, or volume label syntax is incorrect
```

**Cause**: Wrong quote escaping on Windows CMD

**Wrong (CMD)**:
```cmd
curl -X POST ... -d '{"email":"user@example.com"}'
```

**Correct (CMD)**:
```cmd
curl -X POST ... -d "{\"email\":\"user@example.com\"}"
```

**Better (PowerShell)**:
```powershell
curl -X POST ... -d '{"email":"user@example.com"}'
```

---

### Issue 5: Command Too Long

**Solution**: Use external file
```bash
# Create request.json
echo '{"email":"user@example.com","password":"password123"}' > request.json

# Use it
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d @request.json
```

---

## 🧪 Testing Scenarios

### Scenario 1: Happy Path (Success)

```bash
#!/bin/bash
# test_registration_success.sh

echo "Testing successful registration..."

curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"success@example.com","password":"password123"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo "✅ Registration successful!"
```

**Run**:
```bash
bash test_registration_success.sh
```

---

### Scenario 2: Batch Registrations

```bash
#!/bin/bash
# test_batch_registration.sh

USERS=(
  "user1@example.com:password123"
  "user2@example.com:password456"
  "user3@example.com:password789"
)

for user in "${USERS[@]}"; do
  IFS=':' read -r email password <<< "$user"
  echo "Registering: $email"
  
  curl -X POST http://localhost:4001/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}" \
    -s | jq '.message'
done
```

---

### Scenario 3: Duplicate Email Test

```bash
#!/bin/bash
# test_duplicate_email.sh

EMAIL="duplicate@example.com"
PASSWORD="password123"

echo "First registration:"
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -s | jq '.'

echo -e "\nSecond registration (should fail):"
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -s | jq '.'
```

---

### Scenario 4: All Validation Tests

```bash
#!/bin/bash
# test_all_validations.sh

echo "1. Valid registration:"
curl -s -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"valid@example.com","password":"password123"}' | jq '.message'

echo -e "\n2. Missing email:"
curl -s -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"password":"password123"}' | jq '.message'

echo -e "\n3. Missing password:"
curl -s -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' | jq '.message'

echo -e "\n4. Password too short:"
curl -s -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"short@example.com","password":"12345"}' | jq '.message'

echo -e "\n5. Duplicate email (if already exists):"
curl -s -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"valid@example.com","password":"password456"}' | jq '.message'
```

---

## 🔄 cURL vs Postman vs Code

### Comparison Table:

| Aspect | cURL | Postman | Node.js fetch |
|--------|------|---------|---------------|
| Installation | Pre-installed | Need download | Built-in |
| Learning Curve | Steep | Easy | Medium |
| GUI | No | Yes | No |
| Speed | Fast | Slower | Fast |
| Automation | Excellent | Good | Excellent |
| Team Sharing | Code-based | UI-based | Code-based |
| Documentation | Built-in man | Docs | Docs |

---

## 📚 Using Different Methods

### Method 1: cURL (Terminal)

```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Method 2: Postman (GUI)

```
1. Open Postman
2. New Request → POST
3. URL: http://localhost:4001/api/auth/register
4. Headers → Content-Type: application/json
5. Body → Raw → JSON
   {
     "email": "user@example.com",
     "password": "password123"
   }
6. Click Send
```

### Method 3: Node.js fetch

```javascript
const response = await fetch('http://localhost:4001/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
console.log(data);
```

### Method 4: JavaScript axios

```javascript
const axios = require('axios');

await axios.post('http://localhost:4001/api/auth/register', {
  email: 'user@example.com',
  password: 'password123'
});
```

### Method 5: Python requests

```python
import requests

response = requests.post(
    'http://localhost:4001/api/auth/register',
    json={
        'email': 'user@example.com',
        'password': 'password123'
    }
)

print(response.json())
```

---

## 🎓 Interview Questions About cURL

### Q1: What does the `-d` flag do in cURL?

**Answer**: `-d` sends data in the request body. It automatically sets:
- Content-Length header
- Uses POST method by default
- Encodes data

---

### Q2: Why do we use `-H "Content-Type: application/json"`?

**Answer**: Tells the server the request body is JSON format. Without it, the server might misinterpret the data.

---

### Q3: Difference between `-v` and `-i` flags?

**Answer**:
- `-v` (verbose): Shows ALL details (request + response + headers)
- `-i` (include): Shows response headers + body only

---

### Q4: How to send multiple headers?

**Answer**: Use multiple `-H` flags
```bash
curl -H "Content-Type: application/json" \
     -H "Authorization: Bearer token123" \
     -X POST http://localhost:4001/api/auth/register \
     -d '{"email":"user@example.com","password":"pass"}'
```

---

### Q5: How to follow redirects in cURL?

**Answer**: Use `-L` flag
```bash
curl -L -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'
```

---

## 📋 Quick Reference

### Most Common cURL Command:

```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### With Pretty Output:

```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' | jq '.'
```

### With All Details:

```bash
curl -v -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Get Status Code Only:

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

---

## ✅ Testing Checklist

- [ ] Server is running (`npm run dev`)
- [ ] URL is correct (http://localhost:4001/api/auth/register)
- [ ] Method is POST (`-X POST`)
- [ ] Content-Type header is set
- [ ] JSON is valid (use jq or validator)
- [ ] Email and password provided
- [ ] No trailing commas in JSON
- [ ] Quotes properly escaped

---

## 🚀 Ready to Test!

**Run this command:**

```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"password123"}'
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Registration successfull. Please login to continue."
}
```

---

*Last Updated: 2026-11-11*
