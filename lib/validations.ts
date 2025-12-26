import { z } from "zod"

export const jobPostingSchema = z.object({
  // Core Fields
  reference: z.string().min(1, "Reference is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  companyName: z.string().min(1, "Company name is required"),
  location: z.string().min(1, "Location is required"),
  country: z.string().min(2, "Country code is required"),
  startDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
  durationMonths: z.coerce.number().min(0, "Duration must be positive").optional(),
  seniorityLevel: z.enum(["Junior", "Mid", "Senior"]).or(z.string()),

  // Extended Manual
  description: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  
  languageRequirements: z.array(z.object({
    language: z.string(),
    level: z.enum(["Basic", "Intermediate", "Advanced", "Native"]),
    mandatory: z.boolean()
  })).optional(),

  workArrangement: z.object({
    remote_allowed: z.boolean().optional(),
    on_site_days_per_week: z.coerce.number().nullable().optional()
  }).optional(),

  contactInfo: z.object({
    contact_person: z.string().nullable().optional(),
    email: z.string().nullable().optional()
  }).optional(),

  industrySector: z.enum(["Banking", "Insurance", "Finance", "IT", "Healthcare", "Consulting", "Other"]).optional(),
  urgent: z.boolean().default(false).optional(),

  // Extended Auto
  detailedRequirements: z.object({
    technical_skills: z.array(z.object({
      skill_name: z.string(),
      years_experience: z.coerce.number().nullable().optional(),
      proficiency_level: z.enum(["Basic", "Intermediate", "Advanced", "Expert"]).optional(),
      mandatory: z.boolean().optional()
    })).optional(),
    soft_skills: z.array(z.string()).optional(),
    years_experience_required: z.object({
      minimum: z.coerce.number(),
      maximum: z.coerce.number().nullable().optional()
    }).optional()
  }).optional(),
  
  educationRequirements: z.object({
    minimum_level: z.enum(["High School", "Bachelor", "Master", "PhD"]).nullable().optional(),
    fields_of_study: z.array(z.string()).optional()
  }).optional(),

  contractDetails: z.object({
    contract_type: z.enum(["External", "Permanent", "Fixed-term", "Freelance"]).nullable().optional(),
    end_date: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
    renewable: z.boolean().optional()
  }).optional(),

  department: z.string().optional().nullable(),
  applicationInstructions: z.string().optional().nullable(),

  // Metadata/System
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED", "FILLED"]).default("ACTIVE"),
  
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
