import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");
  const filename = searchParams.get("filename");

  const key = `folders/${orgId}/inbound/${filename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 });
  return Response.json({ url });
}
