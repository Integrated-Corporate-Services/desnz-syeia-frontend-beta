import React from 'react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
const navigate = useNavigate();

return (
<div className="govuk-width-container">
<main className="govuk-main-wrapper" id="main-content" role="main">
<div className="govuk-grid-row">
<div className="govuk-grid-column-two-thirds">
<button
type="button"
className="govuk-back-link"
onClick={() => navigate('/')}
>
Back to start
</button>

<h1 className="govuk-heading-l">You cannot access this page</h1>

<p className="govuk-body">
You do not have permission to view this page. This may be because:
</p>

<ul className="govuk-list govuk-list--bullet">
<li>you do not have the required administrator role</li>
<li>you need to request access from your organisation administrator</li>
<li>the page you're looking for has been moved or deleted</li>
</ul>

<div className="govuk-inset-text">
<p className="govuk-body">
If you think you should have access to this page, contact your
Distribution Network Operator (DNO) administrator.
</p>
</div>

<div className="govuk-form-group">
<button
type="button"
className="govuk-button"
onClick={() => navigate('/')}
>
Go to registration
</button>
</div>

<h2 className="govuk-heading-m">Get help</h2>
<p className="govuk-body">
For technical issues, email{' '}
<a href="mailto:support@example.gov.uk" className="govuk-link">
support@example.gov.uk
</a>
</p>

</div>
</div>
</main>
</div>
);
};

export default UnauthorizedPage;
