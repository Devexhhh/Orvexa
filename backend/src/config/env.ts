//
// Frontend origins allowed to call the API (CORS).
// Comma-separated; the first one is where OAuth redirects back to.
//
//   CLIENT_URLS=https://app.orvexa.com,https://staging.orvexa.com
//
const DEFAULT_CLIENT_URL = "http://localhost:3001";

export const clientUrls = (process.env.CLIENT_URLS || DEFAULT_CLIENT_URL)
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean);

export const primaryClientUrl = clientUrls[0] || DEFAULT_CLIENT_URL;
