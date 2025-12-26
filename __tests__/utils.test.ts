import { describe, it, expect } from 'vitest'
import { cn } from '../lib/utils'

describe('Utils', () => {
  describe('cn (classnames)', () => {
    it('should merge class names correctly', () => {
      expect(cn('c-1', 'c-2')).toBe('c-1 c-2')
    })

    it('should handle conditional classes', () => {
      expect(cn('c-1', true && 'c-2', false && 'c-3')).toBe('c-1 c-2')
    })

    it('should merge tailwind classes properly (override)', () => {
      // tailwind-merge should resolve conflicts. 
      // e.g., p-4 overrides p-2 if they are conflicting padding classes.
      expect(cn('p-2', 'p-4')).toBe('p-4')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('should handle arrays and objects if supported by clsx', () => {
      expect(cn(['a', 'b'])).toBe('a b')
      expect(cn({ 'a': true, 'b': false })).toBe('a')
    })
  })
})
