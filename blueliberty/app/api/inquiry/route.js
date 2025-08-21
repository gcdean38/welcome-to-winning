import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const region = process.env.AWS_REGION;
const s3 = new S3Client({ region });
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, organization, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const id = uuidv4();

    // Save to DynamoDB
    await dynamo.send(
      new PutCommand({
        TableName: process.env.DYNAMO_TABLE,
        Item: {
          id,
          name,
          email,
          organization,
          message,
          createdAt: new Date().toISOString(),
        },
      })
    );

    // Save raw JSON to S3
    const s3Key = `inquiries/${id}.json`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: s3Key,
        Body: JSON.stringify(body, null, 2),
        ContentType: "application/json",
      })
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error saving inquiry:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
