import { describe, it, expect } from "vitest";
import { photoUpdateSchema, photoPublishGuard, uploadRequestSchema } from "@/lib/validators/photo";
import { enquirySchema } from "@/lib/validators/enquiry";
import { collectionSchema } from "@/lib/validators/collection";
import { buildDisplayKey, buildOriginalKey, sanitizeFilename } from "@/lib/storage/keys";
import { collagePresets } from "@/lib/collage-presets";
import { isEmailAllowlisted, parseAdminAllowlist } from "@/lib/auth/admin";

describe("lib/validators", () => {
  it("enforces alt text of min 8 characters to publish", () => {
    expect(photoPublishGuard.safeParse({ alt: "short" }).success).toBe(false);
    expect(photoPublishGuard.safeParse({ alt: "Studio portrait in white linen" }).success).toBe(true);
  });

  it("validates enquiry honeypot", () => {
    const valid = enquirySchema.safeParse({
      name: "Osagie",
      email: "osagie@example.com",
      message: "I would like to book a studio session for next week.",
    });
    expect(valid.success).toBe(true);

    const botSpam = enquirySchema.safeParse({
      name: "Bot",
      email: "bot@example.com",
      message: "Spam message here",
      website: "http://spam.com",
    });
    expect(botSpam.success).toBe(false);
  });

  it("validates collection slug regex (lowercase and hyphens only)", () => {
    expect(collectionSchema.safeParse({ title: "Studio", slug: "studio-session" }).success).toBe(true);
    expect(collectionSchema.safeParse({ title: "Studio", slug: "Studio Session!" }).success).toBe(false);
  });
});

describe("lib/storage/keys", () => {
  it("sanitizes filenames safely", () => {
    expect(sanitizeFilename("IMG_0123 (1) [FINAL].JPG")).toBe("img_0123-1-final-.jpg");
  });

  it("builds immutable display key containing hash8", () => {
    const key = buildDisplayKey("ph_123", "a1b2c3d4");
    expect(key).toBe("photos/ph_123/a1b2c3d4-display.jpg");
  });
});

describe("lib/collage-presets", () => {
  it("provides 3 collage presets, each with 10 slots and slots 0-3 as LCP candidates", () => {
    expect(collagePresets.length).toBe(3);
    collagePresets.forEach((preset) => {
      expect(preset.slots.length).toBe(10);
      expect(preset.slots[0].isLcp).toBe(true);
      expect(preset.slots[1].isLcp).toBe(true);
      expect(preset.slots[2].isLcp).toBe(true);
      expect(preset.slots[3].isLcp).toBe(true);
    });
  });
});

describe("lib/auth/admin", () => {
  it("checks email against allowlist case-insensitively", () => {
    expect(isEmailAllowlisted("Osakpolorobazee01@gmail.com")).toBe(true);
    expect(isEmailAllowlisted("osakpolorobazee01@gmail.com")).toBe(true);
    expect(isEmailAllowlisted("unauthorized@example.com")).toBe(false);
  });
});
