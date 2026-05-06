import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const B2_ENDPOINT = process.env.BACKBLAZE_ENDPOINT || "https://s3.eu-central-003.backblazeb2.com";
const B2_REGION = process.env.BACKBLAZE_REGION || "eu-central-003";
const B2_ACCESS_KEY_ID = process.env.BACKBLAZE_ACCESS_KEY_ID;
const B2_SECRET_ACCESS_KEY = process.env.BACKBLAZE_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.BACKBLAZE_BUCKET_NAME || "policyvault-docs";

async function listObjects() {
  console.log(`Listing objects in bucket: ${BUCKET_NAME}...`);
  
  if (!B2_ACCESS_KEY_ID || !B2_SECRET_ACCESS_KEY) {
    console.error("❌ Missing credentials in .env.local");
    return;
  }

  const client = new S3Client({
    endpoint: B2_ENDPOINT,
    region: B2_REGION,
    credentials: {
      accessKeyId: B2_ACCESS_KEY_ID,
      secretAccessKey: B2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  try {
    const response = await client.send(new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 100
    }));
    
    if (response.Contents && response.Contents.length > 0) {
      console.log(`✅ Found ${response.Contents.length} objects:`);
      response.Contents.forEach(obj => console.log(` - ${obj.Key} (${obj.Size} bytes)`));
    } else {
      console.log("✅ Bucket is already empty!");
    }

  } catch (error: any) {
    console.error("\n❌ ListObjects failed:");
    console.dir(error, { depth: null });
  }
}

listObjects();
