export const TAB_ID_STORAGE_KEY = 'syeia.active-tab-id';

export function getOrCreateTabId(): string {
	const existingTabId = sessionStorage.getItem(TAB_ID_STORAGE_KEY);
	if (existingTabId) return existingTabId;

	const tabId = crypto.randomUUID();
	sessionStorage.setItem(TAB_ID_STORAGE_KEY, tabId);
	return tabId;
}

let fetchInterceptorInstalled = false;

export function installTabIdFetchInterceptor(backendBaseUrl: string): void {
	if (fetchInterceptorInstalled) return;

	const originalFetch = window.fetch.bind(window);
	window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
		const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
		const isBackendRequest = backendBaseUrl
			? requestUrl.startsWith(backendBaseUrl)
			: requestUrl.startsWith('/');

		if (!isBackendRequest) return originalFetch(input, init);

		const headers = new Headers(input instanceof Request ? input.headers : undefined);
		new Headers(init?.headers).forEach((value, name) => headers.set(name, value));
		headers.set('X-Tab-Id', getOrCreateTabId());

		if (input instanceof Request) {
			return originalFetch(new Request(input, { ...init, headers }));
		}

		return originalFetch(input, { ...init, headers });
	};
	fetchInterceptorInstalled = true;
}