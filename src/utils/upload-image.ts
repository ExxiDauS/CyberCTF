import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";
import * as path from "path";

export interface UploadResult {
  success: boolean;
  location?: string;
  key?: string;
  error?: string;
}

export interface FileData {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-southeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});
const s3Bucket = process.env.S3_BUCKET || "mytsvcbucket";

export async function uploadImage(file: FileData, courseName: string, problemID: number) {
    try {
        const extension = path.extname(file.originalname);
        const key = `${courseName}-${problemID}${extension}`;
        const uploadParams = {
            Bucket: s3Bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "public-read" as "public-read"
        };
        await s3Client.send(new PutObjectCommand(uploadParams));
        const location = `https://${s3Bucket}.s3.ap-southeast-2.amazonaws.com/${key}`;
        return {
          success: true,
          location,
          key,
        };
    } catch (error) {
        console.error("S3 upload error:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unknown upload error occurred",
        };
    }
}