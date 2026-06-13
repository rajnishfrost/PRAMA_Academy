# Media Module

## Overview
Centralized file upload and media management system. All image uploads across the application go through the Media API, which stores files on disk and tracks metadata in MongoDB.

## How It Works
1. Frontend uses `ImageUpload` component to upload files
2. Files are sent to `/api/media/upload` via multipart form-data
3. Multer stores the file in `uploads/{module}/` directory
4. A Media document is created in MongoDB with file metadata
5. The file URL is returned and stored in the parent document (e.g., Course)
6. Frontend uses `getImageUrl()` helper to resolve image paths for display

## Storage Structure
```
backend/
  uploads/
    courses/        # Course images (cover, hero, benefits, teacher)
    general/        # General uploads
```

## Key Files
- Model: `backend/src/models/Media.js`
- Routes: `backend/src/routes/media.js`
- Frontend Upload Component: `frontend/src/components/ImageUpload.jsx`
- URL Helper: `frontend/src/lib/imageUrl.js`

## Media Document Fields
- `filename` - Generated unique filename on disk
- `originalName` - Original uploaded filename
- `path` - Relative file path on server
- `url` - URL path for accessing the file (e.g., `/uploads/courses/abc.jpg`)
- `mimetype` - File MIME type
- `size` - File size in bytes
- `module` - Category/module the file belongs to (e.g., "courses", "general")
- `uploadedBy` - Reference to the User who uploaded
