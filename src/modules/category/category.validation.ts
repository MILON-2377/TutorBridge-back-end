import z from "zod";

export const CategorySchema = z.object({
  name: z
    .string()
    .min(3, "Category name must be at least 3 characters")
    .max(50, "Category name is too long"),
  description: z
    .string()
    .min(20)
    .min(20, "Description must be at least 20 characters")
    .max(500)
    .optional(),
});

export type CategoryInput = z.infer<typeof CategorySchema>;
