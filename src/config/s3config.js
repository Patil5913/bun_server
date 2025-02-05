import { S3Client } from "bun";



export const s3Client = new S3Client({

  accessKeyId: process.env.S3_ACCESS_KEY_ID,

  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,

  endpoint: process.env.S3_ENDPOINT,

});
