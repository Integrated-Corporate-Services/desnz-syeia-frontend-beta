import { SummaryRow } from '../types';

export const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return dateObj.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};


export const formatBoolean = (value: boolean | null | undefined, yesText: string = 'Yes', noText: string = 'No'): string => {
    if (value === null || value === undefined) return '';
    return value ? yesText : noText;
};

export const formatAddress = (address: { line1?: string; line2?: string; town_city?: string; county?: string; postcode?: string }): string => {
    if (!address) return '';

    const lines = [address.line1, address.line2, address.town_city, address.county, address.postcode].filter(Boolean);

    return lines.join('<br>');
};

export const formatList = (items: string[]): string => {
    if (!items || items.length === 0) return 'None';

    return `<ul class="govuk-list govuk-list--bullet">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
};

export const createSummaryRow = (key: string, value: string, changeLink?: string, changeLinkText: string = 'Change'): SummaryRow => {
    const row: SummaryRow = {
        key: { text: key },
        value: value.includes('<') ? { text: '', html: value } : { text: value },
    };

    if (changeLink) {
        row.actions = {
            items: [
                {
                    href: changeLink,
                    text: changeLinkText,
                    visuallyHiddenText: key.toLowerCase(),
                },
            ],
        };
    }

    return row;
};

export const truncateText = (text: string, maxLength: number = 100): string => {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

export const getApplicationOptionText = (groundsForApplication: string): string => {
    const mapping: { [key: string]: string } = {
        'wayleave_expired': 'Wayleave expired',
        'wayleave_terminated': 'Wayleave terminated',
        'no_wayleave_exists': 'No wayleave exists',
    };
    return mapping[groundsForApplication] || groundsForApplication;
};

export const getWayleaveTypeText = (wayleaveType: string): string => {
    const mapping: { [key: string]: string } = {
        'wayleave': 'Wayleave',
        'interim_necessary_wayleave': 'Inherited necessary wayleave',
        'implied_wayleave': 'Implied wayleave',
    };
    return mapping[wayleaveType] || wayleaveType;
};

export const formatEnumValue = (value: string | null | undefined): string => {
    if (!value) return '';

    return value
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export const formatPhone = (phone: string | null | undefined): string => {
    return phone || '';
};

export const formatEmail = (email: string | null | undefined): string => {
    return email || '';
};


export const getNestedProperty = (obj: any, path: string, defaultValue: any = ''): any => {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
        if (result === null || result === undefined) {
            return defaultValue;
        }
        result = result[key];
    }

    return result !== null && result !== undefined ? result : defaultValue;
};