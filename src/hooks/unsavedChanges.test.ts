import { renderHook, act } from '@testing-library/react';
import { useUnsavedChanges, getUnsavedChanges, resetUnsavedChanges } from './useUnsavedChanges';

describe('useUnsavedChanges hook', () => {
  it('sets global flag when dirty is true', () => {
    const { rerender } = renderHook(({ dirty }) => useUnsavedChanges(dirty), {
      initialProps: { dirty: false },
    });
    // initially false
    expect(getUnsavedChanges()).toBe(false);
    // set dirty true
    rerender({ dirty: true });
    expect(getUnsavedChanges()).toBe(true);
  });

  it('resets flag on unmount', () => {
    const { unmount } = renderHook(() => useUnsavedChanges(true));
    expect(getUnsavedChanges()).toBe(true);
    unmount();
    expect(getUnsavedChanges()).toBe(false);
  });

  it('resetUnsavedChanges manually clears flag', () => {
    const { rerender } = renderHook(({ dirty }) => useUnsavedChanges(dirty), {
      initialProps: { dirty: true },
    });
    expect(getUnsavedChanges()).toBe(true);
    act(() => {
      resetUnsavedChanges();
    });
    expect(getUnsavedChanges()).toBe(false);
  });
});
