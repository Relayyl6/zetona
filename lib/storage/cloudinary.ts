import crypto from "crypto";

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
  apiKey: process.env.CLOUDINARY_API_KEY || "",
  apiSecret: process.env.CLOUDINARY_API_SECRET || "",
};

/**
 * Uploads a file buffer directly to Cloudinary using their REST API
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer | Uint8Array,
  filename: string,
  options: { folder?: string; publicId?: string } = {}
): Promise<CloudinaryUploadResult> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = options.folder || "zetona";

  // Build params to sign (sorted alphabetically)
  const paramsToSign: Record<string, string> = {
    folder,
    timestamp,
  };
  if (options.publicId) {
    paramsToSign.public_id = options.publicId;
  }

  const sortedKeys = Object.keys(paramsToSign).sort();
  const signatureString = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join("&") + CLOUDINARY_CONFIG.apiSecret;
  const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

  const formData = new FormData();
  const blob = new Blob([fileBuffer as any]);
  formData.append("file", blob, filename);
  formData.append("api_key", CLOUDINARY_CONFIG.apiKey);
  formData.append("timestamp", timestamp);
  formData.append("folder", folder);
  formData.append("signature", signature);
  if (options.publicId) {
    formData.append("public_id", options.publicId);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Cloudinary upload failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
  };
}

/**
 * Builds an optimized Cloudinary delivery URL with dynamic width, quality, and format
 */
export function buildCloudinaryUrl(
  publicIdOrUrl: string,
  options: { width?: number; quality?: number; format?: "auto" | "webp" | "avif" | "jpg" } = {}
): string {
  // If it's already an absolute URL but not Cloudinary, return as-is
  if (publicIdOrUrl.startsWith("http") && !publicIdOrUrl.includes("res.cloudinary.com")) {
    return publicIdOrUrl;
  }

  const cloudName = CLOUDINARY_CONFIG.cloudName;
  const w = options.width ? `w_${options.width},` : "";
  const q = options.quality ? `q_${options.quality},` : "q_auto,";
  const f = options.format ? `f_${options.format},` : "f_auto,";
  const transforms = `${w}${q}${f}c_limit`.replace(/,+$/, "");

  if (publicIdOrUrl.includes("res.cloudinary.com")) {
    return publicIdOrUrl.replace("/upload/", `/upload/${transforms}/`);
  }

  const cleanId = publicIdOrUrl.replace(/^\//, "");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${cleanId}`;
}
