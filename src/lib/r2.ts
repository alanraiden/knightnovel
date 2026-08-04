import "server-only";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 speaks the S3 API, so the regular AWS SDK works against it —
// just point it at the account-specific R2 endpoint instead of AWS.
// Needs four env vars (Cloudflare dashboard → R2 → Manage API Tokens, plus
// your bucket's public URL — either the bucket's r2.dev URL or a custom
// domain you've attached to it):
//   R2_ACCOUNT_ID
//   R2_ACCESS_KEY_ID
//   R2_SECRET_ACCESS_KEY
//   R2_BUCKET_NAME
//   R2_PUBLIC_URL       e.g. https://pub-xxxx.r2.dev or https://cdn.yourdomain.com

const configured = Boolean(
  process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_PUBLIC_URL
);

const client = configured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export function isR2Configured() {
  return configured;
}

export async function uploadImageToR2(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  if (!client) throw new Error("R2 is not configured");

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  const base = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
  return `${base}/${key}`;
}
