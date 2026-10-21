import { useEffect, useRef, useState } from 'react';
import { applicationApiService } from '../../../services/applicationApiService';
import { isReassignmentTerminal } from '../constants/reassignment';
import type {
    AssignmentDetails,
    EligibleAssignee,
    ReassignmentSuccess,
} from '../types/applicationReassignment';

export function useReassignmentForm(applicationId: string, status: string | null) {
    const terminal = isReassignmentTerminal(status);
    const [loaded, setLoaded] = useState<{
        applicationId: string;
        assignees: EligibleAssignee[];
        details: AssignmentDetails;
    } | null>(null);
    const [selectedId, setSelectedId] = useState('');
    const [search, setSearch] = useState('');
    const [justification, setJustification] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const pending = useRef(false);
    const currentApplicationId = useRef(applicationId);
    currentApplicationId.current = applicationId;

    useEffect(() => {
        let active = true;
        setLoaded(null);
        setSelectedId('');
        setSearch('');
        setJustification('');
        setConfirming(false);
        setError(null);
        if (terminal) return;
        Promise.all([
            applicationApiService.getEligibleAssignees(applicationId),
            applicationApiService.getAssignmentHistory(applicationId),
        ])
            .then(([assignees, details]) => {
                if (active) setLoaded({ applicationId, assignees, details });
            })
            .catch(() => {
                if (active) setError('Unable to load reassignment details. Try again later.');
            });
        return () => {
            active = false;
        };
    }, [applicationId, terminal]);

    const data = loaded?.applicationId === applicationId ? loaded : null;
    const selected = data?.assignees.find((assignee) => assignee.user_id === selectedId);
    const changeSearch = (value: string) => {
        setSearch(value);
        setSelectedId('');
    };
    const selectAssignee = (assignee: EligibleAssignee) => {
        setSelectedId(assignee.user_id);
        setSearch(`${assignee.first_name} ${assignee.last_name} - ${assignee.email}`);
    };

    const submit = async (): Promise<ReassignmentSuccess | null> => {
        if (!selected || !justification.trim() || terminal || pending.current) return null;
        pending.current = true;
        setSubmitting(true);
        setError(null);
        try {
            await applicationApiService.reassignApplication(
                applicationId,
                selected.user_id,
                justification.trim()
            );
            if (currentApplicationId.current !== applicationId) return null;
            return {
                reference: data?.details.application_reference || applicationId,
                name: `${selected.first_name} ${selected.last_name}`,
            };
        } catch (reason: unknown) {
            if (currentApplicationId.current === applicationId)
                setError(
                    reason instanceof Error
                        ? reason.message
                        : 'Unable to reassign application. Try again later.'
                );
            return null;
        } finally {
            pending.current = false;
            setSubmitting(false);
        }
    };

    return {
        data,
        selected,
        selectedId,
        search,
        changeSearch,
        selectAssignee,
        justification,
        setJustification,
        confirming,
        setConfirming,
        submitting,
        error,
        loading: !terminal && !data && !error,
        terminal,
        submit,
    };
}
