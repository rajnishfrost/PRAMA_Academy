# Courses API Reference

## Public Endpoints (No Auth Required)

### GET /api/courses/public
Returns all active courses sorted by order.

**Response:**
```json
{
  "courses": [
    {
      "_id": "...",
      "name": "Abacus",
      "slug": "abacus",
      "tagline": "...",
      "cover": "/images/courses/c1.png",
      "heroImage": "/images/childWithTable.jpg",
      "intro": ["...", "..."],
      "benefits": [{ "heading": "...", "image": "..." }],
      "levels": [{ "title": "...", "desc": "..." }],
      "programs": [{ "title": "...", "details": ["..."], "note": "..." }],
      "teacher": { "name": "...", "image": "...", "hours": "..." },
      "price": { "full": "$100", "monthly": "$15/month" },
      "isActive": true,
      "order": 0
    }
  ]
}
```

### GET /api/courses/public/:slug
Returns single active course by slug.

---

## Admin Endpoints (Auth + RBAC Required)

### GET /api/courses
List all courses (including inactive). Requires `courses:read`.

### GET /api/courses/:id
Get single course by MongoDB ID. Requires `courses:read`.

### POST /api/courses
Create new course. Requires `courses:write`.

**Body:** Full course object (see model schema).

### PUT /api/courses/:id
Update course. Requires `courses:edit`.

### DELETE /api/courses/:id
Delete course. Requires `courses:delete`.

### POST /api/courses/upload
Upload course image. Requires `courses:write`.

**Body:** `multipart/form-data` with `image` field.
**Response:** `{ "url": "/uploads/courses/filename.jpg" }`
