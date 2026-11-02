<!-- markdownlint-disable MD013 -->

# 📝 Interview Answers: JavaScript, React.js & Redux

Detailed answers with explanations and code for every question in
[REACT_INTERVIEW.md](REACT_INTERVIEW.md). Read the question, answer it out loud
first, then compare with the answer here.

## 1.1 Variables, Scoping & Hoisting

### 1.1.1 What is the difference between var, let, and const?

**Short answer:** `var` is function-scoped and can be redeclared. `let` and
`const` are block-scoped and cannot be redeclared in the same scope. `const`
also prevents rebinding the variable, though it does not make the value
immutable.

**Detailed explanation:**

- `var` is hoisted and initialized to `undefined`, so it can be read before its
  declaration line.
- `let` and `const` are block-scoped (`{}`, `if`, `for`) and sit in the Temporal
  Dead Zone until their declaration runs.
- `const` requires an initializer and cannot be reassigned. Objects and arrays
  it holds can still be mutated.
- Pitfall: `var` leaks out of `if` and loop blocks, which is a common source of
  bugs. Prefer `const` by default and `let` only when reassignment is needed.

**Code example:**

```javascript
function demo() {
  if (true) {
    var a = 1; // function-scoped: visible after the block
    let b = 2; // block-scoped
    const c = 3; // block-scoped, cannot be reassigned
  }
  console.log(a); // 1
  // console.log(b); // ReferenceError: b is not defined
}
demo();
```

### 1.1.2 What is hoisting? How does it behave differently with var vs. let?

**Short answer:** Hoisting means declarations are registered when a scope is
created, before any code runs. `var` declarations are initialized to
`undefined`, while `let` and `const` are created but left uninitialized, so
reading them early throws a `ReferenceError`.

**Detailed explanation:**

- Only the declaration is hoisted. An assignment such as `x = 10` stays where it
  is written.
- `var` hoists and initializes to `undefined`, so early reads return `undefined`
  silently.
- `let` and `const` hoist without initialization, so early reads throw a
  `ReferenceError`. This is the TDZ.
- Function declarations are hoisted completely, including their body. Function
  expressions follow the rules of their variable.

**Code example:**

```javascript
console.log(x); // undefined (var is hoisted and initialized)
var x = 10;
console.log(x); // 10

try {
  console.log(y);
} catch (err) {
  console.log(err.name); // "ReferenceError" (let is in the TDZ)
}
let y = 20;
```

### 1.1.3 What is the Temporal Dead Zone (TDZ)?

**Short answer:** The TDZ is the span from the start of a block until a `let` or
`const` declaration is evaluated. During that span the binding exists but cannot
be accessed, and any access throws a `ReferenceError`.

**Detailed explanation:**

- The TDZ is a runtime period, not a line of code. It starts at block entry and
  ends when the declaration executes.
- It exists so that accidental use of a variable before its initialization fails
  loudly rather than returning `undefined`.
- Even `typeof` throws inside the TDZ. For a truly undeclared variable, `typeof`
  returns `"undefined"` instead.
- A default parameter that refers to a later parameter is also in the TDZ.

**Code example:**

```javascript
function demo() {
  try {
    console.log(count); // count exists, but is in the TDZ
  } catch (err) {
    console.log(err.name); // "ReferenceError"
  }
  let count = 1;
  console.log(count); // 1
}
demo();
```

### 1.1.4 What will the following code output and why?

**Short answer:** It prints `undefined`. The `var a` declaration is hoisted and
initialized to `undefined` before execution starts, and the assignment `a = 5`
runs only when execution reaches that line.

**Detailed explanation:**

- The engine creates the binding `a` during the creation phase and sets it to
  `undefined`.
- The line `var a = 5;` is split conceptually into a declaration (hoisted) and
  an assignment (runtime).
- Because the log runs before the assignment, it sees `undefined`, not an error.
- If `let` were used instead, the same code would throw a `ReferenceError` due
  to the TDZ.

**Code example:**

```javascript
console.log(a); // undefined: declaration hoisted, assignment not yet run
var a = 5;
console.log(a); // 5
```

### 1.1.5 What is block scope vs. function scope?

**Short answer:** Function scope means a variable is visible anywhere inside the
enclosing function. Block scope means it is visible only inside the nearest pair
of curly braces. `var` uses function scope, while `let` and `const` use block
scope.

**Detailed explanation:**

- Blocks include `if`, `for`, `while`, `switch`, and any bare `{}`.
- `for (let i ...)` creates a fresh binding per iteration, which matters for
  closures.
- Using `var` inside a loop with `setTimeout` is a classic pitfall: all
  callbacks share one variable.
- Block scope makes code easier to reason about and reduces accidental name
  collisions.

**Code example:**

```javascript
for (var i = 0; i < 3; i++) {}
console.log(i); // 3 (var leaked out of the loop)

for (let j = 0; j < 3; j++) {}
// console.log(j); // ReferenceError (let stayed inside the loop)

for (var k = 0; k < 3; k++) {
  setTimeout(() => console.log("var", k)); // prints "var 3" three times
}
for (let m = 0; m < 3; m++) {
  setTimeout(() => console.log("let", m)); // prints "let 0", "let 1", "let 2"
}
```

### 1.1.6 Can you reassign a const object's property? Why or why not?

**Short answer:** Yes. `const` prevents reassigning the variable binding to a
different value, but the object it points to is still mutable. To block property
changes, you need `Object.freeze`, which is shallow.

**Detailed explanation:**

- `const` protects the reference, not the contents.
- Reassigning the variable itself throws
  `TypeError: Assignment to constant variable.`
- `Object.freeze` makes top-level properties read-only. Nested objects remain
  mutable unless frozen separately.
- In sloppy mode a write to a frozen property is silently ignored. In strict
  mode, which modules and classes use, it throws a `TypeError`.

**Code example:**

```javascript
const user = { name: "Asha" };
user.name = "Ravi"; // OK: the object is mutated, binding unchanged
console.log(user.name); // "Ravi"

// user = { name: "X" };   // TypeError: Assignment to constant variable.

const frozen = Object.freeze({ name: "Asha" });
frozen.name = "Ravi"; // ignored in sloppy mode, TypeError in strict mode
console.log(frozen.name); // "Asha"
```

### 1.1.7 What is variable shadowing?

**Short answer:** Shadowing happens when a variable declared in an inner scope
has the same name as one in an outer scope. The inner variable hides the outer
one within its scope, and the outer variable is still intact outside it.

**Detailed explanation:**

- Shadowing is legal and common with `let`, `const`, `var`, and function
  parameters.
- Inside the inner scope there is no way to reach the shadowed outer variable by
  its plain name.
- Accidental shadowing is a frequent bug, especially when a parameter hides a
  module-level variable.
- Redeclaring a `var` in the same scope is not shadowing; it simply reuses the
  same variable.

**Code example:**

```javascript
const name = "outer";

function greet() {
  const name = "inner"; // shadows the outer name
  console.log(name); // "inner"
}

greet();
console.log(name); // "outer"
```

### 1.1.8 What is the difference between undefined and null?

**Short answer:** `undefined` means a value has not been assigned, and it is the
default the engine uses for missing values. `null` is an explicit, intentional
"no value" that a developer assigns. Both are falsy, and they are loosely equal
but not strictly equal.

**Detailed explanation:**

- `undefined` appears for uninitialized variables, missing properties, missing
  arguments, and functions with no return.
- `null` is set deliberately to signal absence, for example when a lookup finds
  nothing.
- `null == undefined` is `true` because of a special loose-equality rule, but
  `null === undefined` is `false`.
- They convert differently to numbers: `Number(null)` is `0`, while
  `Number(undefined)` is `NaN`.

**Code example:**

```javascript
let a;
console.log(a); // undefined
let b = null;
console.log(b); // null
console.log(null == undefined); // true
console.log(null === undefined); // false
console.log(Number(null)); // 0
console.log(Number(undefined)); // NaN
```

### 1.1.9 What does typeof null return and why is it a known bug?

**Short answer:** `typeof null` returns `"object"`, which is wrong because
`null` is a primitive. It is a bug inherited from the first JavaScript engine,
and it cannot be fixed without breaking existing web code. To test for null,
compare with `=== null`.

**Detailed explanation:**

- In the original implementation, values carried a type tag. The object tag was
  `0`, and `null` was represented as the null pointer, which also had tag `0`.
- `typeof` read the tag, so `null` was reported as an object.
- A fix was proposed to TC39, but it was rejected because too much existing code
  depends on the behavior.
- Pitfall: `typeof` is unreliable for arrays and null, so use `Array.isArray`
  for arrays and `=== null` for null checks.

**Code example:**

```javascript
console.log(typeof null); // "object" (historical bug)
console.log(typeof undefined); // "undefined"
const isNull = (v) => v === null;
console.log(isNull(null)); // true
```

### 1.1.10 What is the difference between == and ===?

**Short answer:** `==` is loose equality and performs type coercion before
comparing. `===` is strict equality and returns `true` only when both value and
type match. Prefer `===` everywhere, with the one common exception of
`x == null` to catch both `null` and `undefined`.

**Detailed explanation:**

- Loose equality converts operands to a common type using rules that are hard to
  memorize, which causes surprises.
- Objects are compared by reference in both operators, not by content.
- `NaN` is not equal to anything, including itself, in both operators. Use
  `Number.isNaN` to test it.
- Strict equality is faster to reason about and makes code review easier.

**Code example:**

```javascript
console.log(0 == ""); // true  (both coerced to 0)
console.log(0 === ""); // false (different types)
console.log("1" == 1); // true
console.log("1" === 1); // false
console.log(null == 0); // false (null only loosely equals undefined)
console.log([1] == 1); // true  ([1] becomes "1", then 1)
console.log(NaN === NaN); // false
```

## 1.2 Functions & Scope

### 1.2.1 What is a first-class function in JavaScript?

**Short answer:** A first-class function is a function that is treated like any
other value. It can be assigned to a variable, passed as an argument, returned
from another function, and stored in data structures.

**Detailed explanation:**

- Functions in JavaScript are objects, so they can also have properties.
- This property is what makes callbacks, higher-order functions, and functional
  patterns possible.
- Many built-in APIs, such as `map`, `setTimeout`, and event listeners, depend
  on it.
- Pitfall: because functions are values, passing a method without binding it can
  lose its `this`.

**Code example:**

```javascript
const shout = (s) => s.toUpperCase() + "!"; // stored in a variable
const apply = (fn, value) => fn(value); // passed as an argument
const makeAdder = (n) => (x) => x + n; // returned from a function
const ops = { shout }; // stored in an object

console.log(apply(shout, "hi")); // "HI!"
console.log(makeAdder(2)(5)); // 7
console.log(ops.shout("ok")); // "OK!"
```

### 1.2.2 What is the difference between a function declaration and a function expression?

**Short answer:** A function declaration is a statement with a name, and the
whole function is hoisted, so it can be called before it appears in the code. A
function expression creates a function as part of an expression, and only its
variable is hoisted, which means it is not callable early.

**Detailed explanation:**

- Declarations look like `function name() {}` and are hoisted with their body.
- Expressions look like `const f = function () {}` or an arrow function assigned
  to a variable.
- With `var`, the variable holds `undefined` until the assignment runs. With
  `const` or `let`, it is in the TDZ.
- Function declarations inside blocks behave differently in sloppy mode, so
  prefer declarations at the top level of a function or module.

**Code example:**

```javascript
console.log(declared()); // "hoisted"
console.log(typeof expressed); // "undefined" (var is hoisted, the function is not)

function declared() {
  return "hoisted";
}
var expressed = function () {
  return "assigned at runtime";
};
console.log(expressed()); // "assigned at runtime"
```

### 1.2.3 What is an arrow function? How does it differ from a regular function?

**Short answer:** An arrow function is a shorter syntax for a function that does
not have its own `this`, `arguments`, `super`, or `new.target`. It takes these
from the enclosing scope. It also cannot be used with `new` and has no
`prototype` property.

**Detailed explanation:**

- An expression body with no braces returns its value implicitly, for example
  `x => x * 2`.
- Because `this` is lexical, arrows are useful for callbacks inside methods,
  where a regular function would lose `this`.
- Arrows are a poor fit for object methods that need `this` to refer to the
  object they are called on.
- Calling `new` on an arrow throws a `TypeError`.

**Code example:**

```javascript
"use strict";
const user = {
  name: "Asha",
  regular() {
    return function () {
      return this?.name;
    };
  },
  arrow() {
    return () => this.name;
  },
};
console.log(user.regular()()); // undefined (called without a receiver)
console.log(user.arrow()()); // "Asha" (this captured from the method)
```

### 1.2.4 What is a closure? Give a real-world use case

**Short answer:** A closure is a function that keeps access to variables from
the scope where it was created, even after that outer function has returned. A
common use is private state, such as a counter or a rate limiter that outside
code cannot modify directly.

**Detailed explanation:**

- Closures are created every time a function is defined inside another function.
- The captured variables live as long as any closure references them, which can
  keep large objects in memory.
- Real-world uses include data privacy, factories, memoization, once-only
  wrappers, debounce and throttle, and React's `useState` setter identity.
- Pitfall: closures in loops capture the variable, not its value. Use `let` or
  an IIFE to capture a snapshot.

**Code example:**

```javascript
function createCounter(start = 0) {
  let count = start; // private: not reachable from outside
  return {
    increment: () => ++count,
    value: () => count,
  };
}

const c = createCounter(10);
c.increment();
c.increment();
console.log(c.value()); // 12
console.log(c.count); // undefined (no direct access)
```

### 1.2.5 What is an IIFE (Immediately Invoked Function Expression)? When is it used?

**Short answer:** An IIFE is a function expression that runs immediately after
it is defined. It creates a private scope so that its variables do not leak into
the global scope. Modern code uses modules and block scope more often, but IIFEs
are still useful for async setup and one-off initialization.

**Detailed explanation:**

- The wrapping parentheses turn the function into an expression, so it can be
  invoked right away.
- Before ES modules, IIFEs were the main way to create namespaces and the module
  pattern.
- Async IIFEs let you use `await` in environments without top-level `await`,
  such as older CommonJS files.
- Pitfall: without a semicolon before a leading `(`, automatic semicolon
  insertion can merge the IIFE with the previous line.

**Code example:**

```javascript
const result = (function () {
  const secret = "hidden"; // not on the global scope
  return secret.length;
})();
console.log(result); // 6
console.log(typeof secret); // "undefined"

(async () => {
  const data = await Promise.resolve("loaded");
  console.log(data); // "loaded"
})();
```

### 1.2.6 What is the difference between call(), apply(), and bind()?

**Short answer:** All three set the `this` value for a function. `call` invokes
the function immediately with arguments listed one by one. `apply` invokes it
immediately with arguments passed as an array. `bind` returns a new function
with `this` fixed, and does not invoke it.

**Detailed explanation:**

- The first argument of `call`, `apply`, and `bind` is always the `this` value.
- `apply` was historically used for spreading arrays into functions such as
  `Math.max`, but spread syntax now covers that.
- `bind` also supports partial application, because extra arguments are fixed in
  the new function.
- A bound function cannot be rebound. Arrow functions ignore the `this` passed
  to any of the three.

**Code example:**

```javascript
function greet(greeting, punct) {
  return `${greeting}, ${this.name}${punct}`;
}
const person = { name: "Ravi" };

console.log(greet.call(person, "Hello", "!")); // "Hello, Ravi!"
console.log(greet.apply(person, ["Hi", "?"])); // "Hi, Ravi?"
const bound = greet.bind(person, "Namaste");
console.log(bound(".")); // "Namaste, Ravi."
```

### 1.2.7 How does the this keyword behave in arrow functions vs regular functions?

**Short answer:** A regular function's `this` is set by how it is called: a
method call, a plain call, `new`, or an explicit `call`, `apply`, or `bind`. An
arrow function has no `this` of its own, so it uses the `this` of the
surrounding scope at the time it was defined, and that value cannot be changed.

**Detailed explanation:**

- Calling a method as `obj.fn()` sets `this` to `obj`. Extracting it as
  `const f = obj.fn` and calling `f()` loses that binding.
- In strict mode, a plain call leaves `this` as `undefined`. In sloppy mode it
  becomes the global object.
- Arrow functions inside class field initializers are a common fix for lost
  `this` in React and class code.
- `call`, `apply`, and `bind` have no effect on an arrow's `this`.

**Code example:**

```javascript
"use strict";
const timer = {
  seconds: 0,
  startRegular() {
    setTimeout(function () {
      console.log(this?.seconds);
    }, 0); // this is not timer
  },
  startArrow() {
    setTimeout(() => {
      this.seconds++;
      console.log(this.seconds);
    }, 0); // this is timer
  },
};
timer.startArrow(); // 1
timer.startRegular(); // undefined
```

### 1.2.8 What is a pure function?

**Short answer:** A pure function always returns the same output for the same
inputs and has no side effects. It does not mutate its arguments, change outside
state, perform I/O, or depend on values like the current time or random numbers.

**Detailed explanation:**

- Purity makes functions easy to test, cache, and reason about.
- Pure functions can be safely reordered or parallelized, because they do not
  depend on shared state.
- Common impurities include mutating arguments, writing to globals, logging,
  network calls, `Date.now()`, and `Math.random()`.
- Pitfall: a function can be pure but still mutate a local variable internally.
  This is acceptable as long as the outside world sees no change.

**Code example:**

```javascript
const add = (a, b) => a + b; // pure

let total = 0;
const addToTotal = (n) => {
  total += n;
  return total;
}; // impure: reads and writes outer state

const addItemImpure = (cart, item) => {
  cart.push(item);
  return cart;
}; // mutates input
const addItemPure = (cart, item) => [...cart, item]; // returns a new array

console.log(add(2, 3)); // 5
console.log(addItemPure([1], 2)); // [1, 2]
```

### 1.2.9 What is a higher-order function? Give 3 examples

**Short answer:** A higher-order function either takes a function as an
argument, returns a function, or both. Examples include array methods like
`map`, wrapper functions like `once`, and factories like `multiplyBy`.

**Detailed explanation:**

- Higher-order functions enable abstraction over behavior, not just data.
- `map`, `filter`, and `reduce` all accept callbacks, which makes them
  higher-order.
- Wrappers such as `once`, `debounce`, and memoize take a function and return an
  enhanced version.
- Factories return specialized functions, which is a form of partial
  application.

**Code example:**

```javascript
// 1. Built-in: map takes a callback
const doubled = [1, 2, 3].map((n) => n * 2); // [2, 4, 6]

// 2. Takes a function and returns a wrapped one
const once = (fn) => {
  let done = false;
  return (...args) => {
    if (!done) {
      done = true;
      return fn(...args);
    }
  };
};
const init = once(() => console.log("init ran"));
init(); // "init ran"
init(); // prints nothing

// 3. Returns a function (factory)
const multiplyBy = (k) => (x) => x * k;
console.log(multiplyBy(3)(4)); // 12
```

### 1.2.10 What is currying in JavaScript?

**Short answer:** Currying turns a function that takes several arguments into a
chain of functions that each take one argument, or that accept whatever
arguments are available and keep returning functions until all are supplied. It
is useful for creating specialized functions from general ones.

**Detailed explanation:**

- A curried `f(a, b, c)` can be called as `f(a)(b)(c)`, `f(a, b)(c)`, or
  `f(a)(b, c)`.
- Currying is often confused with partial application. Partial application fixes
  some arguments and returns a function for the rest, without requiring
  one-at-a-time calls.
- The helper below relies on `fn.length`, which counts only parameters before
  the first default or rest parameter.
- Pitfall: currying adds function-call overhead, so avoid it in very hot loops.

**Code example:**

```javascript
const curry = (fn) =>
  function curried(...args) {
    return args.length >= fn.length
      ? fn(...args)
      : (...more) => curried(...args, ...more);
  };

const add3 = curry((a, b, c) => a + b + c);
console.log(add3(1)(2)(3)); // 6
console.log(add3(1, 2)(3)); // 6
const add10 = add3(10);
console.log(add10(5)(5)); // 20
```

### 1.2.11 What is function composition?

**Short answer:** Function composition combines small functions so that the
output of one becomes the input of the next. `compose` applies functions right
to left, while `pipe` applies them left to right. It lets you build complex
transformations from simple, reusable steps.

**Detailed explanation:**

- Mathematically, `compose(f, g)(x)` equals `f(g(x))`.
- `pipe` is usually easier to read because the order matches the data flow.
- Composition works best with pure, single-argument functions.
- Pitfall: composing async functions requires awaiting each step, so plain
  `pipe` will pass Promises along.

**Code example:**

```javascript
const compose =
  (...fns) =>
  (x) =>
    fns.reduceRight((acc, fn) => fn(acc), x);
const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((acc, fn) => fn(acc), x);

const trim = (s) => s.trim();
const upper = (s) => s.toUpperCase();
const exclaim = (s) => `${s}!`;

const shout = pipe(trim, upper, exclaim);
console.log(shout("  hello  ")); // "HELLO!"
console.log(compose(exclaim, upper, trim)("  hi ")); // "HI!"
```

### 1.2.12 What are default parameters?

**Short answer:** Default parameters give a parameter a fallback value that is
used when the argument is `undefined` or missing. They are evaluated at call
time and can refer to earlier parameters. Only `undefined` triggers the default,
not `null`.

**Detailed explanation:**

- Defaults can be any expression, including function calls, and are evaluated
  each time the function runs.
- A default can refer to parameters that appear before it, but not to ones after
  it, which would be a TDZ error.
- `null` does not trigger the default, which is a frequent source of bugs with
  API responses.
- Parameters with defaults do not count toward `fn.length`, and parameters after
  the first default are not counted either.

**Code example:**

```javascript
function greet(name = "Guest", greeting = `Hello, ${name}`) {
  return `${greeting}!`;
}
console.log(greet()); // "Hello, Guest!"
console.log(greet("Ravi")); // "Hello, Ravi!"
console.log(greet(undefined, "Hi")); // "Hi!"
console.log(greet(null)); // "Hello, null!" (null does not trigger default)
console.log(greet.length); // 0
```

### 1.2.13 What is the arguments object? Does it work in arrow functions?

**Short answer:** `arguments` is an array-like object available inside regular
functions that holds every argument passed, including ones without a matching
parameter. It is not a real array. Arrow functions do not have their own
`arguments`; they reuse the one from the enclosing regular function.

**Detailed explanation:**

- `arguments` has a `length` property and indexed access, but it lacks array
  methods such as `map`.
- Convert it with `Array.from(arguments)` or `[...arguments]`, or better, use
  rest parameters.
- In sloppy mode, `arguments` is linked to named parameters, so changing one
  changes the other. Strict mode removes this link.
- Modern code should prefer `(...args)`, which is a real array and works in
  arrow functions.

**Code example:**

```javascript
function sumAll() {
  return Array.from(arguments).reduce((a, b) => a + b, 0);
}
console.log(sumAll(1, 2, 3)); // 6

function outer() {
  const inner = () => arguments[0]; // arrow reuses outer's arguments
  return inner();
}
console.log(outer("from outer")); // "from outer"
```

### 1.2.14 What is the difference between parameters and arguments?

**Short answer:** Parameters are the named placeholders in a function's
definition, while arguments are the actual values passed when the function is
called. Parameters are fixed names, and arguments are the runtime values that
fill them.

**Detailed explanation:**

- Parameters exist only inside the function body; arguments are the values
  supplied at the call site.
- Missing arguments become `undefined` for their parameters.
- Extra arguments are ignored unless the function reads them through `arguments`
  or a rest parameter.
- Default and rest parameters apply to the parameter side of this relationship.

**Code example:**

```javascript
function add(a, b) {
  // a and b are parameters
  return a + b;
}
console.log(add(2, 3)); // 5: 2 and 3 are arguments
console.log(add(2)); // NaN: b is undefined
console.log(add(1, 2, 3)); // 3: the extra argument is ignored
```

### 1.2.15 What is recursion? Write a recursive function to calculate factorial

**Short answer:** Recursion is when a function calls itself on a smaller version
of the problem until it reaches a base case that stops the calls. Factorial is
the classic example: `n!` equals `n * (n - 1)!`, with `0!` defined as `1`.

**Detailed explanation:**

- Every recursive function needs a base case; without one, it ends in a
  `RangeError: Maximum call stack size exceeded`.
- Each call adds a frame to the call stack, so very deep recursion can overflow
  it. Iteration or a loop is safer for large inputs.
- JavaScript engines do not reliably implement tail-call optimization, so do not
  rely on it.
- Numbers lose integer precision above `Number.MAX_SAFE_INTEGER`. Use `BigInt`
  for large factorials.

**Code example:**

```javascript
function factorial(n) {
  if (n < 0) throw new RangeError("n must be >= 0");
  if (n === 0 || n === 1) return 1; // base case
  return n * factorial(n - 1); // recursive case
}
console.log(factorial(5)); // 120
console.log(factorial(0)); // 1
console.log(factorial(20)); // 2432902008176640000 (exact; larger n loses precision)
```

## 1.3 Arrays & Objects

### 1.3.1 What is the difference between map(), forEach(), filter(), and reduce()?

**Short answer:** `forEach` runs a callback for side effects and returns
`undefined`. `map` returns a new array of the same length with transformed
values. `filter` returns a new array with only the elements that pass a test.
`reduce` combines all elements into a single value.

**Detailed explanation:**

- None of these methods mutate the original array.
- Chaining `filter`, `map`, and `reduce` is common, but each step creates an
  intermediate array.
- Use `forEach` only when you need side effects, such as logging or DOM updates;
  use `map` when you need a result.
- `reduce` takes an initial value as its second argument. Without it, the first
  element is used as the accumulator, and an empty array throws a `TypeError`.

**Code example:**

```javascript
const nums = [1, 2, 3, 4];
const r1 = nums.forEach((n) => n * 2); // undefined
const r2 = nums.map((n) => n * 2); // [2, 4, 6, 8]
const r3 = nums.filter((n) => n % 2 === 0); // [2, 4]
const r4 = nums.reduce((acc, n) => acc + n, 0); // 10
console.log(r1, r2, r3, r4); // undefined [2, 4, 6, 8] [2, 4] 10
```

### 1.3.2 How does find() differ from filter()?

**Short answer:** `find` returns the first element that matches, or `undefined`
if none does, and it stops searching as soon as it finds a match. `filter`
returns an array of every matching element, which is empty when nothing matches.

**Detailed explanation:**

- Use `find` when you expect one item, such as looking up a user by ID.
- Use `filter` when you need all matches.
- `find` returns the element itself, so it is ambiguous when the element is
  `undefined`. Use `findIndex` to get a position, or `-1` when nothing matches.
- Both methods accept a callback that receives the element, index, and array.

**Code example:**

```javascript
const users = [
  { id: 1, name: "Asha" },
  { id: 2, name: "Ravi" },
  { id: 3, name: "Ravi" },
];
console.log(users.find((u) => u.name === "Ravi")); // { id: 2, name: "Ravi" }
console.log(users.filter((u) => u.name === "Ravi")); // [{ id: 2, ... }, { id: 3, ... }]
console.log(users.find((u) => u.id === 99)); // undefined
console.log(users.filter((u) => u.id === 99)); // []
```

### 1.3.3 What does flat() and flatMap() do?

**Short answer:** `flat(depth)` flattens nested arrays up to the given depth,
and `flat(Infinity)` flattens fully. `flatMap` runs `map` and then flattens the
result by one level. It is handy when each element should produce zero or more
items.

**Detailed explanation:**

- `flat()` defaults to a depth of `1`.
- `flatMap` is more efficient than `map` followed by `flat`, because it builds
  one array in a single pass.
- Returning an empty array from `flatMap` removes that element, so it can filter
  and map together.
- Pitfall: `flatMap` only flattens one level, so nested results from its
  callback stay nested.

**Code example:**

```javascript
const nested = [1, [2, [3, [4]]]];
console.log(nested.flat()); // [1, 2, [3, [4]]]
console.log(nested.flat(Infinity)); // [1, 2, 3, 4]

const sentences = ["hi there", "good day"];
console.log(sentences.flatMap((s) => s.split(" "))); // ["hi", "there", "good", "day"]
console.log([1, 2, 3].flatMap((n) => (n % 2 ? [n * 10] : []))); // [10, 30]
```

### 1.3.4 How do you remove duplicates from an array?

**Short answer:** For primitive values, wrap the array in a `Set` and spread it
back into an array: `[...new Set(arr)]`. For objects, which compare by
reference, deduplicate by a key using a `Map` keyed by that property.

**Detailed explanation:**

- `Set` uses SameValueZero comparison, so `NaN` is treated as equal to `NaN`.
- Objects with identical contents are still distinct in a `Set`, because they
  are different references.
- A `Map` keeps the first insertion position but lets the last value for a key
  win.
- `filter` with `indexOf` also works but is O(n squared) on large arrays.

**Code example:**

```javascript
const nums = [1, 2, 2, 3, 3, 3, NaN, NaN];
console.log([...new Set(nums)]); // [1, 2, 3, NaN]

const people = [{ id: 1 }, { id: 1 }, { id: 2 }];
// Objects compare by reference, so dedupe by a key
const unique = [...new Map(people.map((p) => [p.id, p])).values()];
console.log(unique.length); // 2
```

### 1.3.5 What is destructuring? Give examples for both arrays and objects

**Short answer:** Destructuring extracts values from arrays or objects into
individual variables in one statement. Arrays are matched by position, and
objects are matched by property name. Both support defaults, renaming, nesting,
and rest collection.

**Detailed explanation:**

- Array destructuring uses commas to skip elements and works with any iterable.
- Object destructuring uses property names, and `key: newName` renames the
  variable.
- A default applies only when the value is `undefined`, not when it is `null`.
- Pitfall: destructuring `null` or `undefined` throws a `TypeError`, so guard
  against missing data when needed.

**Code example:**

```javascript
const [first, , third = 0, ...rest] = [10, 20, undefined, 40, 50];
console.log(first, third, rest); // 10 0 [40, 50]

const user = { name: "Asha", address: { city: "Pune" }, role: undefined };
const {
  name,
  address: { city },
  role = "guest",
  age = 30,
} = user;
console.log(name, city, role, age); // Asha Pune guest 30

let x = 1,
  y = 2;
[x, y] = [y, x]; // swap without a temporary variable
console.log(x, y); // 2 1
```

### 1.3.6 What is the spread operator (...)? How is it different from rest parameters?

**Short answer:** The spread operator expands an iterable or object into
individual elements, such as in array literals, object literals, or function
calls. Rest parameters use the same `...` syntax to collect the remaining values
into an array or object. Spread is for building values, and rest is for
gathering them.

**Detailed explanation:**

- Spread appears on the right side of an assignment or inside a call; rest
  appears on the left, in parameters or destructuring.
- A rest parameter must be the last parameter, and an object rest element must
  be last in the pattern.
- Both spread and object rest copy only own enumerable properties, and only one
  level deep.
- Spreading a string produces its characters, which is handy but can surprise
  you.

**Code example:**

```javascript
// Rest: collects remaining values
const sum = (...nums) => nums.reduce((a, b) => a + b, 0);
console.log(sum(1, 2, 3)); // 6

const { id, ...others } = { id: 1, name: "Asha", role: "dev" };
console.log(others); // { name: 'Asha', role: 'dev' }

// Spread: expands values
const arr = [1, 2];
console.log([...arr, 3]); // [1, 2, 3]
console.log(Math.max(...arr)); // 2
```

### 1.3.7 How do you merge two objects in JavaScript?

**Short answer:** Use spread, `{ ...a, ...b }`, which creates a new object where
properties from `b` overwrite those from `a`. `Object.assign({}, a, b)` does the
same, and it is also fine as long as the first argument is a new empty object.
Both merges are shallow.

**Detailed explanation:**

- `Object.assign(target, ...sources)` mutates its first argument, so passing
  `{}` first avoids mutating an existing object.
- Shallow merging replaces nested objects entirely rather than merging them.
  This is the most common surprise.
- A true deep merge requires a recursive helper or a library such as lodash's
  `merge`.
- Later sources win on key conflicts, so order matters.

**Code example:**

```javascript
const defaults = { theme: "light", settings: { fontSize: 14, bold: false } };
const userPrefs = { settings: { fontSize: 18 } };

const shallow = { ...defaults, ...userPrefs };
console.log(shallow.settings); // { fontSize: 18 } (bold was lost)

const merged = Object.assign({}, defaults, { theme: "dark" });
console.log(merged.theme); // "dark"
console.log(defaults.theme); // "light" (original untouched)
```

### 1.3.8 What is Object.keys(), Object.values(), Object.entries()?

**Short answer:** They return arrays describing an object's own enumerable
string-keyed properties: `Object.keys` returns the keys, `Object.values` returns
the values, and `Object.entries` returns `[key, value]` pairs. Together they
make it easy to loop over or transform objects.

**Detailed explanation:**

- Inherited properties and symbol keys are excluded.
- Integer-like keys come first in ascending order, then string keys in insertion
  order.
- `Object.entries` pairs well with `Object.fromEntries` to transform an object's
  values and rebuild it.
- Unlike `for...in`, these methods do not walk the prototype chain.

**Code example:**

```javascript
const product = { name: "Pen", price: 10, qty: 3 };
console.log(Object.keys(product)); // ["name", "price", "qty"]
console.log(Object.values(product)); // ["Pen", 10, 3]
console.log(Object.entries(product)); // [["name", "Pen"], ["price", 10], ["qty", 3]]

const doubled = Object.fromEntries(
  Object.entries(product).map(([k, v]) => [
    k,
    typeof v === "number" ? v * 2 : v,
  ]),
);
console.log(doubled); // { name: 'Pen', price: 20, qty: 6 }
```

### 1.3.9 How do you deep clone an object?

**Short answer:** The modern approach is `structuredClone(obj)`, which copies
nested structures and handles Dates, Maps, Sets, and circular references. The
older `JSON.parse(JSON.stringify(obj))` trick works for plain data but silently
loses several types.

**Detailed explanation:**

- `structuredClone` cannot copy functions, DOM nodes, or class prototypes; those
  throw or come back as plain objects.
- The JSON approach turns Dates into strings, drops `undefined` and function
  values, converts `NaN` to `null`, and throws on circular references.
- Libraries such as lodash's `cloneDeep` cover edge cases that the built-ins
  miss.
- Deep cloning is expensive, so clone only what you need to change.

**Code example:**

```javascript
const original = { name: "Asha", tags: ["a"], created: new Date(0) };

const clone1 = structuredClone(original);
clone1.tags.push("b");
console.log(original.tags); // ["a"]
console.log(clone1.created instanceof Date); // true

const clone2 = JSON.parse(JSON.stringify(original));
console.log(clone2.created instanceof Date); // false (now a string)
```

### 1.3.10 What is the difference between shallow copy and deep copy?

**Short answer:** A shallow copy duplicates only the top-level properties, so
nested objects are still shared by reference between the copy and the original.
A deep copy recursively duplicates every nested level, so the two objects share
nothing.

**Detailed explanation:**

- Spread, `Object.assign`, and `slice` all create shallow copies.
- Changing a top-level primitive on a shallow copy does not affect the original.
- Changing a nested object through a shallow copy does affect the original,
  which is a common source of bugs in state updates.
- In React and Redux, updates should copy the path to the changed value, which
  is a controlled, shallow-copy-based approach.

**Code example:**

```javascript
const a = { info: { city: "Pune" }, n: 1 };
const shallow = { ...a };
shallow.n = 2; // top-level: independent
shallow.info.city = "Delhi"; // nested: shared reference

console.log(a.n); // 1
console.log(a.info.city); // "Delhi" (changed through the shared object)

const deep = structuredClone(a);
deep.info.city = "Mumbai";
console.log(a.info.city); // "Delhi" (unaffected)
```

### 1.3.11 What is optional chaining (?.) and nullish coalescing (??)?

**Short answer:** Optional chaining `?.` stops evaluation and returns
`undefined` when the value before it is `null` or `undefined`, instead of
throwing. Nullish coalescing `??` returns the right-hand value only when the
left side is `null` or `undefined`, so `0`, `""`, and `false` are kept.

**Detailed explanation:**

- `?.` works with properties, methods (`obj.fn?.()`), and bracket access
  (`arr?.[0]`).
- `??` differs from `||`, which also replaces falsy values such as `0` and empty
  strings.
- `??` and `||` cannot be mixed without parentheses; the combination is a
  `SyntaxError`.
- `?.` cannot be used on the left side of an assignment.

**Code example:**

```javascript
const user = { profile: { name: "Asha", age: 0 } };
console.log(user.profile?.name); // "Asha"
console.log(user.address?.city); // undefined (no error)
console.log(user.getName?.()); // undefined (method does not exist)

console.log(user.profile.age || 18); // 18 (0 is falsy, so the wrong value)
console.log(user.profile.age ?? 18); // 0 (only null or undefined trigger it)
console.log(user.address?.city ?? "NA"); // "NA"
```

### 1.3.12 How does Array.from() work?

**Short answer:** `Array.from` creates a new array from an iterable or an
array-like object, meaning anything with a `length` property. An optional second
argument maps each element as it is copied. It works on values that spread
cannot handle, such as `{ length: 3 }`.

**Detailed explanation:**

- Iterables include strings, Sets, Maps, and NodeLists; array-likes include
  `arguments` and plain objects with `length`.
- The map function is applied while copying, which avoids a separate `map` call.
- `new Array(3)` creates holes, while `Array.from({ length: 3 })` creates real
  `undefined` values.
- Strings are split by code point, so emoji stay intact, unlike `split("")`.

**Code example:**

```javascript
console.log(Array.from({ length: 3 })); // [undefined, undefined, undefined]
console.log(Array.from({ length: 3 }, (_, i) => i * 2)); // [0, 2, 4]
console.log(Array.from("hey")); // ["h", "e", "y"]
console.log(Array.from(new Set([1, 1, 2]))); // [1, 2]
```

### 1.3.13 What is Array.isArray() used for?

**Short answer:** `Array.isArray` reliably tells whether a value is a real
array. It is needed because `typeof` returns `"object"` for arrays and
`instanceof Array` fails for arrays created in another frame or realm.

**Detailed explanation:**

- Array-like objects such as `arguments` and `{ length: 0 }` return `false`,
  which is correct because they are not arrays.
- It is the right check before calling array methods on data from an API or a
  user.
- `Array.isArray` works across iframes and realms, unlike `instanceof`.
- Pitfall: `typeof null` is also `"object"`, so checking `typeof` alone is never
  enough.

**Code example:**

```javascript
console.log(Array.isArray([])); // true
console.log(Array.isArray({ length: 0 })); // false (array-like, not an array)
console.log(typeof []); // "object" (typeof cannot identify arrays)
console.log([] instanceof Array); // true (but unreliable across realms)
```

### 1.3.14 How do you sort an array of objects by a property?

**Short answer:** Pass a comparator to `sort` that returns a negative, zero, or
positive number based on the property. Use subtraction for numbers and
`localeCompare` for strings. `sort` mutates the array, so sort a copy when the
original must stay unchanged.

**Detailed explanation:**

- Without a comparator, `sort` compares values as strings, so `[10, 9, 1]`
  becomes `[1, 10, 9]`.
- `sort` is stable since ES2019, so items with equal keys keep their original
  relative order.
- `toSorted()` (ES2023) returns a sorted copy and is a cleaner alternative to
  `[...arr].sort()`, where the runtime supports it.
- For multi-key sorts, compare the first key and fall back to the next when it
  is equal.

**Code example:**

```javascript
const people = [
  { name: "Ravi", age: 30 },
  { name: "asha", age: 25 },
  { name: "Zoya", age: 25 },
];
const byAge = [...people].sort((a, b) => a.age - b.age);
console.log(byAge.map((p) => p.name)); // ["asha", "Zoya", "Ravi"] (stable)

const byName = [...people].sort((a, b) => a.name.localeCompare(b.name));
console.log(byName.map((p) => p.name)); // ["asha", "Ravi", "Zoya"]
```

### 1.3.15 What does splice() vs slice() do?

**Short answer:** `slice(start, end)` returns a shallow copy of a portion of the
array and leaves the original unchanged. `splice(start, deleteCount, ...items)`
changes the original array by removing and optionally inserting elements, and it
returns the removed elements.

**Detailed explanation:**

- The `end` index in `slice` is exclusive, and negative indexes count from the
  end.
- `splice` is the mutating method, so it is unsafe in React state or Redux
  reducers unless the array is copied first.
- Omitting `deleteCount` in `splice` removes everything from `start` to the end.
- Pitfall: mixing up the two names is common, so remember that `splice` mutates
  and `slice` does not.

**Code example:**

```javascript
const arr = ["a", "b", "c", "d", "e"];
console.log(arr.slice(1, 3)); // ["b", "c"] (end is exclusive)
console.log(arr.slice(-2)); // ["d", "e"]
console.log(arr); // ["a", "b", "c", "d", "e"] (unchanged)

const removed = arr.splice(1, 2, "X"); // remove 2 items at index 1, insert "X"
console.log(removed); // ["b", "c"]
console.log(arr); // ["a", "X", "d", "e"] (mutated)
```

## 1.4 Asynchronous JavaScript

### 1.4.1 What is the JavaScript event loop?

**Short answer:** JavaScript runs one piece of code at a time on a single
thread. The event loop lets it handle asynchronous work by checking whether the
call stack is empty and, if so, moving the next queued callback onto it.

**Detailed explanation:**

- Timers, network requests and DOM events are handled by the browser or Node
  runtime, which queues a callback when the work finishes.
- The loop runs the current synchronous code, drains the microtask queue, then
  takes one macrotask and repeats.
- Long synchronous work blocks the loop, which freezes the UI and delays every
  queued callback.
- Pitfall: `setTimeout` does not run code in parallel. It only schedules a
  callback for later.

**Code example:**

```javascript
console.log("1 sync start");
setTimeout(() => console.log("4 timeout (macrotask)"), 0);
Promise.resolve().then(() => console.log("3 promise (microtask)"));
console.log("2 sync end");
// Output: 1, 2, 3, 4
```

### 1.4.2 What is the call stack? What is the task queue?

**Short answer:** The call stack is a LIFO structure that tracks the function
currently executing. The task queue holds callbacks from finished async
operations and waits until the stack is empty before they run.

**Detailed explanation:**

- A frame is pushed when a function is called and popped when it returns.
- Stack overflow happens with runaway recursion and throws a `RangeError`.
- The task queue is FIFO. The event loop moves a task onto the stack only when
  the stack is empty.
- Modern engines use a separate microtask queue for promise reactions, which is
  drained before the next task.

**Code example:**

```javascript
function recurse(n) {
  return recurse(n + 1); // never returns
}
try {
  recurse(0);
} catch (e) {
  console.log(e instanceof RangeError); // true
}
```

### 1.4.3 What is the difference between synchronous and asynchronous code?

**Short answer:** Synchronous code runs line by line, and each statement waits
for the previous one. Asynchronous code starts an operation and lets the program
continue, then handles the result later through a callback, promise or `await`.

**Detailed explanation:**

- Synchronous code blocks the thread until it finishes.
- Async code hands waiting work (I/O, timers) to the runtime, so the JavaScript
  thread stays free.
- Async does not mean parallel in JavaScript. Concurrency comes from the event
  loop. Web Workers provide true parallelism.
- Pitfall: async results cannot be returned synchronously. Reading a variable
  that a callback will set later gives `undefined`.

**Code example:**

```javascript
let result;
setTimeout(() => {
  result = "loaded";
}, 100);
console.log(result); // undefined, the timer has not run yet
setTimeout(() => console.log(result), 200); // 'loaded'
```

### 1.4.4 What is a callback function? What problem does it solve?

**Short answer:** A callback is a function passed as an argument and invoked
later, usually when an operation completes. It lets asynchronous or reusable
code hand its result back to the caller without blocking.

**Detailed explanation:**

- Callbacks underpin `setTimeout`, `addEventListener` and Node APIs.
- Node uses error-first callbacks, `(err, data) => {}`, so errors are checked
  first.
- Problem: inversion of control. You rely on the library to call your callback
  exactly once.
- Pitfall: after calling back with an error, `return` so the success path does
  not also run.

**Code example:**

```javascript
function readUser(id, callback) {
  setTimeout(() => {
    if (id <= 0) return callback(new Error("Invalid id"));
    callback(null, { id, name: "Asha" });
  }, 100);
}
readUser(1, (err, user) => {
  if (err) return console.error(err.message);
  console.log(user.name); // Asha
});
```

### 1.4.5 What is "callback hell"? How do you avoid it?

**Short answer:** Callback hell is deeply nested callbacks in which each step
depends on the previous one, which makes code hard to read and error-handle. You
avoid it with promises, `async`/`await`, named functions and by running
independent work in parallel.

**Detailed explanation:**

- Nested callbacks form a pyramid, and error handling is repeated at every
  level.
- Promise chains or `async`/`await` flatten the sequence into readable steps.
- Pitfall: `await` inside `forEach` does not wait. Use `for...of` for sequential
  work, or `Promise.all` with `map` for parallel work.

**Code example:**

```javascript
const delay = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const getUser = (id) => delay(100, { id, name: "Asha" });
const getOrders = (uid) => delay(100, [{ id: 7, uid }]);

async function main() {
  const user = await getUser(1); // replaces getUser(1, cb1 => ...)
  const orders = await getOrders(user.id);
  console.log(orders[0].id); // 7
}
main();
```

### 1.4.6 What is a Promise? What are its states?

**Short answer:** A Promise represents the eventual result of an async
operation. It is pending until it becomes fulfilled with a value or rejected
with a reason, and once settled it never changes state.

**Detailed explanation:**

- The three states are pending, fulfilled and rejected. Fulfilled and rejected
  are both "settled".
- Consumers attach handlers with `.then`, `.catch` and `.finally`.
- Calling `resolve` or `reject` after the first settlement has no effect.
- Handlers always run asynchronously as microtasks, even if the promise is
  already settled.
- Pitfall: a rejection with no handler is an unhandled rejection.

**Code example:**

```javascript
const p = new Promise((resolve) => {
  setTimeout(() => resolve("done"), 100);
});
console.log(p); // Promise { <pending> }
p.then((v) => console.log(v)); // 'done' after about 100ms
```

### 1.4.7 What is the difference between Promise.all(), Promise.race(), Promise.any(), and Promise.allSettled()?

**Short answer:** `Promise.all` resolves with all values in order, or rejects on
the first rejection. `race` settles with the first promise to settle, `any`
resolves with the first fulfillment, and `allSettled` waits for everything and
reports each outcome without rejecting.

**Detailed explanation:**

- `all` is best when every result is required. It fails fast.
- `race` is useful for timeouts, since the first settlement wins even if it is a
  rejection.
- `any` rejects with an `AggregateError` only when every input rejects.
- `allSettled` is best for partial failure, such as a dashboard with several
  independent widgets.

**Code example:**

```javascript
const delay = (ms, v, fail = false) =>
  new Promise((res, rej) =>
    setTimeout(() => (fail ? rej(new Error(v)) : res(v)), ms),
  );

async function main() {
  console.log(await Promise.race([delay(50, "slow"), delay(10, "fast")])); // fast
  console.log(await Promise.any([delay(10, "bad", true), delay(30, "ok")])); // ok
  try {
    await Promise.all([delay(10, "x"), delay(20, "boom", true)]);
  } catch (e) {
    console.log(e.message); // boom
  }
  const r = await Promise.allSettled([delay(5, "a"), delay(5, "b", true)]);
  console.log(r.map((x) => x.status)); // [ 'fulfilled', 'rejected' ]
}
main();
```

### 1.4.8 How does async/await work? What does it return?

**Short answer:** `async`/`await` is syntax over promises. An `async` function
always returns a promise, and `await` pauses that function until the awaited
promise settles, then resumes with its value or throws its rejection.

**Detailed explanation:**

- A `return` value in an `async` function is wrapped in a resolved promise. A
  `throw` becomes a rejected promise.
- `await` pauses only the surrounding async function. The rest of the program
  keeps running.
- `await` accepts non-promise values too, which are treated as already-resolved
  promises.
- Top-level `await` is available in ES modules.
- Pitfall: awaiting inside a loop runs the calls one after another. Start them
  first and combine with `Promise.all` when they are independent.

**Code example:**

```javascript
async function getNumber() {
  return 42;
}
async function main() {
  console.log("before await");
  const n = await getNumber();
  console.log("after await", n);
}
main();
console.log("sync end");
// Output: before await / sync end / after await 42
```

### 1.4.9 How do you handle errors in async/await?

**Short answer:** Wrap `await` calls in `try`/`catch`, because a rejected
promise throws at the `await` line. Make sure the top-level call also handles
rejections so none go unhandled.

**Detailed explanation:**

- `try`/`catch`/`finally` works just as it does for synchronous code.
- Pitfall: `return somePromise()` inside `try` does not catch its rejection. Use
  `return await somePromise()`.
- Unhandled rejections crash Node by default, and browsers log them.
- Do not swallow errors silently. Log them, rethrow, or convert them to a
  meaningful error.

**Code example:**

```javascript
async function fetchUser(id) {
  if (id < 0) throw new Error("Invalid id");
  return { id, name: "Asha" };
}
async function show(id) {
  try {
    const user = await fetchUser(id);
    console.log(user.name);
  } catch (err) {
    console.log("Failed:", err.message);
  } finally {
    console.log("done");
  }
}
show(1);
show(-1);
// Output: Asha, done, Failed: Invalid id, done
```

### 1.4.10 What is the difference between microtask queue and macrotask queue?

**Short answer:** Both hold callbacks waiting for the call stack to clear. The
microtask queue (promise reactions, `queueMicrotask`) is drained completely
after each task, before the next macrotask runs. Macrotasks (`setTimeout`,
`setInterval`, I/O, UI events) run one at a time per loop iteration.

**Detailed explanation:**

- Order: run the script, drain microtasks, render if needed (browsers), take one
  macrotask, drain microtasks, and repeat.
- A microtask that queues another microtask runs it before any macrotask.
- Pitfall: a very long microtask chain blocks rendering and timers just like a
  long synchronous task.
- Node adds `process.nextTick`, which runs before promise microtasks.

**Code example:**

```javascript
setTimeout(() => console.log("macrotask"), 0);
Promise.resolve().then(() => {
  console.log("microtask 1");
  Promise.resolve().then(() => console.log("microtask 2 (queued inside)"));
});
console.log("sync");
// Output: sync, microtask 1, microtask 2 (queued inside), macrotask
```

### 1.4.11 What does setTimeout(fn, 0) actually do?

**Short answer:** It schedules `fn` as a macrotask to run after a minimum delay
of roughly zero. It runs only after the current synchronous code and pending
microtasks finish, so it is never immediate.

**Detailed explanation:**

- Real delays are clamped to a minimum, typically 1 to 4 ms, and nested timers
  are clamped further in browsers.
- Common uses are deferring work until the current stack clears and yielding to
  the browser so it can render.
- Pitfall: other tasks can run before it, and a busy main thread delays it.
- Pitfall: `setTimeout` is not a thread. It only queues a callback.

**Code example:**

```javascript
console.log("A");
setTimeout(() => console.log("B (timeout 0)"), 0);
Promise.resolve().then(() => console.log("C (microtask)"));
console.log("D");
// Output: A, D, C, B
```

### 1.4.12 How does fetch() work? What does it return?

**Short answer:** `fetch(url, options)` starts an HTTP request and returns a
promise that resolves to a `Response` as soon as headers arrive. The body is
read with another promise, such as `response.json()`. `fetch` rejects only on
network failure, so HTTP errors like 404 must be checked with `response.ok`.

**Detailed explanation:**

- `Response` exposes `ok`, `status`, `headers`, and body readers such as
  `json()` and `text()`.
- The body can be read only once.
- Options include `method`, `headers`, `body`, `credentials` and `signal`, where
  `signal` comes from an `AbortController` for cancellation.
- Pitfall: forgetting `await` on `res.json()` returns a promise, not the data.

**Code example:**

```javascript
async function getPost(id) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
getPost(1).then((post) => console.log(post.title)); // prints the post title
```

### 1.4.13 What is the difference between JSON.stringify() and JSON.parse()?

**Short answer:** `JSON.stringify` converts a JavaScript value into a JSON
string, and `JSON.parse` converts a JSON string back into a value. They are
inverses only for JSON-safe data, so functions, `undefined`, `Date` objects and
`NaN` do not round-trip cleanly.

**Detailed explanation:**

- `stringify` omits `undefined`, functions and symbols in objects, and turns
  them into `null` in arrays.
- `NaN` and `Infinity` become `null`. A `Date` becomes an ISO string and is not
  restored as a `Date`.
- Circular references throw a `TypeError`.
- `parse` throws a `SyntaxError` on invalid input, so wrap parsing untrusted
  data in `try`/`catch`.

**Code example:**

```javascript
const user = {
  name: "Asha",
  age: undefined,
  greet() {},
  joined: new Date(0),
  tags: [NaN],
};
const json = JSON.stringify(user);
console.log(json); // {"name":"Asha","joined":"1970-01-01T00:00:00.000Z","tags":[null]}
const back = JSON.parse(json);
console.log(typeof back.joined); // 'string'
```

### 1.4.14 How do you make multiple API calls in parallel?

**Short answer:** Start all the requests before awaiting any of them, then
combine them with `Promise.all`, or with `Promise.allSettled` when partial
failure is acceptable. Awaiting each call in turn makes the total time the sum
of all calls.

**Detailed explanation:**

- Sequential total time is roughly the sum of the calls. Parallel total time is
  roughly the slowest call.
- Pitfall: `await` inside `map` does not run in parallel by itself. `map`
  returns an array of promises, which `Promise.all` then awaits.
- `Promise.all` keeps results in input order.
- For many requests, limit concurrency with a pool so the server is not
  overwhelmed.

**Code example:**

```javascript
const delay = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const fetchUser = (id) => delay(100, `user${id}`);

async function main() {
  const users = await Promise.all([1, 2, 3].map(fetchUser));
  console.log(users); // [ 'user1', 'user2', 'user3' ] after about 100ms, not 300ms
}
main();
```

### 1.4.15 What is debouncing vs. throttling?

**Short answer:** Debouncing delays a function until calls stop for a set time,
so only the last call runs. Throttling runs a function at most once per time
window, so calls are spaced out at a steady rate. Debounce suits
search-as-you-type, and throttle suits scroll or resize handlers.

**Detailed explanation:**

- Debounce waits for a quiet period. Throttle guarantees a regular cadence.
- Pitfall: in React, a debounced function recreated on each render loses its
  timer. Keep it stable with `useMemo` or `useRef`.
- Pitfall: a debounce can be starved if events never stop. Add a `maxWait` if
  needed.
- Lodash provides `debounce` and `throttle` with leading and trailing options.

**Code example:**

```javascript
function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
const search = debounce((q) => console.log("search:", q), 300);
search("r");
search("re");
search("rea");
search("react");
// After 300ms of quiet, prints once: search: react
```

## 1.5 ES6+ Features

### 1.5.1 What are template literals?

**Short answer:** Template literals are strings wrapped in backticks that
support embedded expressions with `${}` and multi-line text without escape
characters. They also form the basis of tagged templates.

**Detailed explanation:**

- Any expression can go inside `${}`, and it is evaluated at runtime.
- Line breaks inside the backticks are preserved in the string.
- Pitfall: never build SQL or HTML from untrusted input with plain template
  literals, because this allows injection. Use parameterized queries or
  escaping.

**Code example:**

```javascript
const name = "Asha";
const items = 3;
const msg = `Hello ${name},
you have ${items * 2} items. ${items > 2 ? "Nice!" : ""}`;
console.log(msg);
// Hello Asha,
// you have 6 items. Nice!
```

### 1.5.2 What are ES6 modules? What is the difference between import and require()?

**Short answer:** ES modules use `import` and `export`, are statically analyzed,
and have live bindings. `require()` is CommonJS, a runtime function call that
loads a module synchronously and gives you its exports as they were when loaded.

**Detailed explanation:**

- `import` declarations are hoisted and must be at the top level. `require()`
  can run anywhere, including inside an `if`.
- ES module exports are live bindings, so an importer sees updates. CommonJS
  destructuring copies primitive values.
- ES modules run in strict mode by default and support top-level `await`.
- `import()` is the dynamic form that returns a promise, which is used for lazy
  loading.

**Code example:**

```javascript
// counter.mjs (ES module)
export let count = 0;
export function inc() {
  count++;
}

// main.mjs
import { count, inc } from "./counter.mjs";
inc();
console.log(count); // 1, live binding

// CommonJS equivalent:
// const { count } = require('./counter.cjs'); // stays 0, copied value
```

### 1.5.3 What is a Symbol in JavaScript?

**Short answer:** A Symbol is a primitive value that is always unique, created
with `Symbol(description)`. It is commonly used as a property key that cannot
clash with other keys, and for built-in protocol hooks such as
`Symbol.iterator`.

**Detailed explanation:**

- `Symbol('a') !== Symbol('a')`.
- `Symbol.for(key)` returns a shared symbol from a global registry.
- Symbol keys are skipped by `Object.keys`, `for...in` and `JSON.stringify`.
- Pitfall: symbols do not convert implicitly to strings, so `` `${sym}` ``
  throws. Use `String(sym)` or `sym.toString()`.

**Code example:**

```javascript
const id = Symbol("id");
const user = { name: "Asha", [id]: 101 };
console.log(user[id]); // 101
console.log(Object.keys(user)); // [ 'name' ]
console.log(Symbol("x") === Symbol("x")); // false
console.log(JSON.stringify(user)); // {"name":"Asha"}
```

### 1.5.4 What is a Map and how is it different from an object?

**Short answer:** A Map is a collection of key-value pairs that preserves
insertion order and accepts keys of any type. Unlike a plain object, it has no
inherited keys, exposes a `size` property, and is built for frequent additions
and deletions.

**Detailed explanation:**

- Object keys are strings or symbols. Other keys are coerced, so `1` and `'1'`
  are the same key.
- Map keys can be objects, functions or `NaN`, and they are compared by
  reference.
- Iteration with `for...of` yields `[key, value]` pairs.
- A Map is not JSON-serializable directly. Convert with `Object.fromEntries` or
  `Array.from`.

**Code example:**

```javascript
const keyObj = { id: 1 };
const m = new Map([
  [keyObj, "user object"],
  ["1", "string one"],
  [1, "number one"],
]);
console.log(m.get(keyObj)); // 'user object'
console.log(m.get(1)); // 'number one'
console.log(m.size); // 3

const o = {};
o[keyObj] = "x"; // key becomes '[object Object]'
o[1] = "y"; // key becomes '1'
console.log(Object.keys(o)); // [ '1', '[object Object]' ]
```

### 1.5.5 What is a Set and when would you use it?

**Short answer:** A Set is a collection of unique values that preserves
insertion order. Use it to remove duplicates or to check membership with
`has()`, which is effectively constant time compared with scanning an array.

**Detailed explanation:**

- Uniqueness uses SameValueZero, so `NaN` equals `NaN`, and objects are compared
  by reference.
- Sets are not indexable. Convert with spread, as in `[...set]`, to get an
  array.
- Pitfall: two objects with identical contents are still two entries.
- Common use: `[...new Set(arr)]` removes duplicates from an array.

**Code example:**

```javascript
const tags = new Set(["js", "react", "js", "redux"]);
console.log(tags.size); // 3
console.log(tags.has("react")); // true
tags.add({ id: 1 });
tags.add({ id: 1 }); // a different object reference
console.log(tags.size); // 5
console.log([...new Set([3, 1, 3, 2])]); // [ 3, 1, 2 ]
```

### 1.5.6 What are generators? What is function* syntax?

**Short answer:** A generator is declared with `function*` and can pause at each
`yield`, producing values lazily. Calling it returns an iterator without running
the body, and each `next()` call runs until the next `yield`.

**Detailed explanation:**

- `yield` sends a value out, and a value passed to `next(x)` becomes the result
  of that `yield`.
- `return` ends the generator with `done: true`.
- `yield*` delegates to another iterable or generator.
- Generators suit lazy or infinite sequences and custom iterators.
  `async function*` is used for streams.
- Pitfall: a generator object is one-shot. Once exhausted, it yields nothing
  more.

**Code example:**

```javascript
function* idGenerator(start = 1) {
  let id = start;
  while (true) {
    const reset = yield id++; // pauses here
    if (reset) id = start;
  }
}
const ids = idGenerator();
console.log(ids.next().value); // 1
console.log(ids.next().value); // 2
console.log(ids.next(true).value); // 1, the reset value re-enters the loop
```

### 1.5.7 What is the difference between for...of and for...in?

**Short answer:** `for...of` iterates over the values of an iterable, such as
arrays, strings, Maps and Sets. `for...in` iterates over the enumerable string
keys of an object, including inherited ones, and is meant for objects rather
than arrays.

**Detailed explanation:**

- `for...in` on an array gives string indices and also any extra enumerable
  properties added to it.
- `for...of` on a plain object throws, because plain objects are not iterable.
- To loop over an object's own entries, use `for...of` with
  `Object.entries(obj)`.
- Both support `break` and `continue`. `for await...of` consumes async
  iterables.

**Code example:**

```javascript
const arr = ["a", "b"];
arr.extra = "x";
for (const i in arr) console.log(i); // '0', '1', 'extra'
for (const v of arr) console.log(v); // 'a', 'b'

const obj = { x: 1, y: 2 };
for (const [k, v] of Object.entries(obj)) console.log(k, v); // x 1, then y 2
```

### 1.5.8 What is WeakMap vs Map?

**Short answer:** A WeakMap holds its keys weakly, so when no other reference to
a key object remains, the garbage collector can free that entry. Keys must be
objects, and WeakMap is not iterable and has no `size`, which is what makes this
safe.

**Detailed explanation:**

- A Map holds strong references to its keys, so entries keep objects alive and
  can leak memory.
- WeakMap is useful for private metadata about DOM nodes or objects, and for
  caches keyed by objects.
- Its API is limited to `set`, `get`, `has` and `delete`, because garbage
  collection timing is not observable.
- Pitfall: WeakMap keys must be objects. Primitive keys like strings throw a
  `TypeError`.

**Code example:**

```javascript
const meta = new WeakMap();
let node = { id: "btn-1" };
meta.set(node, { clicks: 0 });
console.log(meta.get(node)); // { clicks: 0 }
console.log(meta.has(node)); // true
node = null; // no strong references remain, so the entry may be collected
// meta.set('str', 1); // TypeError: Invalid value used as weak map key
```

### 1.5.9 What is tagged template literals?

**Short answer:** A tagged template is a template literal prefixed by a
function, such as `tag` followed by a backtick string. The function receives the
static string parts and the evaluated substitutions, which lets it control how
the final string is built.

**Detailed explanation:**

- The tag is called as `tag(strings, ...values)`, and `strings.raw` holds the
  unprocessed text.
- `strings` has one more element than `values`.
- Libraries use this for styled-components, GraphQL `gql`, and `String.raw`.
- Common uses are escaping HTML and parameterized SQL, where values are passed
  separately from the text.

**Code example:**

```javascript
function highlight(strings, ...values) {
  return strings.reduce(
    (out, str, i) => out + str + (i < values.length ? `[${values[i]}]` : ""),
    "",
  );
}
const user = "Asha",
  score = 42;
console.log(highlight`User ${user} scored ${score} points.`);
// User [Asha] scored [42] points.
console.log(String.raw`C:\new\table`); // C:\new\table
```

### 1.5.10 What are Proxy and Reflect in JavaScript?

**Short answer:** A `Proxy` wraps an object and intercepts operations such as
property reads, writes and deletes through handler functions called traps.
`Reflect` provides the default implementation of each operation, so a trap can
forward to it.

**Detailed explanation:**

- Syntax is `new Proxy(target, handler)`. Common traps are `get`, `set`, `has`,
  `deleteProperty`, and `apply`.
- `Reflect.set` returns a boolean instead of throwing, which makes it safe to
  use in traps.
- Uses include validation, logging, default values, and reactive state, which
  Vue 3 is built on.
- Pitfall: proxies add overhead. Passing `receiver` through `Reflect.get` keeps
  getters bound correctly.
- Pitfall: the engine enforces invariants, so a trap cannot report a
  non-configurable property as missing.

**Code example:**

```javascript
const target = { name: "Asha", age: 30 };
const safe = new Proxy(target, {
  get(obj, prop, receiver) {
    if (!(prop in obj)) return `No such property: ${String(prop)}`;
    return Reflect.get(obj, prop, receiver);
  },
  set(obj, prop, value) {
    if (prop === "age" && typeof value !== "number")
      throw new TypeError("age must be a number");
    return Reflect.set(obj, prop, value);
  },
});
console.log(safe.name); // Asha
console.log(safe.email); // No such property: email
safe.age = 31; // ok
// safe.age = 'old';     // TypeError: age must be a number
```

## 1.6 Prototypes & OOP

### 1.6.1 What is the prototype chain?

**Short answer:** Every object has an internal link to another object called its
prototype. Property lookup checks the object itself, then its prototype, and so
on up the chain until it finds the property or reaches `null`. This is how
objects share methods without copying them.

**Detailed explanation:**

- The chain usually ends at `Object.prototype`, whose prototype is `null`.
- Reading a property searches the chain, but assigning one creates an own
  property on the object, unless a setter or read-only property on the chain
  blocks it.
- `in` checks the whole chain, while `Object.hasOwn` checks only own properties.
- Pitfall: modifying built-in prototypes such as `Array.prototype` affects all
  code and is risky.

**Code example:**

```javascript
const animal = { eats: true };
const dog = Object.create(animal);
dog.barks = true;
console.log(dog.barks); // true, own property
console.log(dog.eats); // true, found on the prototype
console.log(Object.hasOwn(dog, "eats")); // false
console.log(Object.getPrototypeOf(dog) === animal); // true
```

### 1.6.2 What is Object.create()?

**Short answer:** `Object.create(proto)` creates a new object whose prototype is
the object you pass, without calling any constructor. It is the most direct way
to set up prototype-based inheritance. `Object.create(null)` creates an object
with no prototype at all.

**Detailed explanation:**

- The optional second argument takes property descriptors.
- Objects made with `Object.create(null)` have no inherited methods such as
  `toString`, which makes them safe dictionaries for user-supplied keys.
- Changes to the prototype are visible to every object that inherits from it,
  because nothing is copied.

**Code example:**

```javascript
const base = {
  greet() {
    return `Hi, I'm ${this.name}`;
  },
};
const user = Object.create(base, { name: { value: "Asha", enumerable: true } });
console.log(user.greet()); // Hi, I'm Asha

const dict = Object.create(null);
dict.key = "value";
console.log("toString" in dict); // false, no inherited methods
```

### 1.6.3 What is the difference between **proto** and prototype?

**Short answer:** `__proto__` is an accessor on each object that points to the
object it actually inherits from. `prototype` is a property on constructor
functions and classes, and it becomes the `__proto__` of every instance created
with `new`.

**Detailed explanation:**

- For an instance `p` of `Person`, `p.__proto__ === Person.prototype`.
- Instances do not have a `prototype` property. Only functions and classes do.
- `__proto__` is a legacy accessor. Prefer `Object.getPrototypeOf` and
  `Object.setPrototypeOf`.
- Pitfall: merging untrusted objects that contain a `__proto__` key can pollute
  prototypes, so filter such keys.

**Code example:**

```javascript
function Person(name) {
  this.name = name;
}
Person.prototype.hello = function () {
  return `Hi ${this.name}`;
};
const p = new Person("Asha");
console.log(p.__proto__ === Person.prototype); // true
console.log(Object.getPrototypeOf(p) === Person.prototype); // true
console.log(p.prototype); // undefined
```

### 1.6.4 What is a class in JavaScript? Is it just syntactic sugar?

**Short answer:** A class is a template for creating objects, introduced in
ES2015. It is largely syntactic sugar over constructor functions and prototypes,
but it adds real behavior: class code is always strict, class declarations are
not usable before their definition, and calling a class without `new` throws.

**Detailed explanation:**

- Class methods are non-enumerable and live on the prototype.
- Private fields with `#` are enforced by the engine, so they are a real feature
  rather than sugar.
- `typeof Person` is still `'function'`, which shows the prototype model
  underneath.

**Code example:**

```javascript
class Person {
  #age; // private field, enforced by the engine
  constructor(name, age) {
    this.name = name;
    this.#age = age;
  }
  greet() {
    return `Hi, ${this.name}`;
  }
}
console.log(typeof Person); // 'function'
console.log(Object.keys(Person.prototype)); // [] because methods are non-enumerable
// Person('Asha', 3); // TypeError: Class constructor Person cannot be invoked without 'new'
```

### 1.6.5 What is inheritance in JavaScript classes?

**Short answer:** Inheritance uses the `extends` keyword, which links the
subclass prototype to the parent prototype. `super()` calls the parent
constructor, and the subclass inherits the parent's methods and can override
them.

**Detailed explanation:**

- A derived constructor must call `super()` before it uses `this`.
- `super.method()` calls the parent's version of a method, which is useful when
  extending behavior.
- Static methods are inherited too.
- Classes can extend built-ins such as `Error`, which old ES5-style functions
  could not do reliably.
- Pitfall: deep hierarchies create tight coupling. Composition is often the
  better choice.

**Code example:**

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a sound`;
  }
}
class Dog extends Animal {
  speak() {
    return `${super.speak()} - woof!`;
  }
}
const d = new Dog("Rex");
console.log(d.speak()); // Rex makes a sound - woof!
console.log(d instanceof Animal); // true
```

### 1.6.6 What is the difference between instanceof and typeof?

**Short answer:** `typeof` returns a string naming the type of a value, which is
most useful for primitives. `instanceof` checks whether a constructor's
`prototype` appears in an object's prototype chain, so it is for objects.

**Detailed explanation:**

- `typeof null` returns `'object'`, a long-standing bug in the language.
- Arrays are objects, so `typeof []` is `'object'`. Use `Array.isArray` to test
  for arrays.
- `instanceof` returns `false` for primitives such as `'hi'`.
- Pitfall: `instanceof` can fail across iframes or realms, because each realm
  has its own constructors.
- `typeof` on an undeclared variable returns `'undefined'` instead of throwing.

**Code example:**

```javascript
console.log(typeof "hi"); // 'string'
console.log(typeof null); // 'object' (historical bug)
console.log(typeof notDeclared); // 'undefined', no error
console.log(Array.isArray([])); // true
console.log([] instanceof Array); // true
console.log("hi" instanceof String); // false, primitive
console.log(new String("hi") instanceof String); // true
```

### 1.6.7 What is constructor in a class?

**Short answer:** The `constructor` is a special method that runs when `new`
creates an instance. It initializes the object's properties, and in a derived
class it must call `super()` before it uses `this`.

**Detailed explanation:**

- A class can have only one constructor. Defining two is a `SyntaxError`.
- If you omit it, JavaScript supplies an empty default constructor.
- Every class's prototype has a `constructor` property that points back to the
  class.
- Pitfall: keep constructors free of heavy work such as network calls. Use a
  static factory method for that.

**Code example:**

```javascript
class Product {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
}
const p = new Product("Pen", 2);
console.log(p.name, p.price); // Pen 2
console.log(p.constructor === Product); // true
console.log(Product.prototype.constructor === Product); // true
```

### 1.6.8 What are getters and setters?

**Short answer:** Getters and setters are accessor properties defined with `get`
and `set`. They run code when a property is read or assigned, but callers use
them like plain properties. They are used for computed values and for validating
or transforming data on assignment.

**Detailed explanation:**

- A getter without a setter is read-only. Assigning to it throws in strict mode,
  which class bodies always use.
- Accessors keep internal state private while exposing a simple interface.
- Pitfall: a setter with no getter reads back as `undefined`.
- Pitfall: keep getters cheap and free of side effects, because callers do not
  expect a function call.

**Code example:**

```javascript
class Temperature {
  #celsius = 0;
  get fahrenheit() {
    return (this.#celsius * 9) / 5 + 32;
  }
  set fahrenheit(f) {
    if (typeof f !== "number") throw new TypeError("Must be a number");
    this.#celsius = ((f - 32) * 5) / 9;
  }
}
const t = new Temperature();
t.fahrenheit = 212;
console.log(t.fahrenheit); // 212
```

### 1.6.9 What is the difference between static and instance methods?

**Short answer:** Instance methods live on the prototype and are called on
objects created from the class, with `this` referring to that instance. Static
methods live on the class itself, are called on the class, and usually hold
utilities or factory functions.

**Detailed explanation:**

- Static methods are not available on instances, so calling one through an
  instance gives `undefined`.
- Subclasses inherit static methods, which is how factories such as
  `User.fromJSON` work across a hierarchy.
- Instance methods are shared through the prototype, so memory use does not grow
  with each instance.
- Pitfall: a static method extracted from its class has no class `this`, so bind
  it or call it through the class.

**Code example:**

```javascript
class MathUtil {
  static square(n) {
    return n * n;
  }
  constructor(value) {
    this.value = value;
  }
  doubled() {
    return this.value * 2;
  }
}
console.log(MathUtil.square(4)); // 16
console.log(new MathUtil(5).doubled()); // 10
console.log(new MathUtil(5).square); // undefined, static is not on instances
```

### 1.6.10 What is encapsulation in JavaScript?

**Short answer:** Encapsulation hides internal state and exposes only a
controlled interface, so outside code cannot corrupt the object. In modern
JavaScript this is done with private class fields (`#name`), closures, and
getters and setters.

**Detailed explanation:**

- The underscore prefix such as `_balance` is only a naming convention and is
  not enforced.
- Private fields are enforced by the engine. Code outside the class cannot read
  them, even through bracket notation.
- Closures give privacy too: local variables inside a factory function are
  visible only to its returned methods.
- Pitfall: `Object.freeze` is shallow, so nested objects remain mutable. It is
  not full encapsulation.

**Code example:**

```javascript
class BankAccount {
  #balance = 0;
  deposit(amount) {
    if (amount <= 0) throw new RangeError("Amount must be positive");
    this.#balance += amount;
  }
  get balance() {
    return this.#balance;
  }
}
const acc = new BankAccount();
acc.deposit(100);
console.log(acc.balance); // 100
// acc.#balance = 5;      // SyntaxError: private names only accessible inside the class
// acc.balance = 999;     // TypeError in strict mode: getter only
```

## 2.1 JSX & Basics

### 2.1.1 What is JSX? Is it mandatory in React?

**Short answer:** JSX is a syntax extension that lets you write markup-like code
inside JavaScript. It is not mandatory: a build step compiles it to plain
function calls, and you could write React with `React.createElement` or a
library like `htm` instead.

**Detailed explanation:**

- JSX is compiled by Babel, TypeScript, or esbuild into `jsx()` calls (automatic
  runtime) or `React.createElement()` calls (classic runtime).
- Browsers cannot read JSX directly, so a compile step is required in practice.
- JSX is syntactic sugar: it produces plain JavaScript objects (React elements),
  not DOM nodes.
- Pitfall: JSX looks like HTML, but attributes are JavaScript expressions, so
  `onClick={handleClick}` passes a function, not a string.

**Code example:**

```jsx
import React from "react";

function Greeting() {
  const name = "Ravi";
  // JSX (what you write) -- compiled to a function call
  const el = <h1 className="title">Hello, {name}</h1>;
  // Equivalent without JSX
  const el2 = React.createElement(
    "h1",
    { className: "title" },
    "Hello, ",
    name,
  );
  console.log(el, el2);
  return el;
}
```

### 2.1.2 How is JSX different from HTML?

**Short answer:** JSX is JavaScript, so it has different attribute names and
rules than HTML. Keywords like `class` and `for` become `className` and
`htmlFor`, event handlers are camelCase, and `style` takes an object.

**Detailed explanation:**

- `class` becomes `className`, `for` becomes `htmlFor`, and `tabindex` becomes
  `tabIndex`.
- Event handlers are camelCase (`onClick`, `onChange`) and receive function
  references, not strings.
- `style` takes a JavaScript object with camelCase keys, such as
  `{ fontSize: 14 }`.
- Void elements must self-close (`<input />`), and every tag must be closed.
- You can embed any JavaScript expression with `{}`, which HTML cannot do.

**Code example:**

```jsx
function Field() {
  return (
    // "class" and "for" from HTML become className and htmlFor
    <label htmlFor="email" className="field" style={{ fontSize: 14 }}>
      Email
      {/* void tags must self-close */}
      <input id="email" type="email" tabIndex={0} />
    </label>
  );
}
```

### 2.1.3 What are the rules of JSX?

**Short answer:** JSX must return a single root expression, all tags must be
closed, attributes are camelCase, and only JavaScript expressions (not
statements) can go inside `{}`. Component names must start with a capital letter
so React treats them as components.

**Detailed explanation:**

- Return one root element, or a Fragment, from a component.
- Use `{}` for expressions; statements like `if` or `for` cannot appear inside
  JSX, so compute values above the `return`.
- Lowercase tags (`<div>`) are DOM elements; capitalized tags (`<Card>`) are
  components.
- Put the `return` JSX in parentheses when it spans multiple lines to avoid
  automatic semicolon insertion returning `undefined`.
- Comments must use `{/* */}` inside children.

**Code example:**

```jsx
function Profile({ user, isAdmin }) {
  // Statements go above the return; JSX accepts only expressions
  const title = isAdmin ? "Admin" : "Member";
  return (
    <section className="profile" style={{ marginTop: 8 }}>
      <h2>
        {user.name} ({title})
      </h2>
      <img src={user.avatar} alt="" />
    </section>
  );
}
```

### 2.1.4 Why must JSX elements have one parent element?

**Short answer:** A JavaScript function can only return one value, and JSX
compiles to one function call per element. To return siblings, you wrap them in
one parent element or a Fragment.

**Detailed explanation:**

- `return <h1 /> <p />` is invalid because two expressions cannot be returned
  without a wrapper.
- The wrapper can be a `div`, a semantic element like `section`, or a Fragment.
- Pitfall: a wrapper `div` adds a DOM node that can break CSS layouts, such as
  flexbox or tables; use a Fragment in those cases.
- Arrays of elements are also valid, but each needs a `key`.

**Code example:**

```jsx
// Invalid: two sibling elements returned with no wrapper
// return <h1>Title</h1> <p>Body</p>;

// Valid: wrap in one parent element
function Article() {
  return (
    <div>
      <h1>Title</h1>
      <p>Body</p>
    </div>
  );
}
```

### 2.1.5 What is a React Fragment? When do you use it?

**Short answer:** A Fragment lets a component return multiple sibling elements
without adding an extra DOM node. Use it when a wrapper element would break HTML
or CSS structure, such as table rows or definition lists.

**Detailed explanation:**

- The short syntax is `<>...</>`; the full form `<Fragment>` is needed when you
  pass a `key`.
- Fragments render only their children, so the DOM stays clean.
- Common uses: returning `<td>` cells from a component, grouping elements in a
  list, or returning siblings from a conditional branch.
- Pitfall: the short syntax cannot take a `key`, so mapped lists must use
  `<Fragment key={...}>`.

**Code example:**

```jsx
import { Fragment } from "react";

function Columns() {
  // No extra DOM node: the cells become direct children of the row
  return (
    <>
      <td>Name</td>
      <td>Email</td>
    </>
  );
}

function Terms({ items }) {
  return items.map((i) => (
    // A key is required on the list item, so use the full Fragment form
    <Fragment key={i.id}>
      <dt>{i.term}</dt>
      <dd>{i.definition}</dd>
    </Fragment>
  ));
}
```

### 2.1.6 How do you add comments in JSX?

**Short answer:** Inside JSX children, wrap a JavaScript comment in braces:
`{/* comment */}`. Inside an opening tag's attribute list, a plain
`/* comment */` works. HTML-style `<!-- -->` comments are not valid in JSX.

**Detailed explanation:**

- Plain `//` comments are fine above the `return` or inside a `{}` expression.
- `<!-- -->` causes a syntax error because JSX is not HTML.
- A common trick is commenting out JSX blocks with `{/* ... */}` during
  debugging.
- Pitfall: a `//` line inside children is treated as text, so it renders on the
  page.

**Code example:**

```jsx
function Card({ title }) {
  return (
    <div className="card" /* comment allowed inside the tag */>
      {/* JSX comment: rendered as nothing */}
      <h3>{title}</h3>
      {/* <p>This paragraph is hidden</p> */}
    </div>
  );
}
```

### 2.1.7 What is the Virtual DOM? How does it work?

**Short answer:** The Virtual DOM is a lightweight JavaScript object tree that
mirrors the UI. On each render React builds a new tree, diffs it against the
previous one, and applies only the minimal changes to the real DOM.

**Detailed explanation:**

- JSX produces React elements, which are plain objects describing a node's type,
  props, and children.
- When state changes, React re-renders the affected components to produce a new
  element tree.
- React compares the old and new trees (reconciliation) and computes the minimal
  set of DOM operations.
- Pitfall: the Virtual DOM is not inherently faster than hand-written DOM
  updates; its value is declarative code and batched, predictable updates.

**Code example:**

```jsx
const element = <button className="primary">Save</button>;

// Roughly what React holds in memory (not a real DOM node):
// { $$typeof: Symbol(react.element), type: "button",
//   props: { className: "primary", children: "Save" }, key: null }
console.log(element.type); // "button"
```

### 2.1.8 What is reconciliation in React?

**Short answer:** Reconciliation is the process React uses to decide what
changed between two renders. It relies on two heuristics: elements of different
types are replaced, and list items are matched by `key`.

**Detailed explanation:**

- If an element's type changes (for example `div` to `span`), React unmounts the
  old subtree and mounts a new one.
- If the type stays the same, React updates the existing DOM node and its props.
- For lists, `key` tells React which child is which, so reordering moves nodes
  instead of recreating them.
- Pitfall: using array indexes as keys breaks state when items are inserted,
  removed, or reordered.

**Code example:**

```jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        // Stable id, not the array index, so React can match items across renders
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

### 2.1.9 What is the difference between React and ReactDOM?

**Short answer:** `react` is the core library that defines components, hooks,
and elements, independent of any platform. `react-dom` is the renderer that
connects React to the browser DOM.

**Detailed explanation:**

- `react` contains `useState`, `useEffect`, `createElement`, and the component
  model.
- `react-dom` provides `createRoot`, `hydrateRoot`, and `createPortal`, which
  put React output into the browser.
- Other renderers exist for the same core, such as React Native for mobile.
- Since React 18, apps start with `createRoot` from `react-dom/client` instead
  of the older `ReactDOM.render`.

**Code example:**

```jsx
import { createRoot } from "react-dom/client";
import App from "./App";

// react-dom takes the React tree and renders it into a real DOM node
const container = document.getElementById("root");
createRoot(container).render(<App />);
```

### 2.1.10 What is React.createElement()?

**Short answer:** `React.createElement(type, props, ...children)` is the
function that creates a React element object. JSX is compiled into calls like
this, so it is what runs under the hood.

**Detailed explanation:**

- The arguments are the element type (a string like `"p"` or a component
  function), a props object, and the children.
- It returns a plain object, which React later renders; it does not touch the
  DOM itself.
- Modern compilers use the automatic runtime and call `jsx()` from
  `react/jsx-runtime`, which is faster and avoids importing React just for JSX.
- You rarely call `createElement` directly, but understanding it explains why
  JSX becomes plain objects.

**Code example:**

```jsx
import React from "react";

function Note() {
  const name = "Ravi";
  // JSX (what you write)
  const a = <p className="note">Hi {name}</p>;
  // Classic compiled output
  const b = React.createElement("p", { className: "note" }, "Hi ", name);
  return a;
}
```

## 2.2 Components & Props

### 2.2.1 What is the difference between functional and class components?

**Short answer:** Functional components are plain functions that return JSX and
use hooks for state and effects. Class components extend `React.Component`, use
`this.state`, and rely on lifecycle methods; they are legacy but still
supported.

**Detailed explanation:**

- Since React 16.8, hooks let function components do everything classes did, so
  new code is written as functions.
- Classes need `this` binding for callbacks and split related logic across
  lifecycle methods.
- Error boundaries still require a class component (`componentDidCatch` or
  `static getDerivedStateFromError`).
- Pitfall: do not mix up the two styles inside one component; choose one per
  component.

**Code example:**

```jsx
import { useState } from "react";

// Function component (recommended)
function Greeting({ name }) {
  const [count, setCount] = useState(0);
  return (
    <p onClick={() => setCount(count + 1)}>
      Hi {name} ({count})
    </p>
  );
}

// Class component (legacy style, still supported)
// class Greeting extends React.Component {
//   render() { return <p>Hi {this.props.name}</p>; }
// }
```

### 2.2.2 What are props in React?

**Short answer:** Props are the inputs a parent passes to a child component,
written as attributes in JSX. A function component receives them as a single
object argument.

**Detailed explanation:**

- Props flow one way, from parent to child, which keeps data flow predictable.
- You can pass any value: strings, numbers, objects, arrays, functions, or JSX.
- Default values can be set in the destructuring pattern.
- Pitfall: `<Card active />` with no value means `active={true}`.

**Code example:**

```jsx
function UserCard({ name, role = "Member" }) {
  return (
    <p>
      {name} - {role}
    </p>
  );
}

export default function App() {
  return <UserCard name="Asha" role="Admin" />;
}
```

### 2.2.3 Are props mutable? Why or why not?

**Short answer:** No, props are read-only from the child's point of view. The
parent owns the data, and a child that mutates its props breaks one-way data
flow and can leave the UI out of sync.

**Detailed explanation:**

- A component must be a pure function of its props; it should derive new values,
  not change the inputs.
- Mutating a prop object changes the parent's data without telling React, so
  React may not re-render.
- If a child needs to change a value, the parent passes a callback prop, and the
  parent updates its own state.
- Pitfall: a prop object can be mutated accidentally through a nested reference;
  treat all props as frozen.

**Code example:**

```jsx
function Badge({ user }) {
  // BAD: user.name = "Changed";  (mutates the parent's object)

  // GOOD: derive a new value and leave the prop untouched
  const displayName = user.name.toUpperCase();
  return <span>{displayName}</span>;
}
```

### 2.2.4 What is prop drilling? Why is it a problem?

**Short answer:** Prop drilling is passing data through intermediate components
that do not use it, just so a deeply nested child can receive it. It makes
components harder to refactor because every layer is coupled to data it does not
need.

**Detailed explanation:**

- Every component in the chain must know about the prop, even if it only
  forwards it.
- Renaming or changing the shape of the data means editing many unrelated files.
- Common fixes: composition (pass components or `children` directly), Context
  for truly shared data, or a state library for app-wide state.
- Pitfall: Context is not automatically better; it re-renders consumers when its
  value changes, so scope it carefully.

**Code example:**

```jsx
// `user` passes through Layout, which never uses it
function App() {
  const user = { name: "Asha" };
  return <Layout user={user} />;
}

function Layout({ user }) {
  return <Header user={user} />;
}

function Header({ user }) {
  return <h1>Welcome {user.name}</h1>;
}
```

### 2.2.5 What are PropTypes? How do you use them?

**Short answer:** PropTypes is a runtime type-checking library (`prop-types`)
that validates props in development and logs warnings when they are wrong. It is
not used in production builds and has been removed for function components in
React 19, where TypeScript is the typical replacement.

**Detailed explanation:**

- Define a `propTypes` property on the component with validators like
  `PropTypes.string.isRequired`.
- Validation runs only in development, so it adds no production cost.
- It documents the component's API, but it does not stop bad data from reaching
  the UI.
- Pitfall: PropTypes warnings are easy to ignore; a typed language catches the
  same errors at build time.

**Code example:**

```jsx
import PropTypes from "prop-types";

function Button({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>;
}

Button.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};
```

### 2.2.6 What are default props?

**Short answer:** Default props are fallback values used when a prop is not
provided. For function components, the modern approach is default parameter
values in the destructuring pattern, since `defaultProps` is deprecated and
removed in React 19.

**Detailed explanation:**

- Defaults apply only when the prop is `undefined`, not when it is `null` or
  `""`.
- Destructuring defaults are evaluated on every render and are easy to read.
- `defaultProps` still works on class components.
- Pitfall: passing `size={null}` does not trigger the default and can produce an
  invalid attribute.

**Code example:**

```jsx
// Preferred for function components: default parameter values
function Avatar({ size = 40, alt = "User" }) {
  return <img width={size} height={size} alt={alt} src="/avatar.png" />;
}

// <Avatar size={undefined} /> uses 40
// <Avatar size={null} />      keeps null: defaults do NOT apply to null
```

### 2.2.7 What is the children prop?

**Short answer:** `children` is a special prop that holds whatever is placed
between a component's opening and closing tags. It can be text, elements,
arrays, or even a function, and it lets you build wrapper components.

**Detailed explanation:**

- React passes `children` automatically; you do not write it as an attribute.
- A component with no content between its tags gets `children` as `undefined`.
- Use it for layout wrappers, modals, cards, and providers.
- Pitfall: if you read `children` and also render it inside a wrapper, check
  whether a single child or an array is passed (`React.Children` helps).

**Code example:**

```jsx
function Panel({ title, children }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function App() {
  return (
    <Panel title="Stats">
      <p>42 orders today</p>
    </Panel>
  );
}
```

### 2.2.8 What is component composition?

**Short answer:** Component composition means building complex UIs by nesting
and combining components, passing content or other components through props and
`children`. React favors composition over inheritance.

**Detailed explanation:**

- Slots are created by passing JSX as props, such as `header` or `footer`.
- Composition keeps components reusable because each piece has a single job.
- Specialized components (for example, `ConfirmDialog`) are built by composing a
  generic `Modal`.
- Pitfall: inheritance between components is discouraged; if you find yourself
  extending one, move the shared parts into a composed child or a hook.

**Code example:**

```jsx
function Card({ header, children, footer }) {
  return (
    <div className="card">
      <header>{header}</header>
      <main>{children}</main>
      {footer && <footer>{footer}</footer>}
    </div>
  );
}

export default function App() {
  return (
    <Card header={<h3>Profile</h3>} footer={<button>Edit</button>}>
      <p>Welcome back!</p>
    </Card>
  );
}
```

### 2.2.9 What is the difference between presentational and container components?

**Short answer:** Presentational components focus on how things look and take
data through props. Container components own the data and logic, such as
fetching, and render presentational components. Hooks have blurred this split,
but the idea of separating concerns still helps.

**Detailed explanation:**

- Presentational components are reusable and easy to test because they depend
  only on props.
- Containers handle side effects and state, then pass results down.
- Custom hooks now often replace container components: the logic moves into a
  hook, and the component just renders.
- Pitfall: do not split components this way out of habit; split when the logic
  and the UI need to change independently.

**Code example:**

```jsx
import { useEffect, useState } from "react";

// Presentational: props in, UI out, no data fetching
function UserList({ users }) {
  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}

// Container: owns the data and renders the presentational component
export function UserListContainer() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers);
  }, []);
  return <UserList users={users} />;
}
```

### 2.2.10 What is a controlled vs. uncontrolled component?

**Short answer:** A controlled component has its value stored in React state and
updated through `onChange`, so React is the single source of truth. An
uncontrolled component lets the DOM keep its own value, which you read on demand
with a ref.

**Detailed explanation:**

- Controlled inputs give you instant validation, formatting, and easy resets, at
  the cost of a re-render per keystroke.
- Uncontrolled inputs use `defaultValue` for the initial value and are read with
  `ref.current.value`.
- Pitfall: passing `value` without `onChange` makes an input read-only and
  triggers a React warning.
- Pitfall: switching an input between controlled and uncontrolled causes
  warnings and bugs.

**Code example:**

```jsx
import { useRef, useState } from "react";

// Controlled: React state is the source of truth
function ControlledInput() {
  const [value, setValue] = useState("");
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}

// Uncontrolled: the DOM holds the value; read it when needed
function UncontrolledInput() {
  const ref = useRef(null);
  return (
    <>
      <input defaultValue="" ref={ref} />
      <button onClick={() => alert(ref.current.value)}>Read</button>
    </>
  );
}
```

## 2.3 State & Lifecycle

### 2.3.1 What is state in React?

**Short answer:** State is data owned by a component that can change over time.
When you update it through its setter, React re-renders the component so the UI
reflects the new value.

**Detailed explanation:**

- State is private to the component that declares it, unless it is shared by
  lifting it up or passed through Context.
- A component re-renders when its state changes, and its children re-render with
  it unless memoized.
- State persists across re-renders but is reset when the component unmounts.
- Pitfall: state is not a regular variable; a plain `let` inside the component
  resets on every render.

**Code example:**

```jsx
import { useState } from "react";

function Counter() {
  // State owned by this component; calling setCount triggers a re-render
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
  );
}
```

### 2.3.2 What is the difference between state and props?

**Short answer:** Props are inputs passed in from a parent and are read-only
inside the child. State is data a component owns and updates itself. A change in
either one causes a re-render.

**Detailed explanation:**

- Props come from outside; state is created inside the component with
  `useState`.
- A child can read its props but cannot change them; it can only change its own
  state.
- Props can be derived into state, but copying props into state creates a stale
  copy if the parent changes.
- Pitfall: avoid storing a prop in state just to read it; use the prop directly.

**Code example:**

```jsx
import { useState } from "react";

function Child({ count }) {
  // props: read-only, owned by the parent
  return <p>Count: {count}</p>;
}

function Parent() {
  // state: owned and updated here
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>+</button>
      <Child count={count} />
    </>
  );
}
```

### 2.3.3 What is useState? How does it work?

**Short answer:** `useState` is a hook that returns a pair: the current state
value and a setter function. Calling the setter schedules a re-render with the
new value, and the initial value is used only on the first render.

**Detailed explanation:**

- Each render sees a snapshot of state; the value does not change inside the
  current event handler.
- Setter updates are queued and batched, so multiple calls in one event cause
  one re-render.
- Pass a function as the initial value (lazy initialization) when computing it
  is expensive; React calls it only once.
- Pitfall: calling the setter during render without a guard causes an infinite
  loop.

**Code example:**

```jsx
import { useState } from "react";

function Todos() {
  // Lazy initializer: the function runs only on the first render
  const [items, setItems] = useState(() =>
    JSON.parse(localStorage.getItem("items") ?? "[]"),
  );
  const add = (text) => setItems([...items, text]);
  return <button onClick={() => add("new")}>{items.length} items</button>;
}
```

### 2.3.4 Why should you never mutate state directly?

**Short answer:** React detects changes by comparing references, so mutating an
existing object or array leaves the reference the same and React may skip the
re-render. You must create a new object or array instead.

**Detailed explanation:**

- React uses `Object.is` on state to decide whether to re-render, and
  memoization uses the same comparison.
- Mutation can make the UI show stale data and bugs that appear only sometimes.
- Mutation also breaks tools like Redux DevTools and time-travel debugging,
  which depend on immutable snapshots.
- Pitfall: a shallow copy is not enough for nested objects; copy each level you
  change.

**Code example:**

```jsx
import { useState } from "react";

function Tags() {
  const [tags, setTags] = useState(["react"]);

  // BAD: tags.push("redux"); setTags(tags);  -- same reference, React may skip the render

  // GOOD: a new array, so React sees a change
  const addTag = () => setTags([...tags, "redux"]);
  return <button onClick={addTag}>{tags.join(", ")}</button>;
}
```

### 2.3.5 How do you update state based on the previous state value?

**Short answer:** Pass an updater function to the setter, such as
`setCount(prev => prev + 1)`. It receives the latest queued state, so it stays
correct even when several updates happen before the next render.

**Detailed explanation:**

- Inside a handler, `count` is a snapshot from the last render, so
  `setCount(count + 1)` repeated three times adds only one.
- The updater form always works on the latest value React has queued.
- Use the updater form whenever the new state depends on the old state.
- Pitfall: the updater must be pure; do not call side effects like `fetch` or
  `console.log` inside it.

**Code example:**

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  // Using `count` three times: all read the same snapshot (0), so the result is 1
  // setCount(count + 1); setCount(count + 1); setCount(count + 1);

  // Updater form: each call sees the previous queued value, so the result is 3
  const incrementThree = () => {
    setCount((c) => c + 1);
    setCount((c) => c + 1);
    setCount((c) => c + 1);
  };
  return <button onClick={incrementThree}>{count}</button>;
}
```

### 2.3.6 What is lifting state up?

**Short answer:** Lifting state up means moving shared state to the closest
common ancestor of the components that need it. The ancestor passes the value
down as props and passes callbacks down for changes.

**Detailed explanation:**

- Sibling components cannot share state directly, so the parent becomes the
  single source of truth.
- Children become controlled: they display props and report changes through
  callbacks.
- Pitfall: lifting too high causes unnecessary re-renders across the tree; lift
  only as far as needed.
- If many levels need the state, consider Context or a state library instead.

**Code example:**

```jsx
import { useState } from "react";

function TempInput({ label, value, onChange }) {
  return (
    <input
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// The parent owns the shared state; siblings receive it through props
export default function Converter() {
  const [celsius, setCelsius] = useState("");
  const fahrenheit = celsius === "" ? "" : (Number(celsius) * 9) / 5 + 32;
  return (
    <>
      <TempInput label="Celsius" value={celsius} onChange={setCelsius} />
      <p>{fahrenheit} F</p>
    </>
  );
}
```

### 2.3.7 What is the component lifecycle in class components?

**Short answer:** Class components go through three phases: mounting
(constructor, render, `componentDidMount`), updating (render,
`componentDidUpdate`), and unmounting (`componentWillUnmount`). Lifecycle
methods are where side effects and cleanup were placed before hooks.

**Detailed explanation:**

- `constructor` initializes state and binds methods; `render` returns JSX and
  must be pure.
- `componentDidMount` runs once after the first DOM commit and is used for
  fetching and subscriptions.
- `componentDidUpdate(prevProps, prevState)` runs after updates, and you must
  guard it to avoid loops.
- `componentWillUnmount` runs before removal and is used for cleanup.

**Code example:**

```jsx
import { Component } from "react";

class Timer extends Component {
  state = { seconds: 0 };

  componentDidMount() {
    // Mounting: start work after the first render
    this.id = setInterval(
      () => this.setState((s) => ({ seconds: s.seconds + 1 })),
      1000,
    );
  }

  componentWillUnmount() {
    // Unmounting: clean up
    clearInterval(this.id);
  }

  render() {
    return <p>{this.state.seconds}s</p>;
  }
}
```

### 2.3.8 What are the phases of the React lifecycle (mount, update, unmount)?

**Short answer:** Mount is the first render and insertion into the DOM, update
is any re-render caused by state, props, or context changes, and unmount is
removal from the DOM. In hooks, the render phase must be pure, and effects
handle the commit-phase side effects.

**Detailed explanation:**

- Rendering can run more than once, and React may discard a render, so it must
  not perform side effects.
- Effects run after commit: once on mount, again after dependencies change, and
  cleanup runs before each re-run and on unmount.
- In development, StrictMode mounts, unmounts, and remounts components once to
  expose missing cleanup.
- Pitfall: relying on the number of renders is fragile; think in terms of
  effects and their cleanup.

**Code example:**

```jsx
import { useEffect, useState } from "react";

function Chat({ roomId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Mount, and again when roomId changes: connect
    // const conn = createConnection(roomId);
    // conn.onMessage((m) => setMessages((prev) => [...prev, m]));
    // conn.connect();
    return () => {
      // Before the next run and on unmount: disconnect
      // conn.disconnect();
    };
  }, [roomId]);

  return <p>{messages.length} messages</p>;
}
```

### 2.3.9 What is componentDidMount? What is its hook equivalent?

**Short answer:** `componentDidMount` runs once after a component's first render
is committed to the DOM. Its hook equivalent is `useEffect` with an empty
dependency array.

**Detailed explanation:**

- It is the right place for data fetching, subscriptions, and reading DOM
  measurements.
- `useEffect` runs after the browser paints, while `componentDidMount` runs
  before paint; use `useLayoutEffect` if you need that timing.
- An empty array `[]` means the effect runs only on mount; any dependency makes
  it re-run on change.
- Pitfall: in StrictMode dev, the effect runs twice, so the work must be safe to
  repeat.

**Code example:**

```jsx
import { useEffect, useState } from "react";

function Me() {
  const [user, setUser] = useState(null);

  // Equivalent of componentDidMount: runs once after the first commit
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then(setUser);
  }, []);

  return <p>{user ? user.name : "Loading..."}</p>;
}
```

### 2.3.10 What is componentWillUnmount? How do you replicate it with hooks?

**Short answer:** `componentWillUnmount` runs just before a component is removed
and is used for cleanup such as clearing timers or removing listeners. With
hooks, you return a cleanup function from `useEffect`.

**Detailed explanation:**

- The cleanup function runs on unmount and before the effect runs again because
  its dependencies changed.
- Typical cleanup: `clearInterval`, `removeEventListener`, unsubscribing, or
  aborting a fetch.
- Pitfall: forgetting cleanup leaks memory and can call `setState` on an
  unmounted component.
- A useEffect with no return value has no cleanup, so the work keeps running.

**Code example:**

```jsx
import { useEffect, useState } from "react";

function Ticker() {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTicks((t) => t + 1), 1000);
    // Equivalent of componentWillUnmount: clean up the interval
    return () => clearInterval(id);
  }, []);

  return <p>{ticks}</p>;
}
```

## 2.4 Hooks

### 2.4.1 What are React Hooks? Why were they introduced?

**Short answer:** Hooks are functions, such as `useState` and `useEffect`, that
let function components use state and lifecycle features. They were introduced
in React 16.8 to share stateful logic without wrapper components and to avoid
the complexity of classes.

**Detailed explanation:**

- Before hooks, shared logic needed higher-order components or render props,
  which created deep wrapper trees.
- Hooks group related code by concern (for example, all subscription logic
  together) instead of splitting it across lifecycle methods.
- Functions are easier to minify, compose, and test than classes with `this`.
- Pitfall: hooks must follow the rules of hooks, which are enforced by a lint
  plugin.

**Code example:**

```jsx
import { useEffect, useState } from "react";

// State and side effects live together in one function
function WindowTitle() {
  const [title, setTitle] = useState(document.title);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return <input value={title} onChange={(e) => setTitle(e.target.value)} />;
}
```

### 2.4.2 What are the rules of Hooks?

**Short answer:** Call hooks only at the top level of a function component or
custom hook, never inside loops, conditions, or nested functions. React ties
each hook to its call order, so the order must be the same on every render.

**Detailed explanation:**

- Only call hooks from React function components or from custom hooks.
- Hooks inside `if`, loops, or callbacks change the order and corrupt state.
- The `eslint-plugin-react-hooks` package enforces these rules.
- Pitfall: an early `return` before a hook call also breaks the order; put the
  hooks first.

**Code example:**

```jsx
import { useState } from "react";

function Profile({ isLoggedIn }) {
  // BAD: if (isLoggedIn) { const [name] = useState("Asha"); }  -- conditional hook

  // GOOD: call the hook unconditionally and put the condition in the render
  const [name] = useState("Asha");
  return <p>{isLoggedIn ? name : "Guest"}</p>;
}
```

### 2.4.3 What is useEffect and when does it run?

**Short answer:** `useEffect` runs side effects, such as fetching data,
subscriptions, or DOM changes, after React has rendered and the browser has
painted. By default it runs after every render, and you control that with the
dependency array.

**Detailed explanation:**

- Effects are for work that reaches outside React, not for computing values
  during render.
- With no dependency array, the effect runs after every render.
- With `[]`, it runs once after mount; with values, it runs after mount and
  whenever those values change.
- Pitfall: setting state in an effect without a guard can cause an infinite
  render loop.

**Code example:**

```jsx
import { useEffect, useState } from "react";

function WindowSize() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    // Runs after the first render is painted, because the array is empty
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return <p>{width}px</p>;
}
```

### 2.4.4 What is the dependency array in useEffect?

**Short answer:** The dependency array lists the reactive values the effect
reads. React re-runs the effect only when one of those values changes, comparing
each with `Object.is`.

**Detailed explanation:**

- Omitting the array runs the effect after every render; `[]` runs it only on
  mount.
- Any value from props or state used inside the effect should be listed.
- Leaving out a dependency causes stale values, which the `exhaustive-deps` lint
  rule catches.
- Pitfall: objects and functions created during render are new each time, so
  they re-trigger the effect; memoize them or move them inside.

**Code example:**

```jsx
import { useEffect, useState } from "react";

function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  // Re-runs only when `query` changes
  useEffect(() => {
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then(setResults);
  }, [query]);

  return (
    <ul>
      {results.map((r) => (
        <li key={r.id}>{r.title}</li>
      ))}
    </ul>
  );
}
```

### 2.4.5 How do you run useEffect only once?

**Short answer:** Pass an empty dependency array, `[]`, so the effect runs after
the first render and never again. In development with StrictMode, React mounts
the effect twice, so the cleanup should make the work safe to repeat.

**Detailed explanation:**

- An empty array means no reactive values, so there is nothing to trigger a
  re-run.
- Use it for one-time setup such as fetching initial data or attaching a global
  listener.
- Pitfall: do not hide a missing dependency by using `[]` when the effect
  actually reads props or state.
- Pitfall: StrictMode's double mount exposes missing cleanup, such as an
  uncancelled request.

**Code example:**

```jsx
import { useEffect, useState } from "react";

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/users", { signal: controller.signal })
      .then((r) => r.json())
      .then(setUsers)
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      });
    // Cancels the request if StrictMode unmounts the effect in development
    return () => controller.abort();
  }, []);

  return <p>{users.length} users</p>;
}
```

### 2.4.6 How do you clean up a useEffect?

**Short answer:** Return a function from the effect. React calls it before the
effect runs again and when the component unmounts, which is where you clear
timers, remove listeners, or unsubscribe.

**Detailed explanation:**

- The cleanup function closes over the values from the render that created the
  effect.
- It runs before the next effect, so the previous subscription is always removed
  first.
- Typical cleanups: `clearInterval`, `removeEventListener`, socket `disconnect`,
  `AbortController.abort()`.
- Pitfall: an effect that returns a non-function value, like a Promise, causes
  an error.

**Code example:**

```jsx
import { useEffect, useState } from "react";

function Ticker() {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTicks((t) => t + 1), 1000);
    // Cleanup: runs before the effect re-runs and on unmount
    return () => clearInterval(id);
  }, []);

  return <p>{ticks}</p>;
}
```

### 2.4.7 What is useRef? How is it different from useState?

**Short answer:** `useRef` returns a mutable object `{ current }` that persists
across renders. Changing `ref.current` does not trigger a re-render, unlike
`useState`, so refs are for values and DOM nodes that do not affect the UI
output.

**Detailed explanation:**

- Common uses: referencing DOM elements, storing timer IDs, and keeping
  instance-like values.
- Refs are read and written in event handlers and effects, not during render.
- Use `useState` when the value appears in the UI; use `useRef` when it is only
  bookkeeping.
- Pitfall: reading `ref.current` during render gives inconsistent results,
  because React does not track it.

**Code example:**

```jsx
import { useEffect, useRef } from "react";

function SearchBox() {
  // { current: null } persists across renders; changing it does not re-render
  const inputRef = useRef(null);

  useEffect(() => {
    // Direct DOM access, safe inside an effect
    inputRef.current.focus();
  }, []);

  return <input ref={inputRef} placeholder="Search" />;
}
```

### 2.4.8 What is useMemo? When should you use it?

**Short answer:** `useMemo` caches the result of a calculation and recomputes it
only when its dependencies change. Use it for genuinely expensive computations
or to keep a stable object identity for memoized children and effect
dependencies.

**Detailed explanation:**

- It takes a function and a dependency array, and returns the cached value.
- Measure first; memoizing cheap work adds overhead and complexity.
- React may discard cached values in the future, so treat it as a performance
  hint, not a guarantee.
- Pitfall: `useMemo` does not prevent a child from re-rendering by itself;
  combine it with `React.memo` for that.

**Code example:**

```jsx
import { useMemo, useState } from "react";

function Report({ items, filter }) {
  const [tick, setTick] = useState(0);

  // Recomputed only when items or filter change, not when tick changes
  const visible = useMemo(
    () => items.filter((i) => i.name.includes(filter)),
    [items, filter],
  );

  return (
    <>
      <button onClick={() => setTick(tick + 1)}>Re-render</button>
      <p>{visible.length} matches</p>
    </>
  );
}
```

### 2.4.9 What is useCallback? When should you use it?

**Short answer:** `useCallback` returns the same function instance between
renders unless its dependencies change. Use it when you pass a callback to a
`React.memo` child or use it as a dependency of another hook, where a new
function each render would cause extra work.

**Detailed explanation:**

- Without it, every render creates a new function, so a memoized child sees a
  changed prop and re-renders.
- It is equivalent to `useMemo(() => fn, deps)`.
- Pitfall: wrapping every handler in `useCallback` is wasted effort when the
  child is not memoized.
- Use the updater form inside the callback (`setCount(c => c + 1)`) so the
  dependency list can stay empty.

**Code example:**

```jsx
import { memo, useCallback, useState } from "react";

// memo skips re-rendering when its props are shallowly equal
const AddButton = memo(function AddButton({ onAdd }) {
  return <button onClick={onAdd}>Add</button>;
});

export default function App() {
  const [count, setCount] = useState(0);

  // Same function identity across renders, so memo(AddButton) can skip work
  const handleAdd = useCallback(() => setCount((c) => c + 1), []);

  return (
    <>
      <p>{count}</p>
      <AddButton onAdd={handleAdd} />
    </>
  );
}
```

### 2.4.10 What is the difference between useMemo and useCallback?

**Short answer:** `useMemo` caches the value returned by a function, while
`useCallback` caches the function itself. Both use a dependency array and
recompute only when those dependencies change.

**Detailed explanation:**

- `useMemo(fn, deps)` returns the result of calling `fn`.
- `useCallback(fn, deps)` returns `fn` itself, so it is the same as
  `useMemo(() => fn, deps)`.
- Use `useMemo` for data such as sorted lists or derived objects; use
  `useCallback` for event handlers and callbacks.
- Pitfall: both hooks are only useful if the dependencies are stable and the
  consumer benefits from identity.

**Code example:**

```jsx
import { useCallback, useMemo } from "react";

function Example({ list, id }) {
  // useMemo caches a VALUE: the sorted copy of the list
  const sorted = useMemo(() => [...list].sort(), [list]);

  // useCallback caches a FUNCTION: the same handler across renders
  const onSelect = useCallback(() => console.log(id), [id]);

  // A React.memo child receives stable props and can skip re-rendering
  return <Child items={sorted} onSelect={onSelect} />;
}
```

### 2.4.11 What is useContext? How do you use it?

**Short answer:** `useContext` reads the nearest value provided by a
`Context.Provider` above the component. The component re-renders whenever that
provided value changes.

**Detailed explanation:**

- You create a context with `createContext(defaultValue)` and wrap part of the
  tree in its `Provider`.
- The default value is used only when no Provider sits above the component.
- `useContext` must be called in a component or a custom hook, following the
  rules of hooks.
- Pitfall: all consumers re-render on any change to the value, so split
  frequently changing data into its own context.

**Code example:**

```jsx
import { createContext, useContext } from "react";

const ThemeContext = createContext("light");

function Toolbar() {
  // Reads the nearest Provider value and subscribes to changes
  const theme = useContext(ThemeContext);
  return <div className={`toolbar ${theme}`}>Toolbar</div>;
}

export default function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}
```

### 2.4.12 What is useReducer? When would you prefer it over useState?

**Short answer:** `useReducer` manages state through a pure reducer function
`(state, action) => newState` and a `dispatch` function. Prefer it when the
state has several related fields or when the next state depends on complex logic
over many event types.

**Detailed explanation:**

- Actions describe what happened (`{ type: "increment" }`), and the reducer
  decides how state changes.
- The reducer is a pure function, so it is easy to unit test without rendering.
- It centralizes update logic that would otherwise be spread across many
  handlers.
- Pitfall: for a single boolean or number, `useState` is simpler and clearer.

**Code example:**

```jsx
import { useReducer } from "react";

function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "reset":
      return { count: 0 };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

export default function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return (
    <>
      <p>{state.count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+1</button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
    </>
  );
}
```

### 2.4.13 What is useLayoutEffect? How does it differ from useEffect?

**Short answer:** `useLayoutEffect` runs synchronously after React updates the
DOM but before the browser paints. Use it to measure layout and apply changes
that must not flicker; use `useEffect` for everything else.

**Detailed explanation:**

- `useEffect` runs after paint, so the user may briefly see the unmeasured
  state.
- `useLayoutEffect` blocks painting, so long work in it makes the UI feel slow.
- It is the closest hook equivalent of `componentDidMount` for timing-sensitive
  DOM work.
- Pitfall: it warns during server rendering because there is no layout on the
  server.

**Code example:**

```jsx
import { useLayoutEffect, useRef, useState } from "react";

function Tooltip({ text }) {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);

  // Runs after the DOM is updated but before paint, so no flicker
  useLayoutEffect(() => {
    setHeight(ref.current.getBoundingClientRect().height);
  }, [text]);

  return (
    <div ref={ref} style={{ marginTop: -height }}>
      {text}
    </div>
  );
}
```

### 2.4.14 What is useId? What problem does it solve?

**Short answer:** `useId` generates a unique, stable ID string for a component
instance that is the same on the server and the client. It solves hydration
mismatches when linking elements with attributes like `htmlFor` or
`aria-describedby`.

**Detailed explanation:**

- Random IDs or counters differ between server and client and cause hydration
  errors.
- The ID is unique per component instance, so reusing a component does not
  create duplicates.
- Use it for accessibility attributes and form field IDs.
- Pitfall: do not use it for list `key` values, and do not use it as a CSS
  selector because it contains colons.

**Code example:**

```jsx
import { useId } from "react";

function EmailField() {
  // Same ID on server and client, unique per instance
  const id = useId();
  return (
    <>
      <label htmlFor={id}>Email</label>
      <input id={id} type="email" />
    </>
  );
}
```

### 2.4.15 How do you write a custom hook? Give an example

**Short answer:** A custom hook is a function whose name starts with `use` and
that calls other hooks, which lets you share stateful logic between components.
The hook returns whatever values the components need.

**Detailed explanation:**

- The `use` prefix is what lets the lint rules and React treat the function as a
  hook.
- Each component that calls a custom hook gets its own independent state.
- Custom hooks can return values, functions, or objects, and can accept
  arguments.
- Pitfall: reading `window` directly in a custom hook fails on the server, so
  guard it or initialize inside an effect in frameworks that render on the
  server.

**Code example:**

```jsx
import { useEffect, useState } from "react";

// Custom hook: name starts with "use" and calls other hooks
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return width;
}

export default function Layout() {
  const width = useWindowWidth();
  return <p>{width < 768 ? "Mobile" : "Desktop"}</p>;
}
```

## 2.5 Context API

### 2.5.1 What is the Context API?

**Short answer:** The Context API lets a component share a value with any
descendant without passing props through every level. It is made of
`createContext`, a `Provider` that supplies the value, and `useContext` that
reads it.

**Detailed explanation:**

- Context is a transport mechanism for data, not a state manager by itself.
- The value can be anything: a string, an object, or a state value and its
  setter.
- Components read the value by the nearest Provider above them in the tree.
- Pitfall: Context does not make data reactive on its own; you usually pair it
  with `useState` or `useReducer`.

**Code example:**

```jsx
import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function App() {
  const [user] = useState({ name: "Asha" });
  return (
    <UserContext.Provider value={user}>
      <Profile />
    </UserContext.Provider>
  );
}

function Profile() {
  // No user prop needed, even if this component is deeply nested
  const user = useContext(UserContext);
  return <p>{user.name}</p>;
}
```

### 2.5.2 When should you use Context vs. Redux?

**Short answer:** Context suits values that change rarely, such as theme,
locale, or the logged-in user. Redux, or a similar store, suits frequently
changing shared state that needs selectors, middleware, and debugging tools.

**Detailed explanation:**

- Context re-renders every consumer when its value changes, so it is poor for
  high-frequency updates.
- Redux subscribes components to slices of state with selectors, so only
  affected components re-render.
- Redux provides DevTools, middleware for async work, and predictable update
  patterns.
- Pitfall: using Context as a global store for everything leads to re-render
  problems and hard-to-trace updates.

**Code example:**

```jsx
// Context: fine for rarely changing values like theme or locale
// <ThemeContext.Provider value={theme}>...</ThemeContext.Provider>

// Redux: subscribes to one slice of the store
import { useSelector } from "react-redux";

function CartCount() {
  // Re-renders only when the selected value changes
  const count = useSelector((state) => state.cart.items.length);
  return <span>{count}</span>;
}
```

### 2.5.3 How do you create a context?

**Short answer:** Call `createContext(defaultValue)` at module level to create a
context object. The default value is used only when a component has no Provider
above it.

**Detailed explanation:**

- Create contexts in their own module so components can import them without
  circular dependencies.
- The default value is a fallback for tests or components rendered outside a
  Provider.
- Pitfall: using `null` as the default and then reading properties without a
  check causes runtime errors.
- Export a small custom hook (for example `useLocale`) that throws a helpful
  error if no Provider is present.

**Code example:**

```jsx
import { createContext, useContext } from "react";

// The default is used ONLY when no Provider is above the consumer
const LocaleContext = createContext("en-US");

export function Price({ amount }) {
  const locale = useContext(LocaleContext);
  return <span>{amount.toLocaleString(locale)}</span>;
}
```

### 2.5.4 What is Provider in context?

**Short answer:** A Provider is the component, such as
`<MyContext.Provider value={...}>`, that makes a value available to all of its
descendants. Its `value` prop is what `useContext` returns for those components.

**Detailed explanation:**

- Providers can be nested; the closest one wins.
- Wrapping `children` in a custom provider component keeps the state logic in
  one place.
- In React 19 you can render the context itself (`<MyContext value={...}>`), but
  `.Provider` still works.
- Pitfall: passing a new object literal as `value` on every render forces all
  consumers to re-render.

**Code example:**

```jsx
import { createContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  // The Provider makes `value` available to every descendant
  return (
    <CartContext.Provider value={{ items, setItems }}>
      {children}
    </CartContext.Provider>
  );
}
```

### 2.5.5 What happens when context value changes?

**Short answer:** Every component that calls `useContext` for that context
re-renders, even if it uses only part of the value. Components in between that
do not consume the context re-render only if their own parent re-renders.

**Detailed explanation:**

- React compares the new value to the old one with `Object.is`.
- Consumers re-render regardless of memoization of intermediate components,
  because the context update bypasses them.
- Pitfall: an object value with a new identity on every render makes consumers
  re-render even when nothing changed.
- Consumers that use a different part of a changing value still re-render, so
  split contexts by how often they change.

**Code example:**

```jsx
import { createContext, useContext, useState } from "react";

const CountContext = createContext(0);

function Display() {
  // Re-renders whenever the Provider's value changes (compared with Object.is)
  const count = useContext(CountContext);
  return <p>{count}</p>;
}

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <CountContext.Provider value={count}>
      <button onClick={() => setCount(count + 1)}>+</button>
      <Display />
    </CountContext.Provider>
  );
}
```

### 2.5.6 How do you avoid unnecessary re-renders with Context?

**Short answer:** Memoize the Provider value with `useMemo`, split state and
actions into separate contexts, and keep frequently changing data out of widely
consumed contexts. Components that only call actions then never re-render on
state changes.

**Detailed explanation:**

- A stable value object means consumers re-render only when something inside it
  actually changes.
- Separating state and dispatch (or actions) lets components that only trigger
  updates skip re-renders.
- Wrapping children in a component that does not depend on the context also
  helps.
- Pitfall: memoizing everything adds complexity; start with splitting contexts
  when a real performance problem appears.

**Code example:**

```jsx
import { createContext, useMemo, useState } from "react";

const CountContext = createContext(null);
const ActionsContext = createContext(null);

export function CountProvider({ children }) {
  const [count, setCount] = useState(0);

  // Stable identity: components that only call actions
  // never re-render on count changes
  const actions = useMemo(
    () => ({ increment: () => setCount((c) => c + 1) }),
    [],
  );
  const state = useMemo(() => ({ count }), [count]);

  return (
    <CountContext.Provider value={state}>
      <ActionsContext.Provider value={actions}>
        {children}
      </ActionsContext.Provider>
    </CountContext.Provider>
  );
}
```

### 2.5.7 Can you have multiple contexts in one app?

**Short answer:** Yes. You can create as many contexts as you need and nest
their Providers, and each context works independently. This is often better than
one large context holding everything.

**Detailed explanation:**

- Separate contexts for theme, auth, and locale keep unrelated updates from
  re-rendering each other's consumers.
- Nesting order matters only when one Provider depends on another's value.
- A common pattern is a single `AppProviders` component that composes all
  Providers.
- Pitfall: deeply nested Providers are hard to read; group them into one
  composed component.

**Code example:**

```jsx
import { createContext, useContext } from "react";

const ThemeContext = createContext("light");
const AuthContext = createContext(null);

export default function App() {
  return (
    <ThemeContext.Provider value="dark">
      <AuthContext.Provider value={{ name: "Asha" }}>
        <Header />
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

function Header() {
  const theme = useContext(ThemeContext);
  const auth = useContext(AuthContext);
  return <h1 className={theme}>Hi {auth.name}</h1>;
}
```

### 2.5.8 What is context vs. global state?

**Short answer:** Context is scoped to a part of the component tree and can have
many independent instances, while global state is a single store that any
component can read. Context is dependency injection; global state is a
singleton.

**Detailed explanation:**

- A Provider defines the scope: two Providers of the same context hold two
  separate values.
- Global state, such as a Redux store, has one value for the whole app.
- Context does not have a built-in way to read state outside React components,
  while stores can be accessed from anywhere.
- Pitfall: calling Context "global" is misleading; its reach is limited to its
  Provider subtree.

**Code example:**

```jsx
import { createContext, useContext } from "react";

const StoreContext = createContext(null);

// Two Providers create two independent instances of the same context,
// something a single global store cannot do
export default function App() {
  return (
    <>
      <StoreContext.Provider value={{ name: "Sales" }}>
        <Panel />
      </StoreContext.Provider>
      <StoreContext.Provider value={{ name: "Support" }}>
        <Panel />
      </StoreContext.Provider>
    </>
  );
}

function Panel() {
  const store = useContext(StoreContext);
  return <section>{store.name}</section>;
}
```

### 2.5.9 How do you pass functions through context?

**Short answer:** Put the function in the Provider's `value`, usually alongside
state, and memoize it with `useCallback` so its identity stays stable. Consumers
then call it directly from `useContext`.

**Detailed explanation:**

- Setter functions from `useState` are already stable and can be passed
  directly.
- Functions defined in the Provider body are recreated each render unless
  wrapped in `useCallback`.
- Memoize the whole value with `useMemo` so consumers are not re-rendered
  needlessly.
- Pitfall: a function that reads stale state must use the updater form or be
  recreated when its dependencies change.

**Code example:**

```jsx
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  // Stable function identity across renders
  const toggle = useCallback(
    () => setTheme((t) => (t === "light" ? "dark" : "light")),
    [],
  );
  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function ToggleButton() {
  const { theme, toggle } = useContext(ThemeContext);
  return <button onClick={toggle}>Theme: {theme}</button>;
}
```

### 2.5.10 What is the useContext hook vs. Context.Consumer?

**Short answer:** `useContext` is a hook that reads a context inside a function
component and is the modern approach. `Context.Consumer` is a render-prop
component that reads the same value and is mainly used in class components or
older code.

**Detailed explanation:**

- Both read the nearest Provider value and subscribe the component to changes.
- `useContext` is shorter and avoids nested callbacks in JSX.
- Class components read context with `static contextType = MyContext` and
  `this.context`, or with `Consumer`.
- Pitfall: `useContext` can only be called inside a function component or custom
  hook, not in a class.

**Code example:**

```jsx
import { createContext, useContext } from "react";

const UserContext = createContext("Guest");

// Modern: the hook inside a function component
function HookVersion() {
  const name = useContext(UserContext);
  return <p>{name}</p>;
}

// Legacy: the render-prop Consumer
function ConsumerVersion() {
  return <UserContext.Consumer>{(name) => <p>{name}</p>}</UserContext.Consumer>;
}
```

## 2.6 React Router

### 2.6.1 What is React Router? What problem does it solve?

**Short answer:** React Router is the standard client-side routing library for
React. It maps URL paths to components and swaps views without a full page
reload, so a single-page app can still have real, linkable URLs with working
back and forward buttons.

**Detailed explanation:**

- A single-page app ships one HTML file. Without a router, the URL and the
  visible view are not connected, so pages cannot be bookmarked or shared.
- React Router listens to the browser History API, matches the current location
  against your route definitions, and renders the matching element.
- It also provides navigation hooks, URL parameters, and nested layouts.
- Pitfall: client-side routing does not hit the server. A direct load or refresh
  of `/products/42` must be answered with `index.html` by the server, or the
  user gets a 404.

**Code example:**

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Each Route maps a URL path to an element */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 2.6.2 What is the difference between `<BrowserRouter>` and `<HashRouter>`?

**Short answer:** `BrowserRouter` uses the HTML5 History API to produce clean
URLs such as `/products/42`. `HashRouter` puts the route after a `#`, such as
`/#/products/42`, which the server never sees, so it works on static hosts
without rewrite rules.

**Detailed explanation:**

- `BrowserRouter` needs the server to return `index.html` for unknown paths,
  because refreshing a deep link sends that path to the server.
- `HashRouter` works on any static host, such as GitHub Pages, because the hash
  part is never sent to the server.
- The trade-offs of `HashRouter` are uglier URLs, weaker SEO, and a clash with
  in-page anchor links that also use `#`.
- Both provide the same router context, so the rest of the route tree is
  identical.
- Pitfall: using `BrowserRouter` on a static host and then seeing 404 errors on
  refresh.

**Code example:**

```jsx
import { BrowserRouter, HashRouter } from "react-router-dom";

// Clean URLs: https://example.com/products/42
// The server must return index.html for unknown paths.
export function ServerHostedApp() {
  return (
    <BrowserRouter>
      {/* AppRoutes is your <Routes> tree */}
      <AppRoutes />
    </BrowserRouter>
  );
}

// Hash URLs: https://example.com/#/products/42
// Works on any static host with no server configuration.
export function StaticHostApp() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}
```

### 2.6.3 How do you define routes in React Router v6?

**Short answer:** Wrap the app in a router, then declare routes inside
`<Routes>` using `<Route path>` and `element`. In v6, the best matching route
wins regardless of declaration order, and child paths are relative to their
parent.

**Detailed explanation:**

- `<Routes>` replaces v5's `<Switch>`. The `element` prop replaces `component`
  and `render`.
- Ranking is by specificity, so `/users/new` beats `/users/:userId` no matter
  where it is declared.
- Nested `<Route>` children inherit the parent path. Child paths should not
  start with a slash.
- An `index` route renders at the parent's exact path.
- Dynamic segments use `:name`, and `*` acts as a catch-all.
- Pitfall: `Switch`, `exact`, and `component=` are v5 APIs and do not exist in
  v6.

**Code example:**

```jsx
import { Routes, Route } from "react-router-dom";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/users" element={<Users />}>
        {/* Child paths are relative to /users */}
        <Route index element={<p>Pick a user</p>} />
        <Route path=":userId" element={<UserProfile />} />
        <Route path="new" element={<NewUser />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

### 2.6.4 What is `<Link>` vs. `<NavLink>`?

**Short answer:** `<Link>` renders an accessible anchor that navigates on the
client without a reload. `<NavLink>` does the same, and it also knows whether it
matches the current location, so it can apply an active style for menus.

**Detailed explanation:**

- Both render an `<a href>` and intercept clicks so the page does not reload.
- `NavLink` accepts `className` or `style` as functions that receive
  `{ isActive, isPending }`. The default active class is `active`.
- Use the `end` prop on a `NavLink` to the root path. Without it, `/` matches
  every route and is always active.
- The `replace` prop replaces the current history entry instead of pushing a new
  one.
- Pitfall: a plain `<a href>` for an internal link causes a full reload and
  discards app state.

**Code example:**

```jsx
import { Link, NavLink } from "react-router-dom";

function Nav() {
  return (
    <nav>
      {/* Plain link: no active styling */}
      <Link to="/docs">Docs</Link>

      {/* NavLink: gets an active class when the path matches */}
      <NavLink
        to="/"
        end // active only on exactly "/", not on every route
        className={({ isActive }) => (isActive ? "nav-active" : undefined)}
      >
        Home
      </NavLink>
    </nav>
  );
}
```

### 2.6.5 What is useNavigate()? How is it used?

**Short answer:** `useNavigate()` returns a function for programmatic
navigation, such as after a login or form submit. Use `<Link>` for ordinary
clickable links and `useNavigate` when navigation depends on logic.

**Detailed explanation:**

- `navigate('/path')` pushes a new entry. `navigate(-1)` goes back.
- `navigate('/login', { replace: true })` replaces the current entry, so Back
  does not return to the form.
- `navigate(path, { state })` passes data to the next route. The receiving
  component reads it with `useLocation().state`.
- Call `navigate` from event handlers or effects, never directly during render.
- Pitfall: calling `navigate` in an effect without a guard can loop when its
  dependencies change. `useNavigate` replaces the v5 `useHistory` hook.

**Code example:**

```jsx
import { useNavigate } from "react-router-dom";

function LoginForm({ onLogin }) {
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    await onLogin(); // assumed async login call
    // Replace history so Back does not return to the login form
    navigate("/dashboard", { replace: true });
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Log in</button>
    </form>
  );
}
```

### 2.6.6 What is useParams()?

**Short answer:** `useParams()` returns the dynamic URL segments of the current
match as an object, such as `{ userId: '42' }` for `/users/:userId`. Values are
always strings, so convert them when you need a number.

**Detailed explanation:**

- Declare parameters with `:name` in the route path.
- The result includes parameters from parent routes as well.
- Optional and splat parameters can be `undefined`.
- Put the param in your effect dependencies. Without it, the component keeps
  showing the old record when the URL changes.
- Pitfall: out-of-order responses can overwrite newer data. Ignore stale
  responses with a cleanup flag or an AbortController.

**Code example:**

```jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Route: <Route path="/users/:userId" element={<UserProfile />} />
function UserProfile() {
  const { userId } = useParams(); // string, e.g. "42"
  const [user, setUser] = useState(null);

  useEffect(() => {
    let ignore = false; // ignore stale responses
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setUser(data);
      });
    return () => {
      ignore = true;
    };
  }, [userId]);

  return <h2>{user ? user.name : "Loading..."}</h2>;
}
```

### 2.6.7 What is useLocation()?

**Short answer:** `useLocation()` returns the current location object, with
`pathname`, `search`, `hash`, `state`, and `key`. Use it to read the URL or data
passed through navigation. It does not navigate.

**Detailed explanation:**

- The component re-renders on every location change.
- `search` is the raw query string, such as `?page=2`. Use `useSearchParams` or
  `URLSearchParams` to parse it.
- `state` holds data passed with `navigate(path, { state })`. It is not part of
  the URL, so it is not shareable.
- Common uses are page-view analytics, a "came from" link, and scroll
  restoration.
- Pitfall: `location.state` is `null` on a direct visit or a shared link, so
  always guard it.

**Code example:**

```jsx
import { Link, useLocation } from "react-router-dom";

function Confirmation() {
  const location = useLocation();
  // State is set by navigate('/confirm', { state: { orderId: 7 } })
  // It is null on a direct visit, so guard it.
  const orderId = location.state?.orderId;

  return (
    <div>
      <p>Path: {location.pathname}</p>
      <p>Order: {orderId ?? "unknown"}</p>
      <Link to="/">Back home</Link>
    </div>
  );
}
```

### 2.6.8 How do you create nested routes?

**Short answer:** Nest `<Route>` elements inside a parent route, and render an
`<Outlet />` in the parent's element where the child should appear. The parent
layout, such as a header or sidebar, stays mounted while only the nested content
changes.

**Detailed explanation:**

- Child paths are relative to the parent, so they must not start with a slash.
- The parent element must render `<Outlet />`, or the children never appear.
- An `index` child handles the parent's own path.
- Child routes can read parent params with `useParams`.
- Pitfall: a leading slash on a child path makes it absolute and breaks the
  nesting. Forgetting `<Outlet />` gives a blank page with no error.

**Code example:**

```jsx
import { Link, Outlet, Route, Routes } from "react-router-dom";

function DashboardLayout() {
  return (
    <div>
      <nav>
        {/* Relative to /dashboard, so these resolve to /dashboard/stats etc. */}
        <Link to="stats">Stats</Link> <Link to="settings">Settings</Link>
      </nav>
      {/* The matched child route renders here */}
      <Outlet />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<p>Pick a section</p>} />
        <Route path="stats" element={<Stats />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
```

### 2.6.9 What are protected/private routes? How do you implement them?

**Short answer:** A protected route checks authentication and either renders the
requested page or redirects to login. In v6, implement it as a layout route that
returns `<Navigate>` when the user is signed out and `<Outlet />` when they are
signed in.

**Detailed explanation:**

- Client-side guards are a UX feature. The server must still enforce
  authorization on every API call.
- Pass `state={{ from: location }}` in the redirect so the login page can send
  the user back afterward.
- Wrapping a layout route protects all of its children at once.
- Auth state usually comes from Context or Redux.
- Pitfall: redirecting before the session check finishes causes a flash to the
  login page. Render a loading state first.

**Code example:**

```jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth"; // your auth hook (assumed)

export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p>Checking session...</p>; // avoid redirect flicker

  if (!user) {
    // Send to login, remembering where the user was headed
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />; // authenticated: render the child route
}

// Usage:
// <Route element={<RequireAuth />}>
//   <Route path="/profile" element={<Profile />} />
// </Route>
```

### 2.6.10 What is the `<Outlet>` component?

**Short answer:** `<Outlet />` is a placeholder in a parent route's element that
renders whichever child route matches. It lets layouts stay mounted and keep
their state while the nested content changes.

**Detailed explanation:**

- It renders nothing if no child matches, unless there is an index route.
- `<Outlet context={value} />` passes data to children. Children read it with
  `useOutletContext()`.
- It is the building block for layouts, protected-route wrappers, and nested
  dashboards.
- Pitfall: forgetting it. The child route matches correctly but never shows.

**Code example:**

```jsx
import { useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";

// Parent layout shares state with whichever child matches
function ShopLayout() {
  const [cart, setCart] = useState([]);
  return (
    <div>
      <header>My Shop</header>
      <Outlet context={{ cart, setCart }} />
    </div>
  );
}

// Child route reads the shared value
function Checkout() {
  const { cart } = useOutletContext();
  return <p>Items in cart: {cart.length}</p>;
}
```

## 2.7 Performance Optimization

### 2.7.1 What is React.memo()? When should you use it?

**Short answer:** `React.memo()` wraps a component so it skips re-rendering when
its props are shallowly equal to the previous ones. Use it for components that
re-render often with the same props and have a meaningful render cost.

**Detailed explanation:**

- The comparison is a shallow `Object.is` check per prop. An inline object,
  array, or function is a new reference on every render, so it defeats `memo`.
- Stabilize function and object props with `useCallback` and `useMemo`.
- An optional second argument lets you supply a custom comparison function.
- `memo` does not stop re-renders caused by the component's own state or by
  context changes.
- Pitfall: wrapping everything in `memo` adds comparison cost for no gain.
  Profile first.

**Code example:**

```jsx
import { memo, useCallback, useState } from "react";

// Re-renders only when its props change (shallow compare)
const ItemList = memo(function ItemList({ items, onSelect }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} onClick={() => onSelect(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
});

export default function Parent() {
  const [count, setCount] = useState(0);
  const [items] = useState([{ id: 1, name: "A" }]);
  // Stable reference: a new function each render would defeat memo
  const handleSelect = useCallback((id) => console.log(id), []);

  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>Clicked {count}</button>
      <ItemList items={items} onSelect={handleSelect} />
    </>
  );
}
```

### 2.7.2 What is the difference between React.memo and useMemo?

**Short answer:** `React.memo` memoizes a whole component and decides whether to
re-render it based on its props. `useMemo` memoizes a computed value inside a
component and recalculates it only when its dependencies change.

**Detailed explanation:**

- `memo` wraps a component. `useMemo` wraps a value.
- `useMemo` runs its function during render. `memo` only prevents a re-render.
- They are often combined: `useMemo` produces a stable array or object that a
  `memo`-wrapped child can compare cheaply.
- Pitfall: `useMemo` is a performance hint. React may discard cached values, so
  do not rely on it for correctness.

**Code example:**

```jsx
import { memo, useMemo } from "react";

// memo: skips rendering this component when props are unchanged
const Chart = memo(function Chart({ data }) {
  return <div>{data.length} points</div>;
});

function Report({ rows, filter }) {
  // useMemo: caches the derived array until rows or filter change
  const filtered = useMemo(
    () => rows.filter((r) => r.type === filter),
    [rows, filter],
  );

  // Stable array reference lets memo(Chart) skip unrelated re-renders
  return <Chart data={filtered} />;
}
```

### 2.7.3 What causes unnecessary re-renders in React?

**Short answer:** A component re-renders when its state changes, when its parent
re-renders, or when a context value it consumes changes. Most wasted renders
come from parents re-rendering children that did not need new data, and from new
object or function references created on every render.

**Detailed explanation:**

- By default, a state update re-renders the component and its entire child tree.
- A parent re-render re-renders its children even when their props are
  identical, unless they are memoized.
- Every consumer of a context re-renders when its value changes. A new object
  each render triggers this even when nothing changed.
- Inline objects, arrays, and functions are new references each render.
- State kept too high in the tree causes wide re-renders. Colocate state with
  the components that use it.
- Pitfall: StrictMode double-invokes renders in development. This looks like
  extra renders but does not happen in production. Measure with the Profiler
  instead of guessing.

**Code example:**

```jsx
import { memo, useState } from "react";

const Child = memo(function Child({ style, onClick }) {
  console.log("Child rendered");
  return (
    <button style={style} onClick={onClick}>
      Child
    </button>
  );
});

// BAD: <Child style={{ color: 'red' }} onClick={() => {}} />
// Both props are new references on every render, so memo never skips.

// Stable references: defined at module scope (no re-creation per render)
const style = { color: "red" };
const onClick = () => console.log("hi");

export default function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
      <Child style={style} onClick={onClick} />
    </>
  );
}
```

### 2.7.4 What is lazy loading in React?

**Short answer:** Lazy loading defers loading a part of the app, such as a
route, modal, or heavy component, until it is needed. This shrinks the initial
bundle and speeds up the first page load.

**Detailed explanation:**

- It applies to code, images, and data. In React it usually means code.
- For images, use the native `loading="lazy"` attribute.
- For components, use `React.lazy` with a dynamic `import()` inside a `Suspense`
  boundary.
- Good split points are routes, modals, admin sections, and heavy charts or
  editors.
- Pitfall: lazy-loading tiny components adds a network round trip for little
  saving. Preloading on hover or focus can hide that latency.

**Code example:**

```jsx
import { lazy, Suspense } from "react";

// The bundler puts HeavyChart in its own chunk, fetched on first render
const HeavyChart = lazy(() => import("./HeavyChart"));

export default function Dashboard() {
  return (
    <section>
      <h1>Dashboard</h1>
      <Suspense fallback={<p>Loading chart...</p>}>
        <HeavyChart />
      </Suspense>
    </section>
  );
}
```

### 2.7.5 What is React.lazy() and Suspense?

**Short answer:** `React.lazy()` takes a function that returns a dynamic import
and produces a component that loads on first render. `Suspense` shows a fallback
while that component's code is loading.

**Detailed explanation:**

- `lazy` expects the module to have a default export.
- A lazy component must be rendered inside a `Suspense` boundary.
- Place a `Suspense` boundary per route or per section to control where the
  fallback appears.
- A failed chunk load, for example after a deploy changes file names, is handled
  by an error boundary.
- Pitfall: calling `lazy` inside a render creates a new component type on each
  render, which remounts the subtree. Define lazy components at module scope.

**Code example:**

```jsx
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

// Define lazy components at module scope, not inside render
const Home = lazy(() => import("./pages/Home"));
const Reports = lazy(() => import("./pages/Reports"));

export default function App() {
  return (
    // One fallback covers all lazy routes below
    <Suspense fallback={<p>Loading page...</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Suspense>
  );
}
```

### 2.7.6 What is code splitting?

**Short answer:** Code splitting breaks one large JavaScript bundle into smaller
chunks that the browser downloads when they are needed. It is usually done with
dynamic `import()`, which bundlers such as Vite and webpack turn into separate
files.

**Detailed explanation:**

- A static `import` is bundled into the main chunk. A dynamic `import()` creates
  a split point.
- You can split by route, by feature, or by large vendor libraries.
- `React.lazy` is the React wrapper that uses dynamic imports for components.
- Less JavaScript up front improves time to interactive.
- Pitfall: poor splitting can duplicate shared dependencies across chunks. Check
  the bundle analyzer output.

**Code example:**

```js
// Static import: bundled into the main chunk
// import { format } from 'date-fns';

// Dynamic import: the bundler emits a separate chunk loaded on demand
async function handleExport(report) {
  // The large PDF library downloads only when the user clicks Export
  const { generatePdf } = await import("./pdfExporter");
  return generatePdf(report);
}
```

### 2.7.7 What is the key prop and why is it important in lists?

**Short answer:** The `key` prop gives each list item a stable identity, so
React can match elements between renders and update, move, or remove only the
correct DOM nodes and their state. Use a stable unique ID, not the array index,
when items can be reordered, inserted, or removed.

**Detailed explanation:**

- Keys only need to be unique among siblings, not across the app.
- Without keys, React warns and matches children by position, which can attach
  state to the wrong item.
- Index keys are acceptable for static lists that never reorder or filter.
- Index keys on inputs cause state bugs when an item is inserted or removed
  above them.
- `key` is not passed to the component as a prop. Pass the ID separately if the
  component needs it.
- Changing a key forces a remount, which is a useful way to reset a component's
  state.

**Code example:**

```jsx
function TodoList({ todos, onToggle }) {
  return (
    <ul>
      {todos.map((todo) => (
        // Stable id: React keeps each row's input state with its todo
        // Avoid key={index} when items can be reordered, inserted, or removed
        <li key={todo.id}>
          <label>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => onToggle(todo.id)}
            />
            {todo.text}
          </label>
        </li>
      ))}
    </ul>
  );
}
```

### 2.7.8 What is windowing/virtualization in React?

**Short answer:** Windowing renders only the rows currently visible in the
scroll container, plus a small buffer, instead of thousands of DOM nodes.
Libraries such as react-window and TanStack Virtual implement it.

**Detailed explanation:**

- A smaller DOM makes layout, paint, and reconciliation much cheaper.
- The list needs a scroll container with a fixed height, and item sizes must be
  known or measured so offsets can be computed.
- Trade-offs include more complex code, extra care for browser find-in-page and
  accessibility, and less flexible row layouts.
- Alternatives are pagination, server-side filtering, and "load more."
- Pitfall: rendering every item inside a virtual list, for example by passing
  all children, defeats the purpose.

**Code example:**

```jsx
import { FixedSizeList } from "react-window";

// Defined outside the component so its identity is stable
function Row({ index, style, data }) {
  // style carries the absolute position and must be applied
  return <div style={style}>{data[index].name}</div>;
}

export function BigList({ rows }) {
  // Only the visible rows (plus a buffer) are rendered, however long the array
  return (
    <FixedSizeList
      height={400} // viewport height in px
      width="100%"
      itemCount={rows.length}
      itemSize={35} // row height in px
      itemData={rows} // passed to Row as `data`
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 2.7.9 How do you profile a React app for performance?

**Short answer:** Record an interaction in the React DevTools Profiler to see
which components rendered, why they rendered, and how long each took. Combine
that with the browser Performance panel for JavaScript and layout costs, and
profile a production or profiling build.

**Detailed explanation:**

- The Profiler's flame graph and ranked chart show render durations. The
  "Highlight updates" option shows re-renders visually.
- The "Record why each component rendered" setting explains which props, state,
  or hooks changed.
- The `<Profiler>` component reports timings programmatically through its
  `onRender` callback.
- Development builds are slower and StrictMode double-renders, so do not judge
  absolute numbers from them.
- Pitfall: production builds skip `onRender` unless you use a profiling build.
- Fix only what the profile shows, and add `memo` or `useMemo` after you confirm
  the cost.

**Code example:**

```jsx
import { Profiler } from "react";

// Receives timings for everything inside the Profiler subtree
function onRender(id, phase, actualDuration) {
  // phase is "mount" or "update"; durations are in milliseconds
  console.log(`${id} ${phase}: ${actualDuration.toFixed(1)}ms`);
}

export default function App() {
  return (
    <Profiler id="ProductList" onRender={onRender}>
      <ProductList />
    </Profiler>
  );
}
```

### 2.7.10 What is reconciliation and how does the diffing algorithm work?

**Short answer:** Reconciliation is React's process of comparing the new element
tree with the previous one to find the minimal set of DOM changes. React uses
fast heuristics: it compares element types at the same position, and it uses
keys to match list children.

**Detailed explanation:**

- Same type at the same position: React updates the props and keeps the DOM node
  and its state.
- Different type at that position: React unmounts the old subtree and mounts a
  new one, which discards its state.
- Lists: keys match children across renders. Without keys, React matches by
  index.
- The heuristics run in roughly linear time, rather than the cubic cost of an
  optimal tree diff.
- Reconciliation (render phase) is separate from the commit that writes to the
  DOM.
- Pitfall: defining a component inside another component creates a new type on
  every render, which forces a remount each time.

**Code example:**

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}

export default function App({ showExtra }) {
  return (
    <div>
      {/* Same type at this position: Counter keeps its state across renders */}
      <Counter />
      {/* Changing the element type here remounts the whole node */}
      {showExtra ? <p>Extra</p> : <span>Hidden</span>}
    </div>
  );
}
```

## 2.8 Forms & Events

### 2.8.1 What is the difference between controlled and uncontrolled forms?

**Short answer:** In a controlled form, React state is the single source of
truth, and each input's value is bound to state through `onChange`. In an
uncontrolled form, the DOM holds the value, and you read it when needed, usually
through a ref or `FormData`.

**Detailed explanation:**

- Controlled inputs use `value` with `onChange`. Every keystroke updates state
  and re-renders, which enables live validation and formatting.
- Uncontrolled inputs use `defaultValue` and a ref. They re-render less, which
  suits simple forms.
- File inputs are always uncontrolled, because their value is read-only.
- A controlled input without `onChange` is read-only, and React warns about it.
- Pitfall: switching an input between controlled and uncontrolled, for example
  by moving `value` from `undefined` to a string, triggers a warning and
  unpredictable behavior.

**Code example:**

```jsx
import { useRef, useState } from "react";

function ControlledInput() {
  const [name, setName] = useState("");
  // React state is the source of truth; every keystroke re-renders
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}

function UncontrolledForm() {
  const inputRef = useRef(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    // The DOM holds the value; read it only when needed
    console.log(inputRef.current.value);
  };
  return (
    <form onSubmit={handleSubmit}>
      <input defaultValue="" ref={inputRef} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 2.8.2 How do you handle form submission in React?

**Short answer:** Attach an `onSubmit` handler to the `<form>`, call
`e.preventDefault()` to stop the browser's full-page submit, then read the state
and send the data with `fetch` or a callback. Disable the submit button while
the request is pending.

**Detailed explanation:**

- A `type="submit"` button triggers the form's `onSubmit`, including when Enter
  is pressed. An `onClick` handler on the button does not.
- Without `preventDefault`, the page reloads and React state is lost.
- Track submitting, error, and success states so the UI can respond.
- Disabling the button prevents double submission.
- Pitfall: the example's `try/finally` has no `catch`, so a failed request
  becomes an unhandled rejection. Add a `catch` that shows a message to the
  user.

**Code example:**

```jsx
import { useState } from "react";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser's full-page form submit
    setSubmitting(true);
    try {
      await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" disabled={submitting}>
        Sign up
      </button>
    </form>
  );
}
```

### 2.8.3 How do you validate forms in React?

**Short answer:** Run a validation function that takes the values and returns an
error object, check it on submit (and optionally on blur), and block submission
while errors exist. Use a schema library such as Zod or Yup for complex rules,
and always validate again on the server.

**Detailed explanation:**

- Validate on submit at minimum. Validating on blur or change gives faster
  feedback once the user has touched a field.
- Track touched fields so errors do not appear before the user has interacted
  with them.
- Keep validation pure: values in, errors out. That makes it easy to unit test.
- Client-side checks improve UX. The server is the real security boundary.
- Libraries include React Hook Form with a Zod resolver, Formik, and Yup.
- Pitfall: relying on the HTML `required` attribute or a disabled button as
  validation.

**Code example:**

```jsx
import { useState } from "react";

// Pure function: values in, error messages out (easy to unit test)
function validate({ email, password }) {
  const errors = {};
  if (!email.includes("@")) errors.email = "Enter a valid email";
  if (password.length < 8) errors.password = "Use at least 8 characters";
  return errors;
}

export default function LoginForm() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length === 0) console.log("Submit", values);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={values.email}
        onChange={(e) => setValues({ ...values, email: e.target.value })}
      />
      {errors.email && <p role="alert">{errors.email}</p>}
      <input
        type="password"
        value={values.password}
        onChange={(e) => setValues({ ...values, password: e.target.value })}
      />
      {errors.password && <p role="alert">{errors.password}</p>}
      <button type="submit">Log in</button>
    </form>
  );
}
```

### 2.8.4 What is onChange vs onInput?

**Short answer:** For text inputs, React's `onChange` fires on every value
change, which is the same timing as the native `input` event, so `onInput`
behaves essentially the same. The native `change` event fires only on commit,
such as blur, and you get that timing in React with `onBlur`.

**Detailed explanation:**

- React's `onChange` is designed to fire per keystroke for text inputs and
  textareas, and on click for checkboxes and radios.
- The native `change` event fires after the value is committed, for example when
  a text input loses focus.
- `onInput` exists in React and is effectively the same as `onChange` for text
  fields. Using `onChange` is the idiomatic choice.
- Pitfall: expecting React's `onChange` to wait for blur, as the native event
  does. It does not.

**Code example:**

```jsx
import { useState } from "react";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  return (
    <>
      {/* React onChange fires on every keystroke, like native "input" */}
      <input value={query} onChange={(e) => setQuery(e.target.value)} />

      {/* onBlur fires when focus leaves, similar to native "change" timing */}
      <input onBlur={(e) => console.log("Left field with:", e.target.value)} />
    </>
  );
}
```

### 2.8.5 How do you handle multiple input fields with a single handler?

**Short answer:** Keep all fields in one state object and use each input's
`name` attribute to update the matching key with a computed property name. One
`handleChange` then serves any number of fields.

**Detailed explanation:**

- Use `[name]: value` inside a functional update, and spread the previous state
  so other fields are kept.
- The `name` attribute must match a key in state exactly.
- Checkboxes need `checked` instead of `value`, so check the input type.
- Inputs always produce strings. Convert numbers yourself.
- Pitfall: forgetting the `name` attribute produces a key of `"undefined"` and
  silently breaks the field.

**Code example:**

```jsx
import { useState } from "react";

export default function ProfileForm() {
  const [form, setForm] = useState({ name: "", age: "", subscribe: false });

  // One handler for every field; `name` must match a key in state
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev, // keep the other fields
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  return (
    <form>
      <input name="name" value={form.name} onChange={handleChange} />
      <input
        name="age"
        type="number"
        value={form.age}
        onChange={handleChange}
      />
      <label>
        <input
          name="subscribe"
          type="checkbox"
          checked={form.subscribe}
          onChange={handleChange}
        />
        Subscribe
      </label>
    </form>
  );
}
```

### 2.8.6 What is event.preventDefault()?

**Short answer:** `event.preventDefault()` cancels the browser's default action
for an event, such as following a link, submitting a form, or opening a context
menu. It does not stop the event from bubbling; that is `stopPropagation`.

**Detailed explanation:**

- React's synthetic events wrap native events, and `preventDefault` behaves the
  same way.
- Typical uses are form submission, intercepting anchor clicks in an SPA, and
  custom drag-and-drop.
- It must run synchronously inside the handler, before any `await`. The browser
  decides the default action after the handler finishes, so a late call is too
  late.
- Pitfall: forgetting it in `onSubmit`, which reloads the page and loses state.

**Code example:**

```jsx
export default function Links() {
  function handleNavClick(e) {
    // Stop the anchor's default navigation; handle the route change ourselves
    e.preventDefault();
    console.log("Custom navigation for", e.currentTarget.href);
  }

  function handleSubmit(e) {
    e.preventDefault(); // must run before any await, or the page still reloads
    // ...send the data here
  }

  return (
    <form onSubmit={handleSubmit}>
      <a href="/docs" onClick={handleNavClick}>
        Docs
      </a>
      <button type="submit">Save</button>
    </form>
  );
}
```

### 2.8.7 What is event.stopPropagation()?

**Short answer:** `event.stopPropagation()` stops the event from bubbling to
ancestor handlers. It is useful for isolating a control, but overuse hides
events from parents that may need them, such as analytics or click-outside
logic.

**Detailed explanation:**

- Events bubble from the target up through its ancestors. `stopPropagation`
  halts that walk.
- In React 17 and later, handlers are attached to the root container. The native
  call also stops the event from reaching `document` or `window`.
- It does not prevent the default action. Use `preventDefault` for that.
- Pitfall: using it to silence a bug, such as a parent's click handler firing
  unexpectedly. Often the better fix is to check the event target or the
  element's state.

**Code example:**

```jsx
import { useState } from "react";

export default function Card({ onOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    // A click on the card body opens it
    <div onClick={onOpen}>
      <button
        onClick={(e) => {
          // Without this, the click bubbles to the card and calls onOpen too
          e.stopPropagation();
          setMenuOpen((open) => !open);
        }}
      >
        Menu
      </button>
      {menuOpen && <p>Menu is open</p>}
    </div>
  );
}
```

### 2.8.8 How do you handle file upload inputs in React?

**Short answer:** File inputs are uncontrolled, so read the chosen file from
`e.target.files` in `onChange`, store the `File` in state, and send it with
`FormData`. Let the browser set the multipart `Content-Type`.

**Detailed explanation:**

- `e.target.files` is a `FileList`. Use `files[0]` or `Array.from(files)` for
  multiple files.
- With `FormData`, do not set `Content-Type` manually. The browser adds the
  boundary.
- Validate file type and size on the client before uploading, and check them
  again on the server.
- Use `URL.createObjectURL` for a preview, and revoke the URL on cleanup to free
  memory.
- To clear the selection, reset the DOM input through a ref by setting its
  `value` to `''`. Setting any other value is not allowed.

**Code example:**

```jsx
import { useEffect, useState } from "react";

export default function AvatarUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  // Revoke the object URL when the file changes or on unmount
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleUpload() {
    const data = new FormData();
    data.append("avatar", file); // no manual Content-Type header
    await fetch("/api/avatar", { method: "POST", body: data });
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0] ?? null)}
      />
      {preview && <img src={preview} alt="Preview" width={96} />}
      <button onClick={handleUpload} disabled={!file}>
        Upload
      </button>
    </div>
  );
}
```

### 2.8.9 What is React Hook Form? What problem does it solve?

**Short answer:** React Hook Form is a form library that registers inputs as
uncontrolled fields through `useForm`. It handles validation, errors, and
submission while avoiding a React state update on every keystroke, which reduces
re-renders and boilerplate.

**Detailed explanation:**

- `register` attaches each input. Values are read from the DOM on submit, so
  typing does not re-render the whole form.
- Validation rules can be inline, or come from a schema resolver such as Zod or
  Yup.
- `formState` exposes `errors`, `isSubmitting`, `isDirty`, and more. It tracks
  only the properties you read, so re-renders stay limited.
- `Controller` wraps controlled third-party UI components.
- Trade-off: an extra dependency and a learning curve. A two-field form may not
  need it.
- Pitfall: calling `watch()` for every field brings back re-renders on each
  keystroke.

**Code example:**

```jsx
import { useForm } from "react-hook-form";

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "" } });

  // Called only when validation passes; data holds the collected values
  const onSubmit = async (data) => {
    await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email", { required: "Email is required" })} />
      {errors.email && <p>{errors.email.message}</p>}
      <button type="submit" disabled={isSubmitting}>
        Sign up
      </button>
    </form>
  );
}
```

### 2.8.10 How do you reset a form in React?

**Short answer:** For a controlled form, set state back to the initial values.
For an uncontrolled form, call `form.reset()` through a ref. With React Hook
Form, call its `reset()` function, which also clears errors and dirty state.

**Detailed explanation:**

- Keep the initial values in a constant and set state to a copy of them. Never
  mutate the constant.
- `form.reset()` restores each field's `defaultValue`. Do not call it on a
  controlled form, because React state and the DOM would disagree.
- Changing the form's `key` remounts it and resets all internal state. This is
  simple, but it also remounts the children.
- Reset after a successful submit, not before, so the user does not lose data
  when the request fails.
- Pitfall: resetting a controlled form only in the DOM, which leaves stale
  values in state.

**Code example:**

```jsx
import { useState } from "react";

const emptyForm = { name: "", email: "" };

export default function ContactForm() {
  const [form, setForm] = useState(emptyForm);

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Sending", form);
    setForm(emptyForm); // controlled reset: restore the initial state
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <button type="submit">Send</button>
    </form>
  );
}
```

## 2.9 Advanced React Patterns

### 2.9.1 What is a Higher-Order Component (HOC)?

**Short answer:** A higher-order component is a function that takes a component
and returns a new component with extra props or behavior. It reuses logic across
components, although custom hooks have replaced most HOCs in new code.

**Detailed explanation:**

- The pattern is `withX(Component)` returning a wrapper that renders `Component`
  with added props.
- Common examples are `withAuth` and the legacy `connect` from react-redux.
- Set `displayName` so the wrapper is readable in React DevTools.
- Pitfalls: prop name collisions, deep wrapper trees, static methods not being
  copied (use hoist-non-react-statics), and refs not passing through unless you
  use `forwardRef`.
- Never create an HOC inside a render. The new component type on every render
  remounts the subtree.

**Code example:**

```jsx
// HOC: takes a component, returns an enhanced component
function withWindowWidth(WrappedComponent) {
  function WithWindowWidth(props) {
    // Simplified: real code subscribes to the resize event
    return <WrappedComponent {...props} windowWidth={window.innerWidth} />;
  }
  const name = WrappedComponent.displayName || WrappedComponent.name;
  WithWindowWidth.displayName = `withWindowWidth(${name})`;
  return WithWindowWidth;
}

function Banner({ windowWidth }) {
  return <p>Width: {windowWidth}px</p>;
}

// Apply the HOC once at module scope, not inside render
export default withWindowWidth(Banner);
```

### 2.9.2 What is the render props pattern?

**Short answer:** Render props is a pattern where a component receives a
function prop, usually named `render` or passed as `children`, and calls it with
its internal state. The component owns the logic, and the caller decides what to
render.

**Detailed explanation:**

- The component handles state and behavior. The consumer handles the markup.
- Libraries such as Downshift use this approach.
- Custom hooks have largely replaced it, because a hook shares the same logic
  without extra nesting. For example, a `useMousePosition` hook returns the
  position directly.
- Pitfall: deeply nested render props, sometimes called "callback hell" for JSX,
  are hard to read when several are composed.
- Pitfall: an inline function prop is a new reference on each render, so
  wrapping the consumer in `memo` gains little.

**Code example:**

```jsx
import { useState } from "react";

// Owns the mouse-position logic; the caller decides how to render it
function MouseTracker({ render }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <div
      style={{ height: 200, border: "1px solid #ccc" }}
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
    >
      {render(pos)}
    </div>
  );
}

export default function App() {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <p>
          Mouse at {x}, {y}
        </p>
      )}
    />
  );
}
```

### 2.9.3 What is the compound component pattern?

**Short answer:** A compound component is a parent that shares implicit state
with the child components it renders, usually through Context. Consumers compose
the parts declaratively, as in `<Tabs><Tabs.Tab/></Tabs>`, without passing props
through each level.

**Detailed explanation:**

- The parent owns the state and provides it through a context. Children read it.
- Many UI libraries use this for `Select`, `Tabs`, and `Accordion`.
- Attaching children as static properties, such as `Tabs.Tab`, makes the API
  discoverable.
- Consumers can rearrange the parts freely, for example by moving a `Tab` into a
  different wrapper.
- Pitfall: rendering a child outside its parent gives a null context. Guard that
  case with an error in the hook.

**Code example:**

```jsx
import { createContext, useContext, useState } from "react";

const TabsContext = createContext(null);

function Tabs({ children, defaultTab }) {
  const [active, setActive] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      {children}
    </TabsContext.Provider>
  );
}

function Tab({ id, children }) {
  const { active, setActive } = useContext(TabsContext);
  return (
    <button aria-pressed={active === id} onClick={() => setActive(id)}>
      {children}
    </button>
  );
}

function Panel({ id, children }) {
  const { active } = useContext(TabsContext);
  return active === id ? <div>{children}</div> : null;
}

Tabs.Tab = Tab;
Tabs.Panel = Panel;

// Usage: <Tabs defaultTab="a"><Tabs.Tab id="a">A</Tabs.Tab><Tabs.Panel id="a">...</Tabs.Panel></Tabs>
```

### 2.9.4 What are error boundaries? How do you implement one?

**Short answer:** An error boundary is a class component that catches JavaScript
errors thrown during rendering in its child tree and shows a fallback UI instead
of unmounting the whole app. Implement it with `static getDerivedStateFromError`
and `componentDidCatch`, since there is no hook equivalent.

**Detailed explanation:**

- Boundaries catch errors in render, lifecycle methods, and constructors of
  descendants.
- They do not catch errors in event handlers, async code such as promises and
  `setTimeout`, server rendering, or the boundary itself.
- For event handler and async errors, use try/catch and store the error in
  state, then throw it during render so the boundary catches it. The
  `react-error-boundary` library provides a reusable wrapper with reset support.
- Place boundaries around routes or sections for granular fallbacks.
- Use `componentDidCatch` to report errors to a monitoring service.

**Code example:**

```jsx
import { Component } from "react";

export class ErrorBoundary extends Component {
  state = { hasError: false };

  // Called during render: switch to the fallback UI
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // Called after commit: a good place to log the error
  componentDidCatch(error, info) {
    console.error("Caught by boundary:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <p>Something went wrong. Please refresh.</p>;
    }
    return this.props.children;
  }
}

// Usage: <ErrorBoundary><Widget /></ErrorBoundary>
```

### 2.9.5 What is the difference between createPortal and regular rendering?

**Short answer:** `createPortal` renders children into a DOM node outside the
parent's DOM hierarchy, such as `document.body` for a modal, while keeping them
in the React tree. Context and synthetic events still follow the React tree, not
the DOM tree.

**Detailed explanation:**

- Regular rendering places DOM nodes inside the parent element.
- With a portal, the DOM location changes, but the component stays a child of
  its React parent for context, state, and event bubbling.
- A click inside a portal bubbles to React ancestors even though those ancestors
  are not DOM ancestors.
- Use portals for modals, tooltips, and dropdowns that must escape
  `overflow: hidden` or a z-index stacking context.
- Pitfall: a portal does not manage focus or the Escape key for you. Handle
  accessibility yourself.

**Code example:**

```jsx
import { createPortal } from "react-dom";

export default function Modal({ open, onClose, children }) {
  if (!open) return null;

  // Rendered into <body>, escaping any overflow or z-index on the parent
  return createPortal(
    <div className="overlay" onClick={onClose}>
      {/* Stop clicks inside the dialog from reaching the overlay's onClose */}
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
```

### 2.9.6 What is a controlled vs. uncontrolled component pattern?

**Short answer:** A controlled component gets its value and change handler from
props, so the parent owns the state. An uncontrolled component keeps its own
state internally and may accept a default value. Good components support both,
the way native inputs support `value` and `defaultValue`.

**Detailed explanation:**

- Controlled: the parent passes `value` and `onChange`, and the parent is the
  single source of truth. This is flexible and easy to test.
- Uncontrolled: the child keeps its own state, and the parent can set a default
  or read the value through a ref.
- Hybrid pattern: "controllable state" uses the prop when it is provided and
  falls back to internal state otherwise.
- Pitfall: a component that switches modes depending on whether a prop is
  `undefined` at some point in its life causes subtle bugs.
- Pitfall: passing `value` without `onChange` makes the component read-only.

**Code example:**

```jsx
import { useState } from "react";

// Controlled if `value` is passed, otherwise uncontrolled
function Toggle({ value, defaultValue = false, onChange }) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const on = isControlled ? value : internal;

  function handleClick() {
    const next = !on;
    if (!isControlled) setInternal(next); // only manage state when uncontrolled
    onChange?.(next);
  }

  return (
    <button aria-pressed={on} onClick={handleClick}>
      {on ? "On" : "Off"}
    </button>
  );
}

// Controlled:   <Toggle value={isOn} onChange={setIsOn} />
// Uncontrolled: <Toggle defaultValue={true} />
```

### 2.9.7 What is the provider pattern in React?

**Short answer:** The provider pattern uses a component to supply a value or
service to a subtree through Context, so descendants can access it without props
being passed through every layer. Typical providers expose theme, auth, a store,
or an API client.

**Detailed explanation:**

- Create a context, then write a provider component that holds the state and
  passes the value to `Provider`.
- Wrap `useContext` in a custom hook such as `useTheme`, and throw a clear error
  if it is used outside the provider.
- Memoize the value with `useMemo`, so consumers re-render only when the value
  changes.
- Split frequently changing values from rarely changing ones, such as state
  versus dispatch, into separate contexts.
- Pitfall: one large provider that updates often re-renders every consumer.
  Redux's `<Provider>` follows the same pattern, but its selectors limit
  re-renders.

**Code example:**

```jsx
import { createContext, useContext, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  // Memoize the value so consumers re-render only when theme changes
  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Custom hook with a clear error when used outside the provider
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
```

### 2.9.8 What is the observer pattern in React?

**Short answer:** In the observer pattern, subscribers register callbacks with a
source and are notified when its state changes. In React, this appears as
`useSyncExternalStore` subscribing to an external store, or as event listeners
attached in `useEffect`.

**Detailed explanation:**

- A subject keeps a set of listeners. `subscribe` adds one and returns an
  unsubscribe function.
- `useSyncExternalStore` (React 18+) is the safe way to read mutable external
  state. It avoids tearing during concurrent rendering.
- Redux's `store.subscribe` and react-redux follow the same model.
- Pitfall: forgetting to unsubscribe leaks listeners and can cause updates on
  unmounted components.
- Pitfall: `useEffect` subscriptions need manual cleanup and can miss updates
  between render and effect. `useSyncExternalStore` handles both.

**Code example:**

```jsx
import { useSyncExternalStore } from "react";

// A tiny external store that notifies subscribers on change (observer pattern)
let state = { count: 0 };
const listeners = new Set();

const store = {
  getState: () => state,
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener); // unsubscribe
  },
  increment() {
    state = { count: state.count + 1 };
    listeners.forEach((notify) => notify());
  },
};

export default function Counter() {
  // React subscribes, reads a snapshot, and re-renders when notified
  const count = useSyncExternalStore(
    store.subscribe,
    () => store.getState().count,
  );
  return <button onClick={() => store.increment()}>{count}</button>;
}
```

### 2.9.9 What are forward refs (forwardRef)? When do you use them?

**Short answer:** `forwardRef` lets a component receive a `ref` from its parent
and attach it to an inner DOM element or component. Use it in reusable
components, such as an input wrapper, where consumers need to focus or measure
the underlying element. In React 19, `ref` is also accepted as a regular prop.

**Detailed explanation:**

- Without `forwardRef`, a `ref` on a function component is not passed through,
  and React warns.
- It is common in design-system components that wrap `<input>`, `<button>`, or
  `<select>`.
- `forwardRef` receives `(props, ref)`. The second argument is the forwarded
  ref.
- Combine it with `useImperativeHandle` to expose a small API instead of the raw
  DOM node.
- Pitfall: if the component also needs its own internal ref, you must merge the
  two refs.

**Code example:**

```jsx
import { forwardRef, useRef } from "react";

// Receives the parent's ref as the second argument and attaches it to <input>
const TextInput = forwardRef(function TextInput({ label, ...rest }, ref) {
  return (
    <label>
      {label}
      <input ref={ref} {...rest} />
    </label>
  );
});

export default function SearchPage() {
  const inputRef = useRef(null);
  return (
    <>
      <TextInput ref={inputRef} label="Search" />
      <button onClick={() => inputRef.current.focus()}>Focus search</button>
    </>
  );
}
```

### 2.9.10 What is useImperativeHandle?

**Short answer:** `useImperativeHandle` customizes the value a parent receives
through a ref, so the parent gets a small set of methods instead of the raw DOM
node. It is used with `forwardRef`, and it should be used sparingly, because
most communication should go through props.

**Detailed explanation:**

- The signature is `useImperativeHandle(ref, createHandle, deps)`.
- It hides DOM internals, so you expose only methods such as `focus()`,
  `clear()`, or `open()`.
- The handle is attached during the commit phase. `ref.current` is `null` before
  mount.
- Typical uses are focus control, media players, and components with an
  imperative API.
- Pitfall: overusing it bypasses React's data flow. Prefer props and state when
  you can.
- The `deps` array controls when the handle is recreated.

**Code example:**

```jsx
import { forwardRef, useImperativeHandle, useRef } from "react";

// The parent receives { focus, clear }, not the raw <input> element
const SearchBox = forwardRef(function SearchBox(props, ref) {
  const inputRef = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current.focus(),
      clear: () => {
        inputRef.current.value = "";
      },
    }),
    [], // the handle functions only use the stable inputRef
  );

  return <input ref={inputRef} placeholder="Search..." />;
});

export default function Page() {
  const boxRef = useRef(null);
  return (
    <>
      <SearchBox ref={boxRef} />
      <button onClick={() => boxRef.current.focus()}>Focus</button>
      <button onClick={() => boxRef.current.clear()}>Clear</button>
    </>
  );
}
```

## 3.1 Redux Core Concepts

### 3.1.1 What is Redux? Why do we need it?

**Short answer:** Redux is a predictable state container: all shared application
state lives in one store and changes only through explicit actions. We need it
when many distant components share state and every change must be traceable,
testable, and debuggable.

**Detailed explanation:**

- It solves state that is scattered across components and passed down through
  props (prop drilling) or ad hoc context.
- Every change follows one path (action, then reducer, then new state), so you
  can log, replay, and inspect changes.
- The ecosystem adds Redux DevTools, middleware for side effects, and selectors
  for derived data.
- Pitfall: Redux adds ceremony. For local UI state such as a dropdown toggle,
  `useState` is the better tool.

### 3.1.2 What are the three core principles of Redux?

**Short answer:** Redux rests on a single source of truth, read-only state, and
changes made by pure functions. Together they make app behavior predictable and
debuggable.

**Detailed explanation:**

- Single source of truth: the whole application state lives in one store object.
- State is read-only: the only way to change it is to dispatch an action.
  Components never mutate state directly.
- Changes are made with pure functions: reducers take the previous state and an
  action, and return the next state.
- Why it matters: these constraints make every transition explainable, which
  enables DevTools time travel and deterministic tests.
- Pitfall: "read-only" describes the rule. It does not mean objects are frozen,
  so you must still avoid manual mutation.

### 3.1.3 What is the Redux store?

**Short answer:** The store is the single object that holds application state
and exposes `getState`, `dispatch`, and `subscribe`. You create it once by
passing it a root reducer.

**Detailed explanation:**

- It holds the state tree and is created with a root reducer, plus optional
  middleware and preloaded state.
- Only the reducer computes new state. The store simply saves whatever the
  reducer returns.
- Pitfall: keep one store per app. Multiple stores fragment state and defeat the
  single source of truth.

**Code example:**

```javascript
import { createStore } from "redux";

// createStore takes a root reducer and returns the store.
// Legacy: createStore is deprecated.
// Use configureStore from Redux Toolkit instead.
const store = createStore((state = { value: 0 }, action) =>
  action.type === "counter/incremented"
    ? { ...state, value: state.value + 1 }
    : state,
);

console.log(store.getState()); // { value: 0 }
```

### 3.1.4 What is an action in Redux?

**Short answer:** An action is a plain JavaScript object that describes
something that happened. It must have a `type` string and conventionally carries
a `payload` with the data.

**Detailed explanation:**

- It is a plain, serializable object with no functions, Promises, or class
  instances.
- `type` identifies the event, usually in a `domain/eventName` format such as
  `todos/todoAdded`.
- An action describes intent. The reducer decides how state changes in response.
- Pitfall: non-serializable values inside actions break DevTools, persistence,
  and time travel.

**Code example:**

```javascript
// An action is a plain object with a required `type`.
const action = {
  type: "todos/todoAdded", // what happened
  payload: { id: 1, text: "Learn Redux" }, // data (a convention, not a requirement)
};
```

### 3.1.5 What is an action creator?

**Short answer:** An action creator is a function that returns an action object.
It keeps action shapes consistent and prevents scattered string typos.

**Detailed explanation:**

- It centralizes action construction, so call sites pass arguments instead of
  writing object literals.
- In plain Redux, action creators are pure and synchronous. Async work lives in
  thunks or sagas.
- Pitfall: a mistyped string `type` silently does nothing. Constants or
  generated creators (for example, from `createSlice`) catch this.

**Code example:**

```javascript
const TODO_ADDED = "todos/todoAdded";

// Action creator: returns the action object so callers don't write it inline.
function todoAdded(id, text) {
  return { type: TODO_ADDED, payload: { id, text } };
}

// Assumes `store` from the previous example.
store.dispatch(todoAdded(1, "Learn Redux"));
```

### 3.1.6 What is a reducer? What rules must it follow?

**Short answer:** A reducer is a function `(state, action) => newState` that
computes the next state. It must be pure, must never mutate its arguments, and
must return the existing state for actions it does not handle.

**Detailed explanation:**

- Pure: the same inputs always produce the same output.
- No side effects: no API calls, timers, `Math.random()`, `Date.now()`, or
  `localStorage`.
- No mutation: return new objects for changes. Never return `undefined`.
- Use a default parameter for state so the first call receives the initial
  state.
- Pitfall: dispatching inside a reducer is not allowed, and Redux throws.

**Code example:**

```javascript
// Reducer: (state, action) => newState
function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case "counter/incremented":
      return { ...state, value: state.value + 1 }; // new object, never mutate
    default:
      return state; // unknown actions return the same reference
  }
}
```

### 3.1.7 What is a pure function? Why must reducers be pure?

**Short answer:** A pure function returns the same output for the same inputs
and has no side effects. Reducers must be pure so state transitions are
predictable, replayable, and easy to test.

**Detailed explanation:**

- Output depends only on arguments, and nothing outside the function is read or
  written.
- Replaying the same actions reproduces the same states, which is what makes
  time-travel debugging possible.
- Pure functions make memoization in selectors safe and let react-redux compare
  results cheaply.
- Pitfall: a reducer that reads `Date.now()` or mutates its argument makes
  replays diverge.

**Code example:**

```javascript
// Impure: reads outside state and mutates its argument.
let taxRate = 0.1;
function withTaxImpure(cart) {
  cart.total = cart.subtotal * (1 + taxRate);
  return cart;
}

// Pure: output depends only on the arguments; the input is untouched.
function withTax(cart, rate) {
  return { ...cart, total: cart.subtotal * (1 + rate) };
}
```

### 3.1.8 What is immutability and why does Redux require it?

**Short answer:** Immutability means existing objects and arrays are never
changed; updates create new ones. Redux detects changes by reference, so
in-place mutation can make updates silently invisible to the UI.

**Detailed explanation:**

- React-redux and memoized selectors compare references with `===` to decide
  whether to update.
- Mutating in place keeps the same reference, so subscribers may skip the
  update.
- Time travel depends on past states staying intact.
- Pitfall: a shallow copy copies only one level. Every object along the changed
  path must be copied.
- Redux Toolkit lets you write "mutating" code safely through Immer (see 3.4.6).

**Code example:**

```javascript
const state = {
  todos: [
    { id: 1, done: false },
    { id: 2, done: false },
  ],
};

// Bad: mutates the existing object; the reference never changes.
// state.todos[0].done = true;

// Good: copy each level on the path to the change.
const next = {
  ...state,
  todos: state.todos.map((t) => (t.id === 1 ? { ...t, done: true } : t)),
};

console.log(next !== state); // true
console.log(next.todos[1] === state.todos[1]); // true: the untouched item is shared
```

### 3.1.9 What is dispatch()?

**Short answer:** `dispatch(action)` is the only way to request a state change.
It synchronously runs the root reducer with the current state and the action,
stores the result, and notifies subscribers.

**Detailed explanation:**

- It is synchronous: when `dispatch` returns, the state has already been
  updated.
- With middleware, the `dispatch` you receive is the enhanced version, and
  middleware can intercept it.
- Pitfall: calling `dispatch` inside a reducer throws. Side effects belong in
  middleware, thunks, or event handlers.

**Code example:**

```javascript
import { createStore } from "redux";

const store = createStore((state = { value: 0 }, action) =>
  action.type === "counter/incremented"
    ? { ...state, value: state.value + 1 }
    : state,
);

// Runs the reducer synchronously, saves the result, then notifies subscribers.
store.dispatch({ type: "counter/incremented" });
console.log(store.getState()); // { value: 1 }
```

### 3.1.10 What is getState()?

**Short answer:** `getState()` returns the current state snapshot. It is used
mainly in middleware, thunks, and tests. Components should read state through
hooks or selectors so they subscribe to changes.

**Detailed explanation:**

- It returns the state object by reference, so treat it as read-only.
- Calling it inside a reducer throws, because that state is still being
  computed.
- Calling `getState()` does not cause a re-render. Only subscriptions do.
- Pitfall: reading `getState()` once at module load gives a stale snapshot.

**Code example:**

```javascript
// Assumes `store` from 3.1.9.
const state = store.getState();
console.log(state.value); // read-only: never mutate this object

// Pitfall: calling store.getState() inside a reducer throws,
// because the state for that update is still being computed.
```

### 3.1.11 What is subscribe()?

**Short answer:** `subscribe(listener)` registers a callback that runs after
every dispatch and returns an unsubscribe function. React-redux and other UI
bindings are built on it.

**Detailed explanation:**

- The listener runs on every dispatch, not only when relevant data changes, so
  it must compare what it cares about.
- Listeners receive no arguments. Call `getState()` inside the listener.
- Always call the unsubscribe function during cleanup to avoid leaks.
- In React, prefer hooks such as `useSelector`, which handle subscription and
  cleanup for you.

**Code example:**

```javascript
// Assumes `store` from 3.1.9.
const unsubscribe = store.subscribe(() => {
  // No state is passed in; read it with getState().
  console.log("value is now", store.getState().value);
});

store.dispatch({ type: "counter/incremented" }); // logs: value is now 2
unsubscribe(); // stop listening, for example in cleanup code
```

### 3.1.12 What is combineReducers()?

**Short answer:** `combineReducers` builds a root reducer from an object of
slice reducers, where each reducer manages one key of the state tree. Each slice
reducer sees only its own part of the state.

**Detailed explanation:**

- The object keys define the state shape, such as `{ counter, todos }`.
- Every dispatched action is offered to every slice reducer.
- Redux warns about unexpected keys and throws if a slice reducer returns
  `undefined`.
- Pitfall: a slice reducer cannot see another slice. Cross-slice logic belongs
  in thunks, selectors, or (in RTK) `extraReducers`.

**Code example:**

```javascript
import { combineReducers, createStore } from "redux";

const counter = (state = 0, action) =>
  action.type === "counter/incremented" ? state + 1 : state;
const todos = (state = [], action) =>
  action.type === "todos/added" ? [...state, action.payload] : state;

// Each key owns one slice of the state tree.
const rootReducer = combineReducers({ counter, todos });
const store = createStore(rootReducer);

console.log(store.getState()); // { counter: 0, todos: [] }
```

### 3.1.13 How does data flow in Redux? Explain step by step

**Short answer:** The UI dispatches an action, middleware runs, the root reducer
computes the next state, the store saves it, and subscribers re-render only the
components whose selected data changed. The flow is one-way.

**Detailed explanation:**

- Step 1: a component or effect calls `dispatch(action)`.
- Step 2: middleware runs in order and may pass, modify, delay, or stop the
  action.
- Step 3: the root reducer runs, and `combineReducers` calls each slice reducer.
- Step 4: the store replaces its state with the new object.
- Step 5: subscribers run. React-redux compares each selected value and
  re-renders only the components whose values changed.
- Pitfall: step 5 still does work on every dispatch. A slow or unstable selector
  costs time even when nothing relevant changed.

### 3.1.14 What is the difference between Redux and the Context API?

**Short answer:** Context is a mechanism for passing a value down the tree.
Redux is a state management system with a store, actions, reducers, and tooling.
Context re-renders every consumer when its value changes, while Redux lets
components subscribe to slices through selectors.

**Detailed explanation:**

- Context has no built-in update logic, middleware, DevTools, or time travel.
- Context suits low-frequency values such as theme, locale, or the current user.
- Redux supports selective subscriptions, so components re-render only when
  their selected data changes.
- Pitfall: putting frequently changing values in one Context re-renders a large
  part of the tree. Redux or split contexts avoid that.
- The two can coexist. Many apps use Context for dependency injection and Redux
  for shared application state.

### 3.1.15 When should you use Redux and when shouldn't you?

**Short answer:** Use Redux when lots of state is shared across distant
components, updates are complex, or you need predictability and tooling. Skip it
for local UI state and small apps, and use a server-state library such as RTK
Query for cached API data.

**Detailed explanation:**

- Good fits: shared state such as auth, cart, or filters; complex update rules;
  teams that need DevTools and middleware.
- Poor fits: one component's toggle, a form on one page, or a small app.
- Server data: RTK Query or TanStack Query manage caching, loading states, and
  refetching better than hand-written slices.
- Pitfall: "Redux everywhere" slows simple features. Start with `useState` and
  lift state only when it is needed.

## 3.2 React-Redux

### 3.2.1 What is react-redux?

**Short answer:** react-redux is the official React binding for Redux. It
provides the `Provider` component and hooks, such as `useSelector` and
`useDispatch`, that connect components to the store.

**Detailed explanation:**

- Redux itself knows nothing about React. react-redux bridges the two.
- It subscribes components to the store and re-renders them only when the data
  they select changes.
- It supports hooks (the modern API) and `connect` (the legacy higher-order
  component).
- Pitfall: components that use these hooks must render below a `Provider`, or
  they throw an error.

### 3.2.2 What is the \<Provider\> component?

**Short answer:** `Provider` makes the Redux store available to every component
inside it through React context. You render it once near the root and pass the
store as the `store` prop.

**Detailed explanation:**

- It does not manage state itself. It only supplies the store.
- Any descendant can use `useSelector`, `useDispatch`, or `connect`.
- Pitfall: rendering a second `Provider` with a different store inside the tree
  gives that subtree a different state source. Keep one store.
- Pitfall: `Provider` must sit above every component that calls these hooks.

**Code example:**

```jsx
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";

// Provider exposes the store to every component below it via context.
export default function Root() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
```

### 3.2.3 What is useSelector()? How does it work?

**Short answer:** `useSelector` takes a function that picks data out of the
state and returns it to the component. It subscribes the component to the store
and re-renders only when the returned value changes by reference.

**Detailed explanation:**

- It runs the selector on mount and after every store update.
- The default comparison is `===`. Returning the same reference means no
  re-render.
- Selectors should be pure and cheap, because they run on every dispatch.
- Pitfall: a selector that returns a new object or array fails `===` every time,
  so the component re-renders constantly (see 3.2.8).

**Code example:**

```jsx
import { useSelector } from "react-redux";

function CounterValue() {
  // Re-renders only when state.counter.value changes.
  const value = useSelector((state) => state.counter.value);
  return <p>{value}</p>;
}
```

### 3.2.4 What is useDispatch()?

**Short answer:** `useDispatch` returns the store's `dispatch` function, so a
component can send actions. The returned function is stable across renders, so
it is safe to list in effect dependency arrays.

**Detailed explanation:**

- Call dispatch in event handlers or effects, not during render.
- It also dispatches thunks when thunk middleware is installed.
- Pitfall: dispatching during render causes update loops or warnings. Move the
  call into a handler or effect.

**Code example:**

```jsx
import { useDispatch } from "react-redux";
import { increment } from "./counterSlice";

function IncrementButton() {
  const dispatch = useDispatch(); // stable reference: store.dispatch
  return <button onClick={() => dispatch(increment())}>+1</button>;
}
```

### 3.2.5 What was connect() and how was it used (legacy)?

**Short answer:** `connect(mapStateToProps, mapDispatchToProps)(Component)` was
a higher-order component that injected store data and dispatch-bound callbacks
as props. It is still supported, but hooks replaced it in new code.

**Detailed explanation:**

- The wrapped component receives store data as ordinary props and never imports
  the store.
- `mapStateToProps` and `mapDispatchToProps` describe what gets injected.
- Connected components shallowly compare injected props to avoid unnecessary
  renders.
- Pitfall: nested wrappers complicate the component tree and TypeScript typing,
  a main reason hooks won.

**Code example:**

```jsx
import { connect } from "react-redux";
import { increment } from "./counterSlice";

const mapStateToProps = (state) => ({ value: state.counter.value });
const mapDispatchToProps = { increment }; // object shorthand

function Counter({ value, increment }) {
  // Arrow wrapper: the click event is not passed as the action payload.
  return <button onClick={() => increment()}>{value}</button>;
}

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
```

### 3.2.6 What is mapStateToProps?

**Short answer:** `mapStateToProps` is a function that receives the store state,
and optionally the component's own props, and returns the props the component
needs from the store. It runs whenever the store changes.

**Detailed explanation:**

- Signature: `(state, ownProps) => ({ ...props })`.
- Return only what the component uses, to keep re-renders narrow.
- The returned object is shallowly compared. If every key is equal, the
  component does not re-render.
- Pitfall: building new objects or arrays inside it causes re-renders on every
  store update. Use memoized selectors.

**Code example:**

```javascript
// Runs on every store update. Returns only the props this component needs.
const mapStateToProps = (state, ownProps) => ({
  value: state.counter.value, // primitive: compares cleanly
  label: ownProps.label, // combined with an own prop
});
```

### 3.2.7 What is mapDispatchToProps?

**Short answer:** `mapDispatchToProps` defines the callbacks a connected
component receives for dispatching actions. It can be an object of action
creators, which is the shorthand, or a function that receives `dispatch`.

**Detailed explanation:**

- Object shorthand: react-redux wraps each action creator so calling the prop
  dispatches the action.
- Function form: gives access to `dispatch` and `ownProps` for custom logic.
- If you omit it, the component receives `dispatch` as a prop.
- Pitfall: passing an event handler straight into an action creator sends the
  event object as the payload. Wrap the call in an arrow function.

**Code example:**

```javascript
import { decrement, increment } from "./counterSlice";

// Object shorthand: each action creator is bound to dispatch.
const mapDispatchToProps = { increment, decrement };

// Function form: custom dispatch logic with access to ownProps.
const mapDispatchToPropsFn = (dispatch, ownProps) => ({
  reset: () => dispatch({ type: "counter/reset", payload: ownProps.start }),
});
```

### 3.2.8 How does useSelector decide when to re-render?

**Short answer:** After every dispatch, `useSelector` re-runs the selector and
compares the new result with the previous one using `===`. The component
re-renders only when the result is different.

**Detailed explanation:**

- The comparison runs on every store update, including updates that have nothing
  to do with this component.
- Select stable references from the store whenever possible.
- For derived arrays or objects, derive with `useMemo`, use a memoized
  `createSelector`, or pass an equality function such as `shallowEqual`.
- Pitfall: `useSelector((s) => s.todos.items.filter(...))` looks harmless but
  re-renders on every dispatch.
- In development, react-redux warns when a selector returns different references
  for the same input.

**Code example:**

```jsx
import { useMemo } from "react";
import { shallowEqual, useSelector } from "react-redux";

// Bad: filter returns a new array on every dispatch, so this component
// re-renders after every action, even unrelated ones.
// const done = useSelector((s) => s.todos.items.filter((t) => t.done));

// Better: select the stable reference, then derive with useMemo.
const items = useSelector((s) => s.todos.items);
const done = useMemo(() => items.filter((t) => t.done), [items]);

// Or keep the filter and compare the result shallowly:
// const done = useSelector(selectDone, shallowEqual);
```

### 3.2.9 What is the difference between useSelector and mapStateToProps?

**Short answer:** Both read data from the store. `useSelector` is a hook called
inside a function component, while `mapStateToProps` is a function passed to
`connect` that wraps the component. The hook is simpler and avoids wrapper
components.

**Detailed explanation:**

- Hook: call it anywhere inside a function component and use the component's
  props and closures directly.
- `mapStateToProps`: receives `ownProps` as an argument, and its result is
  merged into the props and shallowly compared.
- Re-render rule: the hook compares the selector's return value by reference.
  `connect` shallowly compares every injected prop.
- Hooks cannot be used in class components. `connect` works with both class and
  function components.
- Pitfall: mixing both in one component adds confusion without benefit.

### 3.2.10 Can you use Redux without React?

**Short answer:** Yes. Redux is a standalone library. The store, reducers, and
dispatch work in plain JavaScript, and the React bindings are optional. Without
them, you subscribe to the store yourself to update the UI.

**Detailed explanation:**

- Redux is used in Node scripts, vanilla JavaScript apps, other frameworks, and
  tests.
- The core library has no dependency on React or the DOM.
- Pitfall: without react-redux you manage subscription setup and cleanup
  yourself.

**Code example:**

```javascript
import { createStore } from "redux";

const store = createStore((state = 0, action) =>
  action.type === "inc" ? state + 1 : state,
);

// Plain JavaScript subscriber; no React involved.
const unsubscribe = store.subscribe(() => console.log(store.getState()));
store.dispatch({ type: "inc" }); // logs 1
unsubscribe();
```

## 3.3 Middleware & Async Redux

### 3.3.1 What is middleware in Redux?

**Short answer:** Middleware is a function that sits between `dispatch` and the
reducers. It can intercept, log, transform, delay, or cancel actions and perform
side effects. Each middleware has the shape `store => next => action`.

**Detailed explanation:**

- Middleware runs in registration order. Each one decides whether to call
  `next(action)`.
- Typical uses: logging, crash reporting, async work (thunks and sagas),
  analytics, and routing.
- Middleware can read state through `getState` and dispatch new actions through
  the full chain.
- Pitfall: forgetting to call `next(action)` silently swallows the action.

**Code example:**

```javascript
// Middleware signature: store => next => action => result
const loggerMiddleware = (storeAPI) => (next) => (action) => {
  console.log("dispatching", action.type);
  const result = next(action); // pass action to next middleware/reducer
  console.log("next state", storeAPI.getState());
  return result;
};
```

### 3.3.2 What is applyMiddleware()?

**Short answer:** `applyMiddleware` is a store enhancer that wires one or more
middleware functions into the store's dispatch pipeline. You pass it as the
enhancer argument to `createStore`.

**Detailed explanation:**

- It composes middleware into an enhanced `dispatch`, so each middleware sees
  actions produced by the ones before it.
- Redux Toolkit's `configureStore` accepts a middleware option and applies it
  for you, along with the default middleware.
- Pitfall: order matters. A middleware that expects plain objects must come
  after any middleware that converts other values into actions.

**Code example:**

```javascript
import { applyMiddleware, createStore } from "redux";
import { thunk } from "redux-thunk";
import { rootReducer } from "./rootReducer"; // assumed to exist

// applyMiddleware returns a store enhancer; createStore applies it.
const store = createStore(rootReducer, applyMiddleware(thunk));
```

### 3.3.3 What is redux-thunk?

**Short answer:** redux-thunk is middleware that lets you dispatch functions,
called thunks. When a thunk is dispatched, the middleware calls it with
`dispatch` and `getState`, which enables async logic inside action creators.

**Detailed explanation:**

- A thunk has the shape `(dispatch, getState, extra) => ...`.
- Plain action objects pass through to `next` unchanged.
- Use thunks for API calls, conditional dispatches, and reading state before
  deciding what to do.
- Redux Toolkit's `configureStore` includes thunk middleware by default.
- Pitfall: thunks run imperatively. Nothing cancels them automatically when a
  component unmounts, so you manage that yourself.

**Code example:**

```javascript
// A thunk: an action creator that returns a function instead of an object.
const fetchTodos = () => async (dispatch, getState) => {
  dispatch({ type: "todos/loading" });
  const res = await fetch("/api/todos");
  const data = await res.json();
  dispatch({ type: "todos/loaded", payload: data });
};

store.dispatch(fetchTodos()); // assumes `store` has thunk middleware
```

### 3.3.4 How does redux-thunk enable async actions?

**Short answer:** The middleware intercepts function actions and calls them
instead of passing them to reducers. Because the function can wait on promises
before dispatching plain actions, the store updates over time rather than all at
once.

**Detailed explanation:**

- The middleware checks whether the incoming action is a function.
- Inside the thunk, code can `await` results and dispatch `loading`, `loaded`,
  and `failed` actions as they happen.
- Those dispatched actions are plain objects, so reducers stay pure.
- The thunk's return value is returned by `dispatch`, so callers can
  `await dispatch(fetchTodos())`.

**Code example:**

```javascript
// Simplified version of what redux-thunk does internally.
const thunkMiddleware =
  ({ dispatch, getState }) =>
  (next) =>
  (action) =>
    typeof action === "function"
      ? action(dispatch, getState) // run the thunk; it may dispatch later
      : next(action); // plain objects go straight through
```

### 3.3.5 What is redux-saga? How is it different from redux-thunk?

**Short answer:** redux-saga is middleware that runs long-lived, generator-based
"sagas". They watch for actions and perform side effects through declarative
effects such as `call` and `put`. Sagas are more powerful than thunks for
complex flows, but they add more concepts.

**Detailed explanation:**

- A saga is a generator function. Each `yield` pauses until the middleware
  finishes that effect.
- Effects such as `call`, `put`, `take`, `takeLatest`, `race`, and `fork` are
  plain descriptions, so sagas can be unit tested step by step.
- Sagas fit cancellation, debouncing, retries, and coordination of several async
  flows.
- Pitfall: the boilerplate and learning curve are significant for small apps.

**Code example:**

```javascript
import { call, put, takeLatest } from "redux-saga/effects";
import { fetchJson } from "./api"; // assumed helper that returns parsed JSON

// Each yield describes an effect for the saga middleware to run.
function* loadTodos() {
  try {
    const todos = yield call(fetchJson, "/api/todos");
    yield put({ type: "todos/loaded", payload: todos });
  } catch (err) {
    yield put({ type: "todos/failed", error: err.message });
  }
}

// Watcher: starts loadTodos on each request and cancels a stale run.
export function* rootSaga() {
  yield takeLatest("todos/requested", loadTodos);
}
```

### 3.3.6 What is the difference between thunks and sagas?

**Short answer:** Thunks are functions you dispatch to run imperative async
work, and the caller can await the result. Sagas are background processes that
listen for actions over time and coordinate work. Most apps are well served by
thunks, and sagas help when flows are complex.

**Detailed explanation:**

- Thunks use `async`/`await` and return a value to the caller. Sagas are
  declarative generators that run continuously.
- Cancellation: sagas have built-in `cancel` and `race`. Thunks need an
  `AbortController`.
- Testing: saga effects can be tested without mocking the store. Thunk tests
  usually mock `dispatch` and `fetch`.
- Pitfall: choosing sagas for simple request and response flows adds complexity
  without benefit.
- Redux Toolkit recommends `createAsyncThunk` for most data fetching and
  `createListenerMiddleware` for reactive logic.

### 3.3.7 How do you handle loading, success, and error states in Redux?

**Short answer:** Store an explicit `status` value, such as `idle`, `loading`,
`succeeded`, or `failed`, next to the data and an `error` field. Dispatch a
separate action for each transition so the UI renders from one source of truth.

**Detailed explanation:**

- Avoid combinations of booleans such as `isLoading` and `hasError`, because
  they can disagree.
- Track status per request or per resource. A single global flag hides which
  request is pending.
- Clear the previous error when a new request starts.
- Pitfall: forgetting to set `failed` on error leaves spinners running forever.
- Redux Toolkit's `createAsyncThunk` generates these transitions for you (see
  3.4.9).

**Code example:**

```javascript
const initialState = { items: [], status: "idle", error: null };

function todosReducer(state = initialState, action) {
  switch (action.type) {
    case "todos/loading":
      return { ...state, status: "loading", error: null };
    case "todos/loaded":
      return { ...state, status: "succeeded", items: action.payload };
    case "todos/failed":
      return { ...state, status: "failed", error: action.payload };
    default:
      return state;
  }
}
```

### 3.3.8 What is a side effect in Redux?

**Short answer:** A side effect is anything that reaches outside the state
update, such as API calls, timers, storage access, navigation, logging, or
randomness. Side effects belong in middleware, thunks, sagas, or event handlers,
never in reducers.

**Detailed explanation:**

- Reducers must be pure, so side effects inside them break replay and testing.
- Side effects are usually triggered by actions and run around the reducer, not
  inside it.
- Pitfall: writing to `localStorage` in a reducer seems to work until time
  travel or a test replays the action.
- Good practice: a middleware or listener persists selected state after each
  action.

**Code example:**

```javascript
// Bad: a side effect inside a reducer. Replays and tests repeat it.
function authReducer(state, action) {
  if (action.type === "user/loggedIn") {
    localStorage.setItem("token", action.payload.token); // side effect
  }
  return { ...state, user: action.payload.user };
}

// Good: the thunk performs the effect, then dispatches a pure update.
export const login = (creds) => async (dispatch) => {
  const { token, user } = await api.login(creds); // assumed API helper
  localStorage.setItem("token", token);
  dispatch({ type: "user/loggedIn", payload: { token, user } });
};
```

### 3.3.9 How do you cancel an async operation in Redux?

**Short answer:** With sagas, `takeLatest` or `cancel` stops the previous task
automatically. With thunks, pass an `AbortController` signal to `fetch` and
abort it when a newer request starts or the component unmounts.

**Detailed explanation:**

- Abort the request, then ignore the `AbortError` in the `catch` block.
- Responses from older requests can overwrite newer data. Cancellation or
  request IDs prevent that.
- Pitfall: aborting in the UI does nothing for the network request unless the
  signal is passed to `fetch`.
- Redux Toolkit's `createAsyncThunk` exposes a `signal` in `thunkAPI` and an
  `abort()` method on the returned promise.

**Code example:**

```javascript
let controller; // holds the in-flight request

const searchUsers = (query) => async (dispatch) => {
  controller?.abort(); // cancel the previous search
  controller = new AbortController();
  dispatch({ type: "search/loading" });
  try {
    const url = `/api/users?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { signal: controller.signal });
    dispatch({ type: "search/loaded", payload: await res.json() });
  } catch (err) {
    if (err.name !== "AbortError") dispatch({ type: "search/failed" });
  }
};
```

### 3.3.10 What is redux-logger?

**Short answer:** redux-logger is middleware that logs each dispatched action
along with the previous and next state in the console. It is a development aid,
and Redux DevTools now covers most of its use cases.

**Detailed explanation:**

- It logs the action type, payload, previous state, and next state.
- Options such as `collapsed` keep the console output readable.
- Pitfall: shipping it to production leaks state into the console and slows
  every dispatch. Include it only in development builds.
- Pitfall: keep it last in the middleware chain so it logs the action after
  other middleware has processed it.

**Code example:**

```javascript
import { applyMiddleware, createStore } from "redux";
import { createLogger } from "redux-logger";
import { rootReducer } from "./rootReducer"; // assumed to exist

// Dev-only: adapt the flag to your bundler (for example, import.meta.env.DEV).
const isDev = process.env.NODE_ENV !== "production";
const logger = createLogger({ collapsed: true });

// If you add more middleware later, keep the logger last in this list.
const store = createStore(
  rootReducer,
  applyMiddleware(...(isDev ? [logger] : [])),
);
```

## 3.4 Redux Toolkit (RTK)

### 3.4.1 What is Redux Toolkit? Why was it created?

**Short answer:** Redux Toolkit (RTK) is the official, recommended way to write
Redux logic. It was created to cut boilerplate, provide safe store defaults, and
simplify common tasks such as immutable updates and async requests.

**Detailed explanation:**

- Classic Redux required action type constants, action creators, `switch`
  reducers, and manual spread copies.
- RTK bundles `redux`, `redux-thunk`, Reselect, Immer, and RTK Query.
- `configureStore` sets up DevTools, thunk middleware, and development checks
  for mutations and non-serializable values.
- RTK is opinionated but still Redux underneath. The store, actions, and
  reducers are the same model.
- Pitfall: mixing hand-written Redux patterns with RTK in one codebase is
  confusing. Use RTK for new code.

### 3.4.2 What is configureStore()?

**Short answer:** `configureStore` creates a Redux store with sensible defaults.
It combines an object of reducers, adds thunk middleware, enables Redux
DevTools, and includes development-only checks.

**Detailed explanation:**

- `reducer` can be a single function or an object of slice reducers.
- The default middleware includes thunk, plus immutability and serializability
  checks in development.
- To add middleware, extend the defaults with the `getDefaultMiddleware`
  callback.
- Pitfall: replacing the middleware array without calling
  `getDefaultMiddleware()` removes thunk and the dev checks.
- The dev checks cost time on large state, and RTK lets you tune or disable
  them.

**Code example:**

```javascript
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";
import todosReducer from "./todosSlice";

export const store = configureStore({
  // Object form: RTK calls combineReducers for you.
  reducer: { counter: counterReducer, todos: todosReducer },
  // Thunk, DevTools, and dev-only checks are on by default.
  // To add middleware, extend the defaults rather than replacing them:
  // middleware: (getDefault) => getDefault().concat(myMiddleware),
});
```

### 3.4.3 What is createSlice()?

**Short answer:** `createSlice` generates a reducer, action creators, and action
types from one definition: a name, an initial state, and a map of reducer
functions. Its reducers use Immer, so you can write direct updates.

**Detailed explanation:**

- Action types are built as `${name}/${reducerKey}`, for example
  `counter/increment`.
- It returns `slice.reducer`, `slice.actions`, and `slice.caseReducers`.
- `extraReducers` handles actions defined elsewhere, such as thunk lifecycle
  actions.
- Pitfall: renaming a reducer key changes its action type string, which can
  break other code that matches on it.
- Keep one slice per feature domain rather than one large slice for the whole
  app.

**Code example:**

```javascript
import { createSlice } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "counter", // prefix for generated action types
  initialState: { value: 0 },
  reducers: {
    // Immer lets you write "mutating" code safely on the draft state.
    increment: (state) => {
      state.value += 1;
    },
    incrementBy: (state, action) => {
      state.value += action.payload;
    },
  },
});

export const { increment, incrementBy } = counterSlice.actions;
export default counterSlice.reducer;
// increment() returns { type: 'counter/increment' }
```

### 3.4.4 What is createAction()?

**Short answer:** `createAction` builds an action creator with a fixed `type`
string, which saves you from writing type constants and object literals. An
optional `prepare` callback builds the payload or metadata before the action is
created.

**Detailed explanation:**

- The returned creator has a `.type` property and a `.match` helper for checking
  actions.
- Calling it returns `{ type, payload }`.
- `prepare` is the right place for non-deterministic work such as generating
  IDs.
- Pitfall: `createSlice` already creates actions for its reducers. Use
  `createAction` for actions that several slices handle.

**Code example:**

```javascript
import { createAction } from "@reduxjs/toolkit";

const todoAdded = createAction("todos/todoAdded");
console.log(todoAdded.type); // 'todos/todoAdded'
console.log(todoAdded({ id: 1 }));
// { type: 'todos/todoAdded', payload: { id: 1 } }

// prepare runs before the action is created: the place for generating an id.
const todoAddedWithId = createAction("todos/todoAdded", (text) => ({
  payload: { id: crypto.randomUUID(), text },
}));
```

### 3.4.5 What is createReducer()?

**Short answer:** `createReducer` builds a reducer from an initial state and a
builder callback that maps action types or action creators to case handlers.
Handlers can use Immer draft syntax, and matchers can cover groups of actions.

**Detailed explanation:**

- Case keys can be string types or action creators from `createAction`.
- `addMatcher` handles groups of actions, such as every `/rejected` action.
- `addCase` calls must come before `addMatcher` calls.
- `createSlice` uses `createReducer` internally.
- Pitfall: use it when you need a reducer without generated action creators.
  Otherwise `createSlice` is less code.

**Code example:**

```javascript
import { createAction, createReducer } from "@reduxjs/toolkit";

const counterReset = createAction("counter/reset");

const counterReducer = createReducer(
  { value: 0, lastError: null },
  (builder) => {
    builder
      .addCase("counter/incremented", (state) => {
        state.value += 1; // Immer draft: safe to mutate
      })
      .addCase(counterReset, (state) => {
        state.value = 0;
      })
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state) => {
          state.lastError = "request failed";
        },
      );
  },
);
```

### 3.4.6 What is Immer? How does RTK use it internally?

**Short answer:** Immer lets you write code that appears to mutate a draft of
the state, then produces a new immutable object with only the changed parts
replaced. RTK wraps reducers in Immer's `produce`, so mutating-style code in
`createSlice` and `createReducer` is safe.

**Detailed explanation:**

- Immer uses proxies to record changes made to the draft.
- Unchanged subtrees keep their references, so updates stay cheap.
- In development, Immer auto-freezes the produced state, which catches
  accidental mutations.
- Pitfall: a single recipe cannot both mutate the draft and return a new value.

**Code example:**

```javascript
import { produce } from "immer";

const base = { todos: [{ id: 1, done: false }] };

// produce hands you a draft; mutations are recorded and applied immutably.
const next = produce(base, (draft) => {
  draft.todos[0].done = true;
});

console.log(base.todos[0].done); // false: the original is untouched
console.log(next.todos[0].done); // true
```

### 3.4.7 How do you write "mutating" logic safely in RTK?

**Short answer:** Inside `createSlice` and `createReducer` callbacks, either
mutate the `state` draft directly or return a new value, but never both. Keep
mutations inside reducers rather than in components or thunks that touch the
same objects.

**Detailed explanation:**

- Methods such as `push`, `splice`, and direct assignment are safe on the draft.
- Returning a new object or array replaces the whole state.
- Do not mutate an action payload after dispatching it, because reducers may
  store that object in state.
- Pitfall: mutating a value captured from outside the draft, such as a
  module-level array, bypasses Immer.
- Use `current(state)` when you need a plain copy of the draft, for example for
  logging.

**Code example:**

```javascript
import { createSlice } from "@reduxjs/toolkit";

const todosSlice = createSlice({
  name: "todos",
  initialState: [],
  reducers: {
    todoAdded(state, action) {
      state.push(action.payload); // OK: mutate the draft
    },
    todoToggled(state, action) {
      const todo = state.find((t) => t.id === action.payload);
      if (todo) todo.done = !todo.done; // OK: mutate the draft object
    },
    todosCleared() {
      return []; // OK: return a new value instead
      // Mutating `state` and also returning a value here would throw.
    },
  },
});
```

### 3.4.8 What is createAsyncThunk()?

**Short answer:** `createAsyncThunk` takes an action type prefix and an async
payload creator, and produces a thunk that dispatches `pending`, `fulfilled`,
and `rejected` actions automatically. It is the standard RTK way to fetch data
without hand-writing those transitions.

**Detailed explanation:**

- The payload creator receives the argument and `thunkAPI`, which includes
  `signal`, `dispatch`, `getState`, and `rejectWithValue`.
- The return value becomes `action.payload` in the `fulfilled` action.
- `rejectWithValue` passes a custom error value to the `rejected` action.
- Pitfall: a failed HTTP response does not throw from `fetch`, so check `res.ok`
  yourself.
- The `condition` option skips the request, for example when data is already
  loading.

**Code example:**

```javascript
import { createAsyncThunk } from "@reduxjs/toolkit";

// First argument: action type prefix. Second: async payload creator.
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (orgId, { signal, rejectWithValue }) => {
    const res = await fetch(`/api/orgs/${orgId}/users`, { signal });
    if (!res.ok) return rejectWithValue(`HTTP ${res.status}`);
    return res.json(); // becomes action.payload in the fulfilled action
  },
);

// Usage: dispatch(fetchUsers('acme'))
```

### 3.4.9 Lifecycle actions of createAsyncThunk

**Question:** What are the lifecycle actions generated by `createAsyncThunk`
(pending, fulfilled, rejected)?

**Short answer:** `pending` fires when the thunk starts, `fulfilled` fires when
the payload creator resolves, and `rejected` fires when it throws or calls
`rejectWithValue`. Each action carries `meta` with the `requestId` and the
original argument, so concurrent requests can be tracked.

**Detailed explanation:**

- Action types are `typePrefix/pending`, `typePrefix/fulfilled`, and
  `typePrefix/rejected`.
- `meta.arg` holds the argument passed to the thunk, and `meta.requestId` is
  unique per call.
- `rejected` includes `error`, a serialized version of the thrown error, and
  `payload` when `rejectWithValue` was used. `meta.aborted` is true when the
  request was cancelled.
- If `condition` returns false, no `pending` action is dispatched.
- Pitfall: if a reducer omits the `rejected` case, the status stays stuck at
  `loading`.

**Code example:**

```javascript
import { createSlice } from "@reduxjs/toolkit";
import { fetchUsers } from "./fetchUsers"; // the thunk from 3.4.8

const usersSlice = createSlice({
  name: "users",
  initialState: { items: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      });
  },
});
```

### 3.4.10 What is extraReducers in createSlice?

**Short answer:** `extraReducers` lets a slice respond to actions it did not
define, such as thunk lifecycle actions, actions from other slices, or a logout
action. In RTK 2 it takes a builder callback and does not generate new action
creators.

**Detailed explanation:**

- Use it for cross-slice coordination, such as clearing a cart on logout.
- Handlers follow the same Immer rules as `reducers`: mutate the draft or return
  a new value.
- Pitfall: the object notation was removed in RTK 2, so use the builder
  callback.
- Pitfall: handle each action in one place. Splitting handlers for the same
  action across `reducers` and `extraReducers` makes behavior hard to follow.

**Code example:**

```javascript
import { createSlice } from "@reduxjs/toolkit";
import { logoutUser } from "./authSlice"; // defined in another slice

const cartSlice = createSlice({
  name: "cart",
  initialState: [],
  reducers: {
    itemAdded: (state, action) => {
      state.push(action.payload);
    },
  },
  // Handles actions this slice did not define.
  extraReducers: (builder) => {
    builder.addCase(logoutUser.fulfilled, () => []); // clear the cart on logout
  },
});

export default cartSlice.reducer;
```

### 3.4.11 What is createSelector()?

**Short answer:** `createSelector`, re-exported from Reselect in RTK, builds a
memoized selector from input selectors and a result function. It recomputes
derived data only when an input changes by reference.

**Detailed explanation:**

- Input selectors pick raw state, and the result function derives the value.
- Stable derived arrays help `useSelector` avoid unnecessary re-renders.
- Selectors are shared modules, so every component that uses one gets the same
  cached result.
- Pitfall: if an input selector returns a new object on every call, the
  memoization is lost.
- Pitfall: a parameterized selector shared by many components can thrash its
  cache. Use a factory function that creates one selector per instance.

**Code example:**

```javascript
import { createSelector } from "@reduxjs/toolkit";

const selectTodos = (state) => state.todos.items;
const selectVisibility = (state) => state.todos.visibility;

// Recomputes only when selectTodos or selectVisibility returns a new reference.
export const selectVisibleTodos = createSelector(
  [selectTodos, selectVisibility],
  (todos, visibility) =>
    visibility === "done" ? todos.filter((t) => t.done) : todos,
);
```

### 3.4.12 What is memoization in selectors?

**Short answer:** Memoization caches a selector's last inputs and result, so
repeated calls with the same inputs return the cached value without recomputing.
This keeps derived data cheap and its references stable.

**Detailed explanation:**

- Inputs are compared by reference (`===`), not by deep equality.
- A selector remembers its most recent inputs and result by default. Reselect
  can cache more argument sets when configured.
- Stable results prevent unnecessary re-renders in components that use them.
- Pitfall: passing a new literal object or array as an argument defeats the
  cache.
- Pitfall: if every list item shares one selector with different arguments, the
  cache misses constantly. Create a selector per instance.

**Code example:**

```javascript
import { createSelector } from "@reduxjs/toolkit";

const selectItems = (state) => state.cart.items;

// Same items reference in, cached total out; no recomputation.
export const selectCartTotal = createSelector([selectItems], (items) => {
  console.log("recomputing total"); // only logs when items changes
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
});

// Pitfall: an input selector that returns a fresh array on every call,
// such as (s) => s.cart.items.slice(), never hits the cache.
```

### 3.4.13 What is createEntityAdapter()?

**Short answer:** `createEntityAdapter` generates a normalized state shape with
`ids` and `entities`, CRUD case reducers, and selectors for one collection. It
removes the need to write lookup and update logic for each entity type.

**Detailed explanation:**

- `getInitialState()` returns `{ ids: [], entities: {} }`.
- Case reducers include `addOne`, `setAll`, `upsertMany`, `updateOne`, and
  `removeOne`.
- The optional `sortComparer` keeps `ids` in sorted order.
- Selectors include `selectAll`, `selectById`, `selectIds`, and `selectTotal`.
- Pitfall: entities need a unique `id` field. Use the `selectId` option if your
  key has a different name.

**Code example:**

```javascript
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

const usersAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.name.localeCompare(b.name), // keeps ids sorted by name
});

const usersSlice = createSlice({
  name: "users",
  initialState: usersAdapter.getInitialState(), // { ids: [], entities: {} }
  reducers: {
    userAdded: usersAdapter.addOne, // generated case reducers
    userRemoved: usersAdapter.removeOne,
    usersReceived: usersAdapter.setAll,
  },
});

export default usersSlice.reducer;

export const { selectAll: selectAllUsers, selectById: selectUserById } =
  usersAdapter.getSelectors((state) => state.users);
```

### 3.4.14 What is normalized state? Why is it useful?

**Short answer:** Normalized state stores each kind of entity once, in a lookup
table keyed by ID, and expresses relationships as IDs. This avoids duplicated
data and makes updates cheap and consistent.

**Detailed explanation:**

- Each record exists in one place, so updating a user updates every view that
  shows it.
- Lookup by ID is direct. Nested arrays require scanning.
- Reducers stay simple because each update touches one entity.
- Pitfall: components that show nested data must join records back together,
  usually in selectors.
- Pitfall: normalizing UI-only data adds complexity without benefit. Normalize
  data that comes from the server.

**Code example:**

```javascript
// Nested (denormalized): the same user is duplicated inside every post.
const nested = {
  posts: [{ id: "p1", author: { id: "u1", name: "Ann" } }],
};

// Normalized: each entity is stored once and related by id.
const normalized = {
  users: { ids: ["u1"], entities: { u1: { id: "u1", name: "Ann" } } },
  posts: { ids: ["p1"], entities: { p1: { id: "p1", authorId: "u1" } } },
};
```

### 3.4.15 How is RTK different from plain Redux? What does it solve?

**Short answer:** Both use the same store, actions, reducers, and dispatch
model. RTK removes boilerplate, adds safe defaults such as Immer and thunk
middleware, and provides helpers for async logic and entity management.

**Detailed explanation:**

- It removes hand-written action type constants, `switch` reducers, and deep
  spread updates.
- Its development checks catch accidental mutations and non-serializable
  actions.
- It provides `createAsyncThunk`, `createEntityAdapter`, and RTK Query for data
  fetching.
- Plain Redux still works, and knowing it helps you debug RTK code.
- Pitfall: RTK does not remove the need to understand pure reducers,
  immutability, and selectors.

## 3.5 RTK Query

### 3.5.1 What is RTK Query?

**Short answer:** RTK Query is the data fetching and caching layer built into
Redux Toolkit. It generates hooks that fetch, cache, and sync server data, so
you do not hand-write thunks, loading flags, or cache logic.

**Detailed explanation:**

- It ships with `@reduxjs/toolkit/query`, and the React hooks come from
  `@reduxjs/toolkit/query/react`.
- Server data lives in the Redux store under `state[reducerPath]`, so Redux
  DevTools shows it.
- It deduplicates identical in-flight requests and handles caching, refetching,
  polling, and cache lifetime.
- Use it for server state. Keep slices for client UI state.
- Pitfall: forgetting to add `api.reducer` and `api.middleware` to
  `configureStore`. Caching and invalidation silently stop working.

**Code example:**

```javascript
// app/store.js
import { configureStore } from "@reduxjs/toolkit";
import { api } from "../services/api";

export const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer },
  // The middleware drives caching, polling, and invalidation
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
```

### 3.5.2 What is createApi()?

**Short answer:** `createApi` defines an API slice: a base query, a set of
endpoints (queries and mutations), and the reducer, middleware, and React hooks
generated from them.

**Detailed explanation:**

- `reducerPath` (default `'api'`) must be unique in the store.
- `baseQuery` decides how requests run. `fetchBaseQuery` is the usual choice.
- `tagTypes` must list every tag type used by `providesTags` or
  `invalidatesTags`.
- Endpoint `getPosts` produces the hook `useGetPostsQuery`. Endpoint `addPost`
  produces `useAddPostMutation`.
- Pitfall: `tagTypes` missing or misspelled, so invalidation does nothing.

**Code example:**

```javascript
// services/api.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => "/posts",
      providesTags: ["Post"],
    }),
  }),
});

// Generated hook: useGetPostsQuery
export const { useGetPostsQuery } = api;
```

### 3.5.3 What is fetchBaseQuery()?

**Short answer:** `fetchBaseQuery` is the built-in `baseQuery` wrapper around
`fetch`. It handles the base URL, JSON bodies, and headers, and it returns
`{ data }` or `{ error }` instead of throwing.

**Detailed explanation:**

- It JSON-serializes object bodies and sets the Content-Type header.
- `prepareHeaders` runs before every request, which makes it the place for auth
  headers.
- HTTP 4xx and 5xx responses come back as `error` with `status` and `data`.
  Network failures use `status: 'FETCH_ERROR'`.
- Pitfall: assuming a failed request throws. You check `error` in the hook or
  the `unwrap()` result instead.
- For another HTTP client, write a custom `baseQuery` function.

**Code example:**

```javascript
import { fetchBaseQuery } from "@reduxjs/toolkit/query";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://jsonplaceholder.typicode.com",
  // Runs before every request
  prepareHeaders: (headers) => {
    headers.set("Accept", "application/json");
    return headers;
  },
});
```

### 3.5.4 What are auto-generated hooks in RTK Query?

**Short answer:** Each endpoint gets a hook. Query endpoints produce
`useXQuery`, which subscribes the component to a cache entry. Mutation endpoints
produce `useXMutation`, which returns a `[trigger, result]` tuple.

**Detailed explanation:**

- The first argument of a query hook is the query argument. The optional second
  argument takes options such as `skip`, `pollingInterval`, and
  `refetchOnMountOrArgChange`.
- `isLoading` is true only for the first load with no data. `isFetching` is true
  for any in-flight request, including refetches.
- Mutations run only when you call the trigger. Call `.unwrap()` on the result
  to get a promise that rejects on error.
- Pitfall: using `isFetching` as the initial-load spinner, which makes the
  spinner flash on every refetch.

**Code example:**

```javascript
import { useGetPostsQuery, useAddPostMutation } from "../services/api";

function Posts() {
  const { data = [], isLoading, isFetching, error } = useGetPostsQuery();
  const [addPost] = useAddPostMutation();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong.</p>;

  return (
    <>
      {isFetching && <small>Refreshing...</small>}
      <ul>
        {data.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
      <button onClick={() => addPost({ title: "New", body: "", userId: 1 })}>
        Add
      </button>
    </>
  );
}
```

### 3.5.5 What is the difference between a query and a mutation in RTK Query?

**Short answer:** Queries are reads (GET). They run automatically when
subscribed and their results are cached. Mutations are writes (POST, PUT, PATCH,
DELETE). They run only when triggered and usually use `invalidatesTags` to
refetch stale queries.

**Detailed explanation:**

- Queries are keyed by endpoint name plus serialized arguments, and they are
  shared across components.
- Mutations do not populate the query cache. They return their own result.
- Pitfall: putting a write in a `query` definition. It fires on mount and can
  cause unexpected server writes.
- Pitfall: forgetting `invalidatesTags` after a write, so the UI shows stale
  data.

**Code example:**

```javascript
updatePost: builder.mutation({
  query: ({ id, ...patch }) => ({
    url: `/posts/${id}`,
    method: 'PATCH',
    body: patch,
  }),
  // Marks the cached Post with this id as stale
  invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }],
}),
```

### 3.5.6 How does caching work in RTK Query?

**Short answer:** Each result is cached under a key made of the endpoint name
and serialized arguments. Components that request the same key share one request
and one cache entry. The entry stays while subscribed and for
`keepUnusedDataFor` seconds after the last subscriber leaves.

**Detailed explanation:**

- Different arguments create different cache entries.
- Subscribing on mount adds a subscriber. Unmounting removes it.
- The cache is kept in the store, so back navigation can render instantly.
- Pitfall: expecting data to disappear on unmount. It stays until
  `keepUnusedDataFor` expires.
- Pitfall: with `refetchOnMountOrArgChange` left at its default, remounting
  shows cached data without a network call.

**Code example:**

```javascript
// Both components share ONE request and ONE cache entry
const PostCount = () => {
  const { data } = useGetPostsQuery();
  return <span>{data?.length ?? 0}</span>;
};
const PostList = () => {
  const { data } = useGetPostsQuery();
  return (
    <ul>
      {data?.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
};

// Different arguments create different cache keys
useGetPostQuery(1); // key: getPost(1)
useGetPostQuery(2); // key: getPost(2)
```

### 3.5.7 What is cache invalidation in RTK Query?

**Short answer:** Invalidation marks cached data as stale so that it refetches.
It is declarative and tag-based: a mutation lists the tags it invalidates, and
any query that provides those tags refetches.

**Detailed explanation:**

- Queries declare `providesTags`. Mutations declare `invalidatesTags`.
- Only subscribed queries refetch right away. Unsubscribed stale queries refetch
  the next time they are subscribed.
- Granular tags such as `{ type: 'Post', id: 5 }` refetch only the affected
  entries.
- Manual control is available through `api.util.invalidateTags`.
- Pitfall: a mutation that invalidates nothing, so the list never updates.

**Code example:**

```javascript
getPosts: builder.query({
  query: () => '/posts',
  // Each item gets its own tag, plus a LIST tag for the collection
  providesTags: (result = []) => [
    ...result.map(({ id }) => ({ type: 'Post', id })),
    { type: 'Post', id: 'LIST' },
  ],
}),
addPost: builder.mutation({
  query: (body) => ({ url: '/posts', method: 'POST', body }),
  // Any query providing the LIST tag refetches
  invalidatesTags: [{ type: 'Post', id: 'LIST' }],
}),
```

### 3.5.8 What are tags in RTK Query (providesTags, invalidatesTags)?

**Short answer:** Tags are labels that link queries and mutations.
`providesTags` says which tags a query's data belongs to. `invalidatesTags` says
which tags a mutation makes stale. Tag types must be declared in `tagTypes` on
`createApi`.

**Detailed explanation:**

- A tag is either a string such as `'Post'` or an object `{ type, id }`. The
  `id` enables granular invalidation.
- Both properties accept a function that receives `(result, error, arg)`.
- Pitfall: tag types that are not listed in `tagTypes`.
- Pitfall: using `invalidatesTags` with a tag that no query provides. Nothing
  refetches.

**Code example:**

```javascript
getPost: builder.query({
  query: (id) => `/posts/${id}`,
  providesTags: (result, error, id) => [{ type: 'Post', id }],
}),
updatePost: builder.mutation({
  query: ({ id, ...body }) => ({ url: `/posts/${id}`, method: 'PUT', body }),
  invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }],
}),
```

### 3.5.9 How do you handle loading and error states with RTK Query hooks?

**Short answer:** Query hooks return `isLoading`, `isFetching`, `isSuccess`,
`isError`, `data`, and `error`. I show a full-page spinner for `isLoading`, a
small indicator for `isFetching`, and an error message from `error` when
`isError` is true.

**Detailed explanation:**

- `data` keeps the last successful value during refetches, so the UI does not
  blank out.
- `error` is either a `FetchBaseQueryError` with `status` and `data`, or a
  `SerializedError` with `message` when code threw.
- Pitfall: reading `data.map` before checking `isError`. `data` can be
  undefined.
- Use `selectFromResult` to limit re-renders to the fields a component uses.

**Code example:**

```javascript
function Posts() {
  const { data, isLoading, isFetching, isError, error } = useGetPostsQuery();

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed: {error.status ?? error.message}</p>;

  return (
    <>
      {isFetching && <small>Refreshing...</small>}
      <ul>
        {data.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
    </>
  );
}
```

### 3.5.10 How do you make conditional queries in RTK Query?

**Short answer:** Pass `skip: true` in the hook options, or pass the `skipToken`
constant as the argument, to prevent the request until a condition is met. A
skipped query does not fetch and reports `isUninitialized`.

**Detailed explanation:**

- When `skip` flips to false, the query runs.
- `skipToken` is the type-safe choice in TypeScript, because `data` is typed
  correctly when the query runs.
- Pitfall: passing `undefined` as the argument. It sends a request with a bad
  URL such as `/posts/undefined`.

**Code example:**

```javascript
import { skipToken } from "@reduxjs/toolkit/query/react";

// Option 1: skip flag
const { data: post } = useGetPostQuery(postId, { skip: !postId });

// Option 2: skipToken, which is type-safe in TypeScript
const { data: user } = useGetUserQuery(userId ?? skipToken);
```

### 3.5.11 What is transformResponse?

**Short answer:** `transformResponse` is an optional function on a query
endpoint that reshapes the raw response before it is cached. Use it to unwrap an
envelope or normalize the shape, so components receive clean data.

**Detailed explanation:**

- The signature is `(response, meta, arg)`. It runs once per response, before
  caching.
- The companion option `transformErrorResponse` does the same for errors.
- Pitfall: changing the shape in `transformResponse` while other code still
  expects the raw shape.
- Pitfall: putting heavy computation here. It runs once per response, and the
  result is cached, so it is not repeated on every render.

**Code example:**

```javascript
getPosts: builder.query({
  query: () => '/posts?_limit=10',
  // The server returns { items: [...], total }; cache only the array
  transformResponse: (response) => response.items,
}),
```

### 3.5.12 How do you add authentication headers to RTK Query requests?

**Short answer:** Set the header in `prepareHeaders` on `fetchBaseQuery`. Read
the token from the store with `getState`, so each request uses the latest token.

**Detailed explanation:**

- `prepareHeaders` receives `(headers, { getState })`, so you can read the auth
  slice.
- Pitfall: capturing the token once when `createApi` runs. The header then goes
  stale after login or refresh.
- Security: avoid storing tokens in localStorage where XSS can read them. Prefer
  memory or httpOnly cookies.
- For refresh-token flows, wrap `baseQuery` with a function that retries after
  a 401.

**Code example:**

```javascript
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token; // read the latest token
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: () => ({}),
});
```

### 3.5.13 What is refetchOnMountOrArgChange?

**Short answer:** It is a query option that controls whether a query refetches
when the component mounts or the argument changes, even when cached data exists.
`true` always refetches, and a number sets a staleness threshold in seconds.

**Detailed explanation:**

- The default is `false`, which uses the cache if present.
- A number refetches only when cached data is older than that many seconds.
- Pitfall: setting `true` everywhere, which creates extra network traffic.
- Related options: `refetchOnFocus` and `refetchOnReconnect`. They require
  `setupListeners(store.dispatch)`.

**Code example:**

```javascript
// Always refetch when this component mounts
const { data: posts } = useGetPostsQuery(undefined, {
  refetchOnMountOrArgChange: true,
});

// Refetch only if the cached entry is older than 30 seconds
const { data: post } = useGetPostQuery(id, { refetchOnMountOrArgChange: 30 });
```

### 3.5.14 What is keepUnusedDataFor?

**Short answer:** `keepUnusedDataFor` is the number of seconds a cache entry
stays in the store after its last subscriber unmounts. The default is 60
seconds.

**Detailed explanation:**

- It can be set on the endpoint or per hook call.
- It applies only to entries with no subscribers. Active entries are never
  removed.
- Trade-off: a longer value gives instant back-navigation and uses more memory.
  A shorter value means fresher data and more requests.
- Pitfall: confusing it with a request timeout or the HTTP cache. It only
  controls the Redux cache lifetime.

**Code example:**

```javascript
getPost: builder.query({
  query: (id) => `/posts/${id}`,
  keepUnusedDataFor: 300, // keep this entry for 5 minutes after the last unmount
}),
```

### 3.5.15 How do you manually trigger a refetch in RTK Query?

**Short answer:** Call the `refetch` function returned by the query hook. For a
query that is not subscribed yet, use the lazy hook's trigger. To refetch every
query that provides a tag, dispatch `api.util.invalidateTags`.

**Detailed explanation:**

- `refetch` forces a network request regardless of the cache.
- The lazy hook `useLazyGetPostsQuery` returns `[trigger, result, lastArg]`, and
  the trigger runs the query on demand.
- `api.util.invalidateTags` is useful when the refresh must reach other
  components.
- Pitfall: calling `refetch` before the query has started. It does nothing
  useful in that case.

**Code example:**

```javascript
function Posts() {
  const { data, refetch, isFetching } = useGetPostsQuery();

  return (
    <>
      <button onClick={() => refetch()} disabled={isFetching}>
        Refresh
      </button>
      <ul>
        {data?.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
    </>
  );
}
```

## 3.6 Redux Debugging & Best Practices

### 3.6.1 What is Redux DevTools?

**Short answer:** Redux DevTools is a browser extension that shows every
dispatched action, the state before and after each action, and the diff between
them. `configureStore` enables it automatically outside production.

**Detailed explanation:**

- It is available as a browser extension and as a standalone app.
- You can inspect the action history and the state tree, and dispatch actions by
  hand.
- RTK Query cache entries show up under `state[reducerPath]`.
- Pitfall: leaving DevTools on in production exposes app state to anyone who
  opens the extension.
- Pitfall: non-serializable values in state or actions trigger RTK's
  serializable-check warnings.

**Code example:**

```javascript
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";

export const store = configureStore({
  reducer: { counter: counterReducer },
  // Enabled by default outside production; set explicitly for clarity
  devTools: process.env.NODE_ENV !== "production",
});
```

### 3.6.2 What is time-travel debugging?

**Short answer:** Time-travel debugging lets you step backward and forward
through recorded actions and see the state at each step. It works because
reducers are pure and deterministic, so replaying the same actions always
rebuilds the same state.

**Detailed explanation:**

- DevTools records the action log and rebuilds earlier states by replaying
  actions.
- Impure reducers, such as ones that read the clock or call an API, break
  replay.
- Side effects such as fetch calls are not part of the action log. Only the
  dispatched actions are.
- Pitfall: mutating state outside Immer, which makes past snapshots unreliable.

**Code example:**

```javascript
const counterReducer = (state = 0, action) =>
  action.type === "counter/increment" ? state + 1 : state;

// Replaying recorded actions rebuilds each historical state
const actions = [{ type: "counter/increment" }, { type: "counter/increment" }];
const states = actions.reduce(
  (history, action) => [...history, counterReducer(history.at(-1), action)],
  [counterReducer(undefined, { type: "@@init" })],
);
// states -> [0, 1, 2]
```

### 3.6.3 What is the difference between local state and global state?

**Short answer:** Local state lives in one component, through `useState` or
`useReducer`, and only that component needs it. Global state is shared across
distant components or must survive navigation, so it lives in a store. Keep
state as local as possible and promote it only when needed.

**Detailed explanation:**

- Local examples: input text, a modal's open flag, hover state.
- Global examples: the logged-in user, the cart, server data used on several
  pages.
- Server state and client state are different. RTK Query handles the server
  side.
- Pitfall: putting everything in Redux. This adds boilerplate and extra
  re-renders.
- Pitfall: keeping shared data in local state, which causes long chains of prop
  drilling.

**Code example:**

```javascript
// Local: only this form needs it
const [query, setQuery] = useState("");

// Global: the header, the cart page, and checkout all read the cart
const items = useSelector((state) => state.cart.items);
```

### 3.6.4 How do you structure Redux folders/files (Ducks pattern, feature-based)?

**Short answer:** I use feature-based folders, where each feature keeps its
slice, selectors, tests, and components together. The Ducks pattern groups
types, actions, and reducer for each domain in one module. RTK's `createSlice`
removes most of the reason for Ducks.

**Detailed explanation:**

- Keep store setup in `app/store.js`.
- Export only the public API from each feature, such as the slice actions,
  reducer, and selectors.
- Ducks is still valid. It is just less common now that `createSlice` generates
  actions and reducers.
- Pitfall: deep imports into another feature's internals, which creates circular
  dependencies.

**Code example:**

```text
src/
  app/
    store.js
  features/
    cart/
      cartSlice.js
      cartSelectors.js
      CartPage.jsx
      cartSlice.test.js
```

### 3.6.5 What is the "feature slice" pattern in RTK?

**Short answer:** Each feature owns one `createSlice` that defines its state,
reducers, and actions. The root store combines the slices, and components import
only from the feature's public exports.

**Detailed explanation:**

- The slice name becomes the action type prefix, such as `cart/addItem`, which
  avoids collisions.
- `extraReducers` lets a slice respond to actions from other slices or from
  thunks, which keeps slices decoupled.
- Pitfall: one slice reading another slice's internal shape. Use selectors on
  the root state instead.

**Code example:**

```javascript
// features/cart/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] },
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload); // Immer makes this safe
    },
  },
});

export const { addItem } = cartSlice.actions;
export default cartSlice.reducer;
```

### 3.6.6 How do you handle pagination in Redux?

**Short answer:** Keep the page number or cursor in state or in the query
arguments, and fetch each page as its own request. For infinite scroll, use RTK
Query's `serializeQueryArgs`, `merge`, and `forceRefetch` to append pages into
one cache entry.

**Detailed explanation:**

- Offset pagination passes `{ page, limit }` as arguments. Each page is cached
  under its own key.
- Store `total` or `hasMore` from the response to know when to stop.
- Pitfall: appending pages again on re-render, which creates duplicates. Merge
  only when a new page arrives.
- Pitfall: keeping the old items when the filter changes. Include the filter in
  the cache key and reset.

**Code example:**

```javascript
getPosts: builder.query({
  query: ({ page, limit = 10 }) => `/posts?_page=${page}&_limit=${limit}`,
  // One cache entry per filter; pages are merged into it
  serializeQueryArgs: ({ queryArgs, endpointName }) =>
    `${endpointName}(${queryArgs.filter})`,
  merge: (currentCache, newItems) => {
    currentCache.push(...newItems);
  },
  // Refetch when the page changes
  forceRefetch: ({ currentArg, previousArg }) =>
    currentArg?.page !== previousArg?.page,
}),
```

### 3.6.7 How do you persist Redux state (e.g., using redux-persist)?

**Short answer:** Wrap the root reducer with `persistReducer`, persist only the
slices that should survive a reload, and wrap the app in `PersistGate` so
rendering waits for rehydration. Do not persist server caches that can be
refetched.

**Detailed explanation:**

- Use `whitelist` to choose which slices to save. Persisting the RTK Query slice
  is usually unnecessary.
- Redux Toolkit's serializable check warns about redux-persist actions unless
  you ignore them.
- Pitfall: storing tokens in localStorage, which exposes them to XSS.
- Pitfall: changing the state shape without a migration. The old saved state
  overwrites the new initial state.

**Code example:**

```javascript
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { PersistGate } from "redux-persist/integration/react";
import cartReducer from "./features/cart/cartSlice";
import { api } from "./services/api";

const rootReducer = combineReducers({
  cart: cartReducer,
  [api.reducerPath]: api.reducer,
});
const persistConfig = { key: "root", storage, whitelist: ["cart"] };

export const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
});

export const persistor = persistStore(store);
// In main.jsx: <PersistGate loading={null} persistor={persistor}><App /></PersistGate>
```

### 3.6.8 What is a selector? Why should you co-locate selectors with slices?

**Short answer:** A selector is a function that reads or derives a value from
the state. Putting selectors next to the slice means the slice owns its state
shape, so a change to that shape is fixed in one place.

**Detailed explanation:**

- A selector takes the root state and returns a value, so it is a pure function.
- Use `createSelector` for derived values. It memoizes the result and recomputes
  only when its inputs change.
- Pitfall: returning a new object or array from a selector without memoization.
  That triggers re-renders on every store update.
- Pitfall: writing `state.cart.items` in many components. A selector rename then
  breaks many files.

**Code example:**

```javascript
// features/cart/cartSelectors.js
import { createSelector } from "@reduxjs/toolkit";

export const selectCartItems = (state) => state.cart.items;

// Recomputes only when the items array changes
export const selectCartTotal = createSelector([selectCartItems], (items) =>
  items.reduce((sum, item) => sum + item.price * item.qty, 0),
);
```

### 3.6.9 How do you test Redux reducers?

**Short answer:** Reducers are pure functions, so I call
`reducer(state, action)` directly and assert on the returned state. No store or
React rendering is needed. I build actions with the slice's action creators, so
tests stay in sync with the code.

**Detailed explanation:**

- Calling the reducer with `undefined` state checks the initial state.
- Test each reducer case, plus an unknown action that returns the same state.
- Test selectors separately from reducers.
- Pitfall: testing through the whole store when a direct reducer call is simpler
  and faster.

**Code example:**

```javascript
import { describe, it, expect } from "vitest";
import reducer, { addItem } from "./cartSlice";

describe("cart reducer", () => {
  it("returns the initial state", () => {
    expect(reducer(undefined, { type: "@@init" })).toEqual({ items: [] });
  });

  it("adds an item", () => {
    const state = reducer(undefined, addItem({ id: 1, qty: 1 }));
    expect(state.items).toHaveLength(1);
  });
});
```

### 3.6.10 How do you test async thunks?

**Short answer:** Dispatch the thunk to a real store with the slice reducer,
mock the network call, await the dispatch, and assert on the final state. Mock
the network layer, such as `fetch` or MSW, rather than the thunk itself, so the
pending, fulfilled, and rejected paths all run.

**Detailed explanation:**

- `await store.dispatch(thunk)` resolves after the thunk finishes. Forgetting
  `await` makes the assertion run too early.
- Test both success and failure, where `fetch` returns `ok: false`.
- Restore globals after each test to avoid leaking mocks.
- Pitfall: asserting on the thunk's return value instead of the state it writes.

**Code example:**

```javascript
import { configureStore } from "@reduxjs/toolkit";
import { it, expect, vi, afterEach } from "vitest";
import usersReducer, { fetchUsers } from "./usersSlice";

afterEach(() => vi.unstubAllGlobals());

it("stores users when the request succeeds", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, name: "Ana" }],
    }),
  );

  const store = configureStore({ reducer: { users: usersReducer } });
  await store.dispatch(fetchUsers());

  expect(store.getState().users.items).toHaveLength(1);
});
```

## 4 Mixed / Integration Questions

### 4.1 How does React's useReducer compare to Redux?

**Short answer:** `useReducer` is React's built-in reducer hook for state that
belongs to one component or subtree. Redux is an external global store with
middleware, DevTools, and selector-based subscriptions. They share the same
reducer idea, so `useReducer` is the lighter choice when global access is not
needed.

**Detailed explanation:**

- Both use `(state, action) => newState` and a dispatch function.
- `useReducer` state is scoped to the component. Passing dispatch down needs
  props or context.
- Redux components subscribe to slices of the store with selectors, so only the
  affected components re-render.
- Redux adds middleware for async work, time-travel debugging, and persistence.
- Pitfall: Context plus `useReducer` works for small global state, but every
  consumer re-renders when the value changes.

**Code example:**

```javascript
// useReducer: local to one component
const [state, dispatch] = useReducer(reducer, initialState);

// Redux: store-wide, with selector-based subscription
const count = useSelector((s) => s.counter.value);
const reduxDispatch = useDispatch();
reduxDispatch(increment());
```

### 4.2 Build a counter app using Redux Toolkit from scratch

**Short answer:** I create a `counterSlice` with `createSlice`, register its
reducer in `configureStore`, wrap the app in `Provider`, and use `useSelector`
and `useDispatch` in the component. Those four steps are the whole loop.

**Detailed explanation:**

- `createSlice` generates the action creators and the reducer. Immer lets the
  reducers use direct assignment.
- `configureStore` sets up Redux DevTools and the default middleware.
- `Provider` makes the store available to every component.
- Pitfall: forgetting `Provider`, which causes "could not find react-redux
  context value" errors.

**Code example:**

```javascript
// features/counter/counterSlice.js
import { createSlice, configureStore } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
  },
});

export const { increment, decrement } = counterSlice.actions;
export const store = configureStore({
  reducer: { counter: counterSlice.reducer },
});

// Component: uses useSelector and useDispatch, and is wrapped in <Provider store={store}>
```

### 4.3 How would you migrate a useState app to use Redux?

**Short answer:** I migrate incrementally. First I find state that several
components read or write, then move that state into a slice, and replace setter
calls with dispatched actions. Local UI state such as input text stays in
`useState`.

**Detailed explanation:**

- Step 1: audit the state and classify each item as local or shared.
- Step 2: add the store and `Provider` without changing behavior.
- Step 3: move one feature at a time, starting with the most shared state.
- Step 4: move update logic into reducers, and remove prop drilling.
- Pitfall: keeping a copy of the same data in both Redux and `useState`. That
  creates two sources of truth.

**Code example:**

```javascript
// Before: state lifted into a parent and passed down through props
const [user, setUser] = useState(null);

// After: shared state in a slice
const user = useSelector(selectUser);
const dispatch = useDispatch();
dispatch(userLoggedIn(data));
```

### 4.4 How would you implement authentication (login/logout) using Redux?

**Short answer:** I create an auth slice that holds the user, the token, and a
request status. A `createAsyncThunk` calls the login API and stores the result.
Logout resets the auth state and the RTK Query cache.

**Detailed explanation:**

- Keep the token in memory or an httpOnly cookie. localStorage is readable by
  any injected script.
- Route guards read a selector such as `selectIsAuthenticated`.
- On logout, dispatch `api.util.resetApiState()`, so the next user does not see
  cached data from the previous user.
- Pitfall: clearing the auth slice but leaving user data in other slices.

**Code example:**

```javascript
export const login = createAsyncThunk(
  "auth/login",
  async (creds, { rejectWithValue }) => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creds),
    });
    if (!res.ok) return rejectWithValue("Invalid credentials");
    return res.json(); // expected shape: { user, token }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: null, status: "idle", error: null },
  reducers: {
    logout: () => ({ user: null, token: null, status: "idle", error: null }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.status = "succeeded";
        Object.assign(s, a.payload);
      })
      .addCase(login.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload;
      });
  },
});
```

### 4.5 How do you share state between sibling components using Redux?

**Short answer:** I put the shared value in a slice. Both siblings read it with
`useSelector` and update it with `dispatch`. Neither sibling needs a common
parent to pass props, and neither needs to know about the other.

**Detailed explanation:**

- Each sibling re-renders only when its selected value changes.
- Keep the shared state minimal, such as an ID instead of a full object copy.
- Pitfall: lifting state into a common parent and passing props when the
  siblings are deep in the tree.
- Pitfall: using Context for values that change often. Every consumer
  re-renders.

**Code example:**

```javascript
// features/selection/selectionSlice.js
const selectionSlice = createSlice({
  name: "selection",
  initialState: { selectedId: null },
  reducers: {
    selectItem: (state, action) => {
      state.selectedId = action.payload;
    },
  },
});
export const { selectItem } = selectionSlice.actions;

// SiblingA.jsx: writes the value
const dispatch = useDispatch();
<button onClick={() => dispatch(selectItem(7))}>Pick 7</button>;

// SiblingB.jsx: reads the value
const selectedId = useSelector((state) => state.selection.selectedId);
```

### 4.6 What happens when you call dispatch inside a useEffect?

**Short answer:** `dispatch` sends the action through the middleware to the
reducer, updates the store, and notifies subscribed components. Dispatching
inside `useEffect` is normal for side effects such as fetching data. The danger
is an effect that dispatches an action that changes its own dependency, which
causes an infinite loop.

**Detailed explanation:**

- Effects run after render. The dispatch then triggers a re-render of components
  that read the changed state.
- `dispatch` is stable, so listing it in the dependency array is safe and
  satisfies the linter.
- Pitfall: an effect that dispatches on every change of a value it also updates,
  such as `count`.
- Pitfall: dispatching during render. That is a side effect in the render phase,
  and it breaks React's purity rules.
- Strict Mode runs effects twice in development, so the dispatched actions
  should be safe to repeat.

**Code example:**

```javascript
useEffect(() => {
  dispatch(fetchUsers()); // runs once after mount
}, [dispatch]); // dispatch is stable, so this is safe

// Anti-pattern: loops forever, because each dispatch changes count
// useEffect(() => { dispatch(increment()); }, [count]);
```

### 4.7 How would you implement a shopping cart with Redux Toolkit?

**Short answer:** I create a cart slice with items keyed by product ID and a
quantity for each. Reducers handle add, remove, quantity change, and clear.
Memoized selectors compute the count and total. Product data comes from RTK
Query, and checkout runs as a mutation.

**Detailed explanation:**

- Store product IDs and quantities, not full product copies. The product data is
  then always fresh.
- Incrementing quantity on a repeat add avoids duplicate lines.
- The server calculates the final total at checkout. The client total is for
  display only.
- Clear the cart after a successful checkout mutation.
- Pitfall: trusting client-side prices. Always verify totals on the server.

**Code example:**

```javascript
const cartSlice = createSlice({
  name: "cart",
  initialState: { items: {} }, // { [productId]: quantity }
  reducers: {
    addToCart: (state, action) => {
      const id = action.payload;
      state.items[id] = (state.items[id] ?? 0) + 1;
    },
    removeFromCart: (state, action) => {
      delete state.items[action.payload];
    },
    clearCart: (state) => {
      state.items = {};
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
```

### 4.8 How do you handle form state — local state or Redux?

**Short answer:** I default to local state, with `useState` or React Hook Form,
because input values are transient and only the form needs them. I move form
data into Redux only when distant components need it, such as a multi-step
wizard that must survive route changes.

**Detailed explanation:**

- Putting every keystroke into Redux dispatches an action per character and
  re-renders subscribers.
- Submission results, such as a saved status or server errors, can go to Redux
  or to the RTK Query mutation state.
- A multi-step draft that spans routes belongs in a slice, ideally persisted.
- Pitfall: putting all form inputs in Redux by habit. It adds code and
  re-renders without benefit.

**Code example:**

```javascript
// Local: fast, scoped, no store writes per keystroke
const [name, setName] = useState("");

// Redux: a multi-step draft shared across routes
const draft = useSelector((state) => state.signupDraft);
dispatch(updateDraft({ step: 2, email }));
```

### 4.9 When would you use useContext instead of Redux?

**Short answer:** I use `useContext` for values that change rarely and are
needed app-wide or across a subtree, such as theme, locale, or the current user.
I use Redux when state changes often, needs selective subscriptions, or needs
middleware and DevTools.

**Detailed explanation:**

- Context re-renders every consumer when its value changes. Redux selectors
  limit re-renders to the components that read the changed value.
- Context is simple and adds no dependency, which suits configuration values.
- Pitfall: passing a new object literal as the Provider value on every render.
  Memoize it.
- Context and `useReducer` together can handle a scoped feature without Redux.

**Code example:**

```javascript
const ThemeContext = createContext("light");

function App() {
  const [theme, setTheme] = useState("light");
  // Memoized, so consumers do not re-render on unrelated App renders
  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <Page />
    </ThemeContext.Provider>
  );
}

function Page() {
  const { theme } = useContext(ThemeContext);
  return <main className={theme}>Content</main>;
}
```

### 4.10 How do you combine RTK Query with custom slices in the same store?

**Short answer:** I register the API slice's reducer under its `reducerPath` and
its middleware alongside the custom slices in `configureStore`. Both live in one
store, so components can use RTK Query hooks and `useSelector` together.

**Detailed explanation:**

- Add `[api.reducerPath]: api.reducer` to the reducer map, and concat
  `api.middleware`.
- Custom slices can react to RTK Query results with `addMatcher` and the
  `matchFulfilled` matcher.
- Keep server data in RTK Query and UI state, such as filters, in custom slices.
- Pitfall: forgetting the middleware. Caching, polling, and invalidation stop
  working.
- Pitfall: copying server responses into a custom slice. That creates two
  sources of truth.

**Code example:**

```javascript
const filtersSlice = createSlice({
  name: "filters",
  initialState: { query: "", lastLoaded: 0 },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
  },
  extraReducers: (builder) => {
    // React to a successful RTK Query fetch
    builder.addMatcher(
      api.endpoints.getPosts.matchFulfilled,
      (state, { payload }) => {
        state.lastLoaded = payload.length;
      },
    );
  },
});

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer, // RTK Query cache
    filters: filtersSlice.reducer, // custom UI slice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
```

## Coding Challenge Questions

### C.1 Build a counter with increment, decrement, and reset using useState

**Short answer:** I keep the count in one `useState` value. Increment and
decrement use functional updates so rapid clicks never use a stale value, and
reset sets the count back to zero.

**Detailed explanation:**

- The functional form `setCount((c) => c + 1)` reads the latest state, which
  matters when updates batch together.
- Reset sets a constant, so it needs no updater.
- Pitfall: writing `setCount(count + 1)` inside a handler that runs several
  times in one event. The updates overwrite each other.

**Code example:**

```javascript
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount((c) => c - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
}
```

### C.2 Fetch and display a list of users from an API using useEffect

**Short answer:** I fetch inside `useEffect` with an empty dependency array so
it runs once after mount. An AbortController cancels the request on unmount, and
the component tracks loading, error, and success states.

**Detailed explanation:**

- The cleanup function aborts the request, which prevents setting state on an
  unmounted component.
- Check `res.ok`, because `fetch` only rejects on network failure, not on HTTP
  404 or 500.
- In React 18 Strict Mode, the effect runs twice in development. The first
  request is aborted, which is expected.
- Pitfall: omitting the dependency array. The effect then fetches after every
  render.

**Code example:**

```javascript
import { useEffect, useState } from "react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("https://jsonplaceholder.typicode.com/users", {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setStatus("success");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setStatus("error");
      });

    return () => controller.abort();
  }, []);

  if (status === "loading") return <p>Loading...</p>;
  if (status === "error") return <p>Error: {error}</p>;

  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>
          {u.name} ({u.email})
        </li>
      ))}
    </ul>
  );
}
```

### C.3 Build a search/filter feature using controlled inputs

**Short answer:** The input's value lives in React state, and every change
updates it, so the input is controlled. The list is derived from that state with
a filter, so there is one source of truth and no duplicated results.

**Detailed explanation:**

- A controlled input sets `value` from state and updates state in `onChange`.
- Derive the filtered list during render instead of storing it in state.
- `useMemo` caches the filter result, which only helps with large lists. It is
  shown here for clarity.
- Trim and lowercase the query so matching ignores case and stray spaces.
- Pitfall: storing the filtered list in separate state. It can drift out of sync
  with the query.

**Code example:**

```javascript
import { useMemo, useState } from "react";

const FRUITS = ["Apple", "Banana", "Cherry", "Grape", "Mango", "Orange"];

export default function Search() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FRUITS.filter((fruit) => fruit.toLowerCase().includes(q));
  }, [query]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search fruits"
      />
      {results.length === 0 && <p>No matches</p>}
      <ul>
        {results.map((fruit) => (
          <li key={fruit}>{fruit}</li>
        ))}
      </ul>
    </div>
  );
}
```

### C.4 Create a custom useLocalStorage hook

**Short answer:** The hook works like `useState`, but it reads its initial value
from localStorage and writes every change back. It parses JSON and falls back to
the initial value when storage is empty, corrupt, or unavailable.

**Detailed explanation:**

- The lazy initializer `useState(() => ...)` reads storage once, not on every
  render.
- The effect writes whenever the key or value changes.
- Wrap storage calls in try/catch. Storage can be blocked, full, or throw in
  private windows.
- Pitfall: calling `JSON.parse` on a raw string that was never serialized. Store
  values with `JSON.stringify`.
- Pitfall: reading storage on every render instead of once, which is slow and
  can cause mismatches.

**Code example:**

```javascript
import { useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue; // corrupt JSON or storage blocked
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or storage disabled: keep working in memory
    }
  }, [key, value]);

  return [value, setValue];
}

// Usage:
// const [theme, setTheme] = useLocalStorage('theme', 'light');
```

### C.5 Create a custom useFetch hook

**Short answer:** The hook takes a URL, fetches it in an effect, and returns a
`{ data, error, loading }` object. It aborts stale requests when the URL changes
or the component unmounts, so an old response cannot overwrite a newer one.

**Detailed explanation:**

- Return one state object so the three fields update together and do not
  flicker.
- Reset the state at the start of each new URL.
- Skip the request when `url` is falsy, which supports conditional fetching.
- Pitfall: no cleanup. A slow response for an old URL can then overwrite the
  current data.
- Pitfall: not checking `res.ok`. Error pages then appear as valid data.

**Code example:**

```javascript
import { useEffect, useState } from "react";

export function useFetch(url) {
  const [state, setState] = useState({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    setState({ data: null, error: null, loading: true });

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((err) => {
        if (err.name !== "AbortError") {
          setState({ data: null, error: err.message, loading: false });
        }
      });

    return () => controller.abort();
  }, [url]);

  return state;
}

// Usage: const { data, error, loading } = useFetch('/api/posts');
```

### C.6 Build a multi-step form in React

**Short answer:** All form values live in one state object in the parent, and a
`step` index decides which fields to render. Next and Back change the index.
Submit only runs on the final step, so pressing Enter early does not submit the
form.

**Detailed explanation:**

- One `update` handler works for every input because each input has a `name`.
- Conditional rendering shows one step at a time, and the form state survives
  step changes.
- Buttons use `type="button"` except Submit, so they do not submit the form by
  accident.
- The submit handler advances instead of submitting when the form is not on its
  last step.
- Pitfall: validating only at the end. Validate each step before calling `next`.

**Code example:**

```javascript
import { useState } from "react";

const STEPS = ["Account", "Profile", "Review"];

export default function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ email: "", name: "" });

  const update = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = (e) => {
    e.preventDefault();
    if (step < STEPS.length - 1) return next(); // Enter key on an early step
    alert(JSON.stringify(form));
  };

  return (
    <form onSubmit={submit}>
      <h2>
        Step {step + 1}: {STEPS[step]}
      </h2>
      {step === 0 && (
        <input
          name="email"
          value={form.email}
          onChange={update}
          placeholder="Email"
        />
      )}
      {step === 1 && (
        <input
          name="name"
          value={form.name}
          onChange={update}
          placeholder="Name"
        />
      )}
      {step === 2 && <pre>{JSON.stringify(form, null, 2)}</pre>}

      <div>
        {step > 0 && (
          <button type="button" onClick={back}>
            Back
          </button>
        )}
        {step < STEPS.length - 1 && (
          <button type="button" onClick={next}>
            Next
          </button>
        )}
        {step === STEPS.length - 1 && <button type="submit">Submit</button>}
      </div>
    </form>
  );
}
```

### C.7 Implement protected routes using React Router

**Short answer:** I wrap private routes in a layout route that renders
`<Outlet />` when the user is authenticated and `<Navigate to="/login" />` when
not. The original location is passed in state, so login can return the user to
the page they wanted.

**Detailed explanation:**

- A pathless layout route groups the protected children without adding a URL
  segment.
- `replace` on `Navigate` avoids leaving the protected URL in the history stack.
- `useLocation` captures where the user was headed.
- Pitfall: checking auth only in the component. The URL is still reachable in
  some setups, so guard at the route level.
- In a real app, `isAuthed` comes from the auth store, not from a one-time read
  of localStorage.

**Code example:**

```javascript
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

const Login = () => <h1>Login</h1>;
const Dashboard = () => <h1>Dashboard</h1>;
const Settings = () => <h1>Settings</h1>;

function RequireAuth({ isAuthed }) {
  const location = useLocation();
  if (!isAuthed) {
    // Remember where the user was going so login can redirect back
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export default function App() {
  const isAuthed = !!localStorage.getItem("token"); // placeholder auth

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth isAuthed={isAuthed} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### C.8 Build a Todo app using useReducer

**Short answer:** The todo list is state managed by a pure reducer with add,
toggle, and remove actions. The component dispatches actions and never mutates
the array, so every change returns a new list and React re-renders correctly.

**Detailed explanation:**

- The reducer returns new arrays and objects, which React needs to detect
  changes.
- The `default` case throws, so a mistyped action type fails loudly.
- `crypto.randomUUID()` gives unique IDs. `Date.now()` can collide when two
  todos are added in the same millisecond.
- The form-input text stays in `useState` because it is transient and only this
  component uses it.
- Pitfall: mutating the array inside the reducer with `push` or `splice`. React
  then skips the re-render.

**Code example:**

```javascript
import { useReducer, useState } from "react";

function todoReducer(state, action) {
  switch (action.type) {
    case "add":
      return [
        ...state,
        { id: crypto.randomUUID(), text: action.text, done: false },
      ];
    case "toggle":
      return state.map((t) =>
        t.id === action.id ? { ...t, done: !t.done } : t,
      );
    case "remove":
      return state.filter((t) => t.id !== action.id);
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

export default function Todos() {
  const [todos, dispatch] = useReducer(todoReducer, []);
  const [text, setText] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch({ type: "add", text: text.trim() });
    setText("");
  };

  return (
    <div>
      <form onSubmit={handleAdd}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="New todo"
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <label>
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => dispatch({ type: "toggle", id: t.id })}
              />
              <span
                style={{ textDecoration: t.done ? "line-through" : "none" }}
              >
                {t.text}
              </span>
            </label>
            <button onClick={() => dispatch({ type: "remove", id: t.id })}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### C.9 Rebuild the Todo app using Redux Toolkit

**Short answer:** The todos become a `todos` slice with `createSlice`. Reducers
use Immer, so they can write direct mutations, and the `prepare` callback
generates the ID. The component reads with `useSelector` and writes with
`useDispatch`, so the state lives outside the component.

**Detailed explanation:**

- `prepare` keeps the ID generation out of the reducer, which keeps the reducer
  pure.
- `nanoid` is re-exported by Redux Toolkit, so no extra package is needed.
- Keep the todo state as a flat array here. Switch to `createEntityAdapter` if
  the list grows or needs lookups by ID.
- Wrap the app in `Provider` with the store.
- Pitfall: returning a value and also mutating the draft in the same reducer.
  Immer throws an error for that.

**Code example:**

```javascript
// features/todos/todosSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";

const todosSlice = createSlice({
  name: "todos",
  initialState: [],
  reducers: {
    todoAdded: {
      reducer: (state, action) => {
        state.push(action.payload);
      },
      prepare: (text) => ({ payload: { id: nanoid(), text, done: false } }),
    },
    todoToggled: (state, action) => {
      const todo = state.find((t) => t.id === action.payload);
      if (todo) todo.done = !todo.done;
    },
    todoRemoved: (state, action) =>
      state.filter((t) => t.id !== action.payload),
  },
});

export const { todoAdded, todoToggled, todoRemoved } = todosSlice.actions;
export const selectTodos = (state) => state.todos;
export default todosSlice.reducer;
```

```javascript
// app/store.js
import { configureStore } from "@reduxjs/toolkit";
import todosReducer from "../features/todos/todosSlice";

export const store = configureStore({ reducer: { todos: todosReducer } });
// In main.jsx: <Provider store={store}><App /></Provider>
```

```javascript
// features/todos/Todos.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { todoAdded, todoToggled, todoRemoved, selectTodos } from "./todosSlice";

export default function Todos() {
  const todos = useSelector(selectTodos);
  const dispatch = useDispatch();
  const [text, setText] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch(todoAdded(text.trim()));
    setText("");
  };

  return (
    <div>
      <form onSubmit={handleAdd}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="New todo"
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <label>
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => dispatch(todoToggled(t.id))}
              />
              <span
                style={{ textDecoration: t.done ? "line-through" : "none" }}
              >
                {t.text}
              </span>
            </label>
            <button onClick={() => dispatch(todoRemoved(t.id))}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### C.10 Add RTK Query to fetch and display posts from a REST API

**Short answer:** I define a `postsApi` with `createApi` and `fetchBaseQuery`,
add its reducer and middleware to the store, and use the generated
`useGetPostsQuery` hook in the component. RTK Query handles loading, caching,
and errors. A mutation invalidates the list tag so the list refetches after a
write.

**Detailed explanation:**

- `providesTags` tags each post and the LIST collection, so a POST can
  invalidate the list.
- Adding the API middleware is required for caching, polling, and invalidation.
- Use `unwrap()` on the mutation to catch errors with try/catch.
- JSONPlaceholder accepts POST but does not persist it, so the refetched list
  may not show the new post. A real backend would.
- Pitfall: forgetting `tagTypes`, so the tags do nothing.

**Code example:**

```javascript
// services/postsApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const postsApi = createApi({
  reducerPath: "postsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://jsonplaceholder.typicode.com",
  }),
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: (limit = 10) => `/posts?_limit=${limit}`,
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: "Post", id })),
        { type: "Post", id: "LIST" },
      ],
    }),
    addPost: builder.mutation({
      query: (body) => ({ url: "/posts", method: "POST", body }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
    }),
  }),
});

export const { useGetPostsQuery, useAddPostMutation } = postsApi;
```

```javascript
// app/store.js
import { configureStore } from "@reduxjs/toolkit";
import { postsApi } from "../services/postsApi";

export const store = configureStore({
  reducer: { [postsApi.reducerPath]: postsApi.reducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(postsApi.middleware),
});
```

```javascript
// features/posts/Posts.jsx
import { useState } from "react";
import { useGetPostsQuery, useAddPostMutation } from "../../services/postsApi";

export default function Posts() {
  const {
    data: posts = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetPostsQuery(10);
  const [addPost, { isLoading: isAdding }] = useAddPostMutation();
  const [title, setTitle] = useState("");

  if (isLoading) return <p>Loading posts...</p>;
  if (isError) {
    return (
      <p>
        Could not load posts. <button onClick={() => refetch()}>Retry</button>
      </p>
    );
  }

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await addPost({ title: title.trim(), body: "new", userId: 1 }).unwrap();
      setTitle("");
    } catch {
      alert("Add failed");
    }
  };

  return (
    <section>
      <form onSubmit={handleAdd}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
        />
        <button disabled={isAdding}>Add</button>
      </form>
      {isFetching && <small>Refreshing...</small>}
      <ul>
        {posts.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
    </section>
  );
}
```
