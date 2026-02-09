const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class ApiError extends Error {
    status: number;
    data: unknown;

    constructor(message: string, status: number, data?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

/**
 * Safely parse JSON response, returns null if not valid JSON
 */
function safeParseJson(text: string): unknown | null {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

/**
 * Check if response is JSON based on content-type header
 */
function isJsonResponse(response: Response): boolean {
    const contentType = response.headers.get('content-type');
    return contentType ? contentType.includes('application/json') : false;
}

export async function apiPost<T>(
    endpoint: string,
    data: unknown
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const text = await response.text();

        // Only parse as JSON if it's actually a JSON response
        const responseData = isJsonResponse(response) ? safeParseJson(text) : null;

        if (!response.ok) {
            const message = responseData && typeof responseData === 'object' && 'message' in responseData
                ? String((responseData as { message: string }).message)
                : `Request failed with status ${response.status}`;

            throw new ApiError(message, response.status, responseData);
        }

        return (responseData ?? {}) as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Network errors or JSON parsing errors
        const message = error instanceof Error ? error.message : 'Network error';
        throw new ApiError(message, 0);
    }
}

export async function apiGet<T>(endpoint: string): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const text = await response.text();
        const responseData = isJsonResponse(response) ? safeParseJson(text) : null;

        if (!response.ok) {
            const message = responseData && typeof responseData === 'object' && 'message' in responseData
                ? String((responseData as { message: string }).message)
                : `Request failed with status ${response.status}`;

            throw new ApiError(message, response.status, responseData);
        }

        return (responseData ?? {}) as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        const message = error instanceof Error ? error.message : 'Network error';
        throw new ApiError(message, 0);
    }
}
