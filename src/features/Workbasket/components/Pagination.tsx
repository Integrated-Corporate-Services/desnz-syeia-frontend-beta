import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="govuk-!-text-align-center">
      <nav className="govuk-pagination" role="navigation" aria-label="Pagination">
      {currentPage > 1 && (
        <div className="govuk-pagination__prev">
          <a
            className="govuk-link govuk-pagination__link"
            href="#"
            rel="prev"
            aria-label={`Go to previous page, page ${currentPage - 1} of ${totalPages}`}
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(currentPage - 1);
            }}
            onKeyDown={(e) => {
              // AC-12: Keyboard accessibility - Enter and Space keys
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onPageChange(currentPage - 1);
              }
            }}
          >
            <svg
              className="govuk-pagination__icon govuk-pagination__icon--prev"
              xmlns="http://www.w3.org/2000/svg"
              height="13"
              width="15"
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 15 13"
            >
              <path d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path>
            </svg>
            <span className="app-pagination-short-label" aria-hidden="true">Prev</span>
            <span className="govuk-pagination__link-title">
              Previous<span className="govuk-visually-hidden"> page</span>
            </span>
          </a>
        </div>
      )}

      <ul className="govuk-pagination__list">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <li key={`ellipsis-${index}`} className="govuk-pagination__item govuk-pagination__item--ellipsis" aria-hidden>
                  …
                </li>
              ) : (
                <li
                  key={index}
                  className={`govuk-pagination__item ${
                    page === currentPage ? 'govuk-pagination__item--current' : ''
                  }`}
                >
                  <a
                    className="govuk-link govuk-pagination__link"
                    href="#"
                    aria-label={`${page === currentPage ? 'Current page, ' : 'Go to '}page ${page} of ${totalPages}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault();
                      if (page !== currentPage) {
                        onPageChange(page as number);
                      }
                    }}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && page !== currentPage) {
                        e.preventDefault();
                        onPageChange(page as number);
                      }
                    }}
                  >
                    {page}
                  </a>
                </li>
              )
            ))}
      </ul>

      {currentPage < totalPages && (
        <div className="govuk-pagination__next">
          <a
            className="govuk-link govuk-pagination__link"
            href="#"
            rel="next"
            aria-label={`Go to next page, page ${currentPage + 1} of ${totalPages}`}
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(currentPage + 1);
            }}
            onKeyDown={(e) => {
              // AC-12: Keyboard accessibility - Enter and Space keys
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onPageChange(currentPage + 1);
              }
            }}
          >
            <span className="govuk-pagination__link-title">
              Next<span className="govuk-visually-hidden"> page</span>
            </span>
            <span className="app-pagination-short-label" aria-hidden="true">Next</span>
            <svg
              className="govuk-pagination__icon govuk-pagination__icon--next"
              xmlns="http://www.w3.org/2000/svg"
              height="13"
              width="15"
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 15 13"
            >
              <path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>
            </svg>
          </a>
        </div>
      )}
      </nav>
    </div>
  );
};
