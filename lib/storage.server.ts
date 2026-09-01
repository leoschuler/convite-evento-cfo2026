import "server-only";
import { randomUUID } from "node:crypto";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Bucket R2 (S3-compatible) usado para tudo que precisa sobreviver a deploys:
 * imagens enviadas pelo admin e o próprio data/invitations.json. Filesystem
 * local não é confiável em produção (efêmero/somente leitura em serverless).
 */
const DATA_KEY = "data/invitations.json";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`missing_env_${name}`);
  return v;
}

let client: S3Client | null = null;
function r2(): S3Client {
  if (!client) {
    client = new S3Client({
      region: process.env.R2_REGION || "auto",
      endpoint: env("R2_ENDPOINT"),
      forcePathStyle: true,
      credentials: {
        accessKeyId: env("R2_ACCESS_KEY_ID"),
        secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
      },
    });
  }
  return client;
}

export async function uploadImage(bytes: Buffer, ext: string, contentType: string): Promise<string> {
  const key = `uploads/${randomUUID()}.${ext}`;
  await r2().send(
    new PutObjectCommand({
      Bucket: env("R2_BUCKET_NAME"),
      Key: key,
      Body: bytes,
      ContentType: contentType,
    })
  );
  return `${env("R2_PUBLIC_BASE_URL").replace(/\/$/, "")}/${key}`;
}

export async function readInvitationsFromBucket(): Promise<string | null> {
  try {
    const res = await r2().send(new GetObjectCommand({ Bucket: env("R2_BUCKET_NAME"), Key: DATA_KEY }));
    return (await res.Body?.transformToString()) ?? null;
  } catch {
    return null;
  }
}

export async function writeInvitationsToBucket(json: string): Promise<void> {
  await r2().send(
    new PutObjectCommand({
      Bucket: env("R2_BUCKET_NAME"),
      Key: DATA_KEY,
      Body: json,
      ContentType: "application/json",
    })
  );
}
