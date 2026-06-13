# Users Module

## Overview
User management for admin panel. Only Super Admin can create, edit, and delete users.

## User Structure
- name, email, password (hashed with bcrypt)
- role (reference to Role document)
- isActive (can deactivate without deleting)

## Key Files
- Model: `backend/src/models/User.js`
- Routes: `backend/src/routes/users.js`
- Frontend: `frontend/src/pages/admin/Users.jsx`
