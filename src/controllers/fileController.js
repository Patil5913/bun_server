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

      // Enhanced validation
      if (!file) {
        logger.info("Upload failed: No file provided");
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

      // Additional file type validation
      if (!(file instanceof File) && !(file instanceof Blob)) {
        logger.info("Upload failed: Invalid file format");
        return new Response(JSON.stringify({
          success: false,
          error: "Invalid file format",
          timestamp: formatDateTime(),
          user: "Patil5913"
        }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Validate file size
      if (file.size === 0) {
        logger.info("Upload failed: File is empty");
        return new Response(JSON.stringify({
          success: false,
          error: "File is empty",
          timestamp: formatDateTime(),
          user: "Patil5913"
        }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Log file details for debugging
      logger.info(`File details - Name: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
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
