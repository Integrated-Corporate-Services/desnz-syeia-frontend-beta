
export const CONTENT = {
  MAX_DESCRIPTION_LENGTH: 4000,
  months: [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ],
  projectOverview: {
    breadcrumb: {
      taskList: "Task list",
      current: "Project overview",
    },
    heading: "Project overview",
    projectName: "Project name",
    projectDescription: "Project description",
    projectDescriptionHint: "You can enter up to 4000 characters",
    infoDetailsSummary: "What type of information should be provided",
    infoDetailsText: "You need to explain why this consent is needed. Include information about any wider projects it is related to, a summary of what work is being done and why.",
    tallestPoleHeight: "What is the height of the tallest proposed pole?",
    tallestPoleHeightSuffix: "metres",
    planReference: "Plan reference",
    workStartDatesKnown: "Do you know when you are intending to start work on this development?",
    earliestWorkStartDate: "What is the earliest expected start date for the development?",
    latestWorkStartDate: "What is the latest expected start date for the development?",
    planInformationDocuments: "Plan information documents",
    planDetailsSummary: "What information should be included in the plan",
    planDetailsText: "Upload a plan which clearly shows the proposed overhead line and where it connects to the network. Please ensure that the line you are applying for is shown in a different colour to the rest of the network.",
    relatedApplications: "Are there any other SYEIA applications related to this one?",
    relatedApplicationsHint: "Related applications would include those related to a CPO or another S37 application that shares the same consultation or environmental report.",
    relatedApplicationsDetails: "Provide details of all related applications",
    relatedApplicationsDetailsHint: "Include application details such as DESNZ reference numbers, your internal references or site addresses. Ensure you list all related applications and explain why they are related.",
    relatedCpo: "Is there a compulsory purchase order (CPO) that is related to this application?",
    relatedCpoDetails: "Enter the name and status of the related CPO.",
    saveAndContinue: "Save and continue",
  },
  header : {
    serviceName: "Submit your Energy Infrastructure Application",
    section: "Section 37 Consent",
    altText: "Department for Energy Security and Net Zero",
  },
  footer: {
    links: [
      {
        text: "Cookies",
        href: "/cookies",
      },
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
    licenceDescription: "All content is available under the ",
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
      text: "Applications",
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
    notListedText2: "The network operator team can be updated from the company contacts link on the left side menu on the application dashboard. Only the team coordinator for the network operator organisation can update the team.",
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
      noDetails2: "The contact can update their details by logging into their account on EIP and going to the 'Update My Details' link shown in the left hand menu on the application dashboard page.",
    },
  },
  
};

export const APPLICATION_SUBMITTED = {
  title: "Application submitted",
  body: "Your application has been submitted successfully. You will receive a confirmation email shortly.",
};

export const LINE_VOLTAGE_OPTIONS = [
  { value: '11kV', label: '11 kV' },
  { value: '33kV', label: '33 kV' },
  { value: '66kV', label: '66 kV' },
  { value: '132kV', label: '132 kV' },
  { value: '275kV', label: '275 kV' },
  { value: '400kV', label: '400 kV' },
];