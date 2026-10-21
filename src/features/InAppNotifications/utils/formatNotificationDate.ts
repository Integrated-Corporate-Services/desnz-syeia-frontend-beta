const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// GOV.UK style, in the viewer's local time: "30 June 2026 at 9:00am", "9 June 2026 at 3:48pm".
export function formatNotificationDate(value: string): string {
  const date = new Date(value);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const time = `${hours % 12 || 12}:${minutes}${hours < 12 ? 'am' : 'pm'}`;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()} at ${time}`;
}
