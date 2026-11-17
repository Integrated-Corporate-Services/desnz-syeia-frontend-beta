import { describe, expect, it } from 'vitest';
import { applicationTypeFromPath, withdrawalContactEmail } from './withdrawalApplicationType';

describe('withdrawal application type', () => {
  it.each([
    ['/cpo/app/withdraw', 'CPO'],
    ['/nwl/app/withdrawal-confirmation', 'NWL'],
    ['/s-37/app/withdraw', 'S37'],
    ['/nwlx/app/withdraw', 'S37'],
  ])('reads %s as %s', (path, type) => expect(applicationTypeFromPath(path)).toBe(type));

  it.each([
    ['CPO', 'compulsorypurchaseorders@energysecurity.gov.uk'],
    ['nwl', 'necessarywayleaves@energysecurity.gov.uk'],
    ['S37', 'S37consents@energysecurity.gov.uk'],
    ['TL', 'S37consents@energysecurity.gov.uk'],
  ])('uses the %s team mailbox', (type, email) => expect(withdrawalContactEmail(type)).toBe(email));
});
