export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  [ROLES.USER]: 'User',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.SUPER_ADMIN]: 'Super Administrator',
}

export const ROLE_PERMISSIONS = {
  [ROLES.USER]: {
    canViewPositions: true,
    canPostPositions: true,
    canProposeCandidates: true,
    canViewAllPositions: false,
    canViewAllCandidates: false,
    canValidatePositions: false,
    canValidateCandidates: false,
    canApprovePositions: false,
    canManageUsers: false,
  },
  [ROLES.ADMIN]: {
    canViewPositions: true,
    canPostPositions: true,
    canProposeCandidates: true,
    canViewAllPositions: true,
    canViewAllCandidates: true,
    canValidatePositions: true,
    canValidateCandidates: true,
    canApprovePositions: false,
    canManageUsers: false,
  },
  [ROLES.SUPER_ADMIN]: {
    canViewPositions: true,
    canPostPositions: true,
    canProposeCandidates: true,
    canViewAllPositions: true,
    canViewAllCandidates: true,
    canValidatePositions: true,
    canValidateCandidates: true,
    canApprovePositions: true,
    canManageUsers: true,
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
