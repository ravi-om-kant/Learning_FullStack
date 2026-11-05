// services/productService.js
const BASE_URL = 'https://dummyjson.com/products';

async function request(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
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
    return request(
      `${BASE_URL}/category/${encodeURIComponent(category)}?${params}`,
      signal
    );
  }
  return request(`${BASE_URL}?${params}`, signal);
}

export function getCategoryList(signal) {
  return request(`${BASE_URL}/category-list`, signal);
}