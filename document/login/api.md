# Login API Reference

## POST /api/auth/login

Login and receive JWT token.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "token": "jwt_token_string",
  "user": {
    "_id": "...",
    "name": "...",
    "email": "...",
    "role": {
      "_id": "...",
      "name": "Super Admin",
      "permissions": [...]
    }
  }
}
```

**Rate Limiting:**
- Max **3 failed attempts** per IP address
- After 3 failures, IP is blocked for **10 minutes**
- Successful login resets the attempt counter
- Stored in-memory (resets on server restart)

**Error Responses:**
- 400: `{ "message": "Email and password required" }`
- 401: `{ "message": "Invalid credentials" }`
- 403: `{ "message": "Account deactivated" }`
- 429: `{ "message": "Too many login attempts. Try again after X minute(s)." }`

---

## GET /api/auth/me

Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "user": { ... }
}
```

**Error:** 401 if token invalid/missing.
