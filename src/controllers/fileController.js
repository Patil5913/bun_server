import { S3Service } from "../services/s3Service.js";



export class FileController {

  static async handleUpload(req) {

    try {

      const formData = await req.formData();

      const file = formData.get("file");

      const bucket = formData.get("bucket") || "default";

      

      if (!file) {

        return new Response("No file provided", { status: 400 });

      }



      const result = await S3Service.uploadFile(file, bucket);

      return new Response(JSON.stringify({

        success: true,

        ...result

      }), {

        headers: { "Content-Type": "application/json" }

      });

    } catch (error) {

      throw error;

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
