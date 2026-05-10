export interface PrivacySection {
  id: string;
  title: string;
  content: (string | ListContent | ContactContent)[];
}

export interface ListContent {
  type: 'list';
  items: string[];
}

export interface ContactContent {
  type: 'contact';
  data: ContactInfo;
}

export interface ContactInfo {
  name: string;
  email?: string;
  address?: string[];
  phone?: string;
  openingHours?: string;
}

export interface PrivacyNoticeConfig {
  serviceName: string;
  organisation: string;
  organisationAcronym: string;
  dataController: string;
  dpoContact: ContactInfo;
  privacyTeamContact: ContactInfo;
  icoContact: ContactInfo;
  lastUpdated: string;
  sections: PrivacySection[];
}
