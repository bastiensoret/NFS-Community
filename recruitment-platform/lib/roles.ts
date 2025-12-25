export const ROLES = {
  BASIC_USER: 'BASIC_USER',
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  GATEKEEPER: 'GATEKEEPER',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  [ROLES.BASIC_USER]: 'Basic User',
  [ROLES.USER]: 'User',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.SUPER_ADMIN]: 'Super Administrator',
  [ROLES.GATEKEEPER]: 'Gatekeeper',
}

export const ROLE_PERMISSIONS = {
  [ROLES.BASIC_USER]: {
    canViewJobs: true,
    canPostJobs: false,
    canProposeCandidates: false,
    canViewAllJobs: false,
    canViewAllCandidates: false,
    canValidateJobs: false,
    canValidateCandidates: false,
    canApproveJobPostings: false,
    canManageUsers: false,
  },
  [ROLES.USER]: {
    canViewJobs: true,
    canPostJobs: true,
    canProposeCandidates: true,
    canViewAllJobs: false,
    canViewAllCandidates: false,
    canValidateJobs: false,
    canValidateCandidates: false,
    canApproveJobPostings: false,
    canManageUsers: false,
  },
  [ROLES.ADMIN]: {
    canViewJobs: true,
    canPostJobs: true,
    canProposeCandidates: true,
    canViewAllJobs: true,
    canViewAllCandidates: true,
    canValidateJobs: true,
    canValidateCandidates: true,
    canApproveJobPostings: false,
    canManageUsers: false,
  },
  [ROLES.SUPER_ADMIN]: {
    canViewJobs: true,
    canPostJobs: true,
    canProposeCandidates: true,
    canViewAllJobs: true,
    canViewAllCandidates: true,
    canValidateJobs: true,
    canValidateCandidates: true,
    canApproveJobPostings: true,
    canManageUsers: true,
  },
  [ROLES.GATEKEEPER]: {
    canViewJobs: true,
    canPostJobs: true,
    canProposeCandidates: true,
    canViewAllJobs: false,
    canViewAllCandidates: false,
    canValidateJobs: false,
    canValidateCandidates: false,
    canApproveJobPostings: true,
    canManageUsers: false,
  },
}

export function getRoleDisplayName(role: string): string {
  return ROLE_DISPLAY_NAMES[role as Role] || role
}

export function hasPermission(role: string, permission: keyof typeof ROLE_PERMISSIONS[Role]): boolean {
  const rolePerms = ROLE_PERMISSIONS[role as Role]
  if (!rolePerms) return false
  return rolePerms[permission] || false
}

export function canManageRoles(role: string): boolean {
  return role === ROLES.SUPER_ADMIN
}
