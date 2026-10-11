export type CpoTask = {
  readonly subsection: string;
  readonly label: string;
  readonly slug: string;
};

export type CpoTaskSection = {
  readonly title: string;
  readonly tasks: readonly CpoTask[];
};

export type CpoProgressItem = {
  subsection_name: string;
  status: string;
};

export type CpoTaskStatus = 'Completed' | 'In progress' | 'Not completed' | 'Cannot start yet';

export type CpoTaskListData = {
  application: any;
  progress: CpoProgressItem[];
};
