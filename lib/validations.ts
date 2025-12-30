import { z } from "zod"

export const jobPostingSchema = z.object({
  // Core Fields
  reference: z.string().optional(), // Auto-generated
  jobTitle: z.string().min(1, "Job title is required"),
  companyName: z.string().min(1, "Company name is required"),
  location: z.string().min(1, "Location is required"),
  country: z.enum(["Belgium", "Netherlands", "Luxembourg", "France"]),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED", "PENDING_APPROVAL", "CAMPAIGN_SENT"]).default("ACTIVE"),

  // Details
  description: z.string().optional(),
  industrySector: z.enum(["Banking", "Insurance", "Finance", "IT", "Healthcare", "Consulting", "Other"]).optional(),
  seniorityLevel: z.enum(["Junior", "Medior", "Senior", "Expert"]),
  employmentType: z.string().optional(),
  durationMonths: z.coerce.number().min(0, "Duration must be positive").optional(),
  startDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
  endDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
  extensionPossible: z.boolean().optional(),

  // Work Arrangement (Flattened)
  remoteAllowed: z.boolean().optional(),
  onSiteDays: z.coerce.number().min(1).max(5).nullable().optional(),

  // Salary (Flattened)
  minSalary: z.coerce.number().optional(),
  maxSalary: z.coerce.number().optional(),
  currency: z.string().default("EUR"),

  // Contact (Flattened)
  contactName: z.string().optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),

  // Arrays
  responsibilities: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  objectives: z.array(z.string()).optional(),
  education: z.array(z.string()).optional(),
  experience: z.array(z.string()).optional(),

  // Relations (Input for JobPostingLanguage)
  languageRequirements: z.array(z.object({
    language: z.enum(["French", "Dutch", "English", "German", "Italian", "Spanish"]),
    level: z.enum(["Basic", "Intermediate", "Advanced", "Native"]),
    mandatory: z.boolean()
  })).optional(),
})

export const candidateSchema = z.object({
  // Contact Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  location: z.string().optional(),
  
  // Experience
  education: z.union([z.string(), z.array(z.string())]).transform(val => Array.isArray(val) ? val : [val]).optional(),
  educationLevel: z.enum(["Bachelor", "Master", "PhD"]).optional(),
  previousRoles: z.union([z.string(), z.array(z.string())]).transform(val => Array.isArray(val) ? val : [val]).optional(),
  seniorityLevel: z.string().min(1, "Seniority level is required"),
  desiredRoles: z.union([z.string(), z.array(z.string())]).transform(val => Array.isArray(val) ? val : [val]),
  softSkills: z.union([z.string(), z.array(z.string())]).transform(val => Array.isArray(val) ? val : [val]),
  hardSkills: z.union([z.string(), z.array(z.string())]).transform(val => Array.isArray(val) ? val : [val]),
  certifications: z.union([z.string(), z.array(z.string())]).transform(val => Array.isArray(val) ? val : [val]).optional(),
  industries: z.union([z.string(), z.array(z.string())]).transform(val => Array.isArray(val) ? val : [val]).optional(),
  languages: z.union([z.string(), z.array(z.string())]).transform(val => Array.isArray(val) ? val : [val]),
  
  // Miscellaneous
  status: z.enum(["DRAFT", "PENDING_APPROVAL", "ACTIVE", "INACTIVE"]).optional(),
})

export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
})

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export type JobPostingFormValues = z.infer<typeof jobPostingSchema>
export type JobPostingInput = z.input<typeof jobPostingSchema>
export type CandidateFormValues = z.infer<typeof candidateSchema>
export type CandidateInput = z.input<typeof candidateSchema>
export type ProfileFormValues = z.infer<typeof profileSchema>
export type PasswordFormValues = z.infer<typeof passwordSchema>
