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

const MINUTES_IN_DAY = 24 * 60;

const minuteSchema = z
  .number()
  .int("Time must be an integer")
  .min(0, "Time must be >= 0")
  .max(MINUTES_IN_DAY, "Time must be <= 1440");

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
    startMinute: minuteSchema,
    endMinute: minuteSchema,
  })
  .refine((data) => data.startMinute < data.endMinute, {
    message: "endMinute must be after startMinute",
    path: ["endMinute"],
  });

export const UpdateAvailabilitySchema = z
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
    startMinute: minuteSchema,
    endMinute: minuteSchema,
    isActive: z.boolean().optional(),
  })
  .partial()
  .refine(
    (data) =>
      data.startMinute !== undefined && data.endMinute !== undefined
        ? data.startMinute < data.endMinute
        : true,
    {
      message: "endMinute must be after startMinute",
      path: ["endMinute"],
    },
  );

export type TutorInput = z.infer<typeof TutorSchema>;
export type AvailabilityRuleInput = z.infer<typeof AvailabilityRuleSchema>;
export type CreateTutorInput = z.infer<typeof CreateTutorSchema>;
export type UpdateAvailabilityInput = z.infer<typeof UpdateAvailabilitySchema>;