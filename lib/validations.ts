import { z } from "zod"

export const jobPostingSchema = z.object({
  // Core Fields
  reference: z.string().optional(), // Auto-generated
  jobTitle: z.string().min(1, "Job title is required"),
  companyName: z.string().min(1, "Company name is required"),
  location: z.string().min(1, "Location is required"),
  country: z.enum(["Belgium", "Netherlands", "Luxembourg", "France"]),
  startDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
  durationMonths: z.coerce.number().min(0, "Duration must be positive").optional(),
  seniorityLevel: z.enum(["Junior", "Medior", "Senior", "Expert"]),

  // Extended Manual
  description: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  
  languageRequirements: z.array(z.object({
    language: z.enum(["French", "Dutch", "English", "German", "Italian", "Spanish"]),
    level: z.enum(["Basic", "Intermediate", "Advanced", "Native"]),
    mandatory: z.boolean()
  })).optional(),

  workArrangement: z.object({
    remote_allowed: z.boolean().optional(),
    on_site_days_per_week: z.coerce.number().min(1).max(5).nullable().optional()
  }).optional(),

  industrySector: z.enum(["Banking", "Insurance", "Finance", "IT", "Healthcare", "Consulting", "Other"]).optional(),
  
  // Metadata/System
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED", "FILLED", "PENDING_APPROVAL", "PENDING_REVIEW"]).default("ACTIVE"),
  
  // Legacy fields (kept for compatibility)
  externalReference: z.string().optional(),
  source: z.string().optional(),
  sourceUrl: z.string().optional().or(z.literal("")),
  companyDivision: z.string().optional(),
  organizationalUnit: z.string().optional(),
  roleCategory: z.string().optional(),
  roleProfile: z.string().optional(),
  workLocation: z.any().optional(),
  employmentType: z.string().optional(),
  contractDuration: z.string().optional(),
  endDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
  extensionPossible: z.boolean().optional(),
  missionContext: z.string().optional(),
  objectives: z.union([z.string(), z.array(z.string())]).optional().transform(val => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }),
  education: z.union([z.string(), z.array(z.string())]).optional().nullable().transform(val => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }),
  experience: z.union([z.string(), z.array(z.string())]).optional().nullable().transform(val => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }),
  languages: z.union([z.string(), z.array(z.string())]).optional().transform(val => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }),
  industry: z.string().optional(),
  domain: z.string().optional(),
  travelRequired: z.string().optional(),
  salaryRange: z.any().optional(),
  applicationMethod: z.string().optional(),
  contactPerson: z.any().optional(),
  applicationDeadline: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
})

export const candidateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  desiredRoles: z.union([z.string(), z.array(z.string())]).transform(val => Array.isArray(val) ? val : [val]),
  skills: z.union([z.string(), z.array(z.string())]).transform(val => Array.isArray(val) ? val : [val]),
  industries: z.union([z.string(), z.array(z.string())]).transform(val => Array.isArray(val) ? val : [val]),
  seniorityLevel: z.string().optional(),
  certifications: z.union([z.string(), z.array(z.string())]).transform(val => Array.isArray(val) ? val : [val]),
  location: z.string().optional(),
  profileDataJson: z.record(z.string(), z.any()).optional(),
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
