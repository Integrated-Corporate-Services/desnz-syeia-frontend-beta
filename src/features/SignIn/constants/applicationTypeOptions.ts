export interface ApplicationTypeOption {
  value: string;
  label: string;
  id: string;
}

export const APPLICATION_TYPE_OPTIONS: ApplicationTypeOption[] = [
  {
    value: 'section37',
    label: 'Overhead electric lines (Section 37)',
    id: 'applicationType',
  },
  {
    value: 'wayleaves',
    label: 'Necessary wayleaves',
    id: 'applicationType-2',
  },
  // {
  //   value: 'treefelling',
  //   label: 'Tree felling or lopping',
  //   id: 'applicationType-3',
  // },
];

export const ROUTES = {
  section37: '/s-37/who-is-applying',
  wayleaves: '/nwl/who-is-applying',
} as const;
