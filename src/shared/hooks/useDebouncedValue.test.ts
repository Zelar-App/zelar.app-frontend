import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('só propaga o valor depois do intervalo sem mudanças', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 500), { initialProps: { v: 'a' } })
    expect(result.current).toBe('a')
    rerender({ v: 'b' })
    act(() => void vi.advanceTimersByTime(300))
    expect(result.current).toBe('a')
    rerender({ v: 'c' })
    act(() => void vi.advanceTimersByTime(300))
    expect(result.current).toBe('a')
    act(() => void vi.advanceTimersByTime(200))
    expect(result.current).toBe('c')
  })
})
