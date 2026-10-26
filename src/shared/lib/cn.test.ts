import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('junta classes ignorando falsy', () => {
    expect(cn('a', false, undefined, null, 'b', 0, 'd')).toBe('a b d')
  })
})
