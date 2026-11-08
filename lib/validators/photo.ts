import { z } from "zod";

export const photoUpdateSchema = z.object({
  title: z.string().trim().max(120).optional().nullable(),
  alt: z.string().trim().max(240).optional().nullable(),
  caption: z.string().trim().max(500).optional().nullable(),
  collectionId: z.string().nullable().optional(),
  focalX: z.number().min(0).max(1).optional(),
  focalY: z.number().min(0).max(1).optional(),
  featuredHome: z.boolean().optional(),
  featuredAbout: z.boolean().optional(),
  status: z.enum(["draft", "published", "trashed"]).optional(),
});

export const photoPublishGuard = z.object({
  alt: z.string().trim().min(8, "Describe the photo (min 8 characters)"),
});

export const uploadRequestSchema = z.object({
  files: z
    .array(
      z.object({
        name: z.string().max(200),
        contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
        displayBytes: z
          .number()
          .int()
          .positive()
          .max(8 * 1024 * 1024),
        originalBytes: z
          .number()
          .int()
          .positive()
          .max(40 * 1024 * 1024),
      })
    )
    .min(1)
    .max(20),
});

export type PhotoUpdateInput = z.infer<typeof photoUpdateSchema>;
export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;
