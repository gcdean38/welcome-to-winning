import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function POST(req, context) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await context.params; // ✅ await params
  if (!action) return Response.json({ error: "Missing action" }, { status: 400 });

  const body = req.headers.get("content-type")?.includes("application/json")
    ? await req.json().catch(() => ({})) // 👈 safe parse
    : {};

  const { fileName, fileType, targetOrgId } = body; // targetOrgId lets admin choose which client
  const orgId = session.user.orgId;
  const orgName = session.user.orgName
  const role = session.user.role;

  if (!orgId) return Response.json({ error: "Missing orgId" }, { status: 400 });

  //
  // 🚀 UPLOAD
  //
  if (action === "upload") {
    if (!fileName || !fileType) {
      return Response.json({ error: "Missing fileName or fileType" }, { status: 400 });
    }

    // Clients upload → their own outbound folder
    // Admins upload → chosen client’s inbound folder
    let key;
    if (role === "client") {
      key = `clients/${orgId}/outbound/${fileName}`;
    } else if (role === "admin") {
      if (!targetOrgId) {
        return Response.json({ error: "Missing targetOrgId for admin upload" }, { status: 400 });
      }
      key = `clients/${targetOrgId}/inbound/${fileName}`;
    }

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: fileType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 });
    return Response.json({ url, key });
  }

  //
  // 🚀 LIST
  //
  if (action === "list") {
    let prefix;

    if (role === "client") {
      // clients only see inbound
      prefix = `clients/${orgId}/inbound/`;
    } else if (role === "admin") {
      // admins need to pass a targetOrgId to list
      if (!targetOrgId) {
        return Response.json({ error: "Missing targetOrgId for admin list" }, { status: 400 });
      }
      // by default list both inbound + outbound for a client
      prefix = `clients/${targetOrgId}/`;
    }

    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: prefix,
    });

    const result = await s3.send(command);

    const files = await Promise.all(
      (result.Contents || []).map(async (item) => {
        const name = item.Key.replace(prefix, "");
        if (!name || name.endsWith("/")) return null; // ⛔ skip blanks/folders

        const getCommand = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: item.Key,
        });

        // View URL (renders in browser if HTML, images, etc.)
        const viewUrl = await getSignedUrl(s3, getCommand, {
          expiresIn: 3600,
        });

        // ✅ Force .html and .pdf downloads as .pdf
        let downloadFileName = name;
        if (name.endsWith(".html") || name.endsWith(".pdf")) {
          const baseName = name.replace(/\.[^/.]+$/, ""); // strip extension
          downloadFileName = `${baseName}.pdf`;
        }

        // Download URL (forces download + custom filename)
        const downloadUrl = await getSignedUrl(s3, getCommand, {
          expiresIn: 3600,
          responseContentDisposition: `attachment; filename="${downloadFileName}"`,
        });

        return {
          key: item.Key,
          name,
          viewUrl,
          downloadUrl,
        lastModified: item.LastModified, // ✅ include upload timestamp

        };
      })
    );

    return Response.json(files.filter(Boolean));
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}
