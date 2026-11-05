// services/productService.js
const BASE_URL = 'https://dummyjson.com/products';

async function request(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export function getProducts({ searchTerm = '', category = '', sortBy = '' } = {}, signal) {
  const params = new URLSearchParams({ limit: '0' });
  const q = searchTerm.trim();
  const filter = sortBy ? sortBy.split("-") : Array(2).fill("");
  const [sortByField = "", sortByOrder = ""] = sortBy ? sortBy.split("-") : [];

  // Rule (Option A): search wins; category is applied on the client
  if (q) {
    params.set('q', q);
    return request(`${BASE_URL}/search?${params}&sortBy=${filter[0]}&order=${filter[1]}`, signal);
  }
  if (category) {
    return request(
      `${BASE_URL}/category/${encodeURIComponent(category)}?${params}&sortBy=${filter[0]}&order=${filter[1]}`,
      signal
    );
  }
  return request(`${BASE_URL}?${params}&sortBy=${filter[0]}&order=${filter[1]}`, signal);
}

export function getCategoryList(signal) {
  return request(`${BASE_URL}/category-list`, signal);
}