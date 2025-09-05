import React, { useEffect, useState } from 'react'
import { Button, InputField, H1, Radio, SearchBox, Select, TextArea, Checkbox, DateField, ErrorSummary, FileUpload, FormGroup, ListItem, GlobalStyle, GridCol, GridRow, H2, Paragraph, Panel, H3, RelatedItems, UnorderedList, SkipLink, LoadingBox, PhaseBanner, Breadcrumbs } from "govuk-react"
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApplicationStore } from '../store/useApplicationStore';

const NetworkOperatorContactDetails = () => {
  const application = useApplicationStore(state => state.application);
  const organisation = useApplicationStore(state => state.organisation);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const appId = params.get('appId');

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    networkOperatorContactAddress: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <main className="govuk-width-container">

        <h1 className="govuk-heading-l" id="network">
          Network Operator Contact Details
        </h1>
        <h2>Application: {application?.project_name}</h2>
        <h3>Organisation: {organisation?.organisation_name}</h3>

        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="networkOperatorContactAddress">
            Contact address
          </label>
          <textarea className="govuk-textarea govuk-!-static-margin-bottom-1" id="networkOperatorContactAddress" name="networkOperatorContactAddress" value={formData.networkOperatorContactAddress} onChange={handleChange}
            rows={5}></textarea>
        </div>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="email">Contact email</label>
          <input className="govuk-input" id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="phone">Contact telephone</label>
          <input className="govuk-input" id="phone" name="phone" type="text" value={formData.phone} onChange={handleChange} />
        </div>
    </main>
  );
};

export default NetworkOperatorContactDetails