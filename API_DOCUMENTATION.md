# Backend API Documentation

## Authentication Endpoints

### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@dotback.com",
  "password": "dotback123"
}
```

**Success Response (200):**
```json
{
  "message": "Logged in successfully.",
  "admin": {
    "email": "admin@dotback.com",
    "name": "DotBack Admin"
  }
}
```

**Error Responses:**
- `400` - Email and password are required
- `401` - Invalid email or password
- `500` - Unexpected error during login

---

### POST `/api/auth/logout`
Logout the current user.

**Success Response (200):**
```json
{
  "message": "Logged out successfully."
}
```

---

### GET `/api/auth/session`
Get current session information.

**Success Response (200):**
```json
{
  "authenticated": true,
  "admin": {
    "id": "...",
    "email": "admin@dotback.com",
    "name": "DotBack Admin"
  }
}
```

**Error Response (401):**
```json
{
  "authenticated": false
}
```

---

### POST `/api/auth/create`
Create a new admin account. **Requires authentication** (must be logged in as an existing admin).

**Request Headers:**
- Cookies: Must include authentication cookie from login

**Request Body:**
```json
{
  "email": "newadmin@example.com",
  "password": "securepassword123",
  "name": "New Admin Name" // Optional
}
```

**Success Response (201):**
```json
{
  "message": "Admin created successfully.",
  "admin": {
    "id": "...",
    "email": "newadmin@example.com",
    "name": "New Admin Name",
    "createdAt": "2025-01-XX...",
    "updatedAt": "2025-01-XX..."
  }
}
```

**Error Responses:**
- `400` - Email and password are required, or validation error
- `401` - Unauthorized (not logged in)
- `409` - Admin with this email already exists
- `500` - Unexpected error during admin creation

**Validation Rules:**
- Email must be valid format
- Password must be at least 6 characters long
- Email must be unique (not already in database)
- Name is optional (defaults to "Administrator")

**Example Usage:**

Using curl:
```bash
# First, login to get authentication cookie
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dotback.com","password":"dotback123"}' \
  -c cookies.txt

# Then create new admin (using cookies from login)
curl -X POST http://localhost:5000/api/auth/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "email": "newadmin@example.com",
    "password": "securepassword123",
    "name": "New Admin"
  }'
```

Using JavaScript fetch:
```javascript
// First login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'admin@dotback.com',
    password: 'dotback123'
  })
});

// Then create admin (cookies are automatically included)
const createResponse = await fetch('http://localhost:5000/api/auth/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'newadmin@example.com',
    password: 'securepassword123',
    name: 'New Admin'
  })
});

const result = await createResponse.json();
console.log(result);
```

---

## Levels Endpoints

### GET `/api/levels`
Get all levels.

**Requires:** Authentication

**Success Response (200):**
```json
{
  "levels": [
    {
      "_id": "...",
      "level": 1,
      "backgroundColor": "#1169d4",
      "dot1Color": "#5bfbb6",
      "dot2Color": "#ebff8a",
      "dot3Color": "#e830a5",
      "dot4Color": "#c4f024",
      "dot5Color": "#ddb00e",
      "logoUrl": "/uploads/...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### POST `/api/levels`
Create a new level.

**Requires:** Authentication

**Request Body:**
```json
{
  "level": 1,
  "backgroundColor": "#1169d4",
  "dot1Color": "#5bfbb6",
  "dot2Color": "#ebff8a",
  "dot3Color": "#e830a5",
  "dot4Color": "#c4f024",
  "dot5Color": "#ddb00e",
  "logoUrl": "" // Optional
}
```

**Success Response (201):**
```json
{
  "level": { ... }
}
```

---

### GET `/api/levels/:level`
Get a specific level by number.

**Requires:** Authentication

**Parameters:**
- `level` - Level number (1-10)

**Success Response (200):**
```json
{
  "level": { ... }
}
```

---

### PUT `/api/levels/:level`
Update a specific level.

**Requires:** Authentication

**Parameters:**
- `level` - Level number (1-10)

**Request Body:**
```json
{
  "backgroundColor": "#1169d4",
  "dot1Color": "#5bfbb6",
  "dot2Color": "#ebff8a",
  "dot3Color": "#e830a5",
  "dot4Color": "#c4f024",
  "dot5Color": "#ddb00e",
  "logoUrl": "" // Optional
}
```

**Success Response (200):**
```json
{
  "level": { ... }
}
```

---

### DELETE `/api/levels/:level`
Delete a specific level.

**Requires:** Authentication

**Parameters:**
- `level` - Level number (1-10)

**Success Response (200):**
```json
{
  "level": { ... }
}
```

---

## Upload Endpoints

### POST `/api/upload`
Upload an image file.

**Requires:** Authentication

**Request:**
- Content-Type: `multipart/form-data`
- Body: FormData with `file` field

**File Requirements:**
- Max size: 1MB
- Max dimensions: 1080x400 pixels
- Must be a valid image file

**Success Response (200):**
```json
{
  "url": "/uploads/1763029208989-140761871-filename.png"
}
```

**Error Responses:**
- `400` - File is required, file too large, or invalid dimensions
- `401` - Unauthorized

---

## Health Check

### GET `/health`
Check if the server is running.

**Success Response (200):**
```json
{
  "status": "ok"
}
```

---

## Authentication

All protected endpoints (except `/health` and `/api/auth/login`) require authentication via HTTP-only cookies set during login.

The authentication cookie is automatically included in requests from the browser when using `credentials: "include"` in fetch requests.

