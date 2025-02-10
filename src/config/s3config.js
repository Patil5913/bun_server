import { S3Client } from "bun";
import { logger } from "../utils/logger.js";

const s3Config = {
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  endpoint: "http://cdn.vrugle.com:9000",
  bucket: process.env.S3_BUCKET || "default",
  forcePathStyle: true,
  region: 'us-east-1'
};

logger.info(`Initializing S3 client with endpoint: ${s3Config.endpoint}`);

export const s3Client = new S3Client(s3Config);

// Test the connection
try {
  const testFile = s3Client.file('test.txt');
  await testFile.exists();
  logger.info('Successfully connected to MinIO');
} catch (error) {
  logger.error('Failed to connect to MinIO:', error);
}
