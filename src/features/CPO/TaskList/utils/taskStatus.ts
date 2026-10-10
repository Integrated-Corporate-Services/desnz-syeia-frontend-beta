import { CPO_SUBSECTIONS, CPO_TASK_SECTIONS } from '../constants/cpoTaskListConstants';
import type { CpoProgressItem, CpoTaskStatus } from '../types/cpoTaskList';

export const buildProgressByTask = (progress: CpoProgressItem[], application: any): Map<string, string> =>
  new Map(progress.map(item => [item.subsection_name,
    item.subsection_name === CPO_SUBSECTIONS.RECORD_NOTICES && item.status.toLowerCase() === 'completed'
      && (application?.cpo_publicity?.requirements?.acknowledged !== true || application?.cpo_publicity?.check?.confirmed !== true)
      ? 'Not completed' : item.status]));

export const areAllOtherTasksCompleted = (progressByTask: Map<string, string>): boolean =>
  CPO_TASK_SECTIONS.flatMap((section) => section.tasks)
    .filter((task) => task.subsection !== CPO_SUBSECTIONS.CHECK_AND_SUBMIT)
    .every((task) => progressByTask.get(task.subsection)?.toLowerCase() === 'completed');

export const getTaskStatus = (subsection: string, progressByTask: Map<string, string>): CpoTaskStatus => {
  if (subsection === CPO_SUBSECTIONS.CHECK_AND_SUBMIT && !areAllOtherTasksCompleted(progressByTask)) {
    return 'Cannot start yet';
  }
  const status = progressByTask.get(subsection)?.toLowerCase();
  return status === 'completed' ? 'Completed' : status === 'in progress' ? 'In progress' : 'Not completed';
};

export const getStatusColour = (status: CpoTaskStatus): 'green' | 'grey' | 'blue' =>
  status === 'Completed' ? 'green' : status === 'Cannot start yet' ? 'grey' : 'blue';
