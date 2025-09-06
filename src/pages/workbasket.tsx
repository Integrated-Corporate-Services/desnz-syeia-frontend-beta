import React, { useEffect } from 'react';
import { useApplicationStore } from '../store/useApplicationStore';
import { useNavigate } from 'react-router-dom';
import { Button, H1, GridCol, GridRow, GlobalStyle } from "govuk-react";

const Workbasket = () => {
  const created_by = '44444444-4444-4444-4444-444444444444'; // get from auth/session
  const applications = useApplicationStore((state) => state.applications);
  const loadApplications = useApplicationStore((state) => state.loadApplications);
  const startApplication = useApplicationStore((state) => state.startApplication);
  const navigate = useNavigate();

  useEffect(() => {
    loadApplications(created_by);
  }, [created_by, loadApplications]);

  const handleStart = () => {
    // Just navigate, do not create a DB record yet
    navigate('/network-operator-details');
  };

  return (
    <main className="govuk-width-container">
      <GlobalStyle />
      <GridRow>
        <GridCol setWidth="two-thirds">
          <H1 className='govuk-heading-l'>Workbasket</H1>
        </GridCol>
        <GridCol setWidth="one-third" className="govuk-!-text-align-right">
          <Button onClick={handleStart}>
            Start new application
          </Button>
        </GridCol>
      </GridRow>
      {applications.length > 0 ? (
        <div>
          <h2>Your Draft Applications</h2>
          {applications
            .filter(app => app.status && app.status.toLowerCase() === 'draft')
            .map(app => (
              <div key={app.application_id}>
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    navigate(`/task-list?id=${app.application_id}`);
                  }}
                  style={{ color: '#1d70b8', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  {app.project_name || 'Untitled Draft'}
                </a>
                <span style={{ marginLeft: 8, color: '#666' }}>({app.status})</span>
              </div>
            ))}
        </div>
      ) : (
        <p>No applications found.</p>
      )}
    </main>
  );
};

export default Workbasket;