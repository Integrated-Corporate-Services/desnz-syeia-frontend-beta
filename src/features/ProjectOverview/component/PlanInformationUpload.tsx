import React from "react";
import FileUploadBox from '../../../components/FileUploadBox';
import type { Application } from '../../../types/application';

function getS3Prefix(application: Application | null) {
  if (!application?.application_id) return null;
  return `${application.application_id}/project-info/plan-information`;
}

interface PlanInformationUploadProps {
  application: Application | null;
  title: string;
}

const PlanInformationUpload: React.FC<PlanInformationUploadProps> = ({ application, title }) => {
  const prefix = getS3Prefix(application) ?? undefined;
  /*if (!prefix) {
    return <div className="govuk-inset-text">Loading application information...</div>;
  }*/
  return (
    <FileUploadBox
      title={title}
      prefix={prefix}
    />
  );
};

export default PlanInformationUpload;
