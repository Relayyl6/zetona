import { z } from "zod";

export const siteSettingsSchema = z.object({
  headline: z.string().trim().max(200).optional().nullable(),
  subline: z.string().trim().max(200).optional().nullable(),
  bio: z.string().trim().max(4000).optional().nullable(),
  showStats: z.boolean().optional(),
  showAwards: z.boolean().optional(),
  showTestimonials: z.boolean().optional(),
  homeSelectorMode: z.enum(["photos", "collections"]).optional(),
  homeVariant: z.enum(["collage", "split"]).optional(),
  instagramUrl: z.string().url().optional().nullable().or(z.literal("")),
  facebookUrl: z.string().url().optional().nullable().or(z.literal("")),
  tiktokUrl: z.string().url().optional().nullable().or(z.literal("")),
  xUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
