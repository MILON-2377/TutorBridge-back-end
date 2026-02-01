import z from "zod";


export const RoleSchema = z.object({
    role: z.enum(["TUTOR"], {error: "Role must be uppercase and need to match with required role"})
});




export type RoleInput = z.infer<typeof RoleSchema>;