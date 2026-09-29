import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { applicationApiService } from "../../../services/applicationApiService";
import { useAuthUserContext } from "../../../context/AuthUserContext";
import { getUserRole } from "../../../utils/roleUtils";

type Assignee = { user_id: string; first_name: string; last_name: string; email: string; is_agent: boolean };
type HistoryEntry = { previous_assignee_name?: string; new_assignee_name: string; assigned_by_name: string; assigned_at: string };
type AssignmentDetails = { application_reference: string | null; current_assignee_name: string | null; history: HistoryEntry[] };

const isTerminal = (status: string | null) => ["COMPLETED", "WITHDRAWN", "CLOSED", "ARCHIVED", "INVALID"].includes((status || "").toUpperCase().replaceAll(" ", "_"));
const formatReassignmentDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return `${new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date).replaceAll("/", ".")}, ${new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date)}`;
};

export const ReassignmentSuccessBanner: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [success] = useState<{ reference: string; name: string } | null>(() => location.state?.reassignment || null);
  useEffect(() => {
    if (success) navigate(location.pathname, { replace: true, state: null });
  }, [success, navigate, location.pathname]);
  return success && <div className="govuk-notification-banner govuk-notification-banner--success" role="status"><div className="govuk-notification-banner__header"><h2 className="govuk-notification-banner__title">Success</h2></div><div className="govuk-notification-banner__content"><h3 className="govuk-notification-banner__heading">Application reassigned</h3><p className="govuk-body">{success.reference} is now assigned to {success.name}.</p></div></div>;
};

export const ApplicationReassignmentLinks: React.FC<{ applicationId: string; status: string | null }> = ({ applicationId, status }) => {
  const { user } = useAuthUserContext();
  const { pathname } = useLocation();
  const [lastActor, setLastActor] = useState<string | null>(null);
  useEffect(() => { applicationApiService.getAssignmentHistory(applicationId).then((details: AssignmentDetails) => setLastActor(details.history[0]?.assigned_by_name || null)).catch(() => setLastActor(null)); }, [applicationId]);
  const base = pathname.replace(/\/application-summary\/?$/, "");
  const canReassign = ["SUPERUSER", "APPLICANT_TEAM_COORDINATOR"].includes(getUserRole(user as any) || "");
  return <div className="govuk-!-margin-top-6">
    {canReassign && !isTerminal(status) && <p><Link className="govuk-button govuk-button--secondary" to={`${base}/reassign`}>Reassign application</Link></p>}
    {lastActor && <p className="govuk-body">Last reassigned by {lastActor}</p>}
    <Link className="govuk-link" to={`${base}/reassignment-history`}>View reassignment history</Link>
  </div>;
};

export const ApplicationReassignment: React.FC<{ applicationId: string; status: string | null }> = ({ applicationId, status }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [details, setDetails] = useState<AssignmentDetails>({ application_reference: null, current_assignee_name: null, history: [] });
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const terminal = isTerminal(status);

  useEffect(() => {
    if (terminal) return;
    Promise.all([
      applicationApiService.getEligibleAssignees(applicationId),
      applicationApiService.getAssignmentHistory(applicationId),
    ]).then(([eligible, assignmentDetails]) => { setAssignees(eligible); setDetails(assignmentDetails); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load reassignment details"));
  }, [applicationId, terminal]);

  const selected = assignees.find((assignee) => assignee.user_id === selectedId);
  const submit = async () => {
    if (!selected || submitting) return;
    try {
      setSubmitting(true);
      setError(null);
      await applicationApiService.reassignApplication(applicationId, selected.user_id, "Manual application reassignment");
      navigate(pathname.replace(/\/reassign\/?$/, "/application-summary"), { state: { reassignment: { reference: details.application_reference || applicationId, name: `${selected.first_name} ${selected.last_name}` } } });
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Unable to reassign application");
      setSubmitting(false);
    }
  };

  if (terminal || error && !assignees.length) return error ? <p className="govuk-error-message" role="alert">{error}</p> : null;

  return <section className="govuk-!-margin-top-6" aria-labelledby="reassignment-heading">
    <h1 className="govuk-heading-l" id="reassignment-heading">{confirming ? "Check before you reassign" : "Who do you want to reassign this application to?"}</h1>
    {error && <p className="govuk-error-message" role="alert">{error}</p>}
    {!confirming ? <>
      <p className="govuk-body">{details.application_reference || applicationId} is currently assigned to {details.current_assignee_name || "no one"}. Choose a new applicant contact to reassign the application to them.</p>
      <label className="govuk-label" htmlFor="new-assignee">Choose a new applicant contact</label>
      <div className="govuk-hint">Start typing a name or email address.</div>
      <input className="govuk-input" id="new-assignee" type="search" autoComplete="off" value={search} onChange={(event) => { setSearch(event.target.value); setSelectedId(""); }} />
      {search && !selectedId && <ul className="govuk-list" aria-label="Matching contacts">{assignees.filter((assignee) => `${assignee.first_name} ${assignee.last_name} ${assignee.email}`.toLowerCase().includes(search.toLowerCase())).map((assignee) => <li key={assignee.user_id}><button className="govuk-button govuk-button--secondary govuk-!-margin-bottom-1" type="button" onClick={() => { setSelectedId(assignee.user_id); setSearch(`${assignee.first_name} ${assignee.last_name} - ${assignee.email}`); }}>{assignee.first_name} {assignee.last_name}{assignee.is_agent ? " (agent)" : ""} - {assignee.email}</button></li>)}</ul>}
      <button className="govuk-button govuk-!-margin-top-3" type="button" disabled={!selectedId} onClick={() => setConfirming(true)}>Continue</button>
    </> : <>
      <dl className="govuk-summary-list"><div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">DESNZ reference</dt><dd className="govuk-summary-list__value">{details.application_reference || applicationId}</dd></div><div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">Current assignee</dt><dd className="govuk-summary-list__value">{details.current_assignee_name || "Not assigned"}</dd></div><div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">New assignee</dt><dd className="govuk-summary-list__value">{selected?.first_name} {selected?.last_name}</dd></div></dl>
      <h2 className="govuk-heading-s">What happens next</h2><p className="govuk-body">The new assignee will become the contact person for this application. We will email relevant contacts to tell them about this reassignment.</p>
      {(status || "").toUpperCase().replaceAll(" ", "_") === "FURTHER_INFORMATION_REQUESTED" && <div className="govuk-inset-text">A further information request is still outstanding. We will email this request to the new assignee.</div>}
      <button className="govuk-button govuk-!-margin-top-3" type="button" disabled={submitting} onClick={submit}>Reassign now</button>{" "}
      <button className="govuk-button govuk-button--secondary" type="button" disabled={submitting} onClick={() => setConfirming(false)}>Cancel</button>
    </>}
  </section>;
};

export const ReassignmentPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { user } = useAuthUserContext();
  const { pathname } = useLocation();
  const base = pathname.replace(/\/reassign\/?$/, "");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (applicationId) applicationApiService.getApplicationById(applicationId).then((application) => setStatus(application.status)).catch(() => setError("Unable to load application")); }, [applicationId]);
  const allowed = ["SUPERUSER", "APPLICANT_TEAM_COORDINATOR"].includes(getUserRole(user as any) || "");
  return <div className="govuk-width-container"><Link className="govuk-back-link" to={`${base}/application-summary`}>Back</Link><main className="govuk-main-wrapper">{error && <p role="alert" className="govuk-error-message">{error}</p>}{status && (isTerminal(status) || !allowed) && <p className="govuk-body">This application cannot be reassigned.</p>}{status && !isTerminal(status) && allowed && applicationId && <ApplicationReassignment applicationId={applicationId} status={status} />}</main></div>;
};

export const ReassignmentHistoryPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { pathname } = useLocation();
  const base = pathname.replace(/\/reassignment-history\/?$/, "");
  const [details, setDetails] = useState<AssignmentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (applicationId) applicationApiService.getAssignmentHistory(applicationId).then(setDetails).catch(() => setError("Unable to load reassignment history")); }, [applicationId]);
  return <div className="govuk-width-container"><Link className="govuk-back-link" to={`${base}/application-summary`}>Back</Link><main className="govuk-main-wrapper"><span className="govuk-caption-l">{details?.application_reference || applicationId}</span><h1 className="govuk-heading-l">Reassignment history</h1>{error && <p role="alert" className="govuk-error-message">{error}</p>}{details && (details.history.length ? <div className="govuk-summary-card"><div className="govuk-summary-card__title-wrapper"><h2 className="govuk-summary-card__title">Reassignments</h2></div><div className="govuk-summary-card__content"><dl className="govuk-summary-list">{details.history.map((entry, index) => <div className="govuk-summary-list__row" key={`${entry.assigned_at}-${index}`}><dt className="govuk-summary-list__key">{formatReassignmentDate(entry.assigned_at)}</dt><dd className="govuk-summary-list__value">Reassigned from {entry.previous_assignee_name || "Unassigned"} to {entry.new_assignee_name} by {entry.assigned_by_name}.</dd></div>)}</dl></div></div> : <p className="govuk-body">No reassignments recorded.</p>)}<Link className="govuk-link" to={`${base}/application-summary`}>Back to application summary</Link></main></div>;
};