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

      try {
        // Create an S3 file reference with explicit bucket path
        const s3File = s3Client.file(`${bucket}/${filename}`);

        // Write file content with proper content type
        await s3File.write(Buffer.from(fileData.content), {
          type: fileData.type || 'application/octet-stream'
        });
        
        logger.info(`Successfully wrote file to S3: ${filename}`);

        // Generate CDN URL using environment variable
        const cdnUrl = `${process.env.CDN_ENDPOINT}/${bucket}/${filename}`;
        
        return {
          success: true,
          url: cdnUrl,
          filename,
          size: fileData.size,
          type: fileData.type,
          bucket
        };
      } catch (writeError) {
        logger.error(`Error writing file to S3:`, writeError);
        throw new Error(`Failed to write file to S3: ${writeError.message}`);
      }

    } catch (error) {
      logger.error('Upload failed:', error);
      throw error;
    }
  }

  static async getFileInfo(bucket, filename) {
    try {
      const s3File = s3Client.file(`${bucket}/${filename}`);
      
      if (!await s3File.exists()) {
        logger.info(`File not found at path: ${bucket}/${filename}`);
        return null;
      }

      const stat = await s3File.stat();
      const cdnUrl = `${process.env.CDN_ENDPOINT}/${bucket}/${filename}`;

      return {
        url: cdnUrl,
        filename,
        bucket,
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
      const s3File = s3Client.file(`${bucket}/${filename}`);
      await s3File.delete();
      logger.info(`Successfully deleted file ${filename} from bucket ${bucket}`);
      return true;
    } catch (error) {
      logger.error('File deletion failed:', error);
      return false;
    }
  }
}
