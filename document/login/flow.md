# Login Flow

## Authentication Flow

1. User opens `/admin/login`
2. Enters email and password
3. Frontend sends POST to `/api/auth/login`
4. Backend checks IP rate limit (max 3 failed attempts per 10 minutes)
5. If IP is blocked, returns 429 with remaining wait time
6. Backend validates credentials against MongoDB
7. If invalid, records failed attempt for that IP
8. If valid, returns JWT token + user object (with populated role), resets IP counter
9. Frontend stores token in `localStorage`
10. `AuthContext` updates `user` state
11. User redirected to `/admin` dashboard

## Token Validation (On Page Refresh)

1. App loads, `AuthContext` checks `localStorage` for token
2. If token exists, calls `GET /api/auth/me`
3. If valid, sets user state (stays logged in)
4. If invalid/expired, clears token (redirects to login)

## Logout

1. User clicks "Logout"
2. Token removed from `localStorage`
3. User state set to `null`
4. Redirected to `/admin/login`

## Protected Routes

- `ProtectedRoute`: Checks if user is authenticated
- `SuperAdminRoute`: Checks if user role is "Super Admin"
- Both show loading state while auth is being verified
