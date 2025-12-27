import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateUserAction } from '../../app/actions/admin'
import { prisma } from '../../lib/prisma'
import { auth } from '../../auth'

// Mock dependencies
vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}))

vi.mock('../../auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Admin Server Actions', () => {
  const mockSuperAdmin = { id: 'super-1', role: 'SUPER_ADMIN' }
  const mockAdmin = { id: 'admin-1', role: 'ADMIN' }
  const mockTargetUser = { id: 'target-1' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateUserAction', () => {
    it('should allow SUPER_ADMIN to update user role', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockSuperAdmin })
      // @ts-ignore
      prisma.user.update.mockResolvedValue({ id: 'target-1', role: 'ADMIN', isGatekeeper: true })

      const result = await updateUserAction({
        userId: mockTargetUser.id,
        role: 'ADMIN',
        isGatekeeper: true
      })

      expect(result.success).toBe(true)
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockTargetUser.id },
        data: { role: 'ADMIN', isGatekeeper: true }
      })
    })

    it('should deny non-SUPER_ADMIN users', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockAdmin })

      const result = await updateUserAction({
        userId: mockTargetUser.id,
        role: 'ADMIN',
        isGatekeeper: true
      })

      expect(result.error).toBe('Unauthorized')
      expect(prisma.user.update).not.toHaveBeenCalled()
    })

    it('should fail validation for invalid role', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockSuperAdmin })

      const result = await updateUserAction({
        userId: mockTargetUser.id,
        // @ts-ignore
        role: 'INVALID_ROLE',
        isGatekeeper: true
      })

      expect(result.validationErrors).toBeDefined()
      expect(prisma.user.update).not.toHaveBeenCalled()
    })
  })
})
