import React from 'react';
import { NOTICE_HEADINGS } from '../../RecordNotices/constants/noticesConstants';
import { inspectionAddresses, noticeDateText } from '../../RecordNotices/utils/noticeRecord';
import type { CpoAnswers } from '../hooks/useCpoApplicationAnswers';
import {
  completedNotice,
  fileList,
  noticeFiles,
  NOT_ANSWERED,
  type FileListOptions,
} from '../utils/answerDisplay';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from './SummaryList';

interface Props {
  notices: CpoAnswers['notices'];
  changeUrl?: string;
  fileOptions: FileListOptions;
}

export const RecordNoticesSummaryCard: React.FC<Props> = ({ notices, changeUrl, fileOptions }) => {
  const addresses = inspectionAddresses(notices.record.inspection);
  const websiteUrl = notices.record.website?.url?.trim();
  const websiteLiveDate = notices.record.website?.liveDate?.trim();

  return (
    <SummaryCard title="Record your notices" changeUrl={changeUrl}>
      {addresses.length
        ? addresses.map((address, index) => (
          <SummaryRow key={address.id} label={`Inspection address ${index + 1}`}>
            {[address.line1, address.line2, address.townCity, address.county].filter(Boolean).join(', ')}
            {address.postcode && `\n${address.postcode}`}
            {'\n'}
            Available from {noticeDateText(address.from)}
          </SummaryRow>
        ))
        : <SummaryRow label="Inspection address">{NOT_ANSWERED}</SummaryRow>}
      <SummaryRow label={NOTICE_HEADINGS.online}>{notices.record.online?.url || NOT_ANSWERED}</SummaryRow>
      {(websiteUrl || websiteLiveDate) && (
        <SummaryRow label={NOTICE_HEADINGS.website}>
          {websiteUrl}
          {websiteLiveDate && (
            <p className="govuk-!-margin-top-0 govuk-!-margin-bottom-0">Went live {noticeDateText(websiteLiveDate)}</p>
          )}
        </SummaryRow>
      )}
      <SummaryRow label={NOTICE_HEADINGS.newspapers}>
        {fileList(noticeFiles(notices, 'newspapers', 'Published'), fileOptions)}
      </SummaryRow>
      <SummaryRow label={NOTICE_HEADINGS.site}>{completedNotice(notices, 'site', 'Displayed', fileOptions)}</SummaryRow>
      <SummaryRow label={NOTICE_HEADINGS.people}>{completedNotice(notices, 'people', 'Last notice served', fileOptions)}</SummaryRow>
    </SummaryCard>
  );
};

export default RecordNoticesSummaryCard;
