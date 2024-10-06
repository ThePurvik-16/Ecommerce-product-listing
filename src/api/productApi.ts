export const fetchProducts = async (url: string, params?: Record<string, string | number>) => {
    const queryString = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
      const defaultHeaders = {
        'x-api-key': '72njgfa948d9aS7gs5',
        'Content-Type': 'application/json',
      };
    const response = await fetch(`${url}${queryString}`, {
        headers: defaultHeaders,
    });
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    return response.json();
  };
  