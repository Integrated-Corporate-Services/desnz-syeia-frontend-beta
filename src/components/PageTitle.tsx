
import { Helmet } from 'react-helmet-async';
import React from 'react';

interface PageTitleProps {
  title: string;
  description?: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({ title, description }) => {
  // Construct full title with branding
  const fullTitle = `${title} - DESNZ SYEIA`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
};

export default PageTitle;
