import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useApprovedDomains } from '../../../hooks';
import { Domain } from '../../../types/organisation';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import SkipLink from '../../../components/SkipLink';

const ApprovedEmailDomainsPage: React.FC = () => {
  const { organisationId } = useParams<{ organisationId: string }>();
  const navigate = useNavigate();
  
  const { domains: fetchedDomains, loading, error, updateDomains } = useApprovedDomains(organisationId);
  
  const [currentDomains, setCurrentDomains] = useState<Domain[]>([]);
  const [newDomains, setNewDomains] = useState<Domain[]>([]);
  const [domainInput, setDomainInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>('');

  // Initialize domains from fetched data
  useEffect(() => {
    if (fetchedDomains.length > 0) {
      const mapped = fetchedDomains.map((domain, index) => ({
        id: `existing-${index}`,
        domain
      }));
      setCurrentDomains(mapped);
    }
  }, [fetchedDomains]);

  const handleAddDomain = () => {
    if (domainInput.trim()) {
      const newDomain = {
        id: Date.now().toString(),
        domain: domainInput.startsWith('@') ? domainInput : `@${domainInput}`
      };
      setNewDomains([...newDomains, newDomain]);
      setDomainInput('');
    }
  };

  const handleDeleteCurrentDomain = (id: string) => {
    setCurrentDomains(currentDomains.filter(d => d.id !== id));
  };

  const handleDeleteNewDomain = (id: string) => {
    setNewDomains(newDomains.filter(d => d.id !== id));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError('');
      
      // Combine current and new domains
      const allDomains = [
        ...currentDomains.map(d => d.domain),
        ...newDomains.map(d => d.domain)
      ];
      
      await updateDomains(allDomains);
      
      // Navigate back to settings page
      navigate(`/admin/organisation/${organisationId}/settings`);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save approved domains');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <SkipLink />
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <LoadingSkeleton type="summary" />
          </main>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SkipLink />
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <Link to={`/admin/organisation/${organisationId}/settings`} className="govuk-back-link">
                  Back
                </Link>
                <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
                  <h2 className="govuk-error-summary__title" id="error-summary-title">
                    There is a problem
                  </h2>
                  <div className="govuk-error-summary__body">
                    <p className="govuk-body">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <Link to={`/admin/organisation/${organisationId}/settings`} className="govuk-back-link">
              Back
            </Link>

            <h1 className="govuk-heading-l govuk-!-margin-top-6">Approved email domains</h1>

            {saveError && (
              <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
                <h2 className="govuk-error-summary__title" id="error-summary-title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <p className="govuk-body">{saveError}</p>
                </div>
              </div>
            )}

            <p className="govuk-body">
              Users can only request access using email addresses from these domains.
            </p>

            <h2 className="govuk-heading-s govuk-!-margin-top-6">Current approved domains</h2>

            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header" style={{ width: '70%' }}>
                    Current approved domains
                  </th>
                  <th scope="col" className="govuk-table__header">Action</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {currentDomains.map((domain) => (
                  <tr key={domain.id} className="govuk-table__row">
                    <td className="govuk-table__cell">{domain.domain}</td>
                    <td className="govuk-table__cell">
                      <a
                        href="#"
                        className="govuk-link"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteCurrentDomain(domain.id);
                        }}
                      >
                        Delete
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {newDomains.length > 0 && (
              <>
                <h2 className="govuk-heading-s govuk-!-margin-top-6">New domains</h2>
                <table className="govuk-table">
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="col" className="govuk-table__header" style={{ width: '70%' }}>
                        New domains
                      </th>
                      <th scope="col" className="govuk-table__header">Action</th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    {newDomains.map((domain) => (
                      <tr key={domain.id} className="govuk-table__row">
                        <td className="govuk-table__cell">{domain.domain}</td>
                        <td className="govuk-table__cell">
                          <a
                            href="#"
                            className="govuk-link"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteNewDomain(domain.id);
                            }}
                          >
                            Delete
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            <div className="govuk-form-group govuk-!-margin-top-6">
              <label className="govuk-label govuk-label--s" htmlFor="domain-input">
                Enter a new domain
              </label>
              <div className="govuk-hint">For example, company.com</div>
              <input
                className="govuk-input"
                id="domain-input"
                name="domain"
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDomain();
                  }
                }}
              />
            </div>

            <button
              type="button"
              className="govuk-button govuk-button--secondary govuk-!-margin-top-2"
              onClick={handleAddDomain}
            >
              Add domain
            </button>

            <div className="govuk-!-margin-top-6">
              <button
                type="button"
                className="govuk-button"
                onClick={handleSave}
                style={{ backgroundColor: '#00703c' }}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save and continue'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default ApprovedEmailDomainsPage;
