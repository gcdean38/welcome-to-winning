import { NextResponse } from "next/server";
import AWS from "aws-sdk";

// Configure AWS SDK with env vars (these should be set in Vercel)
const dynamo = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, organization, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    // Write to DynamoDB
    await dynamo
      .put({
        TableName: "Inquiries",
        Item: {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`, // unique id
          name,
          email,
          organization,
          message,
          createdAt: timestamp,
        },
      })
      .promise();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Inquiry API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
