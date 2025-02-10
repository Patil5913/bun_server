import { S3Service } from "../services/s3Service.js";
import { logger } from "../utils/logger.js";
import { formatDateTime } from "../utils/dateFormatter.js";

export class FileController {

  static async handleUpload(req) {
    try {
      logger.info("Processing file upload request");
      
      const formData = await req.formData();
      const file = formData.get("file");
      const bucket = formData.get("bucket") || "default";

      // Enhanced validation with detailed logging
      if (!file) {
        logger.info("Upload failed: No file provided in form data");
        return new Response(JSON.stringify({
          success: false,
          error: "No file provided",
          timestamp: formatDateTime(),
          user: "Patil5913"
        }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Log the received file object properties
      logger.info(`Received file object: ${JSON.stringify({
        name: file.name,
        size: file.size,
        type: file.type,
        constructor: file.constructor.name
      }, null, 2)}`);

      // Validate file size
      if (!file.size || file.size === 0) {
        logger.info(`Upload failed: File is empty (size: ${file.size})`);
        return new Response(JSON.stringify({
          success: false,
          error: "File is empty",
          details: `File size: ${file.size}`,
          timestamp: formatDateTime(),
          user: "Patil5913"
        }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Get the file content
      let fileContent;
      try {
        fileContent = await file.arrayBuffer();
        logger.info(`Successfully read file content, size: ${fileContent.byteLength} bytes`);
      } catch (error) {
        logger.error("Failed to read file content:", error);
        throw new Error("Failed to read file content");
      }

      logger.info(`Uploading file: ${file.name} (${file.size} bytes) to bucket: ${bucket}`);
      const result = await S3Service.uploadFile(file, bucket);

      logger.info(`File uploaded successfully: ${result.filename}`);
      return new Response(JSON.stringify({
        success: true,
        ...result,
        timestamp: formatDateTime(),
        user: "Patil5913"
      }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (error) {
      logger.error("Upload error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to upload file",
        details: error.message,
        timestamp: formatDateTime(),
        user: "Patil5913"
      }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  static async handleGet(bucket, filename) {
    const file = await S3Service.getFile(bucket, filename);
    if (!file) {
      return new Response("File not found", { status: 404 });
    }

    return new Response(file.fileContent, {
      headers: {
        "Content-Type": file.stat.type || "application/octet-stream",
        "Content-Length": file.stat.size.toString()
      }
    });
  }

  static async handleDelete(bucket, filename) {
    await S3Service.deleteFile(bucket, filename);
    return new Response(JSON.stringify({
      success: true,
      message: "File deleted successfully"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
