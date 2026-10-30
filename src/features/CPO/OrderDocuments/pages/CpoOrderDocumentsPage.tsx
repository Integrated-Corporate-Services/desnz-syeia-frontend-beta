import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import CpoOrderDocumentsOrderPage from './CpoOrderDocumentsOrderPage';
import CpoOrderDocumentsReasonsPage from './CpoOrderDocumentsReasonsPage';
import CpoOrderDocumentsAdditionalPage from './CpoOrderDocumentsAdditionalPage';
import CpoOrderDocumentsCheckPage from './CpoOrderDocumentsCheckPage';

const CpoOrderDocumentsPage: React.FC = () => {
  const { documentStep } = useParams();
  const location = useLocation();
  const legacyRequirements = location.pathname.endsWith('/order-documents');
  const resolved = legacyRequirements ? 'order' : (documentStep ?? 'order');

  switch (resolved) {
    case 'reasons':
      return <CpoOrderDocumentsReasonsPage />;
    case 'additional':
      return <CpoOrderDocumentsAdditionalPage />;
    case 'check':
      return <CpoOrderDocumentsCheckPage />;
    case 'order':
    case 'maps':
    default:
      return <CpoOrderDocumentsOrderPage />;
  }
};

export default CpoOrderDocumentsPage;
