import { join } from "path";

import { s3Client } from "../config/s3Config.js";
import { logger } from "../utils/logger.js";



export class S3Service {

  static async uploadFile(file, bucket) {
    try {
      logger.info(`Starting upload process for file: ${file.name}`);
      
      // Validate bucket name
      if (!bucket || typeof bucket !== 'string') {
        throw new Error('Invalid bucket name');
      }

      // Get file content
      let fileContent;
      try {
        fileContent = await file.arrayBuffer();
        logger.info(`File content read successfully: ${fileContent.byteLength} bytes`);
      } catch (error) {
        logger.error("Error reading file content:", error);
        throw new Error('Failed to read file content');
      }

      if (!fileContent || fileContent.byteLength === 0) {
        throw new Error('File content is empty');
      }

      const filename = `${Date.now()}-${file.name}`;
      logger.info(`Generated filename: ${filename}`);

      const s3File = s3Client.file(join(bucket, filename));

      // Write the file content
      try {
        await s3File.write(new Uint8Array(fileContent));
        logger.info(`File written to S3: ${fileContent.byteLength} bytes`);
      } catch (error) {
        logger.error("Error writing to S3:", error);
        throw new Error('Failed to write file to S3');
      }

      logger.info(`File uploaded successfully to ${bucket}/${filename}`);
      return {
        filename,
        bucket,
        size: fileContent.byteLength,
        url: `${process.env.S3_ENDPOINT}/${bucket}/${filename}`
      };

    } catch (error) {
      logger.error(`S3 upload error: ${error.message}`, error);
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
