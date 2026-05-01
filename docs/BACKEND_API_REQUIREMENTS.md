# Backend API Requirements for Image Upload Feature

## Overview
Frontend application requires backend API endpoints for image upload functionality in the  Sack Counter system. Currently, frontend is using mock responses because these endpoints don't exist.

## Required Endpoints

### 1. Upload Image for Counting Session
**Endpoint:** `POST /counting-sessions/{sessionId}/upload-image`

**Purpose:** Upload an image for a specific counting session (box or sack counting).

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Headers: Include authentication (cookies/headers as per current auth system)
- Body:
  - `image` (File): The image file to upload
  - `description` (String, optional): Description of the image
  - `sessionId` (String/Number): Session ID (also in URL path)

**Response (200 OK):**
```json
{
  "imagePath": "/uploads/{timestamp}_{filename}",
  "message": "Image uploaded successfully",
  "sessionId": "123",
  "fileName": "example.jpg",
  "fileSize": 102400,
  "fileType": "image/jpeg"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid file type/size, missing required fields
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User doesn't have permission to upload for this session
- `404 Not Found`: Session not found
- `413 Payload Too Large`: File too large
- `500 Internal Server Error`: Server error during upload

---

### 2. Upload Image for Specific Row in Counting Session
**Endpoint:** `POST /counting-sessions/{sessionId}/rows/{rowNumber}/upload-image`

**Purpose:** Upload an image for a specific row within a counting session.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `image` (File): The image file to upload
  - `rowNumber` (Number): Row number (also in URL path)
  - `description` (String, optional): Description of the image
  - `vehicleId` (String/Number, optional): Vehicle ID
  - `TypeId` (String/Number, optional):  type ID

**Response (200 OK):**
```json
{
  "imagePath": "/uploads/rows/{timestamp}_{filename}",
  "message": "Row image uploaded successfully",
  "sessionId": "123",
  "rowNumber": 1,
  "fileName": "example.jpg",
  "fileSize": 102400,
  "fileType": "image/jpeg"
}
```

**Error Responses:** Same as endpoint #1

---

### 3. Upload Image for Row (Alternative/Generic)
**Endpoint:** `POST /counting-sessions/rows/upload`

**Purpose:** Generic endpoint for uploading row images (alternative to endpoint #2).

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `image` (File): The image file to upload
  - `rowNumber` (Number): Row number
  - `sessionId` (String/Number, optional): Session ID (if not provided in other ways)
  - `vehicleId` (String/Number, optional): Vehicle ID
  - `TypeId` (String/Number, optional):  type ID
  - `description` (String, optional): Description of the image

**Response (200 OK):**
```json
{
  "imagePath": "/uploads/rows/{timestamp}_{filename}",
  "message": "Image uploaded successfully",
  "rowNumber": 1,
  "fileName": "example.jpg"
}
```

---

## File Requirements

### Accepted File Types:
- `image/jpeg`
- `image/png`
- `image/jpg`
- `image/webp`

### File Size Limits:
- Maximum: 5MB (5 * 1024 * 1024 bytes)
- Recommended: Validate on both client and server side

### File Storage:
- Store in: `/uploads/` directory (or cloud storage)
- Naming convention: `{timestamp}_{original_filename}` or `{uuid}.{extension}`
- Consider subdirectories: `/uploads/sessions/`, `/uploads/rows/`

---

## Security Considerations

### 1. File Validation:
- Validate file type using MIME type (not just extension)
- Validate file size before processing
- Scan for malware if possible

### 2. Authentication & Authorization:
- Verify user is authenticated
- Verify user has permission to upload for the specific session
- Session must belong to user or user must have admin rights

### 3. Input Sanitization:
- Sanitize filename to prevent path traversal attacks
- Limit filename length
- Remove special characters from filename

### 4. Rate Limiting:
- Consider rate limiting to prevent abuse
- Limit number of uploads per user per time period

---

## Database Considerations

### Image Metadata Storage:
Consider adding to your database schema:

```sql
-- For session images
CREATE TABLE counting_session_images (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES counting_sessions(id),
  image_path VARCHAR(500) NOT NULL,
  description TEXT,
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- For row images  
CREATE TABLE counting_row_images (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES counting_sessions(id),
  row_number INTEGER NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  description TEXT,
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Frontend Integration Details

### Current Frontend Implementation:
1. **Table Component**: Uses endpoint #1 via `uploadCountingSessionImage()`
2. **BagRow/BoxRow Components**: Use endpoint #3 via direct axios call
3. **Mock Responses**: Currently returning mock data with messages indicating backend not implemented

### Frontend Code Locations:
- `src/utils/count/count-api.ts`: API functions
- `src/components/table/table.tsx`: Table with upload button
- `src/components/count/BagRow.tsx`: Bag row upload
- `src/components/count/BoxRow.tsx`: Box row upload
- `src/components/image-upload/ImageUploadModal.tsx`: Upload modal

### Testing with Mock Data:
Frontend is configured to work with mock responses. To test real backend integration:
1. Implement the endpoints above
2. Update frontend to remove mock responses
3. Test file upload functionality

---

## Development Priority

### Phase 1 (Minimum Viable):
1. Implement endpoint #1: `/counting-sessions/{sessionId}/upload-image`
2. Basic file validation (type, size)
3. Simple file storage in `/uploads/` directory

### Phase 2 (Enhanced):
1. Implement endpoint #2: `/counting-sessions/{sessionId}/rows/{rowNumber}/upload-image`
2. Database storage for image metadata
3. Better error handling and validation

### Phase 3 (Advanced):
1. Cloud storage integration (S3, Cloudinary, etc.)
2. Image processing (resizing, compression)
3. Multiple file upload support
4. Image gallery/viewing functionality

---

## Questions for Backend Team

1. **File Storage**: Where should uploaded files be stored? Local filesystem or cloud storage?
2. **Database**: Should we store image metadata in database? If so, what schema?
3. **Authentication**: How should we handle authentication for file upload endpoints?
4. **CORS**: Are CORS settings configured for file upload endpoints?
5. **Existing Endpoints**: Are there any existing image upload endpoints we should use instead?
6. **File Size Limit**: What should be the maximum file size? (Frontend currently uses 5MB)
7. **Path Structure**: What should be the URL path structure for accessing uploaded images?

---

## Contact & Coordination

- **Frontend Team**: Responsible for UI/UX and frontend integration
- **Backend Team**: Responsible for API implementation and file handling
- **Testing**: Coordinate testing once endpoints are implemented

**Note**: Frontend is currently using mock responses. Please notify frontend team when endpoints are ready for integration testing.