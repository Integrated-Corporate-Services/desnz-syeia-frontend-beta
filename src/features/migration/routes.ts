import type React from 'react';
import { MIGRATION_PATHS } from './constants';
import {
  AddDocumentPage,
  BatchConfirmationPage,
  BatchDetailsPage,
  BatchesPage,
  BatchIdPage,
  CasesFilePage,
  CheckBatchPage,
  MigratedApplicationPage,
} from './pages';

interface MigrationRoute {
  path: string;
  component: React.ComponentType;
  auth: boolean;
  layout: boolean;
}

/*
 * Param names deliberately avoid ":applicationId" so App.tsx does not wrap these pages in the
 * applicant ApplicationAccessGuard. Every page also checks the TECH_ADMIN role itself.
 * The static "/batches/new..." paths are listed before "/batches/:batchId".
 */
const routes: MigrationRoute[] = [
  { path: MIGRATION_PATHS.NEW_BATCH, component: BatchIdPage, auth: true, layout: true },
  { path: MIGRATION_PATHS.NEW_BATCH_FILE, component: CasesFilePage, auth: true, layout: true },
  { path: MIGRATION_PATHS.NEW_BATCH_CHECK, component: CheckBatchPage, auth: true, layout: true },
  { path: MIGRATION_PATHS.NEW_BATCH_CONFIRMATION, component: BatchConfirmationPage, auth: true, layout: true },
  { path: MIGRATION_PATHS.BATCHES, component: BatchesPage, auth: true, layout: true },
  { path: MIGRATION_PATHS.BATCH_DETAILS, component: BatchDetailsPage, auth: true, layout: true },
  { path: MIGRATION_PATHS.APPLICATION, component: MigratedApplicationPage, auth: true, layout: true },
  { path: MIGRATION_PATHS.ADD_DOCUMENT, component: AddDocumentPage, auth: true, layout: true },
];

/** Always registered; each page allows only the TECH_ADMIN role. */
export const getMigrationRoutes = (): MigrationRoute[] => routes;
