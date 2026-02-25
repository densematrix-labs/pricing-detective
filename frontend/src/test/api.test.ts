import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyzePricing, getTrialStatus } from '../lib/api'

describe('API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  describe('analyzePricing', () => {
    it('handles successful response', async () => {
      const mockResult = {
        tool_name: 'Test',
        overall_score: 80,
        verdict: 'Good',
        issues: [],
        tiers: [],
        summary: '',
        recommendations: [],
      }
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })
      
      const result = await analyzePricing('test content '.repeat(10), 'Test', 'en')
      expect(result.tool_name).toBe('Test')
      expect(result.overall_score).toBe(80)
    })
    
    it('handles string error detail', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: 'Something went wrong' }),
      })
      
      await expect(analyzePricing('test content '.repeat(10), 'Test', 'en'))
        .rejects.toThrow('Something went wrong')
    })
    
    it('handles object error detail with error field', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 402,
        json: () => Promise.resolve({
          detail: { error: 'No tokens remaining', code: 'payment_required' },
        }),
      })
      
      // Should NOT throw [object Object]
      try {
        await analyzePricing('test content '.repeat(10), 'Test', 'en')
      } catch (e) {
        expect((e as Error).message).toBe('No tokens remaining')
        expect((e as Error).message).not.toContain('[object Object]')
      }
    })
    
    it('handles object error detail with message field', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          detail: { message: 'Invalid input format' },
        }),
      })
      
      await expect(analyzePricing('test content '.repeat(10), 'Test', 'en'))
        .rejects.toThrow('Invalid input format')
    })
    
    it('handles empty error detail', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: {} }),
      })
      
      await expect(analyzePricing('test content '.repeat(10), 'Test', 'en'))
        .rejects.toThrow('Analysis failed')
    })
  })
  
  describe('getTrialStatus', () => {
    it('returns trial status', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ used: 1, remaining: 2, limit: 3 }),
      })
      
      const status = await getTrialStatus()
      expect(status.used).toBe(1)
      expect(status.remaining).toBe(2)
    })
    
    it('throws on error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      })
      
      await expect(getTrialStatus()).rejects.toThrow()
    })
  })
})
