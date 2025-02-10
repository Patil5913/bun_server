import { S3Client } from "bun";
import { logger } from "../utils/logger.js";

const s3Config = {
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_ENDPOINT || "http://minio_images:9000",
  bucket: process.env.S3_BUCKET || "bns",
  forcePathStyle: true,
  region: 'us-east-1'
};

logger.info(`Initializing S3 client with endpoint: ${s3Config.endpoint}`);

export const s3Client = new S3Client(s3Config);

// Test the connection
try {
  const testBucket = s3Config.bucket;
  const testFile = s3Client.file(`${testBucket}/.test`);
  await testFile.exists();
  logger.info(`Successfully connected to MinIO at ${s3Config.endpoint}`);
} catch (error) {
  logger.error(`Failed to connect to MinIO: ${error.message}`);
  throw error;
}
