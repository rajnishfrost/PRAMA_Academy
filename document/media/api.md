# Media API Reference

All routes require authentication.

## POST /api/media/upload
Upload a file.

**Content-Type:** `multipart/form-data`

**Fields:**
- `file` (required) - The file to upload
- `module` (optional, default: "general") - Category for organizing uploads

**Response:**
```json
{
  "_id": "...",
  "filename": "1234567890-image.jpg",
  "originalName": "image.jpg",
  "path": "uploads/courses/1234567890-image.jpg",
  "url": "/uploads/courses/1234567890-image.jpg",
  "mimetype": "image/jpeg",
  "size": 45231,
  "module": "courses",
  "uploadedBy": "user_id"
}
```

## GET /api/media
List all media files. Supports filtering by module.

**Query Parameters:**
- `module` (optional) - Filter by module name

## GET /api/media/:id
Get a single media file by ID.

## DELETE /api/media/:id
Delete a media file. Removes the file from disk and the document from MongoDB.
