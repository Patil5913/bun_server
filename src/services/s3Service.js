import { join } from "path";

import { s3Client } from "../config/s3config.js";
import { logger } from "../utils/logger.js";



export class S3Service {

  static async uploadFile(file, bucket) {
    try {
      logger.info(`Starting upload process for file: ${file.name}`);
      
      // Validate bucket name
      if (!bucket || typeof bucket !== 'string') {
        throw new Error('Invalid bucket name');
      }

      if (!file.content || file.content.length === 0) {
        throw new Error('File content is empty');
      }

      // Check if bucket exists, create if it doesn't
      try {
        const bucketExists = await s3Client.headBucket({ Bucket: bucket });
        logger.info(`Bucket ${bucket} exists: ${!!bucketExists}`);
      } catch (error) {
        logger.info(`Creating bucket: ${bucket}`);
        await s3Client.createBucket({ Bucket: bucket });
      }

      const filename = `${Date.now()}-${file.name}`;
      logger.info(`Generated filename: ${filename}`);

      const s3File = s3Client.file(join(bucket, filename));

      // Write the file content with detailed error logging
      try {
        logger.info(`Starting file write to S3: ${file.content.length} bytes`);
        await s3File.write(file.content);
        logger.info(`File written to S3: ${file.content.length} bytes`);
      } catch (error) {
        logger.error("Error writing to S3:", {
          error: error.message,
          stack: error.stack,
          code: error.code,
          details: error
        });
        throw new Error(`Failed to write file to S3: ${error.message}`);
      }

      // Generate CDN URL - ensure proper URL formatting
      const cdnBase = process.env.CDN_ENDPOINT.replace(/\/+$/, ''); // Remove trailing slashes
      const cdnUrl = `${cdnBase}/${bucket}/${filename}`;
      logger.info(`File uploaded successfully. CDN URL: ${cdnUrl}`);
      
      return {
        filename,
        bucket,
        size: file.content.length,
        type: file.type,
        url: cdnUrl,
        // Add internal URL for debugging if needed
        internalUrl: `${process.env.S3_ENDPOINT}/${bucket}/${filename}`
      };

    } catch (error) {
      logger.error(`S3 upload error:`, {
        error: error.message,
        stack: error.stack,
        code: error.code,
        details: error
      });
      throw error;
    }
  }



  static async getFile(bucket, filename) {

    const s3File = s3Client.file(join(bucket, filename));

    const exists = await s3File.exists();

    if (!exists) return null;

    

    const fileContent = await s3File.arrayBuffer();

    const stat = await s3File.stat();

    return { fileContent, stat };

  }



  static async deleteFile(bucket, filename) {

    const s3File = s3Client.file(join(bucket, filename));

    await s3File.delete();

    return true;

  }

}
