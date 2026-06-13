# Roles & Permissions Module

## Overview
RBAC (Role Based Access Control) system. Super Admin creates roles and assigns module-wise permissions.

## Default Roles (System - cannot be deleted)
| Role | Description |
|------|-------------|
| Super Admin | Full access to all modules. Can create roles, manage users. |

## Modules
- `courses` - Course management
- `team` - Team management
- `brand-ambassador` - Brand Ambassador management
- `contact` - Messages/Contact management
- `class-video` - Class Video management
- `users` - User management (Super Admin only)
- `roles` - Role management (Super Admin only)

## Permission Actions (per module)
| Action | Description |
|--------|-------------|
| Read | View/list items |
| Write | Create new items |
| Edit | Update existing items |
| Delete | Remove items |

## How It Works
1. Super Admin creates a new role (e.g. "Manager")
2. Assigns permissions per module via checkbox matrix
3. Creates a user and assigns that role
4. That user can only access what their role permits

## Key Files
- Model: `backend/src/models/Role.js`
- Routes: `backend/src/routes/roles.js`
- Middleware: `backend/src/middleware/rbac.js`
- Frontend: `frontend/src/pages/admin/Roles.jsx`, `RoleForm.jsx`
