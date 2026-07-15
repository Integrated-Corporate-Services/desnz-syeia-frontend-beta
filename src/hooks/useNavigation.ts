import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';
import { urlValidator } from '../validators/url/validator';

export function useNavigation() {
  const routerNavigate = useNavigate();
  
  const navigate = useCallback((
    to: string | null | undefined,
    options?: { replace?: boolean; state?: any }
  ) => {
    if (!to) {
      return;
    }
    
    const validatedUrl = urlValidator.validate(to);
    
    if (!validatedUrl) {
      routerNavigate('/application-dashboard', options);
      return;
    }
    
    routerNavigate(validatedUrl, options);
  }, [routerNavigate]);
  
  return navigate;
}

export function useRedirectParam(paramName: string = 'next'): string | null {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get(paramName);
  
  return urlValidator.validate(redirectUrl);
}

export function useQueryParam(paramName: string): string | null {
  const [searchParams] = useSearchParams();
  
  const currentUrl = typeof window !== 'undefined'
    ? window.location.pathname + window.location.search
    : '';
    
  const validatedUrl = urlValidator.validate(currentUrl);
  
  if (!validatedUrl) {
    return null;
  }
  
  return searchParams.get(paramName);
}

export function useQueryParams(paramNames: string[]): Record<string, string | null> {
  const [searchParams] = useSearchParams();
  
  const currentUrl = typeof window !== 'undefined'
    ? window.location.pathname + window.location.search
    : '';
    
  const validatedUrl = urlValidator.validate(currentUrl);
  
  if (!validatedUrl) {
    return paramNames.reduce((acc, name) => ({ ...acc, [name]: null }), {});
  }
  
  return paramNames.reduce((acc, name) => ({
    ...acc,
    [name]: searchParams.get(name),
  }), {});
}
