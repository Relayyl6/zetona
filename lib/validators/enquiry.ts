import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(200),
  phone: z.string().trim().max(30).optional(),
  sessionType: z.enum(["portrait", "studio", "other"]).optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(4000),
  website: z.string().max(0, "Spam detected").optional(), // honeypot must be empty
  turnstileToken: z.string().optional(), // optional in dev / stub
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
