import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(254),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/\s+/g, "")) // Remove all spaces
    .pipe(
      z
        .string()
        .regex(
          /^\+?[0-9]{7,15}$/,
          "Please enter a valid phone number (7-15 digits)",
        ),
    )
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
});

export type ContactFormInputs = z.infer<typeof contactFormSchema>;
