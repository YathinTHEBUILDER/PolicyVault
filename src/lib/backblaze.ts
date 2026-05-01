import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.BACKBLAZE_ENDPOINT) {
  throw new Error("Missing BACKBLAZE_ENDPOINT");
}

export const b2Client = new S3Client({
  endpoint: process.env.BACKBLAZE_ENDPOINT,
  region: process.env.BACKBLAZE_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.BACKBLAZE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.BACKBLAZE_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true, // Required for Backblaze B2
});

export const BUCKET_NAME = process.env.BACKBLAZE_BUCKET_NAME || "policyvault-docs";
