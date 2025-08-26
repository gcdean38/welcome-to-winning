import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const ddb = new DynamoDBClient({ region: process.env.AWS_REGION });

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // List all client folders in S3
    const listClients = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: "clients/",
      Delimiter: "/",
    });

    const clientFolders = await s3.send(listClients);

    const orgPrefixes =
      clientFolders.CommonPrefixes?.map((p) =>
        p.Prefix.replace("clients/", "").replace("/", "")
      ) || [];

    const results = {};

    for (const orgId of orgPrefixes) {
      // Fetch orgName from AllowedUsers table using Scan
      let orgName = orgId; // fallback
      try {
        const allowedData = await ddb.send(
          new ScanCommand({
            TableName: process.env.DYNAMO_TABLE_ALLOWEDUSERS,
            FilterExpression: "orgId = :orgId",
            ExpressionAttributeValues: {
              ":orgId": { S: orgId },
            },
            ProjectionExpression: "orgName",
          })
        );

        orgName = allowedData.Items?.[0]?.orgName?.S || orgId;
      } catch (err) {
        console.warn(`Failed to get orgName for ${orgId} from AllowedUsers:`, err);
      }

      results[orgId] = { orgName, inbound: [], outbound: [] };

      for (const folder of ["inbound", "outbound"]) {
        const listFiles = new ListObjectsV2Command({
          Bucket: process.env.AWS_S3_BUCKET,
          Prefix: `clients/${orgId}/${folder}/`,
        });

        const res = await s3.send(listFiles);

        if (res.Contents) {
          const files = await Promise.all(
            res.Contents
              .filter((item) => {
                const name = item.Key.replace(`clients/${orgId}/${folder}/`, "");
                return name.length > 0;
              })
              .map(async (item) => {
                const getCmd = new GetObjectCommand({
                  Bucket: process.env.AWS_S3_BUCKET,
                  Key: item.Key,
                });
                const url = await getSignedUrl(s3, getCmd, { expiresIn: 3600 });
                return {
                  name: item.Key.replace(`clients/${orgId}/${folder}/`, ""),
                  url,
                  lastModified: item.LastModified,
                };
              })
          );

          results[orgId][folder] = files.sort(
            (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
          );
        }
      }
    }

    return Response.json(results);
  } catch (err) {
    console.error("listAll error:", err);
    return Response.json({ error: "Failed to list all files" }, { status: 500 });
  }
}
