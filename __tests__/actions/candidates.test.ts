import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCandidateAction, deleteCandidateAction } from '../../app/actions/candidates'
import { prisma } from '../../lib/prisma'
import { auth } from '../../auth'
import { checkRateLimit } from '../../lib/rate-limit'

// Mock dependencies
vi.mock('../../lib/prisma', () => ({
  prisma: {
    candidate: {
      create: vi.fn(),
      delete: vi.fn(),
    },
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

describe('Candidate Server Actions', () => {
  const mockUser = {
    id: 'user-1',
    role: 'USER',
  }

  const mockAdmin = {
    id: 'admin-1',
    role: 'ADMIN',
  }

  const mockCandidateInput = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    desiredRoles: ['Developer'],
    skills: ['React'],
    industries: ['Tech'],
    certifications: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCandidateAction', () => {
    it('should fail if user is not authenticated', async () => {
      // @ts-ignore
      auth.mockResolvedValue(null)
      
      const result = await createCandidateAction(mockCandidateInput)
      
      expect(result.error).toBe('Unauthorized')
      expect(prisma.candidate.create).not.toHaveBeenCalled()
    })

    it('should fail if rate limit exceeded', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockUser })
      // @ts-ignore
      checkRateLimit.mockResolvedValue(false)

      const result = await createCandidateAction(mockCandidateInput)

      expect(result.error).toBe('Too Many Requests')
      expect(prisma.candidate.create).not.toHaveBeenCalled()
    })

    it('should create candidate if authorized and valid', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockUser })
      // @ts-ignore
      checkRateLimit.mockResolvedValue(true)
      // @ts-ignore
      prisma.candidate.create.mockResolvedValue({ id: 'cand-1', ...mockCandidateInput })

      const result = await createCandidateAction(mockCandidateInput)

      expect(result.success).toBe(true)
      expect(prisma.candidate.create).toHaveBeenCalled()
    })

    it('should fail validation with invalid email', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockUser })
      // @ts-ignore
      checkRateLimit.mockResolvedValue(true)

      const invalidInput = { ...mockCandidateInput, email: 'not-an-email' }
      const result = await createCandidateAction(invalidInput)

      expect(result.validationErrors).toBeDefined()
      expect(result.validationErrors?.email).toBeDefined()
    })
  })

  describe('deleteCandidateAction', () => {
    it('should fail if user is not admin/recruiter', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockUser }) // USER role cannot delete
      // @ts-ignore
      checkRateLimit.mockResolvedValue(true)

      const result = await deleteCandidateAction('cand-1')

      expect(result.error).toBe('Forbidden: Insufficient permissions')
      expect(prisma.candidate.delete).not.toHaveBeenCalled()
    })

    it('should delete candidate if user is admin', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockAdmin })
      // @ts-ignore
      checkRateLimit.mockResolvedValue(true)
      // @ts-ignore
      prisma.candidate.delete.mockResolvedValue({ id: 'cand-1' })

      const result = await deleteCandidateAction('cand-1')

      expect(result.success).toBe(true)
      expect(prisma.candidate.delete).toHaveBeenCalledWith({ where: { id: 'cand-1' } })
    })
  })
})
