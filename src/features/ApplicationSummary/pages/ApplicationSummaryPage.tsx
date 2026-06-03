import React from 'react';
import { useLocation } from 'react-router-dom';
import { getApplicationTypeFromLocation } from '../utils';
import ReviewStyleApplicationSummary from './ReviewStyleApplicationSummary';
import LegacyApplicationSummary from './LegacyApplicationSummary';

const ApplicationSummaryPage: React.FC = () => {
    const location = useLocation();
    const applicationType = getApplicationTypeFromLocation(location);

    if (applicationType === 'NWL') {
        return <ReviewStyleApplicationSummary />;
    }

    return <LegacyApplicationSummary />;
};

export default ApplicationSummaryPage;
