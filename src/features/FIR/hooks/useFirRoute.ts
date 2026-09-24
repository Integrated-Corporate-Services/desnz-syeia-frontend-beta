import { useLocation, useParams } from 'react-router-dom';

export const useFirRoute = () => {
  const { applicationId, requestId } = useParams<{
    applicationId: string;
    requestId: string;
  }>();
  const location = useLocation();

  const requestPath = applicationId
    ? `${location.pathname.startsWith('/nwl/') ? '/nwl' : '/s-37'}/${applicationId}/further-information-requests`
    : '';

  return { applicationId, requestId, requestPath, location };
};
