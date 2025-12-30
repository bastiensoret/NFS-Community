import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPositionAction, deletePositionAction, updatePositionAction } from '@/app/actions/positions'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { checkRateLimit } from '@/lib/rate-limit'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
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

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Positions Server Actions', () => {
  const mockUser = { id: 'user-1', role: 'USER' }
  const mockAdmin = { id: 'admin-1', role: 'ADMIN' }
  const mockPosting = {
    jobTitle: 'Software Engineer',
    companyName: 'Tech Corp',
    location: 'Brussels',
    country: 'Belgium',
    seniorityLevel: 'Senior',
    industrySector: 'IT',
    description: 'Great role',
    status: 'ACTIVE',
    remoteAllowed: true,
    onSiteDays: 2,
    minSalary: 50000,
    maxSalary: 70000,
    currency: 'EUR',
    contactName: 'John Doe',
    contactEmail: 'john@techcorp.com',
    contactPhone: '+3212345678',
    responsibilities: ['Coding', 'Testing'],
    skills: ['React', 'Node.js'],
    languageRequirements: [
      { language: 'English', level: 'Native', mandatory: true }
    ]
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
      expect(prisma.jobPosting.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          jobTitle: mockPosting.jobTitle,
          status: 'DRAFT',
          creatorId: mockUser.id,
          reference: expect.stringMatching(/^POS-\d{8}-\d{3}$/)
        })
      }))
    })

    it('should allow ADMIN to create ACTIVE position', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockAdmin })
      // @ts-ignore
      checkRateLimit.mockResolvedValue(true)
      // @ts-ignore
      prisma.jobPosting.create.mockResolvedValue({ id: 'pos-1', ...mockPosting, status: 'ACTIVE', creatorId: mockAdmin.id })

      const result = await createPositionAction(mockPosting as any)

      expect(result.success).toBe(true)
      expect(prisma.jobPosting.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          status: 'ACTIVE',
          creatorId: mockAdmin.id
        })
      }))
    })

    it('should handle language requirements correctly', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockAdmin })
      // @ts-ignore
      checkRateLimit.mockResolvedValue(true)
      // @ts-ignore
      prisma.jobPosting.create.mockResolvedValue({ id: 'pos-1', ...mockPosting })
      
      await createPositionAction(mockPosting as any)

      expect(prisma.jobPosting.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          languageRequirements: {
            create: [
              { language: 'English', level: 'Native', mandatory: true }
            ]
          }
        })
      }))
    })

    it('should fail validation with missing fields', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockUser })
      // @ts-ignore
      checkRateLimit.mockResolvedValue(true)

      const invalidInput = { jobTitle: '' }
      const result = await createPositionAction(invalidInput as any)

      expect(result.validationErrors).toBeDefined()
    })
  })

  describe('updatePositionAction', () => {
    it('should allow creator to update DRAFT position', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockUser })
      // @ts-ignore
      checkRateLimit.mockResolvedValue(true)
      // @ts-ignore
      prisma.jobPosting.findUnique.mockResolvedValue({ id: 'pos-1', creatorId: mockUser.id, status: 'DRAFT' })
      // @ts-ignore
      prisma.user.findUnique.mockResolvedValue(mockUser)
      // @ts-ignore
      prisma.jobPosting.update.mockResolvedValue({ id: 'pos-1', ...mockPosting, jobTitle: 'Updated Title' })

      const result = await updatePositionAction('pos-1', { jobTitle: 'Updated Title' })

      expect(result.success).toBe(true)
      expect(prisma.jobPosting.update).toHaveBeenCalled()
    })

    it('should deny USER from updating someone else\'s position', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: { id: 'other-user', role: 'USER' } })
      // @ts-ignore
      checkRateLimit.mockResolvedValue(true)
      // @ts-ignore
      prisma.jobPosting.findUnique.mockResolvedValue({ id: 'pos-1', creatorId: mockUser.id, status: 'DRAFT' })
      // @ts-ignore
      prisma.user.findUnique.mockResolvedValue({ id: 'other-user', role: 'USER' })

      const result = await updatePositionAction('pos-1', { jobTitle: 'Hacked Title' })

      expect(result.error).toBe('Unauthorized')
    })

    it('should allow ADMIN to update any position', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockAdmin })
      // @ts-ignore
      checkRateLimit.mockResolvedValue(true)
      // @ts-ignore
      prisma.jobPosting.findUnique.mockResolvedValue({ id: 'pos-1', creatorId: mockUser.id, status: 'ACTIVE' })
      // @ts-ignore
      prisma.user.findUnique.mockResolvedValue(mockAdmin)
      // @ts-ignore
      prisma.jobPosting.update.mockResolvedValue({ id: 'pos-1', ...mockPosting, jobTitle: 'Admin Edit' })

      const result = await updatePositionAction('pos-1', { jobTitle: 'Admin Edit' })

      expect(result.success).toBe(true)
    })
  })

  describe('deletePositionAction', () => {
    it('should allow creator to delete', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockUser })
      // @ts-ignore
      checkRateLimit.mockResolvedValue(true)
      // @ts-ignore
      prisma.jobPosting.findUnique.mockResolvedValue({ id: 'pos-1', creatorId: mockUser.id, status: 'DRAFT' })
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
      prisma.jobPosting.findUnique.mockResolvedValue({ id: 'pos-1', creatorId: mockUser.id, status: 'DRAFT' })

      const result = await deletePositionAction('pos-1')

      expect(result.error).toBe('Unauthorized')
      expect(prisma.jobPosting.delete).not.toHaveBeenCalled()
    })
  })
})
