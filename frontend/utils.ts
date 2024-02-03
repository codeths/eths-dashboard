export function ApiCall(endpoint: string, config?: RequestInit) {
  const path = `/api/v1/web${endpoint}`;
  return fetch(path, config);
}
