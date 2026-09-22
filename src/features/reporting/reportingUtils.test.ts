import { afterEach, describe, expect, it, vi } from "vitest";
import { getPresetDates } from "./reportingUtils";

// This project's tsconfig deliberately has no Node types (it's a browser app), so `process`
// isn't a declared global - go through globalThis instead of referencing the bare identifier,
// which would fail `tsc -b` with "Cannot find name 'process'" even though it resolves fine
// at runtime under Vitest/Node.
const nodeProcess = (globalThis as { process?: { env: Record<string, string | undefined> } }).process!;

describe("getPresetDates", () => {
  const originalTz = nodeProcess.env.TZ;

  afterEach(() => {
    vi.useRealTimers();
    nodeProcess.env.TZ = originalTz;
  });

  it('resolves "today" to the local calendar day, not the UTC one, just after local midnight in BST', () => {
    // 2026-06-20T23:30:00Z is 2026-06-21T00:30:00 in Europe/London (BST, UTC+1) - a naive
    // toISOString()-based read of "now" would report 20 June, one day behind the local date
    // the user actually sees on their clock.
    nodeProcess.env.TZ = "Europe/London";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-20T23:30:00.000Z"));

    const { startDate, endDate } = getPresetDates("today");
    expect(startDate).toBe("2026-06-21");
    expect(endDate).toBe("2026-06-21");
  });

  it('keeps "yesterday" one full local day behind "today", not shifted by the UTC boundary', () => {
    nodeProcess.env.TZ = "Europe/London";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-20T23:30:00.000Z")); // 21 June, 00:30 local (BST)

    const today = getPresetDates("today");
    const yesterday = getPresetDates("yesterday");
    expect(today.startDate).toBe("2026-06-21");
    expect(yesterday.startDate).toBe("2026-06-20");
    expect(yesterday.endDate).toBe("2026-06-20");
  });

  it('matches the UTC calendar day outside BST, where local time equals UTC (GMT)', () => {
    nodeProcess.env.TZ = "Europe/London";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-05T10:00:00.000Z")); // GMT, no DST offset

    const { startDate, endDate } = getPresetDates("today");
    expect(startDate).toBe("2026-01-05");
    expect(endDate).toBe("2026-01-05");
  });
});
