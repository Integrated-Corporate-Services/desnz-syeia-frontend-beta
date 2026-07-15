export function readCookie(name: string): string | undefined {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : undefined;
}

export function expireCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function clearNonEssentialCookies(names: string[]): void {
  names.forEach(expireCookie);
}

export function getCsrfToken(): string | undefined {
  return readCookie('csrf_token');
}
