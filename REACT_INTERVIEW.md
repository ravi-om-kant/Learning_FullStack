# 📝 Master Question Bank: JavaScript, React.js & Redux

Here's your complete, categorized list of practice questions — from beginner
to advanced — across all three technologies.

## 🔷 SECTION 1: JavaScript Core

### 📌 1.1 Variables, Scoping & Hoisting

- [ ] What is the difference between `var`, `let`, and `const`?
- [ ] What is hoisting? How does it behave differently with `var` vs. `let`?
- [ ] What is the Temporal Dead Zone (TDZ)?
- [ ] What will the following code output and why?

  ```javascript
  console.log(a);
  var a = 5;
  ```

- [ ] What is block scope vs. function scope?
- [ ] Can you reassign a `const` object's property? Why or why not?
- [ ] What is variable shadowing?
- [ ] What is the difference between `undefined` and `null`?
- [ ] What does `typeof null` return and why is it a known bug?
- [ ] What is the difference between `==` and `===`?

### 📌 1.2 Functions & Scope

- [ ] What is a first-class function in JavaScript?
- [ ] What is the difference between a function declaration and a function expression?
- [ ] What is an arrow function? How does it differ from a regular function?
- [ ] What is a closure? Give a real-world use case.
- [ ] What is an IIFE (Immediately Invoked Function Expression)? When is it used?
- [ ] What is the difference between `call()`, `apply()`, and `bind()`?
- [ ] How does the `this` keyword behave in arrow functions vs. regular functions?
- [ ] What is a pure function?
- [ ] What is a higher-order function? Give 3 examples.
- [ ] What is currying in JavaScript?
- [ ] What is function composition?
- [ ] What are default parameters?
- [ ] What is the `arguments` object? Does it work in arrow functions?
- [ ] What is the difference between parameters and arguments?
- [ ] What is recursion? Write a recursive function to calculate factorial.

### 📌 1.3 Arrays & Objects

- [ ] What is the difference between `map()`, `forEach()`, `filter()`, and `reduce()`?
- [ ] How does `find()` differ from `filter()`?
- [ ] What do `flat()` and `flatMap()` do?
- [ ] How do you remove duplicates from an array?
- [ ] What is destructuring? Give examples for both arrays and objects.
- [ ] What is the spread operator (`...`)? How is it different from rest parameters?
- [ ] How do you merge two objects in JavaScript?
- [ ] What is `Object.keys()`, `Object.values()`, `Object.entries()`?
- [ ] How do you deep clone an object?
- [ ] What is the difference between shallow copy and deep copy?
- [ ] What is optional chaining (`?.`) and nullish coalescing (`??`)?
- [ ] How does `Array.from()` work?
- [ ] What is `Array.isArray()` used for?
- [ ] How do you sort an array of objects by a property?
- [ ] What does `splice()` vs `slice()` do?

### 📌 1.4 Asynchronous JavaScript

- [ ] What is the JavaScript event loop?
- [ ] What is the call stack? What is the task queue?
- [ ] What is the difference between synchronous and asynchronous code?
- [ ] What is a callback function? What problem does it solve?
- [ ] What is "callback hell"? How do you avoid it?
- [ ] What is a Promise? What are its states?
- [ ] What is the difference between `Promise.all()`, `Promise.race()`,
  `Promise.any()`, and `Promise.allSettled()`?
- [ ] How does `async`/`await` work? What does it return?
- [ ] How do you handle errors in `async`/`await`?
- [ ] What is the difference between the microtask queue and the macrotask queue?
- [ ] What does `setTimeout(fn, 0)` actually do?
- [ ] How does `fetch()` work? What does it return?
- [ ] What is the difference between `JSON.stringify()` and `JSON.parse()`?
- [ ] How do you make multiple API calls in parallel?
- [ ] What is debouncing vs. throttling?

### 📌 1.5 ES6+ Features

- [ ] What are template literals?
- [ ] What are ES6 modules? What is the difference between `import` and `require()`?
- [ ] What is a `Symbol` in JavaScript?
- [ ] What is a `Map` and how is it different from an object?
- [ ] What is a `Set` and when would you use it?
- [ ] What are generators? What is `function*` syntax?
- [ ] What is the difference between `for...of` and `for...in`?
- [ ] What is `WeakMap` vs `Map`?
- [ ] What are tagged template literals?
- [ ] What are `Proxy` and `Reflect` in JavaScript?

### 📌 1.6 Prototypes & OOP

- [ ] What is the prototype chain?
- [ ] What is `Object.create()`?
- [ ] What is the difference between `__proto__` and `prototype`?
- [ ] What is a class in JavaScript? Is it just syntactic sugar?
- [ ] What is inheritance in JavaScript classes?
- [ ] What is the difference between `instanceof` and `typeof`?
- [ ] What is `constructor` in a class?
- [ ] What are getters and setters?
- [ ] What is the difference between static and instance methods?
- [ ] What is encapsulation in JavaScript?

## ⚛️ SECTION 2: React.js

### 📌 2.1 JSX & Basics

- [ ] What is JSX? Is it mandatory in React?
- [ ] How is JSX different from HTML?
- [ ] What are the rules of JSX?
- [ ] Why must JSX elements have one parent element?
- [ ] What is a React Fragment? When do you use it?
- [ ] How do you add comments in JSX?
- [ ] What is the Virtual DOM? How does it work?
- [ ] What is reconciliation in React?
- [ ] What is the difference between React and ReactDOM?
- [ ] What is `React.createElement()`?

### 📌 2.2 Components & Props

- [ ] What is the difference between functional and class components?
- [ ] What are props in React?
- [ ] Are props mutable? Why or why not?
- [ ] What is prop drilling? Why is it a problem?
- [ ] What are PropTypes? How do you use them?
- [ ] What are default props?
- [ ] What is the `children` prop?
- [ ] What is component composition?
- [ ] What is the difference between presentational and container components?
- [ ] What is a controlled vs. uncontrolled component?

### 📌 2.3 State & Lifecycle

- [ ] What is state in React?
- [ ] What is the difference between state and props?
- [ ] What is `useState`? How does it work?
- [ ] Why should you never mutate state directly?
- [ ] How do you update state based on the previous state value?
- [ ] What is lifting state up?
- [ ] What is the component lifecycle in class components?
- [ ] What are the phases of the React lifecycle (mount, update, unmount)?
- [ ] What is `componentDidMount`? What is its hook equivalent?
- [ ] What is `componentWillUnmount`? How do you replicate it with hooks?

### 📌 2.4 Hooks

- [ ] What are React Hooks? Why were they introduced?
- [ ] What are the rules of Hooks?
- [ ] What is `useEffect` and when does it run?
- [ ] What is the dependency array in `useEffect`?
- [ ] How do you run `useEffect` only once?
- [ ] How do you clean up a `useEffect`?
- [ ] What is `useRef`? How is it different from `useState`?
- [ ] What is `useMemo`? When should you use it?
- [ ] What is `useCallback`? When should you use it?
- [ ] What is the difference between `useMemo` and `useCallback`?
- [ ] What is `useContext`? How do you use it?
- [ ] What is `useReducer`? When would you prefer it over `useState`?
- [ ] What is `useLayoutEffect`? How does it differ from `useEffect`?
- [ ] What is `useId`? What problem does it solve?
- [ ] How do you write a custom hook? Give an example.

### 📌 2.5 Context API

- [ ] What is the Context API?
- [ ] When should you use Context vs. Redux?
- [ ] How do you create a context?
- [ ] What is `Provider` in context?
- [ ] What happens when the context value changes?
- [ ] How do you avoid unnecessary re-renders with Context?
- [ ] Can you have multiple contexts in one app?
- [ ] What is context vs. global state?
- [ ] How do you pass functions through context?
- [ ] What is the `useContext` hook vs. `Context.Consumer`?

### 📌 2.6 React Router

- [ ] What is React Router? What problem does it solve?
- [ ] What is the difference between `<BrowserRouter>` and `<HashRouter>`?
- [ ] How do you define routes in React Router v6?
- [ ] What is `<Link>` vs. `<NavLink>`?
- [ ] What is `useNavigate()`? How is it used?
- [ ] What is `useParams()`?
- [ ] What is `useLocation()`?
- [ ] How do you create nested routes?
- [ ] What are protected/private routes? How do you implement them?
- [ ] What is the `<Outlet>` component?

### 📌 2.7 Performance Optimization

- [ ] What is `React.memo()`? When should you use it?
- [ ] What is the difference between `React.memo` and `useMemo`?
- [ ] What causes unnecessary re-renders in React?
- [ ] What is lazy loading in React?
- [ ] What is `React.lazy()` and `Suspense`?
- [ ] What is code splitting?
- [ ] What is the `key` prop and why is it important in lists?
- [ ] What is windowing/virtualization in React?
- [ ] How do you profile a React app for performance?
- [ ] What is reconciliation and how does the diffing algorithm work?

### 📌 2.8 Forms & Events

- [ ] What is the difference between controlled and uncontrolled forms?
- [ ] How do you handle form submission in React?
- [ ] How do you validate forms in React?
- [ ] What is `onChange` vs `onInput`?
- [ ] How do you handle multiple input fields with a single handler?
- [ ] What is `event.preventDefault()`?
- [ ] What is `event.stopPropagation()`?
- [ ] How do you handle file upload inputs in React?
- [ ] What is React Hook Form? What problem does it solve?
- [ ] How do you reset a form in React?

### 📌 2.9 Advanced React Patterns

- [ ] What is a Higher-Order Component (HOC)?
- [ ] What is the render props pattern?
- [ ] What is the compound component pattern?
- [ ] What are error boundaries? How do you implement one?
- [ ] What is the difference between `createPortal` and regular rendering?
- [ ] What is a controlled vs. uncontrolled component pattern?
- [ ] What is the provider pattern in React?
- [ ] What is the observer pattern in React?
- [ ] What are forward refs (`forwardRef`)? When do you use them?
- [ ] What is `useImperativeHandle`?

## 🔴 SECTION 3: Redux

### 📌 3.1 Redux Core Concepts

- [ ] What is Redux? Why do we need it?
- [ ] What are the three core principles of Redux?
- [ ] What is the Redux store?
- [ ] What is an action in Redux?
- [ ] What is an action creator?
- [ ] What is a reducer? What rules must it follow?
- [ ] What is a pure function? Why must reducers be pure?
- [ ] What is immutability and why does Redux require it?
- [ ] What is `dispatch()`?
- [ ] What is `getState()`?
- [ ] What is `subscribe()`?
- [ ] What is `combineReducers()`?
- [ ] How does data flow in Redux? Explain step by step.
- [ ] What is the difference between Redux and the Context API?
- [ ] When should you use Redux and when shouldn't you?

### 📌 3.2 React-Redux

- [ ] What is `react-redux`?
- [ ] What is the `<Provider>` component?
- [ ] What is `useSelector()`? How does it work?
- [ ] What is `useDispatch()`?
- [ ] What was `connect()` and how was it used (legacy)?
- [ ] What is `mapStateToProps`?
- [ ] What is `mapDispatchToProps`?
- [ ] How does `useSelector` decide when to re-render?
- [ ] What is the difference between `useSelector` and `mapStateToProps`?
- [ ] Can you use Redux without React?

### 📌 3.3 Middleware & Async Redux

- [ ] What is middleware in Redux?
- [ ] What is `applyMiddleware()`?
- [ ] What is `redux-thunk`?
- [ ] How does `redux-thunk` enable async actions?
- [ ] What is `redux-saga`? How is it different from `redux-thunk`?
- [ ] What is the difference between thunks and sagas?
- [ ] How do you handle loading, success, and error states in Redux?
- [ ] What is a side effect in Redux?
- [ ] How do you cancel an async operation in Redux?
- [ ] What is `redux-logger`?

### 📌 3.4 Redux Toolkit (RTK)

- [ ] What is Redux Toolkit? Why was it created?
- [ ] What is `configureStore()`?
- [ ] What is `createSlice()`?
- [ ] What is `createAction()`?
- [ ] What is `createReducer()`?
- [ ] What is Immer? How does RTK use it internally?
- [ ] How do you write "mutating" logic safely in RTK?
- [ ] What is `createAsyncThunk()`?
- [ ] What are the lifecycle actions generated by `createAsyncThunk`
  (pending, fulfilled, rejected)?
- [ ] What is `extraReducers` in `createSlice`?
- [ ] What is `createSelector()`?
- [ ] What is memoization in selectors?
- [ ] What is `createEntityAdapter()`?
- [ ] What is normalized state? Why is it useful?
- [ ] How is RTK different from plain Redux? What does it solve?

### 📌 3.5 RTK Query

- [ ] What is RTK Query?
- [ ] What is `createApi()`?
- [ ] What is `fetchBaseQuery()`?
- [ ] What are auto-generated hooks in RTK Query?
- [ ] What is the difference between a query and a mutation in RTK Query?
- [ ] How does caching work in RTK Query?
- [ ] What is cache invalidation in RTK Query?
- [ ] What are tags in RTK Query (`providesTags`, `invalidatesTags`)?
- [ ] How do you handle loading and error states with RTK Query hooks?
- [ ] How do you make conditional queries in RTK Query?
- [ ] What is `transformResponse`?
- [ ] How do you add authentication headers to RTK Query requests?
- [ ] What is `refetchOnMountOrArgChange`?
- [ ] What is `keepUnusedDataFor`?
- [ ] How do you manually trigger a refetch in RTK Query?

### 📌 3.6 Redux Debugging & Best Practices

- [ ] What is Redux DevTools?
- [ ] What is time-travel debugging?
- [ ] What is the difference between local state and global state?
- [ ] How do you structure Redux folders/files (Ducks pattern, feature-based)?
- [ ] What is the "feature slice" pattern in RTK?
- [ ] How do you handle pagination in Redux?
- [ ] How do you persist Redux state (e.g., using `redux-persist`)?
- [ ] What is a selector? Why should you co-locate selectors with slices?
- [ ] How do you test Redux reducers?
- [ ] How do you test async thunks?

## 🧩 SECTION 4: Mixed / Integration Questions

- [ ] How does React's `useReducer` compare to Redux?
- [ ] Build a counter app using Redux Toolkit from scratch.
- [ ] How would you migrate a `useState` app to use Redux?
- [ ] How would you implement authentication (login/logout) using Redux?
- [ ] How do you share state between sibling components using Redux?
- [ ] What happens when you call `dispatch` inside a `useEffect`?
- [ ] How would you implement a shopping cart with Redux Toolkit?
- [ ] How do you handle form state — local state or Redux?
- [ ] When would you use `useContext` instead of Redux?
- [ ] How do you combine RTK Query with custom slices in the same store?

## 🎯 Coding Challenge Questions

- [ ] Build a counter with increment, decrement, and reset using `useState`
- [ ] Fetch and display a list of users from an API using `useEffect`
- [ ] Build a search/filter feature using controlled inputs
- [ ] Create a custom `useLocalStorage` hook
- [ ] Create a custom `useFetch` hook
- [ ] Build a multi-step form in React
- [ ] Implement protected routes using React Router
- [ ] Build a Todo app using `useReducer`
- [ ] Rebuild the Todo app using Redux Toolkit
- [ ] Add RTK Query to fetch and display posts from a REST API

## 📊 Question Count Summary

| Section                            | No. of Questions |
| ---------------------------------- | ---------------- |
| JavaScript Core                    | 75               |
| React.js                           | 95               |
| Redux (Core + RTK + RTK Query)     | 75               |
| Integration + Coding Challenges    | 20               |
| **Total**                          | **265**          |

## 💡 How to Use This List

- ✅ Check off questions as you answer them confidently
- ⭐ Star questions you find tricky for revisiting
- 🗣️ Answer out loud — simulate interview conditions
- 📓 Write answers in a notebook or digital doc for the hardest 50
- 🔁 Revisit starred questions every weekend

Would you like me to:

- 📄 Provide detailed answers for any specific section?
- 🧪 Create a quiz format with multiple-choice options?
- 🗂️ Export this as a document for offline use?

Just let me know how you'd like to proceed! 🚀
