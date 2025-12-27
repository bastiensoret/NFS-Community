// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateProfile, changePassword } from '../../app/actions/profile'
import { prisma } from '../../lib/prisma'
import { auth } from '../../auth'
import bcrypt from 'bcryptjs'

// Mock dependencies
vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('../../auth', () => ({
  auth: vi.fn(),
}))

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock fs/promises for file upload
vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
}))

describe('Profile Server Actions', () => {
  const mockUser = { id: 'user-1' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateProfile', () => {
    it('should update profile with valid data', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockUser })
      // @ts-ignore
      prisma.user.update.mockResolvedValue({ id: 'user-1', firstName: 'John', lastName: 'Doe' })

      const formData = new FormData()
      formData.append('firstName', 'John')
      formData.append('lastName', 'Doe')

      const result = await updateProfile({}, formData)

      expect(result.success).toBe(true)
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: expect.objectContaining({ firstName: 'John', lastName: 'Doe' })
      })
    })

    it('should fail validation with missing name', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockUser })

      const formData = new FormData()
      formData.append('firstName', '') // Empty

      const result = await updateProfile({}, formData)

      expect(result.error).toBe('Validation failed')
      expect(result.fieldErrors).toBeDefined()
    })
  })

  describe('changePassword', () => {
    it('should change password if current password is correct', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockUser })
      // @ts-ignore
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', password: 'hashed-old-password' })
      // @ts-ignore
      bcrypt.compare.mockResolvedValue(true)
      // @ts-ignore
      bcrypt.hash.mockResolvedValue('hashed-new-password')

      const formData = new FormData()
      formData.append('currentPassword', 'oldPassword123')
      formData.append('newPassword', 'newPassword123')
      formData.append('confirmPassword', 'newPassword123')

      const result = await changePassword({}, formData)

      expect(result.success).toBe(true)
      expect(prisma.user.update).toHaveBeenCalled()
    })

    it('should fail if current password is incorrect', async () => {
      // @ts-ignore
      auth.mockResolvedValue({ user: mockUser })
      // @ts-ignore
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', password: 'hashed-old-password' })
      // @ts-ignore
      bcrypt.compare.mockResolvedValue(false)

      const formData = new FormData()
      formData.append('currentPassword', 'wrongPassword')
      formData.append('newPassword', 'newPassword123')
      formData.append('confirmPassword', 'newPassword123')

      const result = await changePassword({}, formData)

      expect(result.error).toBe('Validation failed')
      expect(result.fieldErrors?.currentPassword).toBeDefined()
    })
  })
})
