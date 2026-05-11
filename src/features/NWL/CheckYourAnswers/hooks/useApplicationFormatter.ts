import { useMemo } from 'react';
import type { Application } from '../../../../types/application';
import type { SummarySection, FormattedAddress, FormattedPerson } from '../types';
import {
  SECTION_HEADINGS,
  FIELD_LABELS,
  DISPLAY_VALUES,
} from '../constants/checkYourAnswersConstants';
import { NWL_TASK_LIST_ROUTES } from '../../TaskList/constants/taskListRoutes';

/**
 * Hook to format application data into summary sections
 * Transforms raw application data into display-ready format
 */
export const useApplicationFormatter = (application: Application | null) => {
  const formatAddress = (
    line1?: string,
    line2?: string,
    town?: string,
    county?: string,
    postcode?: string
  ): string => {
    const parts = [line1, line2, town, county, postcode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : DISPLAY_VALUES.NOT_PROVIDED;
  };

  const formatPerson = (person: FormattedPerson): string => {
    const parts = [];
    if (person.title) parts.push(person.title);
    if (person.fullName) parts.push(person.fullName);
    if (person.organisation) parts.push(`(${person.organisation})`);
    return parts.length > 0 ? parts.join(' ') : DISPLAY_VALUES.NOT_PROVIDED;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return DISPLAY_VALUES.NOT_PROVIDED;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatBoolean = (value?: boolean): string => {
    if (value === undefined || value === null) return DISPLAY_VALUES.NOT_PROVIDED;
    return value ? DISPLAY_VALUES.YES : DISPLAY_VALUES.NO;
  };

  const sections = useMemo((): SummarySection[] => {
    if (!application) return [];

    const summaries: SummarySection[] = [];

    // Applicant Details Section
    if (application.application_party) {
      const party = application.application_party;
      summaries.push({
        heading: SECTION_HEADINGS.APPLICANT_DETAILS,
        rows: [
          {
            key: FIELD_LABELS.APPLICANT_NAME,
            value: party.organisation_name || DISPLAY_VALUES.NOT_PROVIDED,
            changeLink: NWL_TASK_LIST_ROUTES.APPLICANT_DETAILS,
          },
          {
            key: FIELD_LABELS.ADDRESS,
            value: formatAddress(party.line1, party.line2, party.city, party.county, party.postcode),
          },
          {
            key: FIELD_LABELS.EMAIL,
            value: party.email || DISPLAY_VALUES.NOT_PROVIDED,
          },
          {
            key: FIELD_LABELS.PHONE,
            value: party.phone || DISPLAY_VALUES.NOT_PROVIDED,
          },
        ],
      });

      // Network Operator Contact Details
      if (party.contact_person_name) {
        summaries.push({
          heading: SECTION_HEADINGS.NETWORK_OPERATOR_DETAILS,
          rows: [
            {
              key: FIELD_LABELS.CONTACT_NAME,
              value: party.contact_person_name || DISPLAY_VALUES.NOT_PROVIDED,
              changeLink: NWL_TASK_LIST_ROUTES.NETWORK_OPERATOR_CONTACT_DETAILS,
            },
            {
              key: FIELD_LABELS.CONTACT_EMAIL,
              value: party.contact_person_email || DISPLAY_VALUES.NOT_PROVIDED,
            },
            {
              key: FIELD_LABELS.CONTACT_PHONE,
              value: party.contact_person_phone || DISPLAY_VALUES.NOT_PROVIDED,
            },
          ],
        });
      }
    }

    // Application Details Section
    const appDetailsRows = [];
    
    if (application.type_of_use) {
      appDetailsRows.push({
        key: FIELD_LABELS.TYPE_OF_USE,
        value: application.type_of_use === 'new_lines' ? 'New lines' : 'Existing lines',
        changeLink: NWL_TASK_LIST_ROUTES.TYPE_OF_USE,
      });
    }

    if (application.wayleave_offer_date) {
      appDetailsRows.push({
        key: FIELD_LABELS.WAYLEAVE_OFFER_DATE,
        value: formatDate(application.wayleave_offer_date),
        changeLink: NWL_TASK_LIST_ROUTES.WAYLEAVE_OFFER,
      });
    }

    if (application.grounds_for_application) {
      appDetailsRows.push({
        key: FIELD_LABELS.GROUNDS_FOR_APPLICATION,
        value: application.grounds_for_application,
        changeLink: NWL_TASK_LIST_ROUTES.GROUNDS_FOR_APPLICATION,
      });
    }

    if (appDetailsRows.length > 0) {
      summaries.push({
        heading: SECTION_HEADINGS.APPLICATION_DETAILS,
        rows: appDetailsRows,
      });
    }

    // Notice and Compliance Section (conditional based on application type)
    const noticeRows = [];

    if (application.wayleave_expiry_date) {
      noticeRows.push({
        key: FIELD_LABELS.WAYLEAVE_EXPIRY_DATE,
        value: formatDate(application.wayleave_expiry_date),
      });
    }

    if (application.notice_to_terminate_date) {
      noticeRows.push({
        key: FIELD_LABELS.NOTICE_TO_TERMINATE_DATE,
        value: formatDate(application.notice_to_terminate_date),
      });
    }

    if (application.notice_to_remove_date) {
      noticeRows.push({
        key: FIELD_LABELS.NOTICE_TO_REMOVE_DATE,
        value: formatDate(application.notice_to_remove_date),
      });
    }

    if (application.is_notice_to_remove_clear !== undefined) {
      noticeRows.push({
        key: FIELD_LABELS.NOTICE_TO_REMOVE_CLEAR,
        value: formatBoolean(application.is_notice_to_remove_clear),
      });
    }

    if (application.notice_to_remove_unclear_explanation) {
      noticeRows.push({
        key: FIELD_LABELS.NOTICE_TO_REMOVE_EXPLANATION,
        value: application.notice_to_remove_unclear_explanation,
      });
    }

    if (noticeRows.length > 0) {
      summaries.push({
        heading: SECTION_HEADINGS.NOTICE_AND_COMPLIANCE,
        rows: noticeRows,
      });
    }

    // Objector Details Section
    if (application.objector_details) {
      const objector = application.objector_details;
      summaries.push({
        heading: SECTION_HEADINGS.OWNER_OCCUPIER_DETAILS,
        rows: [
          {
            key: FIELD_LABELS.OBJECTOR_NAME,
            value: formatPerson({
              title: objector.objector_title,
              fullName: objector.objector_full_name,
              organisation: objector.objector_organisation,
            }),
            changeLink: NWL_TASK_LIST_ROUTES.OBJECTOR_DETAILS,
          },
          {
            key: FIELD_LABELS.OBJECTOR_ADDRESS,
            value: formatAddress(
              objector.objector_address_line1,
              objector.objector_address_line2,
              objector.objector_town,
              objector.objector_county,
              objector.objector_postcode
            ),
          },
          {
            key: FIELD_LABELS.OBJECTOR_EMAIL,
            value: objector.objector_email || DISPLAY_VALUES.NOT_PROVIDED,
          },
          {
            key: FIELD_LABELS.OBJECTOR_PHONE,
            value: objector.objector_phone || DISPLAY_VALUES.NOT_PROVIDED,
          },
        ],
      });

      // Landowner Details (if different from objector)
      if (objector.is_landowner === false && objector.landowner_full_name) {
        summaries.push({
          heading: SECTION_HEADINGS.LANDOWNER_DETAILS,
          rows: [
            {
              key: FIELD_LABELS.LANDOWNER_NAME,
              value: formatPerson({
                title: objector.landowner_title,
                fullName: objector.landowner_full_name,
                organisation: objector.landowner_organisation,
              }),
              changeLink: NWL_TASK_LIST_ROUTES.OBJECTOR_DETAILS,
            },
            {
              key: FIELD_LABELS.LANDOWNER_ADDRESS,
              value: formatAddress(
                objector.landowner_address_line1,
                objector.landowner_address_line2,
                objector.landowner_town,
                objector.landowner_county,
                objector.landowner_postcode
              ),
            },
            {
              key: FIELD_LABELS.LANDOWNER_EMAIL,
              value: objector.landowner_email || DISPLAY_VALUES.NOT_PROVIDED,
            },
            {
              key: FIELD_LABELS.LANDOWNER_PHONE,
              value: objector.landowner_phone || DISPLAY_VALUES.NOT_PROVIDED,
            },
          ],
        });
      }

      // Representative Details (if exists)
      if (objector.has_representative && objector.representative_full_name) {
        summaries.push({
          heading: SECTION_HEADINGS.REPRESENTATIVE_DETAILS,
          rows: [
            {
              key: FIELD_LABELS.REPRESENTATIVE_NAME,
              value: formatPerson({
                title: objector.representative_title,
                fullName: objector.representative_full_name,
                organisation: objector.representative_organisation,
              }),
              changeLink: NWL_TASK_LIST_ROUTES.OBJECTOR_DETAILS,
            },
            {
              key: FIELD_LABELS.REPRESENTATIVE_ADDRESS,
              value: formatAddress(
                objector.representative_address_line1,
                objector.representative_address_line2,
                objector.representative_town,
                objector.representative_county,
                objector.representative_postcode
              ),
            },
            {
              key: FIELD_LABELS.REPRESENTATIVE_EMAIL,
              value: objector.representative_email || DISPLAY_VALUES.NOT_PROVIDED,
            },
            {
              key: FIELD_LABELS.REPRESENTATIVE_PHONE,
              value: objector.representative_phone || DISPLAY_VALUES.NOT_PROVIDED,
            },
          ],
        });
      }
    }

    // Negotiations Section
    if (application.negotiations_data) {
      const negotiations = application.negotiations_data;
      const negotiationRows = [];

      if (negotiations.has_negotiations !== undefined) {
        negotiationRows.push({
          key: FIELD_LABELS.HAS_NEGOTIATIONS,
          value: formatBoolean(negotiations.has_negotiations),
          changeLink: NWL_TASK_LIST_ROUTES.EXISTING_NEGOTIATIONS,
        });
      }

      if (
        negotiations.negotiations_start_date_day &&
        negotiations.negotiations_start_date_month &&
        negotiations.negotiations_start_date_year
      ) {
        const dateString = `${negotiations.negotiations_start_date_year}-${negotiations.negotiations_start_date_month.padStart(2, '0')}-${negotiations.negotiations_start_date_day.padStart(2, '0')}`;
        negotiationRows.push({
          key: FIELD_LABELS.NEGOTIATION_START_DATE,
          value: formatDate(dateString),
        });
      }

      if (negotiations.negotiations_comments) {
        negotiationRows.push({
          key: FIELD_LABELS.NEGOTIATION_COMMENTS,
          value: negotiations.negotiations_comments,
          changeLink: NWL_TASK_LIST_ROUTES.EVIDENCE_OF_NEGOTIATIONS,
        });
      }

      if (negotiations.no_negotiations_reason) {
        negotiationRows.push({
          key: FIELD_LABELS.NO_NEGOTIATIONS_REASON,
          value: negotiations.no_negotiations_reason,
        });
      }

      if (negotiationRows.length > 0) {
        summaries.push({
          heading: SECTION_HEADINGS.NEGOTIATIONS,
          rows: negotiationRows,
        });
      }
    }

    // Additional Information Section
    if (application.additional_information_data) {
      const additionalInfo = application.additional_information_data;
      const additionalRows = [];

      if (additionalInfo.has_related_applications !== undefined) {
        additionalRows.push({
          key: FIELD_LABELS.RELATED_APPLICATIONS,
          value: formatBoolean(additionalInfo.has_related_applications),
          changeLink: NWL_TASK_LIST_ROUTES.RELATED_APPLICATIONS,
        });
      }

      if (additionalInfo.related_applications_details) {
        additionalRows.push({
          key: FIELD_LABELS.RELATED_APPLICATIONS_DETAILS,
          value: additionalInfo.related_applications_details,
        });
      }

      if (additionalInfo.other_information_details) {
        additionalRows.push({
          key: FIELD_LABELS.OTHER_IMPORTANT_INFORMATION,
          value: additionalInfo.other_information_details,
          changeLink: NWL_TASK_LIST_ROUTES.OTHER_IMPORTANT_INFORMATION,
        });
      }

      if (additionalRows.length > 0) {
        summaries.push({
          heading: SECTION_HEADINGS.ADDITIONAL_INFORMATION,
          rows: additionalRows,
        });
      }
    }

    return summaries;
  }, [application]);

  return {
    sections,
    formatAddress,
    formatPerson,
    formatDate,
    formatBoolean,
  };
};
