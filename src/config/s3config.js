import { S3Client } from "bun";
import { logger } from "../utils/logger.js";

const s3Config = {
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  endpoint: "http://localhost:9000",
  bucket: process.env.S3_BUCKET || "bns",
  forcePathStyle: true,
  region: 'us-east-1',
  maxAttempts: 3,
  timeout: 5000,
  connectTimeout: 5000
};

logger.info(`Initializing S3 client with endpoint: ${s3Config.endpoint}`);

export const s3Client = new S3Client(s3Config);

// Test the connection
try {
  const testBucket = "bns";
  logger.info(`Testing connection to MinIO at ${s3Config.endpoint}`);
  const testFile = s3Client.file(`${testBucket}/.test`);
  await testFile.exists();
  logger.info(`Successfully connected to MinIO at ${s3Config.endpoint}`);
} catch (error) {
  logger.error(`Failed to connect to MinIO: ${error.message}`, error);
}
