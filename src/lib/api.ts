export async function apiFetch(url: string, options: RequestInit = {}) {
  let storeId = 'store_admin';
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.id) storeId = user.id;
    } catch (e) {}
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-store-id': storeId,
    ...((options.headers as Record<string, string>) || {})
  };

  return fetch(url, {
    ...options,
    headers
  });
}
