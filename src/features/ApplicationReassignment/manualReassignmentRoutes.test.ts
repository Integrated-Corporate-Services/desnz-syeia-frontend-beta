import { afterEach, describe, expect, it, vi } from 'vitest';

const { flag } = vi.hoisted(() => ({ flag: { enabled: false } }));
vi.mock('../../config/appConfig', async (importOriginal) => ({
    ...await importOriginal<typeof import('../../config/appConfig')>(),
    isManualReassignmentEnabled: () => flag.enabled,
}));

describe('manual reassignment route registration', () => {
    afterEach(() => vi.resetModules());

    it.each([false, true])('registers S37/NWL routes only when enabled (%s)', async (enabled) => {
        flag.enabled = enabled;
        const { ROUTE_CONFIG } = await import('../../constants/routes');
        const { nwlApplicationSummaryRoutes } = await import('../NWL/routes');
        for (const routes of [ROUTE_CONFIG, nwlApplicationSummaryRoutes]) {
            expect(routes.some((route) => route.path.endsWith('/reassign'))).toBe(enabled);
            expect(routes.some((route) => route.path.endsWith('/reassignment-history'))).toBe(enabled);
            expect(routes.some((route) => route.path.endsWith('/application-summary'))).toBe(true);
        }
    }, 30000);
});