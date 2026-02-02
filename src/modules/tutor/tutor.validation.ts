import z from "zod";

export const TutorSchema = z.object({
  bio: z.string().min(20, "Biodata must be at least 20 characters").optional(),

  hourlyRate: z.number().positive("Hourly rate must be greater than 0"),

  experienceYears: z
    .number()
    .int()
    .min(1, "Minimum one year of experience required"),

  languages: z
    .array(z.string().min(1))
    .min(1, "At least one language is required"),
});

export const CreateTutorSchema = z.object({
  role: z.enum(["TUTOR"]),
  tutorDetails: TutorSchema,
  category: z.object({
    id: z.string(),
  }),
});

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const AvailabilityRuleSchema = z
  .object({
    dayOfWeek: z.enum([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ]),
    startTime: z.string().regex(timeRegex),
    endTime: z.string().regex(timeRegex),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });

export type TutorInput = z.infer<typeof TutorSchema>;
export type AvailabilityRuleInput = z.infer<typeof AvailabilityRuleSchema>;
export type CreateTutorInput = z.infer<typeof CreateTutorSchema>