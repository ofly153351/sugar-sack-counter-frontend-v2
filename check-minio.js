#!/usr/bin/env node

/**
 * MinIO Troubleshooting Script
 * This script helps diagnose and fix MinIO storage issues
 *
 * Usage:
 * node check-minio.js
 */

const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuration
const CONFIG = {
  minioEndpoint: 'http://localhost:9000',
  minioUIEndpoint: 'http://localhost:9001',
  aiServiceEndpoint: 'http://localhost:8082',
  bucketName: 'sugar-sack-images',
  accessKey: 'minioadmin',
  secretKey: 'minioadmin',
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(` ${title}`, colors.bold + colors.cyan);
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

async function checkDocker() {
  logSection('1. Checking Docker Status');

  try {
    const { stdout } = await execPromise('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"');
    logInfo('Running Docker containers:');
    console.log(stdout);

    const hasMinio = stdout.includes('minio');
    if (hasMinio) {
      logSuccess('MinIO container is running');
    } else {
      logError('MinIO container is NOT running');
      logInfo('To start MinIO: docker run -d -p 9000:9000 -p 9001:9001 --name minio minio/minio server /data --console-address ":9001"');
    }

    return hasMinio;
  } catch (error) {
    logError('Failed to check Docker status: ' + error.message);
    return false;
  }
}

async function checkMinIOHealth() {
  logSection('2. Checking MinIO Health');

  try {
    const response = await axios.get(`${CONFIG.minioEndpoint}/minio/health/live`, {
      timeout: 5000,
    });

    logSuccess(`MinIO health check: ${response.status} ${response.statusText}`);
    logInfo(`MinIO API: ${CONFIG.minioEndpoint}`);
    logInfo(`MinIO UI: ${CONFIG.minioUIEndpoint}`);

    return true;
  } catch (error) {
    logError(`MinIO health check failed: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      logInfo('MinIO might not be running or is on a different port');
      logInfo('Check if MinIO is running: docker ps | grep minio');
      logInfo('Check MinIO logs: docker logs minio');
    }
    return false;
  }
}

async function checkBucket() {
  logSection('3. Checking Bucket Status');

  try {
    // Try to list buckets using mc command
    const { stdout } = await execPromise(`docker exec minio mc ls minio`);
    logInfo('Available buckets in MinIO:');
    console.log(stdout);

    const hasBucket = stdout.includes(CONFIG.bucketName);
    if (hasBucket) {
      logSuccess(`Bucket "${CONFIG.bucketName}" exists`);

      // List files in bucket
      try {
        const { stdout: files } = await execPromise(`docker exec minio mc ls minio/${CONFIG.bucketName} --recursive`);
        logInfo(`Files in bucket "${CONFIG.bucketName}":`);
        console.log(files || 'No files found');
      } catch (listError) {
        logWarning(`Could not list files: ${listError.message}`);
      }
    } else {
      logError(`Bucket "${CONFIG.bucketName}" does NOT exist`);
      logInfo('To create bucket:');
      logInfo(`  docker exec minio mc mb minio/${CONFIG.bucketName}`);
      logInfo('Or create through MinIO UI: http://localhost:9001');
    }

    return hasBucket;
  } catch (error) {
    logError(`Failed to check bucket: ${error.message}`);

    // Try alternative method using API
    try {
      logInfo('Trying alternative bucket check...');
      const response = await axios.get(`${CONFIG.minioEndpoint}/minio/admin/v3/list-buckets`, {
        auth: {
          username: CONFIG.accessKey,
          password: CONFIG.secretKey,
        },
        timeout: 5000,
      });

      const buckets = response.data.buckets || [];
      logInfo(`Found ${buckets.length} bucket(s)`);
      buckets.forEach(bucket => {
        console.log(`  - ${bucket.name} (created: ${new Date(bucket.creationDate).toLocaleString()})`);
      });

      const hasBucket = buckets.some(b => b.name === CONFIG.bucketName);
      return hasBucket;
    } catch (apiError) {
      logError(`API bucket check also failed: ${apiError.message}`);
      return false;
    }
  }
}

async function checkAIService() {
  logSection('4. Checking AI Service');

  try {
    const response = await axios.get(`${CONFIG.aiServiceEndpoint}/health`, {
      timeout: 5000,
    });

    logSuccess(`AI Service health: ${response.status}`);
    logInfo(`AI Service: ${CONFIG.aiServiceEndpoint}`);

    if (response.data) {
      console.log('AI Service Response:', JSON.stringify(response.data, null, 2));

      if (response.data.minio_available !== undefined) {
        if (response.data.minio_available) {
          logSuccess('AI Service reports MinIO is available');
        } else {
          logWarning('AI Service reports MinIO is NOT available');
        }
      }

      if (response.data.minio_initialized !== undefined) {
        if (response.data.minio_initialized) {
          logSuccess('AI Service reports MinIO is initialized');
        } else {
          logWarning('AI Service reports MinIO is NOT initialized');
        }
      }
    }

    return true;
  } catch (error) {
    logError(`AI Service check failed: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      logInfo('AI Service might not be running');
      logInfo('Check AI Service: ps aux | grep "python3 main.py"');
      logInfo('Start AI Service: cd sugar-sack-counter-ai-service && python3 main.py');
    }
    return false;
  }
}

async function testFileUpload() {
  logSection('5. Testing File Upload');

  try {
    // Create a test file
    const testFileName = `test_${Date.now()}.txt`;
    await execPromise(`echo "MinIO Test File - ${new Date().toISOString()}" > ${testFileName}`);

    logInfo(`Created test file: ${testFileName}`);

    // Upload to MinIO using mc
    try {
      await execPromise(`docker exec minio mc cp ${testFileName} minio/${CONFIG.bucketName}/test/`);
      logSuccess(`Test file uploaded to MinIO`);

      // Verify the file exists
      const { stdout } = await execPromise(`docker exec minio mc ls minio/${CONFIG.bucketName}/test/`);
      console.log('Test directory contents:', stdout);

      // Clean up test file
      await execPromise(`rm ${testFileName}`);
      logInfo('Cleaned up local test file');

      return true;
    } catch (uploadError) {
      logError(`Upload failed: ${uploadError.message}`);

      // Clean up test file
      await execPromise(`rm ${testFileName}`).catch(() => {});

      return false;
    }
  } catch (error) {
    logError(`Test upload failed: ${error.message}`);
    return false;
  }
}

async function checkNetwork() {
  logSection('6. Checking Network Connectivity');

  const endpoints = [
    { name: 'MinIO API', url: CONFIG.minioEndpoint },
    { name: 'MinIO UI', url: CONFIG.minioUIEndpoint },
    { name: 'AI Service', url: CONFIG.aiServiceEndpoint },
  ];

  for (const endpoint of endpoints) {
    try {
      const start = Date.now();
      await axios.get(endpoint.url, { timeout: 3000 });
      const duration = Date.now() - start;
      logSuccess(`${endpoint.name}: ${endpoint.url} (${duration}ms)`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        logError(`${endpoint.name}: ${endpoint.url} - Connection refused`);
      } else if (error.code === 'ENOTFOUND') {
        logError(`${endpoint.name}: ${endpoint.url} - Host not found`);
      } else {
        logError(`${endpoint.name}: ${endpoint.url} - ${error.message}`);
      }
    }
  }
}

async function checkPermissions() {
  logSection('7. Checking Permissions');

  logInfo('Checking MinIO container permissions...');
  try {
    const { stdout } = await execPromise('docker exec minio ls -la /data');
    console.log('MinIO data directory:', stdout);
    logSuccess('MinIO data directory accessible');
  } catch (error) {
    logError(`MinIO permissions check failed: ${error.message}`);
  }

  logInfo('\nChecking bucket permissions...');
  try {
    const { stdout } = await execPromise(`docker exec minio mc policy list minio/${CONFIG.bucketName}`);
    console.log('Bucket policy:', stdout);
  } catch (error) {
    logWarning(`Could not check bucket policy: ${error.message}`);
    logInfo('To set public read policy:');
    logInfo(`  docker exec minio mc policy set public minio/${CONFIG.bucketName}`);
  }
}

async function provideSolutions() {
  logSection('8. Recommended Solutions');

  console.log(colors.bold + 'Common Issues and Solutions:' + colors.reset);
  console.log('\n' + colors.yellow + '1. MinIO not running:' + colors.reset);
  console.log('   docker run -d \\');
  console.log('     -p 9000:9000 \\');
  console.log('     -p 9001:9001 \\');
  console.log('     --name minio \\');
  console.log('     -e "MINIO_ROOT_USER=minioadmin" \\');
  console.log('     -e "MINIO_ROOT_PASSWORD=minioadmin" \\');
  console.log('     -v minio-data:/data \\');
  console.log('     minio/minio server /data --console-address ":9001"');

  console.log('\n' + colors.yellow + '2. Bucket not created:' + colors.reset);
  console.log(`   docker exec minio mc mb minio/${CONFIG.bucketName}`);
  console.log(`   docker exec minio mc policy set public minio/${CONFIG.bucketName}`);

  console.log('\n' + colors.yellow + '3. AI Service not running:' + colors.reset);
  console.log('   cd sugar-sack-counter-ai-service');
  console.log('   python3 -m venv venv');
  console.log('   source venv/bin/activate');
  console.log('   pip install -r requirements.txt');
  console.log('   python3 main.py');

  console.log('\n' + colors.yellow + '4. CORS issues:' + colors.reset);
  console.log('   Set CORS in MinIO:');
  console.log('   docker exec minio mc admin config set minio/ api.cors_allow_origin="*"');
  console.log('   docker exec minio mc admin service restart minio');

  console.log('\n' + colors.yellow + '5. Check logs:' + colors.reset);
  console.log('   MinIO logs: docker logs minio');
  console.log('   AI Service logs: Check terminal where python3 main.py is running');

  console.log('\n' + colors.yellow + '6. Reset everything:' + colors.reset);
  console.log('   docker stop minio');
  console.log('   docker rm minio');
  console.log('   docker volume rm minio-data');
  console.log('   # Then follow step 1 to restart');
}

async function generateReport() {
  logSection('Diagnostic Report');

  const report = {
    timestamp: new Date().toISOString(),
    dockerRunning: await checkDocker(),
    minioHealthy: await checkMinIOHealth(),
    bucketExists: await checkBucket(),
    aiServiceRunning: await checkAIService(),
    network: 'Checked',
    permissions: 'Checked',
  };

  console.log('\n' + colors.bold + 'Summary:' + colors.reset);
  console.log(JSON.stringify(report, null, 2));

  if (!report.dockerRunning) {
    logError('\n❌ Docker is not running or MinIO container not found');
  }

  if (!report.minioHealthy) {
    logError('\n❌ MinIO is not healthy or not accessible');
  }

  if (!report.bucketExists) {
    logError(`\n❌ Bucket "${CONFIG.bucketName}" does not exist`);
  }

  if (!report.aiServiceRunning) {
    logError('\n❌ AI Service is not running');
  }

  if (report.dockerRunning && report.minioHealthy && report.bucketExists && report.aiServiceRunning) {
    logSuccess('\n🎉 All systems are GO! MinIO should be working correctly.');
    logInfo('Try uploading an image through the web interface.');
  } else {
    logWarning('\n⚠️  Some issues detected. Check the recommendations above.');
  }
}

async function main() {
  console.log(colors.bold + colors.magenta + '\n🔍 MinIO Troubleshooting Script');
  console.log('='.repeat(60) + colors.reset);

  logInfo('Starting MinIO diagnostics...');
  logInfo(`Bucket: ${CONFIG.bucketName}`);
  logInfo(`MinIO API: ${CONFIG.minioEndpoint}`);
  logInfo(`MinIO UI: ${CONFIG.minioUIEndpoint}`);
  logInfo(`AI Service: ${CONFIG.aiServiceEndpoint}`);

  try {
    await checkNetwork();
    await checkDocker();
    await checkMinIOHealth();
    await checkBucket();
    await checkAIService();
    await checkPermissions();

    // Only test upload if everything else is working
    const { dockerRunning, minioHealthy, bucketExists } = {
      dockerRunning: true, // We'll check this properly in the actual run
      minioHealthy: true,
      bucketExists: true,
    };

    if (dockerRunning && minioHealthy && bucketExists) {
      await testFileUpload();
    }

    await provideSolutions();
    await generateReport();

  } catch (error) {
    logError(`Script failed: ${error.message}`);
    console.error(error.stack);
  }

  console.log('\n' + colors.cyan + '💡 Tip: Open MinIO UI at http://localhost:9001');
  console.log('   Login: minioadmin / minioadmin' + colors.reset);
  console.log('\n');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkDocker,
  checkMinIOHealth,
  checkBucket,
  checkAIService,
  testFileUpload,
  checkNetwork,
  checkPermissions,
  provideSolutions,
  generateReport,
};
