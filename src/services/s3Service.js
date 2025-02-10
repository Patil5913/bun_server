import { join } from "path";

import { s3Client } from "../config/s3config.js";
import { logger } from "../utils/logger.js";

export class S3Service {
  static async uploadFile(fileData, bucket = process.env.S3_BUCKET || "default") {
    try {
      if (!fileData?.name || !fileData?.content) {
        logger.error('Invalid file data:', fileData);
        throw new Error('Invalid file data');
      }

      // Generate optimized filename
      const filename = `${Date.now()}-${fileData.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      logger.info(`Processing upload for: ${filename} (${fileData.size} bytes)`);

      // Create an S3 file reference
      const s3File = s3Client.file(join(bucket, filename));

      try {
        // Write file content with proper content type
        await s3File.write(fileData.content, {
          type: fileData.type
        });
        
        logger.info(`Successfully wrote file to S3: ${filename}`);

        // Generate CDN URL
        const cdnUrl = `http://cdn.vrugle.com:9000/${bucket}/${filename}`;
        
        return {
          success: true,
          url: cdnUrl,
          filename,
          size: fileData.size,
          type: fileData.type
        };
      } catch (writeError) {
        logger.error(`Error writing file to S3: ${writeError.message}`);
        throw new Error(`Failed to write file to S3: ${writeError.message}`);
      }

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
