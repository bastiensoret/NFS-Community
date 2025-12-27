import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPositionAction, deletePositionAction, updatePositionAction } from '../../app/actions/positions'
import { prisma } from '../../lib/prisma'
import { auth } from '../../auth'
import { checkRateLimit } from '../../lib/rate-limit'

// Mock dependencies
vi.mock('../../lib/prisma', () => ({
  prisma: {
    jobPosting: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    }
  },
}))

vi.mock('../../auth', () => ({
  auth: vi.fn(),
}))

vi.mock('../../lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Positions Server Actions', () => {
  const mockUser = { id: 'user-1', role: 'USER' }
  const mockAdmin = { id: 'admin-1', role: 'ADMIN' }
  const mockPosting = {
    jobTitle: 'Dev',
    companyName: 'Corp',
    location: 'Remote',
    country: 'Belgium',
    description: 'Code things',
    seniorityLevel: 'Senior',
    status: 'DRAFT'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createPositionAction', () => {
    it('should create position with default DRAFT status for USER', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockUser })
      // @ts-ignore
      checkRateLimit.mockResolvedValue(true)
      // @ts-ignore
      prisma.jobPosting.create.mockResolvedValue({ id: 'pos-1', ...mockPosting, status: 'DRAFT', creatorId: mockUser.id })

      const result = await createPositionAction(mockPosting as any)

      expect(result.success).toBe(true)
      expect(prisma.jobPosting.create).toHaveBeenCalled()
      // Verify DRAFT enforcement
      const callArg = (prisma.jobPosting.create as any).mock.calls[0][0]
      expect(callArg.data.status).toBe('DRAFT')
    })

    it('should fail validation with missing fields', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockUser })
      // @ts-ignore
      checkRateLimit.mockResolvedValue(true)

      const invalidInput = { jobTitle: '' } // Missing company, location, etc.
      const result = await createPositionAction(invalidInput as any)

      expect(result.validationErrors).toBeDefined()
    })
  })

  describe('deletePositionAction', () => {
    it('should allow creator to delete', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockUser })
      // @ts-ignore
      checkRateLimit.mockResolvedValue(true)
      // @ts-ignore
      prisma.jobPosting.findUnique.mockResolvedValue({ id: 'pos-1', creatorId: mockUser.id })
      // @ts-ignore
      prisma.jobPosting.delete.mockResolvedValue({ id: 'pos-1' })

      const result = await deletePositionAction('pos-1')

      expect(result.success).toBe(true)
    })

    it('should deny non-creator USER', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: { id: 'other-user', role: 'USER' } })
      // @ts-ignore
      checkRateLimit.mockResolvedValue(true)
      // @ts-ignore
      prisma.jobPosting.findUnique.mockResolvedValue({ id: 'pos-1', creatorId: mockUser.id })

      const result = await deletePositionAction('pos-1')

      expect(result.error).toBe('Unauthorized')
      expect(prisma.jobPosting.delete).not.toHaveBeenCalled()
    })
  })
})
