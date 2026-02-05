# MinIO Troubleshooting Guide

## Overview
This guide helps diagnose and fix MinIO storage issues in the Sugar Sack Counter application. MinIO is used to store original and annotated images from AI detection.

## Quick Diagnosis

### 1. Check if MinIO is Running
```bash
# Check Docker containers
docker ps | grep minio

# Expected output:
# minio   Up X minutes  0.0.0.0:9000->9000/tcp, 0.0.0.0:9001->9001/tcp
```

### 2. Check MinIO Health
```bash
# Direct health check
curl http://localhost:9000/minio/health/live

# Check via AI Service
curl http://localhost:8082/minio-status
```

### 3. Check Bucket Exists
```bash
# List buckets
docker exec minio mc ls minio

# Check specific bucket
docker exec minio mc ls minio/sugar-sack-images
```

## Common Issues and Solutions

### Issue 1: MinIO Not Running
**Symptoms:**
- Cannot connect to http://localhost:9000 or http://localhost:9001
- AI Service reports "MinIO unavailable"
- Files not appearing in MinIO UI

**Solutions:**
```bash
# Start MinIO container
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  -v minio-data:/data \
  minio/minio server /data --console-address ":9001"

# Check logs
docker logs minio
```

### Issue 2: Bucket Not Created
**Symptoms:**
- AI Service can connect to MinIO but bucket doesn't exist
- Error: "Bucket sugar-sack-images not found"
- Files uploaded but not stored

**Solutions:**
```bash
# Create bucket
docker exec minio mc mb minio/sugar-sack-images

# Set public read policy (for development)
docker exec minio mc policy set public minio/sugar-sack-images

# Verify bucket
docker exec minio mc ls minio/sugar-sack-images
```

### Issue 3: Files Not Appearing in MinIO UI
**Symptoms:**
- API calls succeed (200 OK)
- No error messages
- Files not visible in http://localhost:9001

**Solutions:**
1. **Check file path:**
   ```bash
   # List all files recursively
   docker exec minio mc ls minio/sugar-sack-images --recursive
   ```

2. **Check file permissions:**
   ```bash
   # Check bucket policy
   docker exec minio mc policy list minio/sugar-sack-images
   
   # Set correct policy
   docker exec minio mc policy set public minio/sugar-sack-images
   ```

3. **Check file structure:**
   Files should be organized as:
   ```
   sugar-sack-images/
   ├── original/
   │   ├── sack/
   │   │   └── session_xxx/
   │   │       └── filename.jpg
   │   └── box/
   │       └── session_xxx/
   │           └── filename.jpg
   └── annotated/
       ├── sack/
       │   └── session_xxx/
       │       └── filename_annotated.jpg
       └── box/
           └── session_xxx/
               └── filename_annotated.jpg
   ```

### Issue 4: CORS Errors
**Symptoms:**
- Browser console shows CORS errors
- API calls fail with CORS policy violations
- Frontend cannot connect to MinIO

**Solutions:**
```bash
# Set CORS policy in MinIO
docker exec minio mc admin config set minio/ api.cors_allow_origin="*"

# Restart MinIO
docker exec minio mc admin service restart minio

# Alternative: Set specific origins
docker exec minio mc admin config set minio/ api.cors_allow_origin="http://localhost:3000,http://localhost:8082"
```

### Issue 5: AI Service Cannot Connect to MinIO
**Symptoms:**
- AI Service health check shows MinIO unavailable
- Error: "Connection refused" or "Network error"
- Images not saved despite successful detection

**Solutions:**
1. **Check AI Service configuration:**
   Verify `.env` file in AI service directory:
   ```env
   MINIO_ENDPOINT=localhost:9000
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=minioadmin
   MINIO_SECURE=false
   MINIO_BUCKET_NAME=sugar-sack-images
   ```

2. **Test connection manually:**
   ```bash
   # From AI service directory
   python3 -c "
   from minio import Minio
   client = Minio(
       'localhost:9000',
       access_key='minioadmin',
       secret_key='minioadmin',
       secure=False
   )
   print('Buckets:', client.list_buckets())
   "
   ```

3. **Restart AI Service:**
   ```bash
   # In AI service directory
   pkill -f "python3 main.py"
   python3 main.py
   ```

## Debugging Tools

### 1. Web Interface Debugging
- **MinIO UI:** http://localhost:9001 (Login: minioadmin/minioadmin)
- **AI Service:** http://localhost:8082/health
- **Frontend:** Check browser console for errors

### 2. Command Line Tools
```bash
# Check all running services
./check-minio.js

# Or run individual checks:
node check-minio.js

# Docker diagnostics
docker ps -a
docker logs minio
docker exec minio mc admin info minio
```

### 3. Log Files
- **MinIO logs:** `docker logs minio`
- **AI Service logs:** Check terminal where `python3 main.py` is running
- **Frontend logs:** Browser Developer Tools → Console

## Step-by-Step Recovery

### Complete Reset (Last Resort)
```bash
# 1. Stop and remove MinIO
docker stop minio
docker rm minio
docker volume rm minio-data

# 2. Clean up AI Service
pkill -f "python3 main.py"

# 3. Restart everything
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  -v minio-data:/data \
  minio/minio server /data --console-address ":9001"

# 4. Create bucket
sleep 10  # Wait for MinIO to start
docker exec minio mc mb minio/sugar-sack-images
docker exec minio mc policy set public minio/sugar-sack-images

# 5. Start AI Service
cd sugar-sack-counter-ai-service
python3 main.py

# 6. Test
curl http://localhost:8082/health
curl http://localhost:8082/minio-status
```

## Prevention Tips

1. **Regular Monitoring:**
   - Check MinIO health daily
   - Monitor disk space
   - Review error logs

2. **Backup Strategy:**
   ```bash
   # Backup MinIO data
   docker exec minio mc mirror minio/sugar-sack-images ./backup/
   
   # Restore from backup
   docker exec minio mc mirror ./backup/ minio/sugar-sack-images
   ```

3. **Automated Checks:**
   Add health checks to your deployment:
   ```bash
   # Cron job for daily check
   0 9 * * * /path/to/check-minio.js >> /var/log/minio-check.log
   ```

## Getting Help

If issues persist:

1. **Collect diagnostics:**
   ```bash
   ./check-minio.js > diagnostics.txt
   docker logs minio > minio-logs.txt
   ```

2. **Check versions:**
   ```bash
   docker --version
   docker-compose --version
   python3 --version
   node --version
   ```

3. **Environment details:**
   - Operating System
   - Docker version
   - Browser used
   - Error messages and screenshots

## Quick Reference

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| MinIO API | http://localhost:9000 | minioadmin/minioadmin |
| MinIO UI | http://localhost:9001 | minioadmin/minioadmin |
| AI Service | http://localhost:8082 | - |
| Frontend | http://localhost:3000 | - |

| Command | Purpose |
|---------|---------|
| `docker ps \| grep minio` | Check if MinIO is running |
| `docker logs minio` | View MinIO logs |
| `docker exec minio mc ls minio` | List buckets |
| `curl http://localhost:8082/health` | Check AI Service health |
| `curl http://localhost:8082/minio-status` | Check MinIO status via AI |

Remember: Always check logs first, as they usually contain the exact error message and solution clues.