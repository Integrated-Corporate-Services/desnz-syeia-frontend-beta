import React from 'react';
import { useLocation } from 'react-router-dom';
import { getApplicationTypeFromLocation } from '../utils';
import ReviewApplicationSummary from './ReviewApplicationSummary';
import GenericApplicationSummary from './GenericApplicationSummary';

const ApplicationSummaryPage: React.FC = () => {
    const location = useLocation();
    const applicationType = getApplicationTypeFromLocation(location);

    if (applicationType === 'NWL') {
        return <ReviewApplicationSummary />;
    }

    return <GenericApplicationSummary />;
};

export default ApplicationSummaryPage;
