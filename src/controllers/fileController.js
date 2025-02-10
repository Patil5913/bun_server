import { S3Service } from "../services/s3Service.js";
import { logger } from "../utils/logger.js";
import { formatDateTime } from "../utils/dateFormatter.js";
import { readFileSync } from "node:fs";

export class FileController {

  static async handleUpload(req) {
    try {
      logger.info("Processing file upload request");
      
      const formData = await req.formData();
      const uploadedFile = formData.get("file");
      const bucket = formData.get("bucket") || process.env.S3_BUCKET || "default";

      if (!uploadedFile || !(uploadedFile instanceof File)) {
        logger.info("Upload failed: Invalid file in form data");
        return new Response(
          JSON.stringify({ success: false, error: "Invalid file provided" }), 
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Log file details for debugging
      logger.info(`File details: name=${uploadedFile.name}, size=${uploadedFile.size}, type=${uploadedFile.type}`);

      try {
        // Read file content as ArrayBuffer
        const fileContent = await uploadedFile.arrayBuffer();
        
        if (!fileContent || fileContent.byteLength === 0) {
          throw new Error("Empty file content");
        }

        const fileData = {
          name: uploadedFile.name,
          type: uploadedFile.type || 'application/octet-stream',
          size: uploadedFile.size,
          content: new Uint8Array(fileContent)
        };

        logger.info(`Prepared file for upload: ${fileData.name} (${fileData.size} bytes)`);
        const result = await S3Service.uploadFile(fileData, bucket);

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
        logger.error(`Error processing file: ${error.message}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Error processing file upload",
            details: error.message
          }), 
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

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
