// services/productService.js
const BASE_URL = 'https://dummyjson.com/products';

async function request(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

async function fetchWithRetry(url, { signal, retries = 3, delay = 300 } = {}) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, { signal });
      if (res.ok) return await res.json();

      const err = new Error(`Request failed (${res.status})`);
      err.retryable = res.status >= 500; // 5xx is retryable, 4xx is not
      throw err;
    } catch (error) {
      const canRetry = error.name !== "AbortError" && error.retryable !== false;
      const isLastAttempt = attempt === retries - 1;

      if (!canRetry || isLastAttempt) throw error;

      await new Promise((resolve) => setTimeout(resolve, delay * 2 ** attempt));
    }
  }
}

export function getProducts({
  searchTerm = '',
  category = '',
  sortBy = '',
  skip = 0,        // ADD THIS
  limit = 0        // ADD THIS 
} = {}, signal) {
  const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  const q = searchTerm.trim();
  // const filter = sortBy ? sortBy.split("-") : Array(2).fill("");
  // const [sortByField = "", sortByOrder = ""] = sortBy ? sortBy.split("-") : [];
  if (sortBy) {
    const [field, order] = sortBy.split("-");
    params.set('sortBy', field);
    params.set('order', order);
  }
  console.log(params);
  // Rule (Option A): search wins; category is applied on the client
  if (q) {
    params.set('q', q);
    return request(`${BASE_URL}/search?${params}`, signal);
  }
  if (category) {
    return fetchWithRetry(
      `${BASE_URL}/category/${encodeURIComponent(category)}?${params}`,
      { signal }
    );
  }
  return fetchWithRetry(`${BASE_URL}?${params}`, { signal });
}

export function getCategoryList(signal) {
  return fetchWithRetry(`${BASE_URL}/category-list`, { signal });
}