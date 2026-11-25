import React from 'react';
import type { StatusDisplay, StatusKind } from '../constants';
import { getScanDisplay, getStatusDisplay } from '../utils/format';

interface Props {
  kind: StatusKind;
  status: string | null | undefined;
}

/** A govuk-tag whose text always says the status, so colour is never the only signal. */
export const StatusTag: React.FC<{ display: StatusDisplay }> = ({ display }) => (
  <strong className={`govuk-tag govuk-tag--${display.colour}`}>{display.label}</strong>
);

const MigrationStatusTag: React.FC<Props> = ({ kind, status }) => (
  <StatusTag display={getStatusDisplay(kind, status)} />
);

export const ScanStatusTag: React.FC<{ scanStatus?: string | null; scanResult?: string | null }> = ({
  scanStatus,
  scanResult,
}) => <StatusTag display={getScanDisplay(scanStatus, scanResult)} />;

export default MigrationStatusTag;
