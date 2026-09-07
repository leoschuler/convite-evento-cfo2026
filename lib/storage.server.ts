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

/** Lançado quando uma escrita condicional perde a corrida (ETag mudou desde a leitura). */
export class WriteConflictError extends Error {
  constructor() {
    super("write_conflict");
    this.name = "WriteConflictError";
  }
}

function isPreconditionFailed(e: unknown): boolean {
  const err = e as { name?: string; Code?: string; $metadata?: { httpStatusCode?: number } } | null | undefined;
  if (!err) return false;
  if (err.$metadata?.httpStatusCode === 412) return true;
  return /precondition/i.test(err.name || err.Code || "");
}

export async function readInvitationsFromBucket(): Promise<{ body: string; etag: string | null } | null> {
  try {
    const res = await r2().send(new GetObjectCommand({ Bucket: env("R2_BUCKET_NAME"), Key: DATA_KEY }));
    const body = await res.Body?.transformToString();
    if (body == null) return null;
    return { body, etag: res.ETag ?? null };
  } catch {
    return null;
  }
}

/**
 * `ifMatch` (o ETag lido junto com a versão atual) faz o R2 recusar a escrita
 * com 412 se o objeto mudou desde a leitura — é o que permite detectar (e
 * reagir a) dois requests concorrentes tentando escrever a partir da mesma
 * versão do arquivo. Sem `ifMatch`, a escrita é incondicional (bootstrap: o
 * objeto ainda não existe).
 */
export async function writeInvitationsToBucket(json: string, ifMatch?: string | null): Promise<void> {
  try {
    await r2().send(
      new PutObjectCommand({
        Bucket: env("R2_BUCKET_NAME"),
        Key: DATA_KEY,
        Body: json,
        ContentType: "application/json",
        ...(ifMatch ? { IfMatch: ifMatch } : {}),
      })
    );
  } catch (e) {
    if (isPreconditionFailed(e)) throw new WriteConflictError();
    throw e;
  }
}
