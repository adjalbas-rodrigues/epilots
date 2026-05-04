import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ApiError } from '@/lib/api';
import { useFeatureGate } from './useFeatureGate';

describe('useFeatureGate', () => {
  it('starts with no gate', () => {
    const { result } = renderHook(() => useFeatureGate());
    expect(result.current.gate).toBeNull();
  });

  it('captures SUBSCRIPTION_REQUIRED from ApiError', () => {
    const { result } = renderHook(() => useFeatureGate());
    const err = new ApiError('Sub required', { status: 402, code: 'SUBSCRIPTION_REQUIRED', data: {} });
    act(() => { result.current.handleError(err); });
    expect(result.current.gate).toEqual({ reason: 'SUBSCRIPTION_REQUIRED' });
  });

  it('captures FEATURE_NOT_IN_PLAN with plan + feature', () => {
    const { result } = renderHook(() => useFeatureGate());
    const err = new ApiError('Feature missing', {
      status: 403,
      code: 'FEATURE_NOT_IN_PLAN',
      data: { plan: 'questoes', required: 'access_videos' }
    });
    act(() => { result.current.handleError(err); });
    expect(result.current.gate).toEqual({
      reason: 'FEATURE_NOT_IN_PLAN',
      currentPlan: 'questoes',
      feature: 'access_videos'
    });
  });

  it('returns false from handleError for non-gate errors', () => {
    const { result } = renderHook(() => useFeatureGate());
    const err = new ApiError('Server explosion', { status: 500 });
    let handled: boolean = true;
    act(() => { handled = result.current.handleError(err); });
    expect(handled).toBe(false);
    expect(result.current.gate).toBeNull();
  });

  it('returns true from handleError when gate captured', () => {
    const { result } = renderHook(() => useFeatureGate());
    const err = new ApiError('x', { status: 402, code: 'SUBSCRIPTION_REQUIRED' });
    let handled: boolean = false;
    act(() => { handled = result.current.handleError(err); });
    expect(handled).toBe(true);
  });

  it('clearGate resets state', () => {
    const { result } = renderHook(() => useFeatureGate());
    const err = new ApiError('x', { status: 402, code: 'SUBSCRIPTION_REQUIRED' });
    act(() => { result.current.handleError(err); });
    act(() => { result.current.clearGate(); });
    expect(result.current.gate).toBeNull();
  });
});
