import z from "zod";

export const RoleSchema = z.object({
  role: z.enum(["TUTOR"], {
    error: "Role must be uppercase and need to match with required role",
  }),
});

export const ProfileSchema = z.object({
  name: z.string().min(3, "Minimum 5 characters required").optional(),
  image: z.string().url("Invalid image URL").or(z.literal("")).optional(),
});

export type RoleInput = z.infer<typeof RoleSchema>;
export type UpdateProfileInput = z.infer<typeof ProfileSchema>;
