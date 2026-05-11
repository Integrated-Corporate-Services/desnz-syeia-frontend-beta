/**
 * Summary List Utilities
 * Helper functions for formatting data into GOV.UK Summary List format
 */

import { SummaryRow } from '../types';

/**
 * Format a date for display
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "10 May 2026")
 */
export const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'Not provided';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return dateObj.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

/**
 * Format a boolean value for display
 * @param value - Boolean value
 * @param yesText - Text to display for true (default: "Yes")
 * @param noText - Text to display for false (default: "No")
 * @returns Formatted string
 */
export const formatBoolean = (value: boolean | null | undefined, yesText: string = 'Yes', noText: string = 'No'): string => {
    if (value === null || value === undefined) return 'Not provided';
    return value ? yesText : noText;
};

/**
 * Format address into multi-line HTML
 * @param address - Address object
 * @returns HTML string with line breaks
 */
export const formatAddress = (address: { line1?: string; line2?: string; town_city?: string; county?: string; postcode?: string }): string => {
    if (!address) return 'Not provided';

    const lines = [address.line1, address.line2, address.town_city, address.county, address.postcode].filter(Boolean);

    return lines.join('<br>');
};

/**
 * Format an array of items into HTML list
 * @param items - Array of items
 * @returns HTML unordered list
 */
export const formatList = (items: string[]): string => {
    if (!items || items.length === 0) return 'None';

    return `<ul class="govuk-list govuk-list--bullet">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
};

/**
 * Create a summary row
 * @param key - Row label
 * @param value - Row value (text or HTML)
 * @param changeLink - Optional change link URL
 * @param changeLinkText - Text for change link (default: "Change")
 * @returns Summary row object
 */
export const createSummaryRow = (key: string, value: string, changeLink?: string, changeLinkText: string = 'Change'): SummaryRow => {
    const row: SummaryRow = {
        key: { text: key },
        value: value.includes('<') ? { html: value } : { text: value },
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

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 100)
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

/**
 * Format enum/constant value to human-readable text
 * @param value - Enum value (e.g., "new_lines")
 * @returns Human-readable text (e.g., "New lines")
 */
export const formatEnumValue = (value: string | null | undefined): string => {
    if (!value) return 'Not provided';

    return value
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Format phone number
 * @param phone - Phone number
 * @returns Formatted phone number or "Not provided"
 */
export const formatPhone = (phone: string | null | undefined): string => {
    return phone || 'Not provided';
};

/**
 * Format email
 * @param email - Email address
 * @returns Email or "Not provided"
 */
export const formatEmail = (email: string | null | undefined): string => {
    return email || 'Not provided';
};

/**
 * Safely get nested property
 * @param obj - Object
 * @param path - Property path (e.g., "address.line1")
 * @param defaultValue - Default value if property not found
 * @returns Property value or default
 */
export const getNestedProperty = (obj: any, path: string, defaultValue: any = 'Not provided'): any => {
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
