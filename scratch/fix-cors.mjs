import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const b2Client = new S3Client({
  endpoint: process.env.BACKBLAZE_ENDPOINT,
  region: process.env.BACKBLAZE_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.BACKBLAZE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.BACKBLAZE_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.BACKBLAZE_BUCKET_NAME || "policyvault-docs";

async function setCors() {
  console.log(`Setting CORS for bucket: ${BUCKET_NAME}...`);
  
  const corsParams = {
    Bucket: BUCKET_NAME,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
          AllowedOrigins: ["*"],
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3600
        }
      ]
    }
  };

  try {
    const data = await b2Client.send(new PutBucketCorsCommand(corsParams));
    console.log("Success! CORS policy updated.");
  } catch (err) {
    console.error("Error setting CORS:", err);
  }
}

setCors();
