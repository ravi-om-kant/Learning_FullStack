# Product Listing: Production Requirements (v2)

Builds on the original brief in `PRODUCT.md`. This version adds the architecture decisions made during design and the production-level expectations the original brief left out.

**Stack:** React (functional components and hooks), plain JavaScript, CSS only (no UI libraries)
**Data source:** DummyJSON (`https://dummyjson.com`)

---

## 1. Goals

- Browse products, search, filter by category, sort, and paginate, all driven by URL-level API calls where the API supports them.
- Cart works offline-first: it lives in the browser (`localStorage`), not on the server.
- Code is structured so each concern (data fetching, URL building, cart state, UI) can be changed or tested on its own.

---

## 2. API contract

| Purpose | Endpoint | Notes |
|---|---|---|
| Base list | `GET /products?limit=&skip=&sortBy=&order=` | `limit`/`skip` for pagination. `sortBy` is a field name, `order` is `asc` or `desc`. Response has `products` and `total`. |
| Search | `GET /products/search?q=` | Returns products matching `q`. Cannot be combined with the category endpoint. |
| Category | `GET /products/category/{slug}` | Slug from the category list. |
| Category list | `GET /products/category-list` | Returns an array of slug strings. Use this one, not `/products/categories`, which returns objects. |

**Verify before coding:** whether `sortBy`/`order` and `limit`/`skip` work on `/search` and `/category`. If not, apply them on the client.

**Not used:** `POST /carts/add`. DummyJSON simulates it and does not persist anything. The cart is client-side only.

---

## 3. Architecture

### 3.1 Folder structure

```
product-listing/
  ProductListing.jsx          page composition only
  product.css
  context/
    ProductContext.js         filter and pagination state, provider, useProduct()
  hooks/
    useFetch.js               generic fetch with loading/error, abortable
    useDebounce.js
    useLocalStorage.js
    useCart.js                useReducer + localStorage sync
  utils/
    buildProductsUrl.js       pure: filter state -> URL string
    applyClientFilters.js     pure: sorting/filtering that the API cannot do
  components/
    ProductList.jsx
    ProductCard.jsx
    SearchBar.jsx
    Filters.jsx
    Pagination.jsx
    Cart.jsx
```

### 3.2 State ownership

- **Filter and page state** (`searchTerm`, `category`, `sortBy`, `order`, `page`) lives in `ProductContext`. Several siblings read and write it (header, filters, pagination, list), so context avoids prop drilling.
- **Fetch state** (`data`, `loading`, `error`) lives in `useFetch`, called once from the page.
- **Cart state** lives in `useCart` (a reducer) and is exposed through its own context so the header badge and cart panel can read it.
- **Derived values** (URL, visible list, page count) are computed, never stored in state.

### 3.3 Hook contracts

**`useFetch(url)`**
- Accepts a string URL, or `null` to skip fetching.
- Returns `{ data, loading, error, refetch }`.
- Aborts the in-flight request on URL change and on unmount (`AbortController`), so stale responses cannot overwrite newer ones.
- Errors are `Error` messages, not raw objects. Non-2xx responses are errors.

**`useDebounce(value, delay = 300)`**
- Returns the value only after it stops changing for `delay` ms.

**`useCart()`**
- Exposes `items`, `totalCount`, `totalPrice`, `add`, `increment`, `decrement`, `remove`, `clear`.
- Reducer actions are pure. Quantity never drops below 1 (decrement at 1 removes the item).
- Persists to `localStorage` under a versioned key (for example `product-listing:cart:v1`).
- Reading storage must tolerate invalid JSON and fall back to an empty cart.

**`useLocalStorage(key, initialValue)`**
- Same shape as `useState`. Writes are guarded with try/catch (storage can be full or disabled).

---

## 4. Functional requirements

### FR-1 Product list
- Fetch on page load and show products in a responsive grid.
- Each card shows image, title, price, rating, and an "Add to Cart" button.
- Loading state while fetching.
- Error state with a **Retry** button that calls `refetch`.
- Empty state: "No products found" when the active filters return nothing.

### FR-2 Search
- Text input filters by title through the API (`/products/search?q=`).
- Input is debounced by 300 ms before it changes the URL.
- Empty input returns to the base list.
- Searching resets page to 1.

### FR-3 Category filter
- Dropdown options come from `/products/category-list`, not hardcoded values.
- Selecting a category uses `/products/category/{slug}`. "All" returns to the base list.
- Changing category resets page to 1.

### FR-4 Sort
- Options: price ascending, price descending, rating descending.
- Sort is passed to the API where supported; otherwise applied on the client.

### FR-5 Combined behavior
- Search, category, and sort must work together. Exact composition rules are in section 5.
- The page never shows a stale result for an earlier filter combination.

### FR-6 Pagination
- 8 products per page.
- Previous, Next, and page-number buttons. Previous is disabled on page 1, Next on the last page.
- Page count is derived from the total number of results for the current filters.
- Page resets to 1 whenever search, category, or sort changes. Reset happens in the change handler, not in an effect.

### FR-7 Cart
- "Add to Cart" adds the product, or increments its quantity if present.
- Cart panel (sidebar or modal) lists items with image, title, unit price, quantity, line total, and remove.
- `+` and `−` change quantity. Quantity is never below 1.
- Header shows the total item count. Cart shows the total price.
- Empty cart shows "Your cart is empty".
- Cart persists across refresh.

### FR-8 Edge cases
- Rapid typing does not show results from an older query.
- Retry after an error reloads the same URL.
- Corrupt `localStorage` cart data does not crash the page.

---

## 5. Filter composition rule (decision required)

The API cannot combine search with category. Pick one rule and document it in code:

| Option | Behavior | Trade-off |
|---|---|---|
| **A. Search wins** (recommended) | If `searchTerm` is set, call `/search`. Apply the category filter on the client. Otherwise call `/category/{slug}` or the base list. | Search results are the broadest set, so the client filter is small. Pagination total must come from the client-filtered length. |
| **B. Category wins** | If a category is set, call `/category`. Apply search on the client. | Works when categories are small. Search over a large category gets filtered on the client. |
| **C. Base list only** | Always call the base list. Apply search, category, and sort on the client. | Simplest and satisfies "work together" exactly. Loses the server-side search the interview brief implies. |

Whichever rule is chosen, the client-side step must use `useMemo` and be a pure function.

---

## 6. URL construction rules

- Built by one pure function: `buildProductsUrl({ searchTerm, category, sortBy, order, page })`.
- Query strings are built with `URLSearchParams`, never template-string concatenation, so values are encoded.
- Returns `null` when no fetch is needed.
- Page size constant lives in one place (`PAGE_SIZE = 8`).

---

## 7. Non-functional requirements

**Performance**
- Debounce search input.
- Memoize derived lists with `useMemo` and handlers with `useCallback` where children are memoized.
- Abort superseded requests.
- No re-fetch on unrelated state changes.

**Correctness**
- No direct state mutation. Arrays and objects are copied before sorting (`[...arr].sort(...)`).
- Effects have complete dependency arrays and cleanup.
- No `console.log` in committed code.

**Accessibility**
- Every input and select has a `<label>` (visually hidden is fine).
- Buttons have text or `aria-label`. Quantity controls are labeled, for example "Increase quantity of X".
- Result count is announced with `aria-live="polite"`.
- All controls are reachable and usable with the keyboard.

**Responsive UI**
- Grid adapts from 1 column on phones to multiple on desktop.
- Pagination does not cover content. Fixed footer needs bottom padding on the list.

**Maintainability**
- Components receive only the props they use. No prop drilling beyond one level.
- Naming: `isLoading` everywhere, not `loading` in one place and `isLoading` in another.
- No duplicated category or sort option lists.

---

## 8. Testing

- **Unit:** `buildProductsUrl` (each branch, encoding of special characters), `cartReducer` (add, increment, decrement floor at 1, remove, clear), `useDebounce` (timing with fake timers).
- **Integration (React Testing Library):** search flow, category change resets page, add to cart updates header count, error then retry, empty states.
- Mock `fetch` in tests. Do not hit the network.

---

## 9. Definition of done

- All FR items pass manually in the browser with no console errors.
- Unit tests for the pure functions and the cart reducer pass.
- Section 5 decision is recorded in code (a comment at the rule site, one short line).
- No `TODO` or commented-out code left in files.
- Each hook and utility has one clear responsibility.

---

## 10. Known issues in current code

- `useFetch.js` has no abort on URL change or unmount.
- `useFetch.js` has a commented-out older version at the bottom. Remove it.
- `ProductListing.jsx` mixes old local state and context state. Pick context.
- `Filters.jsx` has hardcoded, misspelled category options and a sort select that shares state with the category select.
- `ProductCard.jsx` button label reads "Add to Card".
- `Pagination.jsx` and `Cart.jsx` are empty placeholders.
- `console.log` calls remain in `useFetch.js`, `SearchBar.jsx`, `ProductListing.jsx`.

---

## 11. Open decisions

1. Filter composition rule in section 5 (A, B, or C).
2. Does `/search` accept `sortBy`/`order`? Verify against the DummyJSON docs.
3. Cart panel style: sidebar or modal.
4. Is URL query-string sync (bonus) in scope for this iteration?

---

## 12. Bonus (after definition of done)

- Product detail modal or page
- Out-of-stock handling (disable Add to Cart when `stock` is 0)
- Filter state in the URL query string (`useSearchParams`-style sync)
- Dark mode toggle
