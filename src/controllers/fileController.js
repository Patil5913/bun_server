import { S3Service } from "../services/s3Service.js";
import { logger } from "../utils/logger.js";
import { formatDateTime } from "../utils/dateFormatter.js";

export class FileController {

  static async handleUpload(req) {
    try {
      logger.info("Processing file upload request");
      
      const formData = await req.formData();
      const file = formData.get("file");
      const bucket = formData.get("bucket") || process.env.S3_BUCKET || "default";

      if (!file) {
        logger.info("Upload failed: No file provided in form data");
        return new Response(
          JSON.stringify({ success: false, error: "No file provided" }), 
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      logger.info(`Uploading file: ${file.name} to bucket: ${bucket}`);
      const result = await S3Service.uploadFile(file, bucket);

      logger.info(`File uploaded successfully: ${result.filename}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          ...result, 
          timestamp: formatDateTime()
        }), 
        { headers: { "Content-Type": "application/json" } }
      );

    } catch (error) {
      logger.error("Upload handler error:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }), 
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  static async handleGet(bucket, filename) {
    try {
      logger.info(`Getting file info: ${bucket}/${filename}`);
      
      const fileInfo = await S3Service.getFileInfo(bucket, filename);
      
      if (!fileInfo) {
        logger.info(`File not found: ${bucket}/${filename}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "File not found" 
          }), 
          { 
            status: 404, 
            headers: { "Content-Type": "application/json" } 
          }
        );
      }

      logger.info(`Retrieved file info: ${bucket}/${filename}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          ...fileInfo 
        }), 
        { 
          headers: { "Content-Type": "application/json" } 
        }
      );

    } catch (error) {
      logger.error("Get handler error:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }), 
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  static async handleDelete(bucket, filename) {
    try {
      const deleted = await S3Service.deleteFile(bucket, filename);
      return new Response(
        JSON.stringify({ 
          success: deleted, 
          message: deleted ? "File deleted successfully" : "File not found" 
        }), 
        { 
          status: deleted ? 200 : 404,
          headers: { "Content-Type": "application/json" } 
        }
      );
    } catch (error) {
      logger.error("Delete handler error:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }), 
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
}
