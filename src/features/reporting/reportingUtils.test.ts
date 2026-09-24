import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadOrganisationCsv, getPresetDates } from "./reportingUtils";
import type { OrganisationReportRow } from "./types";

// This project's tsconfig deliberately has no Node types (it's a browser app), so `process`
// isn't a declared global - go through globalThis instead of referencing the bare identifier,
// which would fail `tsc -b` with "Cannot find name 'process'" even though it resolves fine
// at runtime under Vitest/Node.
const nodeProcess = (globalThis as { process?: { env: Record<string, string | undefined> } }).process!;

describe("getPresetDates", () => {
  const originalTz = nodeProcess.env.TZ;

  afterEach(() => {
    vi.useRealTimers();
    // Assigning undefined to an env var stores the string "undefined", so delete it when it was unset.
    if (originalTz === undefined) delete nodeProcess.env.TZ;
    else nodeProcess.env.TZ = originalTz;
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

// jsdom's Blob has no .text()/.arrayBuffer() - read it back via FileReader instead, which
// jsdom does implement against its own Blob objects.
const readBlobAsText = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });

describe("downloadOrganisationCsv", () => {
  let capturedBlob: Blob | undefined;
  // jsdom does not provide these; vi.spyOn throws unless the methods exist first.
  const hadCreateObjectURL = typeof URL.createObjectURL === "function";
  const hadRevokeObjectURL = typeof URL.revokeObjectURL === "function";

  beforeEach(() => {
    capturedBlob = undefined;
    if (!hadCreateObjectURL) {
      Object.defineProperty(URL, "createObjectURL", { configurable: true, writable: true, value: () => "" });
    }
    if (!hadRevokeObjectURL) {
      Object.defineProperty(URL, "revokeObjectURL", { configurable: true, writable: true, value: () => undefined });
    }
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob: unknown) => {
      capturedBlob = blob as Blob;
      return "blob:mock";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (!hadCreateObjectURL) delete (URL as { createObjectURL?: unknown }).createObjectURL;
    if (!hadRevokeObjectURL) delete (URL as { revokeObjectURL?: unknown }).revokeObjectURL;
  });

  it("writes one column per heading, defaulting missing role-split fields (older/snapshot rows) to 0", async () => {
    const row: OrganisationReportRow = {
      organisationName: "National Grid Electricity Distribution",
      s37Draft: 1,
      s37Submitted: 2,
      nwlDraft: 10,
      nwlSubmitted: 3,
      accessRequests: 4,
      pendingRequests: 1,
      applicantRequests: 4,
      // agentRequests / applicantPendingRequests / agentPendingRequests deliberately omitted.
    };

    downloadOrganisationCsv([row], "2026-09-11", "2026-09-11");

    expect(capturedBlob).toBeDefined();
    const [headingLine, dataLine] = (await readBlobAsText(capturedBlob!)).split("\n");
    expect(headingLine).toBe(
      '"Organisation","S37 drafts","S37 submitted","NWL drafts","NWL submitted","Access requests","Pending requests","Applicant requests","Agent requests","Applicant pending","Agent pending"'
    );
    expect(dataLine).toBe('"National Grid Electricity Distribution","1","2","10","3","4","1","4","0","0","0"');
  });
});
