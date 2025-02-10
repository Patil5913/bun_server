import { join } from "path";

import { s3Client } from "../config/s3config.js";
import { logger } from "../utils/logger.js";

export class S3Service {
  static async uploadFile(file, bucket = process.env.S3_BUCKET || "default") {
    try {
      if (!file || !file.name) {
        throw new Error('Invalid file');
      }

      // Validate bucket exists or create it
      try {
        const testFile = s3Client.file(join(bucket, '.test'));
        await testFile.exists();
      } catch (error) {
        logger.info(`Note: Bucket ${bucket} might need to be created manually in MinIO console`);
        throw new Error(`Bucket ${bucket} is not accessible. Please ensure it exists.`);
      }

      // Generate optimized filename
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      logger.info(`Processing upload for: ${filename}`);

      // Create an S3 file reference
      const s3File = s3Client.file(join(bucket, filename));

      // Write file directly using Bun's optimized write
      const buffer = Buffer.from(await file.arrayBuffer());
      await s3File.write(buffer);

      // Generate CDN URL
      const cdnUrl = `http://cdn.vrugle.com:9000/${bucket}/${filename}`;
      
      return {
        success: true,
        url: cdnUrl,
        filename,
        size: buffer.length,
        type: file.type
      };

    } catch (error) {
      logger.error('Upload failed:', error);
      throw error;
    }
  }

  static async getFileInfo(bucket, filename) {
    try {
      const s3File = s3Client.file(join(bucket, filename));
      
      if (!await s3File.exists()) {
        logger.info(`File not found in bucket ${bucket}: ${filename}`);
        return null;
      }

      const stat = await s3File.stat();
      const cdnUrl = `http://cdn.vrugle.com:9000/${bucket}/${filename}`;

      return {
        url: cdnUrl,
        filename,
        size: stat.size,
        type: stat.type || 'application/octet-stream',
        lastModified: stat.lastModified
      };

    } catch (error) {
      logger.error('File info retrieval failed:', error);
      throw error;
    }
  }

  static async deleteFile(bucket, filename) {
    try {
      const s3File = s3Client.file(join(bucket, filename));
      
      if (!await s3File.exists()) {
        logger.info(`File not found for deletion in bucket ${bucket}: ${filename}`);
        return false;
      }

      await s3File.delete();
      logger.info(`Successfully deleted file ${filename} from bucket ${bucket}`);
      return true;
    } catch (error) {
      logger.error('File deletion failed:', error);
      throw error;
    }
  }
}
