const baseUrl = process.env.NEXT_PUBLIC_API_URL;

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res: Response) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw { status: res.status, error: data?.error || data?.message || "Request failed" };
    }
    return data;
}

function safeJson(t: string) {
    try { return JSON.parse(t); } catch { return {}; }
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

    const retryInit: RequestInit = {
        ...init,
        headers: { ...(init.headers || {}), Authorization: `Bearer ${newAccess}` },
    };
    const retryRes = await fetch(url, retryInit);
    return handleResponse(retryRes);
}

async function tryRefreshAndRetryRaw(url: string, init: RequestInit): Promise<any> {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
    if (!refreshToken) throw { status: 401, message: "No refresh token" };

    const refreshRes = await fetch(baseUrl + "/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });

    if (!refreshRes.ok) throw { status: 401, message: "Refresh token expired" };

    const { accessToken: newAccess, refreshToken: newRefresh } = await refreshRes.json();
    if (newAccess) localStorage.setItem("access_token", newAccess);
    if (newRefresh) localStorage.setItem("refresh_token", newRefresh);

    const retryInit: RequestInit = {
        ...init,
        headers: { ...(init.headers || {}), Authorization: `Bearer ${newAccess}` },
    };
    const retryRes = await fetch(url, retryInit);
    return handleResponse(retryRes);
}

async function request<T>(method: string, path: string, body?: any, auth = true): Promise<T> {
    const url = baseUrl + path;
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(auth ? getAuthHeaders() : {}),
    };

    const init: RequestInit = { method, headers, body: body ? JSON.stringify(body) : undefined };

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

async function requestRaw<T>(method: string, path: string, body: BodyInit, auth = true): Promise<T> {
    const url = baseUrl + path;
    const init: RequestInit = {
        method,
        headers: { ...(auth ? getAuthHeaders() : {}) },
        body,
    };

    let res = await fetch(url, init);
    if (res.status === 401 && auth) {
        try {
            return await tryRefreshAndRetryRaw(url, init);
        } catch (err) {
            console.warn("Token refresh failed", err);
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            throw err;
        }
    }
    return handleResponse(res);
}

function postFormWithProgress<T>(path: string, form: FormData, onProgress?: (percent: number) => void, auth = true): Promise<T> {
    return new Promise(async (resolve, reject) => {
        const url = baseUrl + path;
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);

        if (auth) {
            const token = localStorage.getItem("access_token");
            if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        xhr.upload.onprogress = (evt) => {
            if (!onProgress || !evt.lengthComputable) return;
            onProgress(Math.round((evt.loaded / evt.total) * 100));
        };

        xhr.onreadystatechange = async () => {
            if (xhr.readyState !== 4) return;
            if (xhr.status === 401 && auth) {
                try {
                    await tryRefreshAndRetryRaw(url, { method: "POST", body: form, headers: getAuthHeaders() });
                    resolve({} as T);
                } catch (e) {
                    reject(e);
                }
                return;
            }
            try {
                const data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
                if (xhr.status >= 200 && xhr.status < 300) resolve(data);
                else reject({ status: xhr.status, error: data?.error || data?.message || "Request failed" });
            } catch (e) {
                reject({ status: xhr.status, error: "Invalid response" });
            }
        };

        xhr.onerror = () => reject({ status: xhr.status, error: "Network error" });
        xhr.send(form);
    });
}

export const fetchWrapper = {
    get: <T>(path: string, auth = true) => request<T>("GET", path, undefined, auth),
    post: <T>(path: string, body?: any, auth = true) => request<T>("POST", path, body, auth),
    put: <T>(path: string, body?: any, auth = true) => request<T>("PUT", path, body, auth),
    patch: <T>(path: string, body?: any, auth = true) => request<T>("PATCH", path, body, auth),
    del: <T>(path: string, body?: any, auth = true) => request<T>("DELETE", path, body, auth),

    postForm: <T>(path: string, form: FormData, auth = true) => requestRaw<T>("POST", path, form, auth),
    postFormWithProgress,
};
