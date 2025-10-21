const baseUrl = process.env.NEXT_PUBLIC_API_URL

function getAuthHeaders(): Record<string, string> {
    const token=localStorage.getItem("access_token")
    return token ? { Authorization : `Bearer ${token}` } : {}
}

async function handleResponse(res: Response) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw { status: res.status, error: data?.error || data?.message || "Request failed" };
    }
    return data;
}

async function tryRefreshAndRetry(url: string, init: RequestInit): Promise<any> {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
    if (!refreshToken) throw { status: 401, message: "No refresh token" };

    const refreshRes = await fetch(baseUrl + "/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });

    if (!refreshRes.ok) throw { status: 401, message: "Refresh token expired" };

    const refreshData = await refreshRes.json();
    const newAccess = refreshData?.accessToken;
    const newRefresh = refreshData?.refreshToken;

    if (newAccess) localStorage.setItem("access_token", newAccess);
    if (newRefresh) localStorage.setItem("refresh_token", newRefresh);

    const retryInit = {
        ...init,
        headers: {
            ...(init.headers || {}),
            Authorization: `Bearer ${newAccess}`,
        },
    };
    const retryRes = await fetch(url, retryInit);
    return handleResponse(retryRes);
}

async function request<T>(
    method: string,
    path: string,
    body?: any,
    auth = true
): Promise<T> {
    const url = baseUrl + path;
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(auth ? getAuthHeaders() : {}),
    };

    const init: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    };

    let res = await fetch(url, init);

    if (res.status === 401 && auth) {
        try {
            return await tryRefreshAndRetry(url, init);
        } catch (err) {
            console.warn("Token refresh failed", err);
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            throw err;
        }
    }

    return handleResponse(res);
}

export const fetchWrapper = {
    get: <T>(path: string, auth = true) => request<T>("GET", path, undefined, auth),
    post: <T>(path: string, body?: any, auth = true) => request<T>("POST", path, body, auth),
    put: <T>(path: string, body?: any, auth = true) => request<T>("PUT", path, body, auth),
    patch: <T>(path: string, body?: any, auth = true) => request<T>("PATCH", path, body, auth),
    del: <T>(path: string, body?: any, auth = true) => request<T>("DELETE", path, body, auth),
};