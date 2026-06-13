# Roles & Permissions Flow

## Creating a New Role

1. Super Admin navigates to `/admin/roles`
2. Clicks "+ New Role"
3. Enters role name and description
4. Permission matrix shows all modules with checkboxes (Read/Write/Edit/Delete)
5. Checks desired permissions
6. Submits form -> POST /api/roles
7. New role appears in roles list

## RBAC Middleware Flow

When an API request hits a protected route:

1. `authenticate` middleware verifies JWT token
2. Loads user with populated role
3. `checkPermission(module, action)` middleware runs:
   - If role is "Super Admin" -> allow
   - Otherwise, find the module in role's permissions array
   - Check if the specific action (read/write/edit/delete) is true
   - If yes -> allow, if no -> 403 Forbidden

## Frontend Permission Check

`AuthContext` provides `hasPermission(module, action)` function:
- **Sidebar filtering**: Only modules with `read` permission are shown in sidebar (`AdminLayout.jsx`)
- **Route protection**: `PermissionRoute` in `App.jsx` redirects to `/admin` if user lacks `read` permission for a module
- **UI elements**: Admin components use `hasPermission` to show/hide buttons (Add, Edit, Delete)
- Super Admin always returns true
- Other roles check their permissions array

## Example

Super Admin creates "Content Manager" role:
- courses: read, write, edit (no delete)
- users: none
- roles: none

Content Manager user can:
- View all courses
- Create new courses
- Edit existing courses
- Cannot delete courses
- Cannot see Users or Roles in sidebar
