import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import Docker from "dockerode";
import { Readable } from "stream";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const docker = new Docker();
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-southeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});
const s3Bucket = process.env.S3_BUCKET || "mytsvcbucket";

/**
 * Builds a Docker image from a tar file stored in S3
 * @param s3Bucket The S3 bucket name
 * @param s3Key The S3 object key (path to the tar file)
 * @param problemName The course name for tagging the image
 * @param problemID The problem ID for tagging the image
 * @returns Promise resolving to the build result
 */
export async function buildImage(
  s3Key: string,
  problemName: string,
  problemID: number
) {
  try {
    // Get the tar file from S3
    console.log(`Fetching docker build context from S3: ${s3Bucket}/${s3Key}`);

    const getObjectParams = {
      Bucket: s3Bucket,
      Key: s3Key,
    };

    const response = await s3Client.send(new GetObjectCommand(getObjectParams));

    if (!response.Body) {
      throw new Error("Empty response body from S3");
    }

    // Convert the S3 object body to a readable stream
    const tarStream = response.Body as Readable;

    tarStream.on("error", (err) => {
      throw new Error(`Stream error: ${err.message}`);
    });

    // Build the Docker image
    const imageTag = `${problemName.toLowerCase()}-${problemID}:1.0.0`;
    console.log(`Building Docker image with tag: ${imageTag}`);

    const stream = await docker.buildImage(tarStream, {
      t: imageTag,
      nocache: true,
      rm: true,
    });

    return new Promise((resolve, reject) => {
      docker.modem.followProgress(
        stream,
        (err, res) => {
          if (err) {
            reject(err);
            return;
          }

          // Check for build errors in the results
          const hasError = res.some((item) => item.error);
          if (hasError) {
            const errorItem = res.find((item) => item.error);
            reject(
              new Error(`Build failed: ${errorItem?.error || "Unknown error"}`)
            );
            return;
          }

          console.log(`Image built successfully with tag: ${imageTag}`);
          resolve(res);
        },
        (event) => {
          if (event.stream && !event.stream.startsWith(" ")) {
            process.stdout.write(event.stream);
          }
        }
      );
    });
  } catch (error) {
    console.error("Error building image from S3:", error);
    throw error; // Re-throw to allow proper handling by the caller
  }
}
