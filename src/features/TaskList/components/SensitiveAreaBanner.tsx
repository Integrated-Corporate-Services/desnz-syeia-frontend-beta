import React from 'react';

interface SensitiveAreaStatus {
  inProgress: boolean;
  completed: number;
  total: number;
}

interface SensitiveAreaBannerProps {
  status: SensitiveAreaStatus | null;
}

const SensitiveAreaBanner: React.FC<SensitiveAreaBannerProps> = ({ status }) => {
  if (!status || !status.inProgress) return null;
  return (
    <div style={{ border: '4px solid #2074c7', background: '#eaf4fb', padding: '1rem', marginBottom: '2rem' }}>
      <strong>Sensitive area checks in progress</strong>
      <div style={{ marginTop: 8 }}>
        {`${status.completed} of ${status.total} checks completed. You can refresh this page to track the progress`}
      </div>
    </div>
  );
};

export default SensitiveAreaBanner;
