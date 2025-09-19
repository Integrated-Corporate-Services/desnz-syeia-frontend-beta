import React from "react";
import FileUploadBox from '../../../components/FileUploadBox';
import type { Application } from '../../../types/application';

function getS3Prefix(application: Application) {
  if (!application?.application_id) return null;
  return `${application.application_id}/project-info/plan-information`;
}

interface PlanInformationUploadProps {
  application: Application;
  title: string;
}

const PlanInformationUpload: React.FC<PlanInformationUploadProps> = ({ application, title }) => {
  const prefix = getS3Prefix(application);
  if (!prefix) {
    return <div className="govuk-inset-text">Loading application information...</div>;
  }
  return (
    <FileUploadBox
      title={title}
      prefix={prefix}
    />
  );
};

export default PlanInformationUpload;
