// app/api/inquiry/route.js
import { NextResponse } from "next/server";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

// Single shared client (server-only)
const dynamo = new DynamoDBClient({
  region: process.env.AWS_REGION, // e.g. "us-east-1"
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// OPTIONAL: put your table name in an env var to avoid hard-coding
const TABLE = process.env.DYNAMODB_TABLE_NAME || "Inquiries";

export async function POST(req) {
  try {
    const { name, email, organization = "", message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await dynamo.send(
      new PutItemCommand({
        TableName: TABLE,
        Item: {
          id:         { S: id },
          name:       { S: name },
          email:      { S: email },
          organization:{ S: organization },
          message:    { S: message },
          createdAt:  { S: createdAt },
        },
      })
    );

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("Inquiry save failed:", err);
    return NextResponse.json(
      { error: "Failed to save inquiry" },
      { status: 500 }
    );
  }
}
