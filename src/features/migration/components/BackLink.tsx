import React from 'react';
import { Link } from 'react-router-dom';
import { MIGRATION_CONTENT } from '../constants';

const BackLink: React.FC<{ to: string; text?: string }> = ({ to, text = MIGRATION_CONTENT.BACK }) => (
  <Link to={to} className="govuk-back-link">
    {text}
  </Link>
);

export default BackLink;
