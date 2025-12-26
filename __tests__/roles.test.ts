import { describe, it, expect } from 'vitest'
import { ROLES, hasPermission, canManageRoles, getRoleDisplayName } from '../lib/roles'

describe('Roles and Permissions', () => {
  describe('getRoleDisplayName', () => {
    it('should return correct display name for known roles', () => {
      expect(getRoleDisplayName(ROLES.BASIC_USER)).toBe('Basic User')
      expect(getRoleDisplayName(ROLES.USER)).toBe('User')
      expect(getRoleDisplayName(ROLES.ADMIN)).toBe('Administrator')
      expect(getRoleDisplayName(ROLES.SUPER_ADMIN)).toBe('Super Administrator')
    })

    it('should return the role key itself if unknown', () => {
      expect(getRoleDisplayName('UNKNOWN_ROLE')).toBe('UNKNOWN_ROLE')
    })
  })

  describe('hasPermission', () => {
    it('should correctly check permissions for BASIC_USER', () => {
      expect(hasPermission(ROLES.BASIC_USER, 'canViewJobs')).toBe(true)
      expect(hasPermission(ROLES.BASIC_USER, 'canPostJobs')).toBe(false)
    })

    it('should correctly check permissions for USER', () => {
      expect(hasPermission(ROLES.USER, 'canPostJobs')).toBe(true)
      expect(hasPermission(ROLES.USER, 'canProposeCandidates')).toBe(true)
      expect(hasPermission(ROLES.USER, 'canValidateJobs')).toBe(false)
    })

    it('should correctly check permissions for ADMIN', () => {
      expect(hasPermission(ROLES.ADMIN, 'canValidateJobs')).toBe(true)
      expect(hasPermission(ROLES.ADMIN, 'canViewAllCandidates')).toBe(true)
      expect(hasPermission(ROLES.ADMIN, 'canManageUsers')).toBe(false)
    })

    it('should correctly check permissions for SUPER_ADMIN', () => {
      expect(hasPermission(ROLES.SUPER_ADMIN, 'canManageUsers')).toBe(true)
      expect(hasPermission(ROLES.SUPER_ADMIN, 'canApproveJobPostings')).toBe(true)
    })

    it('should return false for invalid role', () => {
      // @ts-ignore
      expect(hasPermission('INVALID', 'canViewJobs')).toBe(false)
    })
  })

  describe('canManageRoles', () => {
    it('should only allow SUPER_ADMIN to manage roles', () => {
      expect(canManageRoles(ROLES.SUPER_ADMIN)).toBe(true)
      expect(canManageRoles(ROLES.ADMIN)).toBe(false)
      expect(canManageRoles(ROLES.USER)).toBe(false)
      expect(canManageRoles(ROLES.BASIC_USER)).toBe(false)
    })
  })
})
