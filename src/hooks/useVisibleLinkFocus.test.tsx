import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useVisibleLinkFocus } from './useVisibleLinkFocus';

describe('useVisibleLinkFocus', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
  });

  it('moves a keyboard-focused link out of the bottom browser overlay area', () => {
    const scrollBy = vi.fn();
    vi.stubGlobal('scrollBy', scrollBy);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => callback(0));
    const link = document.createElement('a');
    link.href = '/task-list';
    link.textContent = 'Task list';
    document.body.appendChild(link);
    vi.spyOn(link, 'matches').mockReturnValue(true);
    vi.spyOn(link, 'getBoundingClientRect').mockReturnValue({ bottom: window.innerHeight - 20 } as DOMRect);

    const { unmount } = renderHook(() => useVisibleLinkFocus());
    link.focus();

    expect(scrollBy).toHaveBeenCalledWith({ top: 100, behavior: 'instant' });
    unmount();
  });

  it('does not scroll links that are clear of the viewport edge or pointer-focused', () => {
    const scrollBy = vi.fn();
    vi.stubGlobal('scrollBy', scrollBy);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => callback(0));
    const link = document.createElement('a');
    link.href = '/application-dashboard';
    document.body.appendChild(link);
    const matches = vi.spyOn(link, 'matches').mockReturnValue(true);
    vi.spyOn(link, 'getBoundingClientRect').mockReturnValue({ bottom: window.innerHeight - 150 } as DOMRect);

    const { unmount } = renderHook(() => useVisibleLinkFocus());
    link.focus();
    expect(scrollBy).not.toHaveBeenCalled();

    matches.mockReturnValue(false);
    link.blur();
    link.focus();
    expect(scrollBy).not.toHaveBeenCalled();
    unmount();
  });
});