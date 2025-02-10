import { S3Client } from "bun";

export const s3Client = new S3Client({
  accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin',
  endpoint: process.env.S3_ENDPOINT || 'http://minio:9000',
  forcePathStyle: true, // Required for MinIO
  region: 'us-east-1'   // Required but can be any value for MinIO
});
