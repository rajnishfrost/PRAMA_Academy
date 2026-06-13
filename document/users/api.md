# Users API Reference

All routes require authentication + Super Admin role.

## GET /api/users
List all users with populated role.

## POST /api/users
Create new user.

**Body:**
```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "password123",
  "role": "role_id_here"
}
```

## PUT /api/users/:id
Update user (name, email, password, role, isActive).

## DELETE /api/users/:id
Delete user (cannot delete yourself).
