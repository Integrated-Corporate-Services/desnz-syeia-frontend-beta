import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { NWL_BASE_URL } from "../../../../constants/nwl";

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

    // Generate an invoice number in the format "NWL" + 8-digits.
    // If applicationId is available we derive a deterministic 8-digit number from it,
    // otherwise we create a random 8-digit number.
    const generateInvoiceNumber = (seed?: string) => {
        const to8Digits = (s?: string) => {
            if (!s) {
                // Random 8 digit
                return Math.floor(Math.random() * 1e8).toString().padStart(8, "0");
            }
            // Simple stable hash -> absolute -> mod 1e8 -> pad
            let hash = 0;
            for (let i = 0; i < s.length; i++) {
                hash = ((hash << 5) - hash) + s.charCodeAt(i);
                hash |= 0;
            }
            return (Math.abs(hash) % 1e8).toString().padStart(8, "0");
        };

        return `NWL${to8Digits(seed)}`;
    };

    // Keep invoiceNumber stable for the current applicationId
    const invoiceNumber = useMemo(() => generateInvoiceNumber(applicationId || undefined), [applicationId]);

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

            const candidates = [
                `/backend/api/nwl/${applicationId}/invoice`,
                `/api/nwl/${applicationId}/invoice`
            ];

            for (const url of candidates) {
                try {
                    const res = await fetch(url, { cache: "no-cache", signal: controller.signal });
                    if (!res.ok) {
                        console.debug("Invoice fetch failed", url, res.status);
                        continue;
                    }
                    const blob = await res.blob();
                    if (!blob || blob.size === 0) {
                        console.debug("Empty blob returned from", url);
                        continue;
                    }

                    const objectUrl = URL.createObjectURL(blob);
                    pdfObjectUrlRef.current = objectUrl;
                    if (!cancelled) setPdfUrl(objectUrl);
                    return;
                } catch (err: any) {
                    if (err.name === "AbortError") return;
                    console.error("invoice preview fetch error for", url, err);
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
        if (!applicationId) return;
        const url = `/backend/api/nwl/${applicationId}/invoice?download=true`;
        window.open(url, "_blank", "noopener");
    };

    return (
        <main className="govuk-main-wrapper" id="main-content">
            <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
                <ol className="govuk-breadcrumbs__list">
                    <li className="govuk-breadcrumbs__list-item">
                        <Link
                            className="govuk-breadcrumbs__link"
                            to={`${NWL_BASE_URL}/${applicationId}/task-list`}
                        >
                            Task list
                        </Link>
                    </li>

                    <li className="govuk-breadcrumbs__list-item">
                        <Link
                            className="govuk-breadcrumbs__link"
                            to={`${NWL_BASE_URL}/${applicationId}/payment`}
                        >
                            Pay and submit
                        </Link>
                    </li>

                    <li className="govuk-breadcrumbs__list-item" aria-current="page">Invoice</li>
                </ol>
            </nav>

            <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Your invoice</h1>
            <p className="govuk-body">Your invoice number is:</p>
            <p className="govuk-!-font-weight-bold govuk-!-margin-bottom-1">{invoiceNumber}</p>

            <div style={{ marginBottom: 16 }}>
                <button
                    className="govuk-button"
                    type="button"
                    onClick={handleDownload}
                    disabled={!applicationId}
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