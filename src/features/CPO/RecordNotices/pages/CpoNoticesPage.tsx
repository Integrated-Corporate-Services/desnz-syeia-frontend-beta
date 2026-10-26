import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import CpoNoticeRequirementsPage from './CpoNoticeRequirementsPage';
import CpoNoticeInspectionPage from './CpoNoticeInspectionPage';
import CpoNoticeInspectionAddressPage from './CpoNoticeInspectionAddressPage';
import CpoNoticeInspectionDatePage from './CpoNoticeInspectionDatePage';
import CpoNoticeOnlinePage from './CpoNoticeOnlinePage';
import CpoNoticeWebsitePage from './CpoNoticeWebsitePage';
import CpoNoticeNewspapersPage from './CpoNoticeNewspapersPage';
import CpoNoticeSitePage from './CpoNoticeSitePage';
import CpoNoticePeoplePage from './CpoNoticePeoplePage';
import CpoNoticeCheckPage from './CpoNoticeCheckPage';

const CpoNoticesPage: React.FC = () => {
  const { noticeStep } = useParams();
  const location = useLocation();
  const legacyRequirements = location.pathname.endsWith('/notice-requirements');
  const resolved = legacyRequirements ? 'requirements' : (noticeStep ?? 'requirements');

  switch (resolved) {
    case 'inspection':
      return <CpoNoticeInspectionPage />;
    case 'inspection-address':
      return <CpoNoticeInspectionAddressPage />;
    case 'inspection-date':
      return <CpoNoticeInspectionDatePage />;
    case 'online':
      return <CpoNoticeOnlinePage />;
    case 'website':
      return <CpoNoticeWebsitePage />;
    case 'newspapers':
      return <CpoNoticeNewspapersPage />;
    case 'site':
      return <CpoNoticeSitePage />;
    case 'people':
      return <CpoNoticePeoplePage />;
    case 'check':
      return <CpoNoticeCheckPage />;
    case 'requirements':
    default:
      return <CpoNoticeRequirementsPage />;
  }
};

export default CpoNoticesPage;
