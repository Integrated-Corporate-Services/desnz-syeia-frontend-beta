export const formatReassignmentDate = (timestamp: string) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return `${new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date).replaceAll('/', '.')}, ${new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date)}`;
};

export const getAssignmentBasePath = (pathname: string) =>
    pathname.replace(/\/(application-summary|reassign|reassignment-history)\/?$/, '');
