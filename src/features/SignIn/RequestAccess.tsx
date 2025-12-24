import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorSummary from '../../components/commonFormFields/ErrorSummary';
import TextInput from '../../components/commonFormFields/TextInput';
import MultiSelect from '../../components/commonFormFields/MultiSelect';
import Checkbox from '../../components/commonFormFields/Checkbox';
import { useRequestAccess } from '../../hooks/useRequestAccess';
import axios from 'axios';

interface RegistrationFormData {
    fullName: string;
    email: string;
    line1: string;
    line2: string;
    town: string;
    country: string;
    postCode: string;
    organisations: string[];
    applyingOnBehalf: boolean;
}

const RegistrationPage: React.FC = () => {
    const navigate = useNavigate();
    const { isSubmitting, errors, submitRequestAccess } = useRequestAccess();
    const [organisationOptions, setOrganisationOptions] = useState<Array<{value: string, label: string}>>([]);
    const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
    const [formData, setFormData] = useState<RegistrationFormData>({
        fullName: '',
        email: 'applicant@nationalgrid.com', // Passed from backend in real app
        line1: '',
        line2: '',
        town: '',
        country: 'United Kingdom',
        postCode: '',
        organisations: [], // Changed to array for multiple selections
        applyingOnBehalf: false
    });

    // Fetch organisations on component mount
    useEffect(() => {
        const fetchOrganisations = async () => {
            try {
                const response = await axios.get('/backend/api/organisations');
                const orgs = response.data.map((org: any) => ({
                    value: org.organisation_id,
                    label: org.organisation_name
                }));
                setOrganisationOptions(orgs);
            } catch (error) {
                console.error('Failed to fetch organisations:', error);
            } finally {
                setIsLoadingOrgs(false);
            }
        };
        
        fetchOrganisations();
    }, []);

    type SyntheticEvent = React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | {
        target: { name: string; value: any; type?: string; checked?: boolean };
    };

    const handleInputChange = (e: SyntheticEvent) => {
        const { name, value, type } = e.target;
        let checked = false;
        if ('checked' in e.target && typeof (e.target as any).checked === 'boolean') {
            checked = (e.target as any).checked;
        }
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const onSubmitRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await submitRequestAccess(formData);
    };

    const getFieldError = (fieldId: string): string => {
        const error = errors.find(err => err.fieldId === fieldId);
        return error ? error.message : '';
    };

    return (
        <div className="govuk-width-container">
            <a
                href="/landingPage"
                className="govuk-back-link govuk-!-margin-bottom-6 govuk-!-margin-top-0"
                style={{ display: 'inline-block', marginBottom: '32px', marginTop: 0 }}
            >
                Submit your Energy Infrastructure Application
            </a>
            <main className="govuk-main-wrapper" id="main-content" role="main">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">

                        <ErrorSummary errors={errors} />

                        <h1 className="govuk-heading-l">
                            Provide your details to request access to this service
                        </h1>

                        <p className="govuk-body govuk-!-margin-bottom-2">
                            We need a few more details to give you access to this service.
                            A Distribution Network Operator (DNO) administrator will review your request.
                        </p>

                        <p className="govuk-body govuk-!-margin-bottom-4">
                            Once you submit this form, we will send your request to your organisation's administrator.
                            You will not be able to use the service until they approve your access.
                        </p>

                        <p className="govuk-body govuk-!-margin-bottom-6">
                            We will email you when your request has been reviewed.
                        </p>

                        <form onSubmit={onSubmitRegistration} noValidate>
                            <TextInput
                                id="full-name"
                                name="fullName"
                                label="Full name"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                error={getFieldError('full-name')}
                                autoComplete="name"
                            />

                            <TextInput
                                id="email"
                                name="email"
                                label="Email address"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                readOnly
                                error={getFieldError('email')}
                                hint="This is the email address you used to sign in with GOV.UK One Login."
                                autoComplete="email"
                            />

                            {/* <h2 className="govuk-heading-s govuk-!-margin-top-6">Work address</h2>

                            <TextInput
                                id="line1"
                                name="line1"
                                label="Address line 1"
                                value={formData.line1}
                                onChange={handleInputChange}
                                error={getFieldError('line1')}
                                autoComplete="address-line1"
                            />

                            <TextInput
                                id="line2"
                                name="line2"
                                label="Address line 2 (optional)"
                                value={formData.line2}
                                onChange={handleInputChange}
                                error={getFieldError('line2')}
                                autoComplete="address-line2"
                            />

                            <TextInput
                                id="town"
                                name="town"
                                label="Town or city"
                                value={formData.town}
                                onChange={handleInputChange}
                                error={getFieldError('town')}
                                autoComplete="address-level2"
                            />

                            <TextInput
                                id="country"
                                name="country"
                                label="Country"
                                value={formData.country}
                                onChange={handleInputChange}
                                error={getFieldError('country')}
                                autoComplete="country-name"
                            />

                            <TextInput
                                id="post-code"
                                name="postCode"
                                label="Postcode"
                                value={formData.postCode}
                                onChange={handleInputChange}
                                error={getFieldError('post-code')}
                                autoComplete="postal-code"
                                className="govuk-input--width-10"
                            /> */}

                            <MultiSelect
                                id="organisations"
                                name="organisations"
                                label="Which organisations do you work for or represent?"
                                values={formData.organisations}
                                onChange={handleInputChange}
                                options={organisationOptions}
                                error={getFieldError('organisations')}
                                hint="Choose the Distribution Network Operators (DNOs) you work for or represent. You can select multiple organisations if you work across several."
                                disabled={isLoadingOrgs}
                            />

                            <Checkbox
                                id="applying-on-behalf"
                                name="applyingOnBehalf"
                                label="I am authorised to act on behalf of these organisations"
                                checked={formData.applyingOnBehalf}
                                onChange={handleInputChange}
                                hint="Select this if you are an agent or contractor representing these organisations."
                            />

                            <div className="govuk-form-group govuk-!-margin-top-4">
                                <h2 className="govuk-heading-m govuk-!-margin-bottom-1">Privacy notice</h2>
                                <p className="govuk-body govuk-!-margin-bottom-1">
                                    By continuing, you agree to the processing of your information.
                                </p>
                                <a href="#" className="govuk-link">Read the privacy notice</a>
                            </div>

                            <div className="govuk-form-group govuk-!-margin-top-6">
                                <button 
                                    type="submit" 
                                    className="govuk-button" 
                                    data-module="govuk-button"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Continue'}
                                </button>
                            </div>
                        </form>

                        <details className="govuk-details govuk-!-margin-top-6">
                            <summary className="govuk-details__summary">
                                <span className="govuk-details__summary-text">
                                    Who should use this form?
                                </span>
                            </summary>
                            <div className="govuk-details__text">
                                <p className="govuk-body">
                                    Use this form if you work for one or more Distribution Network Operators (DNOs)
                                    or if you are an authorised agent acting on their behalf.
                                </p>
                                <p className="govuk-body">
                                    You can select multiple organisations if you work across several DNOs
                                    or represent multiple networks.
                                </p>
                                <p className="govuk-body">
                                    If you cannot find your organisation in the list, contact your DNO administrator.
                                </p>
                            </div>
                        </details>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default RegistrationPage;
