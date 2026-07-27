import type { PrivacyNoticeConfig } from '../types';
import { getRuntimeEnv } from '../../../config/runtimeEnv';

const SERVICE_NAME = getRuntimeEnv('VITE_SERVICE_NAME', 'SYEIA');

export const PRIVACY_CONFIG: PrivacyNoticeConfig = {
  serviceName: 'SYEIA (Submit Your Energy Infrastructure Application)',
  organisation: 'Department for Energy Security and Net Zero',
  organisationAcronym: 'DESNZ',
  dataController: 'Department for Energy Security and Net Zero (DESNZ)',
  
  dpoContact: {
    name: 'DESNZ Data Protection Officer',
    email: 'dataprotection@energysecurity.gov.uk',
    address: [
      'Department for Energy Security and Net Zero',
      '1 Victoria Street',
      'London',
      'SW1H 0ET'
    ]
  },

  privacyTeamContact: {
    name: 'DESNZ Privacy Team',
    email: 'privacy@energysecurity.gov.uk'
  },

  icoContact: {
    name: 'Information Commissioner',
    email: 'icocasework@ico.org.uk',
    phone: '0303 123 1113',
    openingHours: 'Monday to Friday, 9am to 4:30pm',
    address: [
      "Information Commissioner's Office",
      'Wycliffe House',
      'Water Lane',
      'Wilmslow',
      'Cheshire',
      'SK9 5AF'
    ]
  },

  lastUpdated: '5 May 2026',

  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      content: [
        `The ${SERVICE_NAME} service is provided by the Department for Energy Security and Net Zero (DESNZ).`,
        'DESNZ is the data controller for pages starting with this domain. This means DESNZ determines how and why your personal data is processed.',
        'This privacy notice explains what personal data we collect, how we use it, how long we keep it, and your rights under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.'
      ]
    },
    {
      id: 'what-data',
      title: 'What data we collect',
      content: [
        'The personal data we collect from you includes:',
        {
          type: 'list',
          items: [
            'your name, email address, and contact details when you register for an account',
            'your organisation details including company registration number and address',
            'project information and application details you submit',
            'documents and files you upload to support your application',
            'consultation responses and feedback you provide',
            'your Internet Protocol (IP) address and details of which web browser you used',
            'information on how you use the site, using cookies and page tagging techniques'
          ]
        },
        'Where you provide your consent, we use Google Analytics (GA4), Google Tag Manager (GTM), and AWS CloudWatch Real User Monitoring (RUM) to collect information about how you use this service.',
        'Google Analytics and Google Tag Manager process information about:',
        {
          type: 'list',
          items: [
            'the pages you visit on this service',
            'how long you spend on each page',
            'how you got to the site',
            'what you click on while you\'re visiting the site'
          ]
        },
        'AWS CloudWatch RUM processes anonymised information about:',
        {
          type: 'list',
          items: [
            'how well the pages performed on your device',
            'performance bottlenecks your device experienced',
            'JavaScript errors your device encountered'
          ]
        },
        'We make sure you cannot be directly identified from analytics data. We do this by:',
        {
          type: 'list',
          items: [
            'removing or reducing personal information in analytics data (for example from page titles or URLs)',
            'hashing IP addresses, session IDs, and user agent strings before storing them',
            'not combining analytics information with other datasets in a way that would directly identify you'
          ]
        }
      ]
    },
    {
      id: 'why-we-need',
      title: 'Why we need your data',
      content: [
        'We collect your personal data to:',
        {
          type: 'list',
          items: [
            'process your energy infrastructure applications',
            'verify your identity and authority to submit applications',
            'communicate with you about your applications',
            'facilitate statutory consultation processes',
            'comply with legal and regulatory requirements',
            'improve the service based on usage patterns',
            'monitor the performance and security of the service',
            'respond to your queries and provide support'
          ]
        },
        'We use the information we collect through Google Analytics, Google Tag Manager, and CloudWatch RUM to:',
        {
          type: 'list',
          items: [
            'understand how you use the service',
            'identify areas for improvement',
            'monitor service performance and reliability',
            'detect and fix technical issues',
            'ensure the service meets user needs'
          ]
        }
      ]
    },
    {
      id: 'legal-basis',
      title: 'Our legal basis for processing your data',
      content: [
        'The legal basis for processing personal data in relation to:',
        {
          type: 'list',
          items: [
            'Application processing: necessary for the performance of a task carried out in the public interest (UK GDPR Article 6(1)(e))',
            'Site security: our legitimate interests and those of our users in ensuring the security and integrity of the service (UK GDPR Article 6(1)(f))',
            'Analytics (Google Analytics, Google Tag Manager, and CloudWatch RUM): your consent (UK GDPR Article 6(1)(a))',
            'Statutory consultations: compliance with legal obligations (UK GDPR Article 6(1)(c))'
          ]
        },
        'Processing of special category data (if applicable) is carried out under UK GDPR Article 9(2)(g) - substantial public interest.'
      ]
    },
    {
      id: 'what-we-do',
      title: 'What we do with your data',
      content: [
        'The data we collect may be shared with:',
        {
          type: 'list',
          items: [
            'other government departments and agencies involved in the application review process',
            'statutory consultees as required by legislation',
            'local planning authorities',
            'our technology suppliers (for example, hosting providers, email service providers)',
            'professional advisers (such as lawyers and auditors)'
          ]
        },
        'We will share your data if we are required to do so by law, for example by court order, or to prevent fraud or other crime.',
        'The data we collect with Google Analytics and Google Tag Manager cookies is transferred and stored with Google where we analyse it with Google Analytics software (GA4) and Google Tag Manager. We do not allow Google to use or share this data for their own purposes.',
        'CloudWatch RUM data is processed and stored by Amazon Web Services in accordance with their data processing terms.',
        'We will not:',
        {
          type: 'list',
          items: [
            'sell or rent your data to third parties',
            'share your data with third parties for marketing purposes',
            'transfer your data outside the UK without appropriate safeguards'
          ]
        }
      ]
    },
    {
      id: 'how-long',
      title: 'How long we keep your data',
      content: [
        'We will only retain your personal data for as long as necessary for the purposes set out in this notice or as required by law.',
        'We will:',
        {
          type: 'list',
          items: [
            'keep application data for 7 years after the decision or withdrawal of the application',
            'keep account data until you request deletion or the account is inactive for 3 years',
            'keep consent audit logs for up to 90 days',
            'delete analytics data after 26 months',
            'delete access logs containing IP addresses after 120 days',
            'keep correspondence and support queries for 2 years'
          ]
        },
        'Some data may be kept for longer periods where required by legislation or for archival purposes in the public interest.'
      ]
    },
    {
      id: 'childrens-privacy',
      title: "Children's privacy protection",
      content: [
        'This service is designed for use by professionals and organisations involved in energy infrastructure projects.',
        'It is not intended for use by children under the age of 16. We do not knowingly collect personal data from children under 16.',
        'If we become aware that we have collected personal data from a child under 16, we will take steps to delete that information as soon as possible.'
      ]
    },
    {
      id: 'where-processed',
      title: 'Where your data is processed and stored',
      content: [
        'We design, build and run our systems to make sure that your data is as safe as possible at all stages, both while it\'s processed and when it\'s stored.',
        'All personal data is stored in the United Kingdom.',
        'Data collected by Google Analytics and Google Tag Manager may be transferred outside the UK for processing. Google has certified compliance with the UK-US Data Bridge, facilitating lawful data transfers.',
        'AWS CloudWatch RUM data is stored in the EU (Ireland) region and may be processed in accordance with AWS\'s UK GDPR compliance framework.'
      ]
    },
    {
      id: 'how-we-protect',
      title: 'How we protect your data and keep it secure',
      content: [
        'We are committed to doing all that we can to keep your data secure. We have set up systems and processes to prevent unauthorised access or disclosure of your data.',
        'Security measures include:',
        {
          type: 'list',
          items: [
            'encryption of data in transit using TLS 1.2 or higher',
            'encryption of sensitive data at rest',
            'secure authentication with multi-factor authentication options',
            'regular security testing and vulnerability assessments',
            'staff training on data protection and information security',
            'access controls limiting who can view your data',
            'audit logging of system access and changes'
          ]
        },
        'We also make sure that any third parties that process data on our behalf have appropriate security measures in place.'
      ]
    },
    {
      id: 'your-rights',
      title: 'Your rights',
      content: [
        'Under the UK GDPR, you have the right to:',
        {
          type: 'list',
          items: [
            'request information about how your personal data is processed',
            'request a copy of your personal data',
            'request that anything inaccurate in your personal data is corrected immediately',
            'request that your personal data is erased if there is no longer a justification for it',
            'object to how your personal data is processed in certain circumstances',
            'request that the processing of your personal data is restricted in certain circumstances',
            'request that your personal data is transferred to another organisation (data portability)',
            'not be subject to decisions based solely on automated processing'
          ]
        },
        'If you have any concerns about how your personal data is being processed, or wish to exercise any of these rights, please contact our Privacy Team:',
        {
          type: 'contact',
          data: {
            name: 'DESNZ Privacy Team',
            email: 'privacy@energysecurity.gov.uk'
          }
        }
      ]
    },
    {
      id: 'links-to-other',
      title: 'Links to other websites',
      content: [
        'This service may contain links to other websites.',
        'This privacy notice only applies to this service and does not cover other government services or websites that we link to.',
        'If you go to another website from this one, read the privacy policy on that website to find out what it does with your information.',
        'If you come to this service from another website, we may receive personal information from that website. You should read the privacy policy of the website you came from to find out more about this.'
      ]
    },
    {
      id: 'contact-us',
      title: 'Contact us or make a complaint',
      content: [
        'Contact our Privacy Team if you:',
        {
          type: 'list',
          items: [
            'have a question about anything in this privacy notice',
            'think that your personal data has been misused or mishandled',
            'want to exercise any of your data protection rights'
          ]
        },
        {
          type: 'contact',
          data: {
            name: 'DESNZ Privacy Team',
            email: 'privacy@energysecurity.gov.uk'
          }
        },
        'You can also contact our Data Protection Officer (DPO):',
        {
          type: 'contact',
          data: {
            name: 'DESNZ Data Protection Officer',
            email: 'dataprotection@energysecurity.gov.uk',
            address: [
              'Department for Energy Security and Net Zero',
              '1 Victoria Street',
              'London',
              'SW1H 0ET'
            ]
          }
        },
        'The DPO provides independent advice and monitoring of our use of personal information.',
        'If you are unhappy with how DESNZ has handled your personal data, you can make a complaint to the Information Commissioner, who is an independent regulator:',
        {
          type: 'contact',
          data: {
            name: 'Information Commissioner',
            email: 'icocasework@ico.org.uk',
            phone: '0303 123 1113',
            openingHours: 'Monday to Friday, 9am to 4:30pm',
            address: [
              "Information Commissioner's Office",
              'Wycliffe House',
              'Water Lane',
              'Wilmslow',
              'Cheshire',
              'SK9 5AF'
            ]
          }
        }
      ]
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      content: [
        'We may change this privacy notice from time to time. When we do, the "last updated" date at the bottom of this page will change.',
        'Any changes to this privacy policy will apply to you and your data immediately.',
        'If these changes affect how your personal data is processed, DESNZ will take reasonable steps to let you know.',
        'We recommend that you review this privacy notice periodically to stay informed about how we are protecting your information.'
      ]
    }
  ]
};
