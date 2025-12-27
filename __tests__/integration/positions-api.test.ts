import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { DELETE, PATCH } from '@/app/api/positions/[id]/route'
import { POST } from '@/app/api/positions/route'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    jobPosting: {
      findUnique: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    }
  }
}))

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(true),
}))

describe('Positions API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/positions', () => {
    it('should allow basic user to create a DRAFT', async () => {
      // Setup
      const mockSession = {
        user: { id: 'user-1', role: 'BASIC_USER' }
      };
      (auth as any).mockResolvedValue(mockSession);

      (prisma.jobPosting.create as any).mockResolvedValue({
        id: 'pos-new',
        status: 'DRAFT',
        jobTitle: 'New Job'
      })

      const body = {
        jobTitle: 'New Job',
        companyName: 'Acme Inc',
        location: 'Brussels',
        country: 'Belgium',
        seniorityLevel: 'Junior',
        status: 'DRAFT'
      }

      const req = new NextRequest('http://localhost:3000/api/positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const res = await POST(req)
      const data = await res.json()

      if (res.status === 400) {
        console.error("Validation Error:", JSON.stringify(data, null, 2))
      }

      expect(res.status).toBe(201)
      expect(data.status).toBe('DRAFT')
      expect(prisma.jobPosting.create).toHaveBeenCalled()
    })

    it('should force DRAFT status for basic user even if ACTIVE requested', async () => {
       // Setup
       const mockSession = {
        user: { id: 'user-1', role: 'BASIC_USER' }
      };
      (auth as any).mockResolvedValue(mockSession);

      (prisma.jobPosting.create as any).mockImplementation((args: any) => Promise.resolve({
        ...args.data,
        id: 'pos-new'
      }))

      const body = {
        jobTitle: 'New Job',
        companyName: 'Acme Inc',
        location: 'Brussels',
        country: 'Belgium',
        seniorityLevel: 'Junior',
        status: 'ACTIVE' // User tries to bypass
      }

      const req = new NextRequest('http://localhost:3000/api/positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const res = await POST(req)
      const data = await res.json()

      if (res.status === 400) {
        throw new Error("Validation Error (Test 2): " + JSON.stringify(data, null, 2))
      }

      expect(res.status).toBe(201)
      // The API logic forces DRAFT if not admin
      expect(data.status).toBe('DRAFT') 
    })
  })

  describe('PATCH /api/positions/[id]', () => {
    it('should allow gatekeeper to approve a position', async () => {
      // Setup
      const mockSession = {
        user: { id: 'gatekeeper-1', role: 'USER', isGatekeeper: true }
      };
      (auth as any).mockResolvedValue(mockSession);
      
      // Mock user lookup for gatekeeper check inside PATCH
      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'gatekeeper-1',
        role: 'USER',
        isGatekeeper: true
      })

      const mockPosition = {
        id: 'pos-1',
        creatorId: 'user-2',
        status: 'PENDING_APPROVAL'
      };
      (prisma.jobPosting.findUnique as any).mockResolvedValue(mockPosition);

      (prisma.jobPosting.update as any).mockResolvedValue({
        id: 'pos-1',
        status: 'CAMPAIGN_SENT'
      })

      const body = { status: 'CAMPAIGN_SENT' }
      const req = new NextRequest('http://localhost:3000/api/positions/pos-1', {
        method: 'PATCH',
        body: JSON.stringify(body)
      })
      const params = Promise.resolve({ id: 'pos-1' })

      const res = await PATCH(req, { params })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.status).toBe('CAMPAIGN_SENT')
    })

    it('should prevent basic user from approving position', async () => {
      // Setup
      const mockSession = {
        user: { id: 'user-1', role: 'BASIC_USER', isGatekeeper: false }
      };
      (auth as any).mockResolvedValue(mockSession);
      
      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'user-1',
        role: 'BASIC_USER',
        isGatekeeper: false
      })

      const mockPosition = {
        id: 'pos-1',
        creatorId: 'user-1',
        status: 'PENDING_APPROVAL'
      };
      (prisma.jobPosting.findUnique as any).mockResolvedValue(mockPosition);

      const body = { status: 'CAMPAIGN_SENT' }
      const req = new NextRequest('http://localhost:3000/api/positions/pos-1', {
        method: 'PATCH',
        body: JSON.stringify(body)
      })
      const params = Promise.resolve({ id: 'pos-1' })

      const res = await PATCH(req, { params })
      
      expect(res.status).toBe(403)
      expect(prisma.jobPosting.update).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /api/positions/[id]', () => {
    it('should allow creator to delete their own position', async () => {
      // Setup
      const mockSession = {
        user: { id: 'user-1', role: 'BASIC_USER' }
      };
      (auth as any).mockResolvedValue(mockSession)

      const mockPosition = {
        id: 'pos-1',
        creatorId: 'user-1',
        status: 'DRAFT'
      };
      (prisma.jobPosting.findUnique as any).mockResolvedValue(mockPosition)

      // Test
      const req = new NextRequest('http://localhost:3000/api/positions/pos-1')
      const params = Promise.resolve({ id: 'pos-1' })
      const res = await DELETE(req, { params })

      // Assertions
      expect(res.status).toBe(200)
      expect(prisma.jobPosting.delete).toHaveBeenCalledWith({
        where: { id: 'pos-1' }
      })
    })

    it('should deny non-creator basic user', async () => {
      // Setup
      const mockSession = {
        user: { id: 'user-2', role: 'BASIC_USER' }
      };
      (auth as any).mockResolvedValue(mockSession)

      const mockPosition = {
        id: 'pos-1',
        creatorId: 'user-1', // Different owner
        status: 'DRAFT'
      };
      (prisma.jobPosting.findUnique as any).mockResolvedValue(mockPosition)

      // Test
      const req = new NextRequest('http://localhost:3000/api/positions/pos-1')
      const params = Promise.resolve({ id: 'pos-1' })
      const res = await DELETE(req, { params })

      // Assertions
      expect(res.status).toBe(403)
      expect(prisma.jobPosting.delete).not.toHaveBeenCalled()
    })

    it('should allow admin to delete any position', async () => {
        // Setup
        const mockSession = {
          user: { id: 'admin-1', role: 'ADMIN' }
        };
        (auth as any).mockResolvedValue(mockSession)
  
        const mockPosition = {
          id: 'pos-1',
          creatorId: 'user-1',
          status: 'DRAFT'
        };
        (prisma.jobPosting.findUnique as any).mockResolvedValue(mockPosition)
  
        // Test
        const req = new NextRequest('http://localhost:3000/api/positions/pos-1')
        const params = Promise.resolve({ id: 'pos-1' })
        const res = await DELETE(req, { params })
  
        // Assertions
        expect(res.status).toBe(200)
        expect(prisma.jobPosting.delete).toHaveBeenCalledWith({
          where: { id: 'pos-1' }
        })
      })
  })
})
