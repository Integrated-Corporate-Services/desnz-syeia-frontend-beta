import React, { useEffect, useState } from "react";
import { applicationApiService } from "../../../services/applicationApiService";

type Assignee = { user_id: string; first_name: string; last_name: string; email: string; is_agent: boolean };
type HistoryEntry = { previous_assignee_name?: string; new_assignee_name: string; assigned_by_name: string; assigned_at: string; justification: string };
type AssignmentDetails = { application_reference: string | null; current_assignee_name: string | null; history: HistoryEntry[] };

export const ApplicationReassignment: React.FC<{ applicationId: string; status: string | null; canReassign?: boolean }> = ({ applicationId, status, canReassign = false }) => {
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [details, setDetails] = useState<AssignmentDetails>({ application_reference: null, current_assignee_name: null, history: [] });
  const [selectedId, setSelectedId] = useState("");
  const [justification, setJustification] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const terminal = ["COMPLETED", "WITHDRAWN", "CLOSED", "ARCHIVED", "INVALID"].includes((status || "").toUpperCase());

  useEffect(() => {
    if (terminal) return;
    Promise.all([
      canReassign ? applicationApiService.getEligibleAssignees(applicationId) : Promise.resolve([]),
      applicationApiService.getAssignmentHistory(applicationId),
    ]).then(([eligible, assignmentDetails]) => { setAssignees(eligible); setDetails(assignmentDetails); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load reassignment details"));
  }, [applicationId, terminal, canReassign]);

  const selected = assignees.find((assignee) => assignee.user_id === selectedId);
  const submit = async () => {
    if (!selected || !justification.trim()) return;
    try {
      setError(null);
      await applicationApiService.reassignApplication(applicationId, selected.user_id, justification.trim());
      setMessage(`Application reassigned to ${selected.first_name} ${selected.last_name}.`);
      setConfirming(false);
      setJustification("");
      setDetails(await applicationApiService.getAssignmentHistory(applicationId));
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Unable to reassign application");
    }
  };

  if (terminal || error && !assignees.length) return error ? <p className="govuk-error-message" role="alert">{error}</p> : null;

  return <section className="govuk-!-margin-top-6" aria-labelledby="reassignment-heading">
    <h2 className="govuk-heading-m" id="reassignment-heading">Application ownership</h2>
    {message && <p className="govuk-panel govuk-panel--confirmation">{message}</p>}
    {error && <p className="govuk-error-message" role="alert">{error}</p>}
    <p className="govuk-body"><strong>Current assignee:</strong> {details.current_assignee_name || "Not assigned"}</p>
    {canReassign && !confirming ? <>
      <label className="govuk-label" htmlFor="new-assignee">Reassign application to</label>
      <select className="govuk-select" id="new-assignee" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
        <option value="">Select a user</option>
        {assignees.map((assignee) => <option key={assignee.user_id} value={assignee.user_id}>{assignee.first_name} {assignee.last_name}{assignee.is_agent ? " (agent)" : ""} - {assignee.email}</option>)}
      </select>
      <button className="govuk-button govuk-!-margin-top-3" type="button" disabled={!selectedId} onClick={() => setConfirming(true)}>Continue</button>
    </> : canReassign && <div className="govuk-inset-text">
      <p className="govuk-body"><strong>Application:</strong> {details.application_reference || applicationId}</p>
      <p className="govuk-body"><strong>Current assignee:</strong> {details.current_assignee_name || "Not assigned"}</p>
      <p className="govuk-body">Reassign to <strong>{selected?.first_name} {selected?.last_name}</strong>?</p>
      <label className="govuk-label" htmlFor="reassignment-justification">Reason for reassignment</label>
      <textarea className="govuk-textarea" id="reassignment-justification" value={justification} onChange={(event) => setJustification(event.target.value)} />
      <button className="govuk-button govuk-!-margin-top-3" type="button" disabled={!justification.trim()} onClick={submit}>Confirm reassignment</button>{" "}
      <button className="govuk-button govuk-button--secondary" type="button" onClick={() => setConfirming(false)}>Cancel</button>
    </div>}
    {details.history.length > 0 && <><h3 className="govuk-heading-s">Assignment history</h3><a className="govuk-link" href={`#assignment-history-${applicationId}`}>View reassignment history</a><ul className="govuk-list govuk-list--bullet" id={`assignment-history-${applicationId}`}>{details.history.map((entry, index) => <li key={`${entry.assigned_at}-${index}`}>{entry.previous_assignee_name || "Unassigned"} to {entry.new_assignee_name} on {new Date(entry.assigned_at).toLocaleDateString("en-GB").replaceAll("/", ".")}, {new Date(entry.assigned_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} by {entry.assigned_by_name}</li>)}</ul></>}
  </section>;
};