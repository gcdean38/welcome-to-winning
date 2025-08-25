import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // List *all clients/* prefixes
    const listClients = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: "clients/",
      Delimiter: "/", // 👈 groups by "folder"
    });

    const clientFolders = await s3.send(listClients);
    const orgPrefixes =
      clientFolders.CommonPrefixes?.map((p) =>
        p.Prefix.replace("clients/", "").replace("/", "")
      ) || [];

    const results = {};

    for (const orgId of orgPrefixes) {
      results[orgId] = { inbound: [], outbound: [] };

      for (const folder of ["inbound", "outbound"]) {
        const listFiles = new ListObjectsV2Command({
          Bucket: process.env.AWS_S3_BUCKET,
          Prefix: `clients/${orgId}/${folder}/`,
        });

        const res = await s3.send(listFiles);

        if (res.Contents) {
          results[orgId][folder] = await Promise.all(
            res.Contents.map(async (item) => {
              const getCmd = new GetObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: item.Key,
              });
              const url = await getSignedUrl(s3, getCmd, {
                expiresIn: 3600,
              });
              return {
                name: item.Key.replace(`clients/${orgId}/${folder}/`, ""),
                url,
                lastModified: item.LastModified,
              };
            })
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
