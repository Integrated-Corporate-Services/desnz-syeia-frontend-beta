import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { NWL_BASE_URL } from "../../../../constants/nwl";

const Invoice: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const getApplicationId = () => {
    if (params.applicationId) return params.applicationId;
    if (params.id) return params.id;
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get("id") || searchParams.get("applicationId") || "";
    }
    return "";
  };
  const applicationId = getApplicationId();

  // Generate invoice number (deterministic if applicationId exists)
  const generateInvoiceNumber = (seed?: string) => {
    const to8Digits = (s?: string) => {
      if (!s) return Math.floor(Math.random() * 1e8).toString().padStart(8, "0");
      let hash = 0;
      for (let i = 0; i < s.length; i++) {
        hash = ((hash << 5) - hash) + s.charCodeAt(i);
        hash |= 0;
      }
      return (Math.abs(hash) % 1e8).toString().padStart(8, "0");
    };
    return `NWL${to8Digits(seed)}`;
  };

  const invoiceNumber = useMemo(() => generateInvoiceNumber(applicationId || undefined), [applicationId]);

  useEffect(() => {
    // Simulate loading for 2-3 seconds before showing "ready" message
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = async () => {
    if (!applicationId) return;
    setDownloading(true);
    try {
      // Call backend to generate, upload, and get presigned URL
      const res = await fetch(`/backend/api/nwl/${applicationId}/invoice/download`);
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank", "noopener");
      } else {
        alert("Failed to get download link");
      }
    } catch (err) {
      alert("Failed to download invoice");
    }
    setDownloading(false);
  };

  return (
    <main className="govuk-main-wrapper" id="main-content">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" to={`${NWL_BASE_URL}/${applicationId}/task-list`}>
              Task list
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" to={`${NWL_BASE_URL}/${applicationId}/payment`}>
              Pay and submit
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">Invoice</li>
        </ol>
      </nav>

      <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Your invoice</h1>
      <p className="govuk-body">Your invoice number is:</p>
      <p className="govuk-!-font-weight-bold govuk-!-margin-bottom-4">{invoiceNumber}</p>

      {loading ? (
        <>
          <style>{`
            @keyframes hods-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .hods-loading-spinner { display:flex; align-items:center; gap:16px; margin-top:24px; }
            .hods-loading-spinner__spinner { width:44px; height:44px; border-radius:50%; border:4px solid #e6eef6; border-top-color:#005ea5; animation: hods-spin 1s linear infinite; }
            .hods-loading-spinner__content h1 { font-size: 1.125rem; margin:0; font-weight:600; }
          `}</style>
          <div className="hods-loading-spinner" role="status" aria-live="polite" aria-busy="true">
            <div className="hods-loading-spinner__spinner"></div>
            <div className="hods-loading-spinner__content">
              <h1 className="govuk-heading-m">Generating Invoice</h1>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="govuk-inset-text govuk-!-margin-bottom-6">
            ✅ Your invoice has been generated and is ready for download.
          </div>

          <div style={{ marginBottom: 16 }}>
            <button
              className="govuk-button"
              type="button"
              onClick={handleDownload}
              disabled={!applicationId || downloading}
            >
              {downloading ? "Preparing download..." : "Download invoice"}
            </button>

            <button
              className="govuk-button govuk-button--secondary"
              type="button"
              onClick={() => navigate(`/nwl/${applicationId}/payment`)}
              style={{ marginLeft: 12 }}
            >
              Continue to payment
            </button>
          </div>
        </>
      )}
    </main>
  );
};

export default Invoice;