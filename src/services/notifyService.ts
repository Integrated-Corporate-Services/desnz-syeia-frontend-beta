import axios from 'axios';

export async function sendNotificationEmail({ to, subject, message, consultationId, applicationId, sections, documents, uploadedFiles }: {
  to: string;
  subject: string;
  message: string;
  consultationId: string;
  applicationId: string;
  sections: any[];
  documents: any[];
  uploadedFiles: any[];
}) {
  // Call backend endpoint for notify
  const response = await axios.post('/backend/api/notify-consultee', {
    to,
    subject,
    message,
    consultationId,
    applicationId,
    sections,
    documents,
    uploadedFiles,
  });
  return response.data;
}
