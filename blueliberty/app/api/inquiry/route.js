import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const dynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION })
);

const ses = new SESClient({ region: process.env.AWS_REGION });

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, organization, message } = body;

    // Save inquiry to DynamoDB
    await dynamo.send(
      new PutCommand({
        TableName: process.env.DYNAMO_TABLE,
        Item: {
          id: Date.now().toString(),
          name,
          email,
          organization,
          message,
          createdAt: new Date().toISOString(),
        },
      })
    );

    // Send notification email
    await ses.send(
      new SendEmailCommand({
        Source: process.env.SES_FROM_EMAIL,
        Destination: {
          ToAddresses: [process.env.SES_TO_EMAIL],
        },
        Message: {
          Subject: { Data: `New Inquiry from ${name}` },
          Body: {
            Text: {
              Data: `Name: ${name}\nEmail: ${email}\nOrganization: ${organization}\n\nMessage:\n${message}`,
            },
          },
        },
      })
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving inquiry:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
