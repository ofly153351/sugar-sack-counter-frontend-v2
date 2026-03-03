# AI Integration for Sugar Sack Counter Frontend

## Overview
This document describes the AI integration for person detection in the Sugar Sack Counter application. The system uses a Python-based AI service with YOLOv8 model for real-time person detection in uploaded images.

## Architecture

### Components
1. **Python AI Service** (Port 8082)
   - FastAPI-based microservice
   - YOLOv8 model for person detection
   - Returns annotated images with bounding boxes

2. **Frontend Integration**
   - ImageUploadModal with AI detection
   - AIDetectionResult component for displaying results
   - BagRow/BoxRow with AI detection buttons
   - Table component with enhanced upload functionality

3. **API Layer**
   - `ai-api.ts` - Frontend API client for AI service
   - `count-api.ts` - Enhanced with image upload functions

## API Endpoints

### AI Service (http://localhost:8082)
- `POST /detect` - Detect persons in uploaded image
- `GET /health` - Health check endpoint

### Frontend API Functions
```typescript
// Detect persons in an image
detectPersons(file: File): Promise<AIDetectionResponse>

// Check AI service health
checkAIHealth(): Promise<AIHealthResponse>

// Process image with AI and get results
processImageWithAI(file: File): Promise<{
  originalImage: string;
  annotatedImage: string;
  detections: DetectionResult[];
  personCount: number;
}>
```

## Features

### 1. Image Upload with AI Detection
- Upload images through modal interface
- Real-time person detection using YOLOv8
- Display annotated images with bounding boxes
- Confidence scores for each detection

### 2. Detection Results Display
- Side-by-side comparison (original vs annotated)
- Detection statistics (person count, average confidence)
- Detailed detection information per person
- Confidence visualization with progress bars

### 3. Integration Points
- **Table Component**: Upload button with AI detection
- **BagRow/BoxRow**: Individual row image upload with AI
- **ImageUploadModal**: Enhanced modal with AI features

## Setup Instructions

### 1. Start AI Service
```bash
# Navigate to AI service directory
cd python-ai-service

# Run startup script
./start.sh
# or manually
python3 main.py
```

### 2. Verify Service Health
```bash
# Check if AI service is running
curl http://localhost:8082/health
# Expected: {"status":"healthy","model_loaded":true}
```

### 3. Test AI Detection
```bash
# Test with curl
curl -X POST -F "file=@test_image.jpg" http://localhost:8082/detect
```

## Usage Examples

### 1. Upload Image with AI Detection
```typescript
import { processImageWithAI } from "@/utils/ai/ai-api";

const handleImageUpload = async (file: File) => {
  const result = await processImageWithAI(file);
  
  // result contains:
  // - originalImage: base64 string
  // - annotatedImage: base64 string with bounding boxes
  // - detections: array of detection objects
  // - personCount: number of persons detected
};
```

### 2. Display Detection Results
```tsx
import { AIDetectionResult } from "@/components/image-upload/AIDetectionResult";

<AIDetectionResult
  originalImage={result.originalImage}
  annotatedImage={result.annotatedImage}
  detections={result.detections}
  personCount={result.personCount}
  showOriginal={true}
/>
```

## File Structure

```
src/
├── components/
│   ├── image-upload/
│   │   ├── ImageUploadModal.tsx    # Enhanced upload modal with AI
│   │   ├── AIDetectionResult.tsx   # Display detection results
│   │   └── index.ts                # Exports
│   ├── count/
│   │   ├── BagRow.tsx              # Updated with AI detection
│   │   └── BoxRow.tsx              # Updated with AI detection
│   └── table/
│       └── table.tsx               # Updated with upload button
├── utils/
│   ├── ai/
│   │   └── ai-api.ts               # AI service API client
│   └── count/
│       └── count-api.ts            # Enhanced with upload functions
```

## Configuration

### Environment Variables
```env
# For development/testing
NEXT_PUBLIC_USE_MOCK_AI=true  # Use mock responses if AI service unavailable
```

### AI Service Configuration
- **Port**: 8082
- **Model**: YOLOv8n (nano)
- **Confidence Threshold**: 0.5
- **File Size Limit**: 5MB
- **Supported Formats**: JPEG, PNG, JPG, WebP

## Testing

### 1. Test AI Service
```bash
# Health check
curl http://localhost:8082/health

# Test detection
curl -X POST -F "file=@test_image.jpg" http://localhost:8082/detect
```

### 2. Test Frontend Integration
1. Navigate to SugarBoxsInfo or SugarBagsInfo page
2. Click upload button in table
3. Select an image with people
4. Click "ตรวจจับบุคคล" button
5. Verify detection results appear

### 3. Test BagRow/BoxRow Integration
1. Go to Count page
2. Add a row
3. Upload image to row
4. Click "ตรวจจับบุคคล" button
5. Verify detection works

## Error Handling

### Common Errors
1. **AI Service Unavailable** (404)
   - Shows mock response with development message
   - Allows upload without AI detection

2. **File Size/Type Errors**
   - Client-side validation before upload
   - Clear error messages

3. **Detection Failures**
   - Graceful degradation to original image
   - Error messages with suggestions

### Fallback Behavior
- If AI service is unavailable, uses mock responses
- Original image is always available
- Upload continues without AI detection

## Performance Considerations

### 1. Image Processing
- Client-side image preview
- Base64 encoding for display
- Optimized image sizes for AI processing

### 2. AI Service
- Local service minimizes network latency
- YOLOv8n optimized for speed
- Async processing with loading states

### 3. Frontend
- Lazy loading of AI components
- Optimized re-renders with React.memo
- Efficient state management

## Security

### 1. File Validation
- Client-side file type validation
- File size limits (5MB)
- MIME type checking

### 2. API Security
- Local service (no external API calls)
- CORS configured for local development
- No sensitive data in image processing

### 3. Data Privacy
- Images processed locally
- No external storage of images
- Temporary base64 encoding only

## Troubleshooting

### 1. AI Service Not Starting
```bash
# Check if port 8082 is in use
lsof -i :8082

# Kill existing process
kill -9 $(lsof -ti:8082)

# Restart service
cd python-ai-service && ./start.sh
```

### 2. Detection Not Working
- Verify AI service is running: `curl http://localhost:8082/health`
- Check browser console for errors
- Verify image contains detectable persons
- Try different image formats

### 3. Slow Performance
- Reduce image size before upload
- Check AI service logs for model loading
- Verify GPU availability for AI service

## Development Notes

### 1. Mock Responses
When `NEXT_PUBLIC_USE_MOCK_AI=true`:
- Returns mock detection data
- Shows development messages
- Allows UI testing without AI service

### 2. Adding New Detection Features
1. Extend `AIDetectionResponse` interface
2. Update `ai-api.ts` with new functions
3. Enhance `AIDetectionResult` component
4. Add new UI elements to `ImageUploadModal`

### 3. Customizing Detection Parameters
Edit `ai-api.ts` to modify:
- Confidence thresholds
- Detection classes
- Response formatting
- Error handling

## Future Enhancements

### 1. Planned Features
- Multiple image upload
- Batch processing
- Detection history
- Export detection results

### 2. Performance Improvements
- Image compression before upload
- WebSocket for real-time updates
- Caching of detection results

### 3. Advanced AI Features
- Multiple object detection (not just persons)
- Counting specific objects (boxes, sacks)
- Quality assessment of images
- Anomaly detection

## Support

### 1. Documentation
- This README
- Code comments in key files
- TypeScript interfaces for API

### 2. Testing Tools
- `test-ai-service.html` - Standalone test page
- Postman collection for API testing
- Sample images for testing

### 3. Monitoring
- AI service health checks
- Detection success rates
- Performance metrics

## Conclusion

The AI integration provides real-time person detection for uploaded images in the Sugar Sack Counter application. The system is designed for reliability, performance, and ease of use, with fallback mechanisms for when the AI service is unavailable.

For questions or issues, refer to the troubleshooting section or contact the development team.





