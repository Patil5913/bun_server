import { join } from "path";

import { s3Client } from "../config/s3Config.js";



export class S3Service {

  static async uploadFile(file, bucket) {

    const filename = `${Date.now()}-${file.name}`;

    const s3File = s3Client.file(join(bucket, filename));

    await s3File.write(file);

    return {

      filename,

      bucket,

      url: `${process.env.S3_ENDPOINT}/${bucket}/${filename}`

    };

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
