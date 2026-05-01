import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { b2Client, BUCKET_NAME } from "./src/lib/backblaze.ts";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testConnection() {
  console.log("Testing Backblaze B2 connection...");
  console.log(`Bucket: ${BUCKET_NAME}`);
  console.log(`Endpoint: ${process.env.BACKBLAZE_ENDPOINT}`);

  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1,
    });

    const response = await b2Client.send(command);
    console.log("✅ Successfully connected to Backblaze B2!");
    console.log("Response metadata:", response.$metadata);
    if (response.Contents) {
      console.log(`Found ${response.Contents.length} objects (capped at 1).`);
    } else {
      console.log("Bucket is empty or no objects found.");
    }
  } catch (error) {
    console.error("❌ Failed to connect to Backblaze B2:");
    console.error(error);
  }
}

testConnection();
