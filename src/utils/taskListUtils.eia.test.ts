import { describe, expect, it } from 'vitest';
import { applyTaskDependencies, getInitialSections } from './taskListUtils';

const done = (name: string) => ({ subsection_name: name, status: 'Completed' });
const LOCATION_AND_BEFORE = ['Applicant details', 'Check applicant contact details', 'Project overview', 'Assets', 'Works overview', 'Route', 'Sensitive area checks', 'Sensitive area review', 'Parishes'].map(done);
const consultationsItem = (progress: { subsection_name: string; status: string }[]) => {
  const sections = getInitialSections('app-1').map((section) => ({
    ...section,
    items: section.items.map((item) => ({ ...item, status: progress.find((p) => p.subsection_name === item.name)?.status ?? item.status })),
  }));
  return applyTaskDependencies(sections, progress).find((s) => s.title === 'Consultations')!.items.find((i) => i.name === 'Consultations')!;
};

describe('Consultations gating on the EIA report (SYEIA-1485)', () => {
  it('cannot start while EIA fees is in progress (full EIA with no report)', () => {
    const item = consultationsItem([...LOCATION_AND_BEFORE, { subsection_name: 'EIA fees', status: 'In progress' }]);
    expect(item.status).toBe('Cannot start yet');
    expect(item.disabled).toBe(true);
  });

  it('can start once EIA fees is completed', () => {
    const item = consultationsItem([...LOCATION_AND_BEFORE, done('EIA fees')]);
    expect(item.status).toBe('Not completed');
    expect(item.disabled).toBeFalsy();
  });

  it('keeps the existing rule when EIA has not been answered', () => {
    expect(consultationsItem(LOCATION_AND_BEFORE).disabled).toBeFalsy();
  });

  it('does not block consultations that are already under way', () => {
    const item = consultationsItem([...LOCATION_AND_BEFORE, { subsection_name: 'EIA fees', status: 'In progress' }, { subsection_name: 'Consultations', status: 'In progress' }]);
    expect(item.status).toBe('In progress');
    expect(item.disabled).toBeFalsy();
  });
});
