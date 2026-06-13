# Roles & Permissions API Reference

All routes require authentication + Super Admin role.

## GET /api/roles/modules

Returns list of available modules for permission assignment.

**Response:**
```json
{ "modules": ["courses", "users", "roles"] }
```

---

## GET /api/roles

List all roles.

**Response:**
```json
{
  "roles": [
    {
      "_id": "...",
      "name": "Super Admin",
      "description": "Full system access",
      "isSystem": true,
      "permissions": [
        { "module": "courses", "read": true, "write": true, "edit": true, "delete": true },
        { "module": "users", "read": true, "write": true, "edit": true, "delete": true },
        { "module": "roles", "read": true, "write": true, "edit": true, "delete": true }
      ]
    }
  ]
}
```

---

## GET /api/roles/:id

Get single role by ID.

---

## POST /api/roles

Create new role.

**Request Body:**
```json
{
  "name": "Manager",
  "description": "Can manage courses",
  "permissions": [
    { "module": "courses", "read": true, "write": true, "edit": true, "delete": false }
  ]
}
```

---

## PUT /api/roles/:id

Update role (cannot modify system roles).

---

## DELETE /api/roles/:id

Delete role (cannot delete system roles).
