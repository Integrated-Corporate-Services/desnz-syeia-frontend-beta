import { Link } from 'react-router-dom';

interface RelatedLink {
  to: string;
  label: string;
}

interface RelatedContentProps {
  links: RelatedLink[];
  className?: string;
}

export function RelatedContent({ links, className }: RelatedContentProps) {
  return (
    <div className={className || 'govuk-!-margin-top-8'}>
      <h2 className="govuk-heading-m">Related content</h2>
      <ul className="govuk-list">
        {links.map((link, index) => (
          <li key={index}>
            <Link to={link.to} className="govuk-link">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
