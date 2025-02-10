import { S3Client } from "bun";
import { logger } from "../utils/logger.js";

const s3Config = {
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  region: 'us-east-1',
  // Add these for better connection handling
  maxAttempts: 3,
  timeout: 30000,
  connectTimeout: 5000
};

logger.info(`Initializing S3 client with endpoint: ${s3Config.endpoint}`);

export const s3Client = new S3Client(s3Config);

// Test the connection using file operations instead
try {
  const testFile = s3Client.file('test.txt');
  await testFile.exists();
  logger.info('Successfully connected to MinIO');
} catch (error) {
  logger.error('Failed to connect to MinIO:', error);
}
