# Courses Module

## Overview
Full CRUD management for courses. Admin panel allows creating, editing, and deleting courses. Public frontend displays active courses.

## Course Structure
Each course contains:
- **Basic**: name, slug, tagline, cover image, hero image, active status, display order
- **Content**: intro paragraphs, history
- **Benefits**: list of benefit items (heading + image)
- **Levels**: course level breakdown (title + description)
- **Programs**: class details with bullet points and notes
- **Teacher**: name, image, total hours
- **Pricing**: full price, monthly price

## Data Flow
1. Admin creates/edits course in admin panel -> saved to MongoDB
2. Public frontend fetches from `/api/courses/public` endpoint
3. If backend is down, static fallback data is used (`/src/data/courses.js`)

## Key Files
- Model: `backend/src/models/Course.js`
- Routes: `backend/src/routes/courses.js`
- Admin UI: `frontend/src/pages/admin/AdminCourses.jsx`, `CourseForm.jsx`
- Public UI: `frontend/src/pages/Home.jsx` (course cards), `CourseDetail.jsx` (detail page)
- Data Hook: `frontend/src/lib/useCourses.js`
- Static Fallback: `frontend/src/data/courses.js`
