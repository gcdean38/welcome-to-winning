import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function POST(req) {
  try {
    // 🔹 Get session
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = session.user?.orgId;
    if (!orgId) {
      return Response.json({ error: "Missing orgId in session" }, { status: 401 });
    }

    console.log("Fetching files for orgId:", orgId);

    const results = { inbound: [], outbound: [] };

    for (const folder of ["inbound", "outbound"]) {
      try {
        const params = {
          Bucket: process.env.AWS_S3_BUCKET,
          Prefix: `clients/${orgId}/${folder}/`,
        };
        console.log("S3 ListObjectsV2Command params:", params);

        const listFilesCmd = new ListObjectsV2Command(params);
        const res = await s3.send(listFilesCmd);

        console.log(`S3 response for ${folder}:`, res);

        if (res.Contents && res.Contents.length > 0) {
          const files = await Promise.all(
            res.Contents
              .filter((item) => item.Key.replace(params.Prefix, "").length > 0)
              .map(async (item) => {
                const getCmd = new GetObjectCommand({
                  Bucket: params.Bucket,
                  Key: item.Key,
                });
                const url = await getSignedUrl(s3, getCmd, { expiresIn: 3600 });
                return {
                  name: item.Key.replace(params.Prefix, ""),
                  url,
                  lastModified: item.LastModified,
                };
              })
          );

          // Sort newest first
          results[folder] = files.sort(
            (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
          );
        } else {
          console.log(`No files found in folder: ${folder}`);
        }
      } catch (err) {
        console.error(`S3 list failed for folder ${folder} and orgId ${orgId}:`, err);
        return Response.json(
          { error: `Failed to list ${folder} files`, details: err.message },
          { status: 500 }
        );
      }
    }

    return Response.json(results);
  } catch (err) {
    console.error("Unexpected error in listOrgFiles:", err);
    return Response.json({ error: "Unexpected server error", details: err.message }, { status: 500 });
  }
}
