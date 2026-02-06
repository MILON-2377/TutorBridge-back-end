import z from "zod";

export const ReviewSchema = z.object({
  rating: z.number().positive(),
  comment: z.string().min(10, "At least 10 characters in comments").optional(),
});

export type ReviewInput = z.infer<typeof ReviewSchema>;
