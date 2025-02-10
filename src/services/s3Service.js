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
      // Try to get file info directly from the CDN URL
      const cdnUrl = `http://cdn.vrugle.com:9000/${bucket}/${filename}`;
      
      // Check if file exists by making a HEAD request
      const response = await fetch(cdnUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        logger.info(`File not found at CDN: ${cdnUrl}`);
        return null;
      }

      return {
        url: cdnUrl,
        filename,
        size: parseInt(response.headers.get('content-length') || '0'),
        type: response.headers.get('content-type') || 'application/octet-stream',
        lastModified: response.headers.get('last-modified')
      };

    } catch (error) {
      logger.error('File info retrieval failed:', error);
      throw error;
    }
  }

  static async deleteFile(bucket, filename) {
    try {
      const s3File = s3Client.file(join(bucket, filename));
      await s3File.delete();
      logger.info(`Successfully deleted file ${filename} from bucket ${bucket}`);
      return true;
    } catch (error) {
      logger.error('File deletion failed:', error);
      return false;
    }
  }
}
