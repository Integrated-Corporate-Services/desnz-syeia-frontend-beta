import { Breadcrumbs } from "govuk-react";

export const CONTENT = {
  header : {
    serviceName: "Submit your Energy Infrastructure Application",
    section: "Section 37 Consent",
    altText: "Department for Energy Security and Net Zero",
  },
  footer: {
    links: [
      {
        text: "Accessibility statement",
        href: "/public/accessibility-statement",
      },
      {
        text: "Contact",
        href: "/public/contact-information",
      },
      {
        text: "Feedback",
        href: "/feedback",
      },
    ],
    licenceDescription: "All content is available under the",
    licence: {
      text: "Open Government Licence v3.0",
      href: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
    },
    exceptWhereOtherwiseStated: "except where otherwise stated", // <-- add this
    copyright: {
      text: "© Crown copyright",
      href: "https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/",
    },
  },
  serviceNav: [
    {
      text: "Workbasket",
      href: "",
    },
    {
      text: "Notifications",
      href: "",
    },
    {
      text: "Sign out",
      href: "",
    },
  ],
  networkOperator: {
    heading: "Network operator details",
    referenceLabel: "Network operator's reference",
    referencePlaceholder: "",
    organisationLabel: "Who is the contact in the network operator organisation for this application?",
    organisationHint: "The section 37 consent will be issued in the name of the person selected here",
    notListedSummary: "The contact is not listed",
    notListedText1: "The contact must have a user account on EIP and be in the \"Electricity Company: S37 Application Editor\" or \"Electricity Company: S37 Application Submitter\" roles in the network operator team.",
    notListedText2: "The network operator team can be updated from the company contacts link on the left side menu on the workbasket. Only the team coordinator for the network operator organisation can update the team.",
    saveAndContinue: "Save and continue",
    continue: "Continue",
    breadcrumb: {
      taskList: "Task list",
    },
  },
  networkOperatorContact: {
    heading: "Network operator contact details",
    summary: {
      name: "Name",
      address: "Address",
      email: "Email address",
      phone: "Phone number",
    },
    breadcrumb: {
      taskList: "Task list",
      current: "Network operator contact details",
    },
    confirmation: {
      legend: "Are all contacts details available and correct?",
      yes: "Yes",
      no: "No",
      saveAndContinue: "Save and continue",
      noDetails1: "If any of the contact details are not correct or missing then the contact person must update their account details on EIP. You will not be allowed to submit the application until all details are provided and correct.",
      noDetails2: "The contact can update their details by logging into their account on EIP and going to the 'Update My Details' link shown in the left hand menu on the workbasket page.",
    },
  },

};

export const APPLICATION_SUBMITTED = {
  title: "Application submitted",
  body: "Your application has been submitted successfully. You will receive a confirmation email shortly.",
};