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

      const filename = `${Date.now()}-${file.name}`;
      logger.info(`Generated filename: ${filename}`);

      const s3File = s3Client.file(join(bucket, filename));
      
      // Get file buffer
      const buffer = await file.arrayBuffer();
      if (!buffer || buffer.byteLength === 0) {
        throw new Error('File buffer is empty');
      }

      logger.info(`Writing file to S3 (${buffer.byteLength} bytes)`);
      await s3File.write(new Uint8Array(buffer));

      logger.info(`File uploaded successfully to ${bucket}/${filename}`);
      return {
        filename,
        bucket,
        size: buffer.byteLength,
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
