# Machine Coding Question: Product Listing with Search, Filter, Sort and Cart

**Time:** 90 minutes
**Stack:** React.js (functional components and hooks), plain JavaScript, no UI libraries (CSS or CSS modules only)

## Problem statement

Build a small e-commerce page where users can browse products, search and filter them, and add items to a cart. The data comes from a public API: `https://dummyjson.com/products`.

## Functional requirements

**1. Product list**
- Fetch products on page load and show them in a responsive grid.
- Each card shows the image, title, price, rating, and an "Add to Cart" button.
- Show a loading state while fetching and an error state with a "Retry" button if the request fails.

**2. Search**
- A search input filters products by title.
- Debounce the input by 300ms so it doesn't filter on every keystroke.

**3. Filter and sort**
- Filter by category (dropdown built from the data).
- Sort by price (low to high, high to low) and by rating.
- Search, filter, and sort must work together.

**4. Pagination**
- Show 8 products per page with Previous/Next buttons and page numbers.
- Reset to page 1 whenever search or filters change.

**5. Cart**
- "Add to Cart" adds the item, or increases its quantity if it's already there.
- A cart panel (sidebar or modal) lists items with quantity controls (+ / −) and a remove button.
- Show the cart item count in the header and the total price in the cart.
- Persist the cart in `localStorage` so it survives a refresh.

**6. Empty states**
- Show "No products found" when the filters match nothing, and "Your cart is empty" for an empty cart.

## Technical constraints

- Functional components and hooks only (no class components).
- Create at least one custom hook (for example `useDebounce` or `useLocalStorage`).
- Keep state logic clean. `useReducer` for the cart is encouraged.
- Don't mutate state directly.
- Use `useMemo` where it makes sense (for example for the filtered and sorted list).

## Suggested folder structure

```
src/
  components/
    ProductCard.jsx
    ProductList.jsx
    SearchBar.jsx
    Filters.jsx
    Pagination.jsx
    Cart.jsx
  hooks/
    useDebounce.js
    useLocalStorage.js
    useFetch.js
  App.jsx
```

## Bonus features (if time permits)

- Product details modal or page
- Disable the "Add to Cart" button while the item is out of stock
- Keep search and filters in the URL query string
- Dark mode toggle
- Basic unit tests with React Testing Library

## What the interviewer evaluates

| Area | What they look for |
|---|---|
| **Working output** | All core features function, with no console errors |
| **Component design** | Sensible splitting, reusable components, clear props |
| **State management** | Right place for state, `useReducer` or context used well, no prop-drilling mess |
| **Hooks knowledge** | Correct `useEffect` dependencies, cleanup, `useMemo`, custom hooks |
| **Edge cases** | Loading, error, empty states, pagination reset, quantity never below 1 |
| **Code quality** | Naming, readability, no duplicated logic |
| **Performance** | Debouncing, no unnecessary re-renders |
| **UI/UX** | Responsive, usable, even if the styling is basic |

## Tips for the round

1. **Spend the first 5 minutes clarifying** requirements and planning your component tree and state.
2. **Get the data flowing first**, then add features one at a time.
3. **Build the list, then search, then filters, then pagination, then cart**, committing to a working state at each step.
4. **Talk through your decisions** as you code. Interviewers weigh reasoning heavily.
5. **Leave the last 10 minutes** for edge cases and cleanup.

## Other common machine coding questions for practice

- Todo app with filters, edit, and persistence
- Autocomplete or typeahead search with debounce and keyboard navigation
- Infinite scroll feed using `IntersectionObserver`
- Nested comment system with add, reply, and delete
- Tic-tac-toe or Connect Four with win detection and undo
- Star rating, accordion, tabs, or modal built as reusable components
- File explorer tree with expand/collapse and add/delete
- Kanban board with drag and drop
- Form with validation and multi-step wizard
- Stopwatch or countdown timer with start, pause, and reset

I can also write a full reference solution for this question, or put this in a `.md` file like your earlier one.