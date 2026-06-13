# Login Module

## Overview
Authentication system for Prama Academy admin panel. Uses JWT-based stateless auth.

## Users
- **Super Admin**: Full system access, can manage roles/users/courses (only default role)

## Default Credentials (After Seed)
- Email: admin@pramaacademy.com
- Password: admin123
- Role: Super Admin

## Security
- **Rate Limiting**: Max 3 login attempts per IP, 10-minute lockout after exceeding limit (in-memory)

## Key Files
- Backend: `backend/src/routes/auth.js`
- Backend Middleware: `backend/src/middleware/auth.js`
- Frontend: `frontend/src/pages/admin/Login.jsx`
- Auth Context: `frontend/src/lib/AuthContext.jsx`
