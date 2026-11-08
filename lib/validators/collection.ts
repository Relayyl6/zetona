import { z } from "zod";

export const collectionSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(80),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
    .max(60),
  description: z.string().trim().max(300).optional().nullable(),
  coverPhotoId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export type CollectionInput = z.infer<typeof collectionSchema>;
