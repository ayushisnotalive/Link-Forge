import {z} from 'zod';

export const createLinkSchema = z.object({
    long_url:z
    .string()
    .trim()
    .min(1, "long url is required")
    .max(2048, "long_url must be 2048 characters or fewer")
    .refine((val) => {
      try {
        const url = new URL(val);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "long_url must be a valid http or https URL"),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;