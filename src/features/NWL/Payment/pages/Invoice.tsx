import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Invoice: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loadingPdf, setLoadingPdf] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pdfObjectUrlRef = useRef<string | null>(null);

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
  const invoiceNumber = "[invoice number]";

  useEffect(() => {
    if (!applicationId) {
      setLoadingPdf(false);
      setError("Missing application id");
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function fetchPdfPreview() {
      setLoadingPdf(true);
      setError(null);
      setPdfUrl('');

      // candidate endpoints (try both common backend mounts)
      const candidates = [
        `/backend/api/nwl/${applicationId}/invoice`,
        `/api/nwl/${applicationId}/invoice`
      ];

      for (const url of candidates) {
        try {
          const res = await fetch(url, { cache: "no-cache", signal: controller.signal });
          if (!res.ok) {
            // try next candidate
            console.debug("Invoice fetch failed", url, res.status);
            continue;
          }
          const blob = await res.blob();

          // create object URL and keep ref for cleanup
          const objectUrl = URL.createObjectURL(blob);
          pdfObjectUrlRef.current = objectUrl;
          if (!cancelled) setPdfUrl(objectUrl);
          return;
        } catch (err: any) {
          if (err.name === "AbortError") {
            return;
          }
          console.error("invoice preview fetch error for", url, err);
          // try next candidate
        }
      }

      if (!cancelled) setError("Preview not available — backend returned no usable PDF");
    }

    fetchPdfPreview().finally(() => { if (!cancelled) setLoadingPdf(false); });

    return () => {
      cancelled = true;
      controller.abort();
      if (pdfObjectUrlRef.current) {
        URL.revokeObjectURL(pdfObjectUrlRef.current);
        pdfObjectUrlRef.current = null;
      }
    };
  }, [applicationId]);

  const handleDownload = () => {
    // open the download endpoint; prefer /backend first. Adjust if your server uses /api/nwl.
    const url = `/backend/api/nwl/${applicationId}/invoice?download=true`;
    window.open(url, "_blank", "noopener");
  };

  return (
    <main className="govuk-main-wrapper" id="main-content">
      <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Your invoice</h1>
      <p className="govuk-!-font-weight-bold govuk-!-margin-bottom-6">{invoiceNumber}</p>

      <div style={{ marginBottom: 16 }}>
        <button
          className="govuk-button"
          type="button"
          onClick={handleDownload}
        >
          Download invoice
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

      <div style={{ marginTop: 24 }}>
        {loadingPdf && (
          <>
            <style>{`
              @keyframes hods-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              .hods-loading-spinner { display:flex; align-items:center; gap:16px; }
              .hods-loading-spinner__spinner { width:44px; height:44px; border-radius:50%; border:4px solid #e6eef6; border-top-color:#005ea5; animation: hods-spin 1s linear infinite; }
              .hods-loading-spinner__content h1 { font-size: 1.125rem; margin:0; font-weight:600; }
            `}</style>

            <div className="hods-loading-spinner" role="status" aria-live="polite" aria-busy="true">
              <div className="hods-loading-spinner__spinner" />
              <div className="hods-loading-spinner__content">
                <h1 className="govuk-heading-m">Loading invoice preview</h1>
              </div>
            </div>
          </>
        )}

        {!loadingPdf && error && (
          <div className="govuk-error-message" role="alert">{error}</div>
        )}

        {!loadingPdf && !error && pdfUrl && (
          <iframe
            title="Invoice preview"
            src={pdfUrl}
            style={{ width: "100%", height: "800px", border: "1px solid #ccc" }}
          />
        )}
      </div>
    </main>
  );
};

export default Invoice;