export type ApplicationType = 'NWL' | 'S37';

export const detectApplicationTypeFromPath = (pathname: string): ApplicationType => {
    if (pathname.includes('/nwl/')) return 'NWL';
    if (pathname.includes('/tlp/')) return 'TLP';
    return 'S37';
};

export const getApplicationTypeFromLocation = (location: { pathname: string }): ApplicationType => {
    return detectApplicationTypeFromPath(location.pathname);
};
