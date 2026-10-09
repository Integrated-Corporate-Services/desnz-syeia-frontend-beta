import { afterEach, describe, expect, it, vi } from 'vitest';

describe('manual reassignment runtime flag', () => {
    const originalEnv = window._env_;

    afterEach(() => {
        window._env_ = originalEnv;
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    it.each([
        [undefined, false],
        ['false', false],
        ['invalid', false],
        ['true', true],
        ['1', true],
    ])('resolves runtime value %s to %s', async (value, expected) => {
        vi.resetModules();
        vi.stubEnv('VITE_ENABLE_MANUAL_REASSIGNMENT', 'false');
        window._env_ = { MODE: 'development', VITE_ENABLE_MANUAL_REASSIGNMENT: value } as typeof window._env_;
        const { isManualReassignmentEnabled } = await import('./appConfig');
        expect(isManualReassignmentEnabled()).toBe(expected);
    });

    it('uses the Vite flag for local development when runtime config is absent', async () => {
        vi.resetModules();
        vi.stubEnv('VITE_ENABLE_MANUAL_REASSIGNMENT', 'true');
        window._env_ = undefined as unknown as typeof window._env_;
        const { isManualReassignmentEnabled } = await import('./appConfig');
        expect(isManualReassignmentEnabled()).toBe(true);
    });
});