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
        constructor: file.constructor.name,
        keys: Object.keys(file),
        hasStream: typeof file.stream === 'function',
        hasArrayBuffer: typeof file.arrayBuffer === 'function'
      }, null, 2)}`);

      // Try to read the file content first
      let fileContent;
      try {
        // Try different methods to read the file
        if (typeof file.arrayBuffer === 'function') {
          logger.info('Reading file using arrayBuffer()');
          fileContent = await file.arrayBuffer();
        } else if (typeof file.stream === 'function') {
          logger.info('Reading file using stream()');
          const chunks = [];
          const reader = file.stream().getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          fileContent = await new Blob(chunks).arrayBuffer();
        } else if (file.text) {
          logger.info('Reading file using text()');
          const text = await file.text();
          fileContent = new TextEncoder().encode(text).buffer;
        } else {
          throw new Error('No suitable method found to read file content');
        }
        
        logger.info(`Successfully read file content, size: ${fileContent.byteLength} bytes`);
        
        if (!fileContent || fileContent.byteLength === 0) {
          logger.info(`Upload failed: File content is empty`);
          return new Response(JSON.stringify({
            success: false,
            error: "File content is empty",
            details: "File was read but contains no data",
            timestamp: formatDateTime(),
            user: "Patil5913"
          }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        
      } catch (error) {
        logger.error("Failed to read file content:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to read file content",
          details: error.message,
          timestamp: formatDateTime(),
          user: "Patil5913"
        }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      logger.info(`Uploading file: ${file.name} (${fileContent.byteLength} bytes) to bucket: ${bucket}`);
      const result = await S3Service.uploadFile({
        name: file.name,
        content: fileContent,
        type: file.type
      }, bucket);

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
