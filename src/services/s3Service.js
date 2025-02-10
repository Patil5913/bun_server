import { join } from "path";

import { s3Client } from "../config/s3config.js";
import { logger } from "../utils/logger.js";

export class S3Service {
  static async uploadFile(file, bucket = process.env.S3_BUCKET || "default") {
    try {
      if (!file || !file.name) {
        throw new Error('Invalid file');
      }

      // Generate optimized filename
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      logger.info(`Processing upload for: ${filename}`);

      // Create an S3 file reference
      const s3File = s3Client.file(join(bucket, filename));

      // Write file directly using Bun's optimized write
      await s3File.write(file);

      // Generate CDN URL
      const cdnUrl = `http://cdn.vrugle.com:9000/${bucket}/${filename}`;
      
      return {
        success: true,
        url: cdnUrl,
        filename,
        size: file.size,
        type: file.type
      };

    } catch (error) {
      logger.error('Upload failed:', error);
      throw error;
    }
  }

  static async getFile(bucket, filename) {
    try {
      const s3File = s3Client.file(join(bucket, filename));
      
      if (!await s3File.exists()) {
        return null;
      }

      // Use Bun's optimized streaming
      return s3File.stream();

    } catch (error) {
      logger.error('File retrieval failed:', error);
      throw error;
    }
  }

  static async deleteFile(bucket, filename) {
    try {
      const s3File = s3Client.file(join(bucket, filename));
      await s3File.delete();
      return true;
    } catch (error) {
      logger.error('File deletion failed:', error);
      throw error;
    }
  }
}
