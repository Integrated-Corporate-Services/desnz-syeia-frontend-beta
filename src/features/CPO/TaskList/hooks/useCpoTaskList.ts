import { useEffect, useMemo, useState } from 'react';
import { cpoTaskListService } from '../services/cpoTaskListService';
import type { CpoProgressItem, CpoTaskStatus } from '../types/cpoTaskList';
import { buildProgressByTask, getTaskStatus } from '../utils/taskStatus';

export const useCpoTaskList = (applicationId: string) => {
  const [application, setApplication] = useState<any>(null);
  const [progress, setProgress] = useState<CpoProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    cpoTaskListService.load(applicationId)
      .then((data) => {
        if (!active) return;
        setApplication(data.application);
        setProgress(data.progress);
      })
      .catch(() => { if (active) setError('Unable to load the CPO task list. Refresh the page to try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applicationId]);

  const progressByTask = useMemo(() => buildProgressByTask(progress, application), [progress, application]);
  const statusOf = (subsection: string): CpoTaskStatus => getTaskStatus(subsection, progressByTask);

  return { application, loading, error, statusOf };
};
