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

      logger.info(`Received file object: ${JSON.stringify({
        name: file.name,
        size: file.size,
        type: file.type,
        constructor: file.constructor.name,
        keys: Object.keys(file),
        hasStream: typeof file.stream === 'function',
        hasArrayBuffer: typeof file.arrayBuffer === 'function'
      }, null, 2)}`);

      let fileContent;
      try {
        if (file instanceof Blob || file instanceof File) {
          logger.info('Reading file as Blob/File');
          const buffer = Buffer.from(await file.arrayBuffer());
          fileContent = buffer;
          logger.info(`Read ${buffer.length} bytes from file`);
        } else {
          logger.info('Reading file as raw data');
          fileContent = Buffer.from(await file.text());
          logger.info(`Read ${fileContent.length} bytes from file`);
        }

        if (!fileContent || fileContent.length === 0) {
          logger.info(`Upload failed: File content is empty`);
          return new Response(
            JSON.stringify({ success: false, error: "File content is empty" }), 
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        logger.info(`Successfully read file content, size: ${fileContent.length} bytes`);
        
      } catch (error) {
        logger.error("Failed to read file content:", error);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to read file content", details: error.message }), 
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      logger.info(`Uploading file: ${file.name} (${fileContent.length} bytes) to bucket: ${bucket}`);
      const result = await S3Service.uploadFile(file, bucket);

      logger.info(`File uploaded successfully: ${result.filename}`);
      return new Response(
        JSON.stringify({ success: true, ...result, timestamp: formatDateTime(), user: "Patil5913" }), 
        { headers: { "Content-Type": "application/json" } }
      );

    } catch (error) {
      logger.error("Upload handler error:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }), 
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  static async handleGet(bucket, filename) {
    try {
      logger.info(`Attempting to get file: ${bucket}/${filename}`);
      
      const stream = await S3Service.getFile(bucket, filename);
      
      if (!stream) {
        logger.info(`File not found: ${bucket}/${filename}`);
        return new Response("File not found", { status: 404 });
      }

      logger.info(`File found: ${bucket}/${filename}, size: ${stream.stat.size} bytes`);
      return new Response(stream);

    } catch (error) {
      logger.error("Get handler error:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }), 
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  static async handleDelete(bucket, filename) {
    try {
      await S3Service.deleteFile(bucket, filename);
      return new Response(
        JSON.stringify({ success: true, message: "File deleted successfully" }), 
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      logger.error("Delete handler error:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }), 
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
}
