import React, { useEffect, useState } from 'react'
import { Button, InputField, H1, Radio, SearchBox, Select, TextArea, Checkbox, DateField, ErrorSummary, FileUpload, FormGroup, ListItem, GlobalStyle, GridCol, GridRow, H2, Paragraph, Panel, H3, RelatedItems, UnorderedList, SkipLink, LoadingBox, PhaseBanner, Breadcrumbs } from "govuk-react"
import { Link, useNavigate, useLocation } from "react-router-dom";

const NetwotkOperatorDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const appId = params.get('appId');
  //const [location, setLocation] = useState('');

  // 🔹 One object to store all fields
  const [formData, setFormData] = useState({
    desnzReference: '',
    operatorReference: '',
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
        <h1 className="govuk-heading-l" id="basic">
          Network Operator Details
        </h1>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="desnzReference">
            DESNZ Reference
          </label>
          <input className="govuk-input govuk-input--width-20" id="desnzReference" name="desnzReference" type="text" value={formData.desnzReference} onChange={handleChange} />
        </div>
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="operator">
            Network operator's reference
          </label>
          <input className="govuk-input govuk-input--width-20" id="operator" name="operator" type="text" value={formData.operatorReference} onChange={handleChange} />

        </div>
        <GridRow>
          <GridCol setWidth="one-third" className="govuk-!-text-align-left">
            <Button
                as={Link}
                to="/network-operator-contact-details"
            >
                Next
            </Button> 
          </GridCol>
        </GridRow>
    </main>
  );
}; // Closing brace for FormWithConditionalRendering

export default NetwotkOperatorDetails