# Spring Boot Basics - Notes

## 1. `toString()` - How an object becomes text

- Every Java class inherits `Object.toString()`, which returns `ClassName@hexHash`.
  Example: `com.ecommerce.project.model.Category@25576170`.
- That default output never reads the object's fields, so it tells you nothing about the data.
- Overriding `toString()` tells Java how to build the text from the fields:

```java
@Override
public String toString() {
    return "Category{categoryId=" + categoryId + ", categoryName='" + categoryName + "'}";
}
```

- `toString()` does not store or set any values. It only formats values that already exist.
- Whenever an object is used in string concatenation or printed (`"x" + obj`, `System.out.println(obj)`, `String.valueOf(obj)`), Java calls `toString()` automatically.
- A `List` prints each element by calling each element's `toString()`.
- IntelliJ can generate it: right-click in the class -> **Generate** -> **toString()** (or `Alt+Insert`).

## 2. Why `categoryId` is `null` but `categoryName` has a value

- Fields are filled by setters or the constructor. `toString()` only reads them.
- When a POST request arrives, Spring does this:
  1. Reads the JSON body, for example `{"categoryName": "Electronics"}`.
  2. Creates an object with the no-arg constructor: `new Category()`.
  3. For each key in the JSON, calls the matching setter: `setCategoryName("Electronics")`.
  4. Any field whose key is not in the JSON is never set, so it stays `null` (for objects) or `0` (for primitives).
- So `categoryId` is `null` because the request body did not contain `categoryId`.
- To set it, send it in the body: `{"categoryId": 1, "categoryName": "Electronics"}`.

Manual equivalent without Spring:

```java
Category c = new Category();
c.setCategoryName("Electronics");
System.out.println(c);   // Category{categoryId=null, categoryName='Electronics'}
```

## 3. `@RequestBody` - JSON to Java object

- `@RequestBody` tells Spring to convert the incoming JSON body into the given Java object.
- The conversion is done by Jackson (the default JSON library in Spring Boot).
- Jackson needs a no-arg constructor and setters (or getters/fields it can access).

## 4. `@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping`

- `@RestController` = `@Controller` + `@ResponseBody`. Return values are written directly to the HTTP response (as JSON for objects and lists).
- `@RequestMapping("/api")` sets a base path for the whole class.
- `@GetMapping("/public/categories")` handles HTTP GET on `/api/public/categories`.
- `@PostMapping("/public/categories")` handles HTTP POST on the same path.
- Returning a `String` sends plain text. Returning an object or `List` sends JSON.

## 5. In-memory list (learning-only storage)

- `private List<Category> categoryList = new ArrayList<>();` lives only in memory.
- Data is lost when the application restarts.
- `ArrayList` is not thread-safe. Concurrent requests can corrupt it. Production code uses a database (JPA/Hibernate) instead.

## 6. Printing a list

- Concatenation or `println` on a `List` calls `toString()` on the list, which calls `toString()` on each element.
- Returning the list from a `@GetMapping` method is better for APIs: Spring converts it to a JSON array automatically.

---

## Interview Questions

**Q1. What is the default `toString()` in Java?**
It is `Object.toString()`, which returns `getClass().getName() + "@" + Integer.toHexString(hashCode())`. It does not show the field values.

**Q2. Does overriding `toString()` set field values?**
No. It only controls the text representation. Values are set by constructors or setters.

**Q3. Why was `categoryId` null in the output?**
The request JSON did not include `categoryId`, so Jackson never called `setCategoryId`. Fields not present in the input stay at their default value.

**Q4. How does Spring turn a JSON body into a Java object?**
Jackson reads the JSON, creates the object with the no-arg constructor, and calls the setters for each matching key. `@RequestBody` triggers this.

**Q5. What is the difference between `@Controller` and `@RestController`?**
`@RestController` = `@Controller` + `@ResponseBody`. Return values are written to the response body instead of being resolved as view names.

**Q6. Why does a method returning `List<Category>` produce JSON?**
`@RestController` applies `@ResponseBody`, and Jackson serializes the list to a JSON array using the getters.

**Q7. What happens if a class has no getters?**
Jackson cannot read the fields for serialization by default, so the JSON output is empty (or it throws an error, depending on configuration).

**Q8. What is the difference between `@GetMapping` and `@PostMapping`?**
GET is for reading data and sends no body. POST is for creating data and usually carries a JSON body read with `@RequestBody`.

**Q9. Why is an in-memory `ArrayList` a problem in a web app?**
Data is lost on restart, and `ArrayList` is not thread-safe when many requests modify it at the same time.

**Q10. When does Java call `toString()` automatically?**
When an object is used in string concatenation, passed to `println`, or placed inside a collection that is printed.

---

## 7. `List` and `ArrayList`

- `List<T>` is an ordered collection that allows duplicates and access by index. It is an interface.
- `ArrayList<T>` is the class that implements `List` using a resizable array.
- `private List<Category> categoryList = new ArrayList<>();` creates an empty list that holds only `Category` objects.

Common operations:

| Operation | Meaning |
|---|---|
| `add(x)` | Appends `x` to the end |
| `get(i)` | Returns the item at index `i` (starts at 0) |
| `size()` | Number of items |
| `remove(i)` | Removes the item at index `i` |

- A list stores **references** to objects, not copies. Changing the object changes what the list shows.
- `get(size()-1)` returns the last item.
- `get(i)` throws `IndexOutOfBoundsException` if `i` is out of range.

### Walkthrough: two POST requests

- **Request 1:** `{"categoryName": "Electronics"}`
  1. Jackson creates `Category` object **A** and sets `categoryName` to `"Electronics"`.
  2. `categoryList.add(A)` stores a reference to A at index 0.
  3. List: `[A]`
- **Request 2:** `{"categoryName": "Books"}`
  1. Jackson creates a new object **B** with `categoryName = "Books"`.
  2. `categoryList.add(B)` stores a reference to B at index 1.
  3. List: `[A, B]`
- With size 2, `get(size()-1)` is `get(1)`, which is B.

### List in the web app: shared state and thread safety

- `CategoryController` is a singleton bean, so every request shares the same `categoryList`.
- Data survives between requests but is cleared on restart.
- `ArrayList` is not thread-safe. Concurrent adds can lose or corrupt data. Use a database or a thread-safe collection in production.

## 8. How `categoryList` holds category data

- Each POST creates a new `Category` from the JSON and calls `categoryList.add(...)`.
- Example: POST `{"categoryName":"Electronics"}` then POST `{"categoryName":"Books"}` gives `[Category(Electronics), Category(Books)]`.
- `CategoryController` is a Spring singleton bean, so one `categoryList` is shared by all requests.
- The data lives in memory only while the application runs.

## 9. GET returns the list as JSON

- `getAllCategoryList()` returns the list. `@RestController` passes it to Jackson.
- Jackson converts the list to a JSON array by calling each object's getters.

## 10. List concepts - Interview Questions

**Q11. What is the difference between `List` and `ArrayList`?**
`List` is the interface (the contract). `ArrayList` is one implementation of it, backed by a resizable array.

**Q12. Does a `List` store copies of objects?**
No. It stores references to the same objects. Changing an object through one reference changes it everywhere.

**Q13. Why is `categoryList` shared between requests?**
The controller is a singleton bean, so Spring creates one instance and uses its single `categoryList` field for every request.

**Q14. What happens if you call `get(0)` on an empty list?**
It throws `IndexOutOfBoundsException`.

**Q15. Is `ArrayList` thread-safe?**
No. Use `Collections.synchronizedList(...)`, `CopyOnWriteArrayList`, or a database for concurrent writes.

**Q16. What is the time complexity of `get(i)` and `add(x)` in an `ArrayList`?**
`get(i)` is O(1). `add(x)` is amortized O(1), but occasionally O(n) when the internal array resizes.

---

## 11. Questions asked while learning

**Q17. Why does `System.out.println(category)` print `Category@25576170`?**
Because the class does not override `toString()`, so Java uses `Object.toString()`, which prints the class name and hash code.

**Q18. How does overriding `toString()` solve the problem?**
It tells Java how to build the text from the fields. It reads values that already exist and does not set any.

**Q19. How does `categoryName` get a value?**
Spring's Jackson reads the JSON request body, calls `new Category()`, and calls `setCategoryName(...)` for each matching key.

**Q20. Why is `categoryId` `null` if we only added `toString()`?**
`toString()` does not set values. The request JSON did not contain `categoryId`, so `setCategoryId` was never called and the field stayed `null`.

**Q21. How does `categoryList` hold the category information?**
It stores references to the `Category` objects created from each POST request. `add(...)` appends each new object to the end.
-----------------------------------------------------------------


### What a List is

A List is an ordered collection that allows duplicates and gives you access by index. In Java, List<Category> is an interface, and ArrayList is the class that implements it.

private List<Category> categoryList = new ArrayList<>();

- List<Category> means it only holds Category objects.
- new ArrayList<>() creates the actual list in memory. It starts empty.
- ArrayList stores items in a resizable array. It grows automatically as you add items.

Common operations:
```
┌───────────┬───────────────────────────────────────────┐
│ Operation │                  Meaning                  │
├───────────┼───────────────────────────────────────────┤
│ add(x)    │ Appends x to the end                      │
├───────────┼───────────────────────────────────────────┤
│ get(i)    │ Returns the item at index i (starts at 0) │
├───────────┼───────────────────────────────────────────┤
│ size()    │ Number of items                           │
├───────────┼───────────────────────────────────────────┤
│ remove(i) │ Removes the item at index i               │
└───────────┴───────────────────────────────────────────┘
```
How categoryList holds category data

The list does not copy the data. It stores references (memory addresses) to Category objects.

Step by step, with two POST requests:

Request 1: `{"categoryName": "Electronics"}`
1. Jackson creates Category object A and sets its categoryName to "Electronics".
2. categoryList.add(A) stores a reference to A at index 0.
3. List: [A]

Request 2: `{"categoryName": "Books"}`
1. Jackson creates a new object B with categoryName = "Books".
2. categoryList.add(B) stores a reference to B at index 1.
3. List: [A, B]

Your line categoryList.get(categoryList.size()-1) means "the last item": with size 2, index 2-1 = 1,
which is B.

Why this works across requests

- CategoryController is a Spring singleton bean. Spring creates one instance and reuses it for every request.
- That one instance has one categoryList field. Every POST and GET uses the same list.
- So the data survives between requests, but only while the application is running. Restarting clears it.

How the GET request uses the list
```java
@GetMapping("/public/categories")
public List<Category> getAllCategoryList() {
    return categoryList;
}
```
- The method returns the list object itself.
- Because of @RestController, Spring passes it to Jackson, which converts it to a JSON array.
- Jackson calls each Category's getters (getCategoryId, getCategoryName) to build the JSON:
```json
[
  {"categoryId": null, "categoryName": "Electronics"},
  {"categoryId": null, "categoryName": "Books"}
]
```
Things to watch for

- Thread safety: ArrayList is not thread-safe. If two requests add at the same time, data can be lost or corrupted. Production code uses a database or a thread-safe collection.
- Index errors: get(i) throws IndexOutOfBoundsException if i is out of range, for example calling get(0) on an empty list.
- Shared state: Since the list is shared by all requests, any change is visible to everyone

---

## 12. Service layer, interfaces and dependency injection

### Why the controller uses the interface, not the implementation

`CategoryService` is a contract. It says what the service can do (`getAllCategoryList`, `createCategory`) but not how.

```java
public interface CategoryService {
    List<Category> getAllCategoryList();
    void createCategory(Category category);
}
```

If the controller depended on `CategoryServiceImpl` directly, it would be tied to that one class. Using the interface gives you:

- **Swappable implementations:** You can later add `CategoryServiceJpaImpl` that stores data in a database. The controller doesn't change.
- **Easy testing:** A unit test can pass a fake or mock `CategoryService` into the controller without starting Spring.
- **Clear boundaries:** The controller only handles HTTP. The service handles business logic.

The interface isn't injected by itself. Spring always injects an object, and it picks the object that implements the interface.

### How the interface and the impl get linked

Step by step, when the application starts:

1. **Component scan:** `SbEcomApplication` is in `com.ecommerce.project`, so Spring scans that package and sub-packages.
2. **Bean creation for the service:** It finds `@Service` on `CategoryServiceImpl`, creates one instance, and registers it as a bean. The bean is registered under its class and under every interface it implements, so it can be found by `CategoryService`.
3. **Bean creation for the controller:** It finds `@RestController` on `CategoryController`. The constructor needs a `CategoryService`, so Spring searches the container for beans of that type. It finds the `CategoryServiceImpl` bean because it implements `CategoryService`.
4. **Injection:** Spring calls `new CategoryController(thatServiceBean)`.

In short, the link is the `implements CategoryService` line. Without it, Spring would have no bean to match the constructor parameter.

Spring finds beans by type. Your code never says "use CategoryServiceImpl". Spring makes that choice.

### Constructor injection vs field injection

**Constructor injection (what your code uses):**

```java
private final CategoryService categoryService;

public CategoryController(CategoryService categoryService) {
    this.categoryService = categoryService;
}
```

**Field injection (the alternative):**

```java
@Autowired
private CategoryService categoryService;   // no constructor needed
```

With field injection, Spring creates the controller with the no-arg constructor first, then uses reflection to write into the private field. Your code never sees the injection happen.

**How to tell them apart:**

| Look for | Type |
|---|---|
| A constructor with the dependency as a parameter | Constructor injection |
| `@Autowired` directly above a field | Field injection |
| A setter annotated with `@Autowired` | Setter injection |

**Why constructor injection is preferred:**

| Point | Constructor | Field |
|---|---|---|
| Can the field be `final`? | Yes | No |
| Is the dependency guaranteed non-null? | Yes, the object can't be created without it | No, it stays null if injection is skipped |
| Is the dependency visible? | Yes, it's in the constructor signature | Hidden inside the class |
| Unit testing without Spring | `new CategoryController(mockService)` | Need reflection or Spring to set the field |
| Circular dependency | Fails at startup, which is good | Can hide the problem |

**Note:** Since Spring 4.3, `@Autowired` is optional on a constructor when there is only one constructor. Your code is correct without it.

### Things to watch for

- **Two beans implementing the same interface:** Spring can't decide which to inject and fails with `NoUniqueBeanDefinitionException`. Fix it with `@Primary` on one bean, or `@Qualifier("name")` at the injection point.
- **Misspelled comment:** `// @Autowire` in the controller is misspelled, and it's just a comment for field injection. You can delete it.
- **Where the list lives now:** The list moved from the controller into `CategoryServiceImpl`. The controller reaches it through the service, and it's still shared because the service is a singleton bean.
- **Unused import:** `java.util.ArrayList` in `CategoryController` isn't used. You can remove it.

### Interview Questions - Service layer and injection

**Q22. Why do we inject an interface (`CategoryService`) instead of the implementation (`CategoryServiceImpl`)?**
It decouples the controller from one implementation. You can swap implementations, such as an in-memory one for a database one, without changing the controller, and you can mock the interface in unit tests.

**Q23. How does Spring know which implementation to inject when the constructor takes an interface?**
Spring searches the bean container for beans whose type matches the parameter. A class annotated with `@Service` that implements the interface is registered as a bean of that interface type, so Spring finds it and passes it in.

**Q24. What is the difference between constructor injection and field injection?**
Constructor injection passes dependencies through the constructor, so they can be `final`, are guaranteed non-null, and are easy to test. Field injection uses `@Autowired` on a field, and Spring sets it with reflection after creating the object.

**Q25. Why is constructor injection preferred over field injection?**
The dependencies are explicit and required, the object can't be created without them, fields can be `final`, unit tests can use plain `new`, and circular dependencies fail at startup instead of being hidden.

**Q26. What happens if two classes implement `CategoryService` and both are annotated with `@Service`?**
Spring throws `NoUniqueBeanDefinitionException` at startup because it can't choose one. Fix it with `@Primary` on the preferred bean or `@Qualifier("beanName")` at the injection point.

**Q27. Do you need `@Autowired` on a constructor?**
Not since Spring 4.3, if the class has only one constructor. Spring uses that constructor automatically. `@Autowired` is still required when a class has multiple constructors and you want Spring to pick one.

**Q28. What is the difference between `@Component`, `@Service`, `@Repository` and `@RestController`?**
All of them register a class as a Spring bean during component scan. `@Service` marks business logic, `@Repository` marks data access (and adds exception translation), and `@RestController` marks a web controller whose return values are written to the response body. Functionally, `@Service` is a `@Component` with a clearer meaning.

---

## 13. Streams, `Optional` and `orElseThrow`

### The line in question

```java
Category category = categoryList.stream()
        .filter(c -> c.getCategoryId().equals(categoryId))
        .findFirst()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
```

Read it as a pipeline:

| Step | What it does | Returns |
|---|---|---|
| `.stream()` | Opens a stream over the list. Nothing runs yet. | `Stream<Category>` |
| `.filter(pred)` | Keeps only items where `pred` is `true` | `Stream<Category>` |
| `.findFirst()` | Takes the first item that survived the filter | `Optional<Category>` |
| `.orElseThrow(supplier)` | Unwraps the `Optional`, or throws if it is empty | `Category` |

### What a Stream is

- A Stream is a pipeline that processes items from a source (a List, Set, array) one at a time.
- It does not store data. It reads from the source and passes items through the steps.
- A stream can be consumed only once. Create a new one with `.stream()` for each query.

### The lambda `c -> c.getCategoryId().equals(categoryId)`

- `filter` takes a `Predicate<Category>`: a function that takes one `Category` and returns `boolean`.
- `c` is each element as it comes through the pipeline. The name is arbitrary.
- The lambda is a shorter way to write an anonymous class:

```java
new Predicate<Category>() {
    @Override
    public boolean test(Category c) {
        return c.getCategoryId().equals(categoryId);
    }
}
```

- `categoryId` must be effectively final (not reassigned) to be used inside a lambda.
- Use `.equals()` for object comparison. `==` compares references, not values. For `Long`/`Integer`, `.equals()` also avoids `NullPointerException` when the left side is a valid object.

### What `Optional` is

- `Optional<T>` is a box that either holds a value or is empty.
- It makes "value might be missing" explicit in the type, instead of returning `null` and hoping the caller checks.
- `findFirst()` returns `Optional` because the list might be empty or nothing might match the filter.

### Why `orElseThrow` takes `() -> ...`

`orElseThrow` has this signature:

```java
public <X extends Throwable> T orElseThrow(Supplier<? extends X> exceptionSupplier)
```

- It takes a `Supplier`: a function with no input that returns a value. `() -> new ...` is that function.
- The exception is created only if the `Optional` is empty. If a category is found, the lambda never runs.
- Passing the exception object directly would not compile, because `ResponseStatusException` is not a `Supplier`. The method needs a factory, not an instance.

```java
.orElseThrow(new ResponseStatusException(HttpStatus.NOT_FOUND)); // compile error: type mismatch
.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)); // works
```

- Without the lambda, `orElseThrow()` (no arguments, Java 10+) throws `NoSuchElementException`. Spring does not map that to 404, so the client gets a 500.

### Why `ResponseStatusException` gives 404

- It is a `RuntimeException`, so no `throws` clause is needed.
- It carries an HTTP status. Spring turns it into a response with that status, so `HttpStatus.NOT_FOUND` becomes HTTP 404.

### Stream vs loop (same logic)

```java
Category found = null;
for (Category c : categoryList) {
    if (c.getCategoryId().equals(categoryId)) {
        found = c;
        break;
    }
}
if (found == null) {
    throw new ResponseStatusException(HttpStatus.NOT_FOUND);
}
```

The stream version does the same work in fewer lines, and the `Optional` forces the "not found" case to be handled.

---

## 14. `ResponseEntity` - controlling the whole HTTP response

### What it is

- `ResponseEntity<T>` is a Spring class that wraps three things:
  1. **Status code** (200, 201, 404, ...)
  2. **Headers** (Content-Type, Location, custom headers)
  3. **Body** (the object that Jackson converts to JSON)
- With a plain return value (`return category;`), Spring always sends 200 OK and the object as the body. `ResponseEntity` lets you choose the status and headers.

### Basic usage

```java
@GetMapping("/public/categories/{id}")
public ResponseEntity<Category> getCategory(@PathVariable Long id) {
    Category category = categoryService.getCategoryById(id);
    return new ResponseEntity<>(category, HttpStatus.OK);
}
```

### Common shortcuts

```java
ResponseEntity.ok(category)                                  // 200 + body
ResponseEntity.status(HttpStatus.CREATED).body(category);    // 201 + body
ResponseEntity.noContent().build();                          // 204, no body
ResponseEntity.notFound().build();                           // 404, no body
ResponseEntity.badRequest().body("Name is required");        // 400 + body
```

### Adding headers

```java
return ResponseEntity.created(URI.create("/api/public/categories/" + id))
        .body(category);   // 201 with a Location header
```

```java
return ResponseEntity.ok()
        .header("X-Total-Count", String.valueOf(list.size()))
        .body(list);
```

### Using it for POST

- `201 Created` is the correct status for a successful create. A plain return sends `200`.

```java
@PostMapping("/public/categories")
public ResponseEntity<String> createCategory(@RequestBody Category category) {
    categoryService.createCategory(category);
    return new ResponseEntity<>("Category added successfully", HttpStatus.CREATED);
}
```

### Using it with `Optional`

```java
@GetMapping("/public/categories/{id}")
public ResponseEntity<Category> getCategory(@PathVariable Long id) {
    return categoryService.findById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
}
```

### All the ways to write a `ResponseEntity`

There are four families of code that produce the same kind of result. Pick whichever reads best.

#### Way 1: Constructor

```java
new ResponseEntity<>(body, HttpStatus.OK)                       // body + status
new ResponseEntity<>(body, headers, HttpStatus.OK)              // body + headers + status
new ResponseEntity<>(HttpStatus.NO_CONTENT)                     // status only, no body
new ResponseEntity<>(headers, HttpStatus.OK)                    // headers + status, no body
```

- The diamond `<>` lets Java infer the generic type from `body`.
- Verbose, but explicit. Good for learning because every part is visible.

#### Way 2: Static factory methods (status is in the method name)

```java
ResponseEntity.ok(body)                       // 200 + body
ResponseEntity.ok().build()                   // 200, no body
ResponseEntity.created(URI location)          // 201 + Location header (needs .body(...) or .build())
ResponseEntity.accepted().body(body)          // 202 + body
ResponseEntity.noContent().build()            // 204, no body
ResponseEntity.badRequest().body(body)        // 400 + body
ResponseEntity.notFound().build()             // 404, no body
ResponseEntity.unprocessableEntity().body(e)  // 422 + body
ResponseEntity.internalServerError().build()  // 500, no body
ResponseEntity.status(HttpStatus.CREATED).body(body)   // any status, enum
ResponseEntity.status(201).body(body)                  // any status, int
ResponseEntity.of(optional)                            // 200 + value if present, else 404
```

Some factories return a `BodyBuilder` (you must call `.body(...)` or `.build()`), and some return a `HeadersBuilder` (only `.build()`):

| Factory | Returns | Can call `.body(x)`? | Can call `.build()`? |
|---|---|---|---|
| `ok()`, `status(...)`, `badRequest()`, `created(uri)` | `BodyBuilder` | Yes | Yes (no body) |
| `noContent()`, `notFound()` | `HeadersBuilder` | No, compile error | Yes |

So `ResponseEntity.noContent().body(category)` does not compile. Use `.build()`.

#### Way 3: Builder chain (headers and content type)

```java
return ResponseEntity.status(HttpStatus.CREATED)
        .header("X-Request-Id", requestId)
        .contentType(MediaType.APPLICATION_JSON)
        .location(URI.create("/api/public/categories/" + id))
        .body(category);
```

Commonly used header helpers on the builder:

| Method | Sets |
|---|---|
| `.header(name, value...)` | Any header (can repeat) |
| `.headers(httpHeaders)` | A whole `HttpHeaders` object (or a lambda: `.headers(h -> h.add("X", "1"))`) |
| `.contentType(MediaType.APPLICATION_JSON)` | `Content-Type` |
| `.location(uri)` | `Location` (used after creating a resource) |
| `.eTag("\"v1\"")` | `ETag` (for caching and concurrency) |
| `.lastModified(instant)` | `Last-Modified` |
| `.cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)))` | `Cache-Control` |

#### Way 4: Prebuilt `HttpHeaders`

```java
HttpHeaders headers = new HttpHeaders();
headers.add("X-Total-Count", String.valueOf(list.size()));
headers.setContentType(MediaType.APPLICATION_JSON);

return new ResponseEntity<>(list, headers, HttpStatus.OK);
```

- Useful when the same headers are built in several places, or when headers are computed in a helper method.

### Body types you can return

| Body type | How it is sent |
|---|---|
| `Category` (any object) | JSON object via Jackson |
| `List<Category>` | JSON array |
| `String` | Plain text, not JSON. `"ok"` is sent as `ok`, not `"ok"` |
| `Map<String, String>` | JSON object, handy for simple error messages |
| `Void` / no body | Empty body. Use `ResponseEntity<Void>` as the return type |
| `null` with `ok()` | `200` with an empty body |

Return type rules:

```java
public ResponseEntity<Category> getOne(...)          // body is a Category
public ResponseEntity<List<Category>> getAll()       // body is a list
public ResponseEntity<String> create(...)            // body is text
public ResponseEntity<Void> delete(...)              // no body
public ResponseEntity<?> anything(...)               // wildcard, any body type
```

### Returning different responses from different branches

```java
@GetMapping("/public/categories/{id}")
public ResponseEntity<?> getCategory(@PathVariable Long id) {
    Category category = categoryService.findById(id);   // hypothetical method, returns null if missing
    if (category == null) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(category);
}
```

- Both `return` lines must fit the declared return type. `ResponseEntity<?>` allows the mix; `ResponseEntity<Category>` allows only the `ok` line unless the `notFound` line is also typed as `ResponseEntity<Category>`. Java often infers this correctly with `ResponseEntity.notFound().build()`, but if it does not, write `ResponseEntity.<Category>notFound().build()`.

### Handling Optional in a controller

```java
// Way A: of() shortcut (Spring 5.1+)
return ResponseEntity.of(categoryService.findById(id));

// Way B: map + orElseGet
return categoryService.findById(id)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());

// Way C: if/else on Optional
Optional<Category> found = categoryService.findById(id);
if (found.isPresent()) {
    return ResponseEntity.ok(found.get());
}
return ResponseEntity.notFound().build();

// Way D: throw instead of returning 404 (see section 13)
return ResponseEntity.ok(categoryService.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
```

- Way A and Way B are the most idiomatic.
- Way D keeps the controller short and lets an exception handler decide the error format.

### A full CRUD-style example

```java
@RestController
@RequestMapping("/api")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/public/categories")
    public ResponseEntity<List<Category>> getAll() {
        return ResponseEntity.ok(categoryService.getAllCategoryList());
    }

    @PostMapping("/public/categories")
    public ResponseEntity<String> create(@RequestBody Category category) {
        categoryService.createCategory(category);
        return ResponseEntity.status(HttpStatus.CREATED).body("Category added successfully");
    }

    @DeleteMapping("/admin/categories/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);   // hypothetical method
        return ResponseEntity.noContent().build();
    }
}
```

| Operation | Typical status | Typical body |
|---|---|---|
| GET list | 200 OK | list |
| POST create | 201 Created | created object or message |
| PUT / PATCH update | 200 OK (or 204 No Content) | updated object, or none |
| DELETE | 204 No Content | none |

### Request side: `HttpEntity` and `RequestEntity`

`ResponseEntity` has two siblings for the incoming request. Use them when you need headers, not just the body.

```java
@PostMapping("/public/categories")
public ResponseEntity<String> create(HttpEntity<Category> request) {
    Category category = request.getBody();
    String clientId = request.getHeaders().getFirst("X-Client-Id");
    ...
}
```

- `@RequestBody Category category` is enough when only the body matters.
- `HttpEntity<T>` gives both body and headers.

### Reading a `ResponseEntity` in tests

```java
ResponseEntity<Category> response = restTemplate.getForEntity("/api/public/categories/1", Category.class);
response.getStatusCode();     // HttpStatus.OK
response.getHeaders();        // HttpHeaders
response.getBody();           // Category
```

- `TestRestTemplate` (Spring Boot tests) works the same way.

### Common mistakes

| Mistake | Result | Fix |
|---|---|---|
| Returning `ResponseEntity<String>` but sending an object | Compile error | Match the generic type to the body |
| `ResponseEntity.noContent().body(x)` | Compile error | Use `.build()` |
| Using `ok()` for a create | Client expects 201 and gets 200 | Use `status(HttpStatus.CREATED)` |
| `ResponseEntity.ok("Done")` expecting JSON | Client gets plain text `Done` | Return a `Map` or a DTO, or set `contentType` |
| Keeping `@ResponseStatus` on a method and returning a different status | `ResponseEntity` status wins | Remove one of them |
| Returning `null` for a missing object with `ok(null)` | `200` with empty body, which is misleading | Return `notFound()` |

### `ResponseEntity` vs `@ResponseStatus` vs throwing an exception

| Approach | Use when |
|---|---|
| Return the object directly | Always 200 is fine, no custom headers needed |
| `ResponseEntity<T>` | You need a specific status, headers, or both, for one method |
| `@ResponseStatus(HttpStatus.CREATED)` on the method | Fixed status for the method, no headers needed |
| Throw `ResponseStatusException` | An error case (404, 400, ...) that should stop the normal flow |

### Interview Questions - Streams, Optional and ResponseEntity

**Q29. What is a Stream in Java?**
A pipeline of operations (`filter`, `map`, `findFirst`, ...) that processes items from a source one at a time. It does not store the data.

**Q30. Why does `findFirst()` return `Optional` instead of the object?**
Because the stream may be empty or nothing may match the filter. `Optional` makes the missing case explicit so the caller must handle it.

**Q31. Why does `orElseThrow` need `() -> ...`?**
It takes a `Supplier` so the exception is created only when the `Optional` is empty. Passing an exception object directly is a type mismatch.

**Q32. What is the difference between `orElseThrow()` and `orElseThrow(() -> ...)`?**
The no-argument version throws `NoSuchElementException`. The supplier version throws the exception you choose, such as `ResponseStatusException` with a 404 status.

**Q33. What is `ResponseEntity`?**
A wrapper that holds the HTTP status, headers and body of a response. It gives full control over the response, where a plain return value always means 200 OK.

**Q34. How do you return 201 Created from a POST method?**
Return `new ResponseEntity<>(body, HttpStatus.CREATED)` or `ResponseEntity.status(HttpStatus.CREATED).body(body)`.

**Q35. Is `ResponseStatusException` a checked exception?**
No. It extends `RuntimeException`, so the method does not need a `throws` clause.

**Q36. What are the two ways to create a `ResponseEntity`?**
The constructor (`new ResponseEntity<>(body, status)`) and the static factories (`ResponseEntity.ok(body)`, `ResponseEntity.status(...)`, `ResponseEntity.notFound()`, and so on). Both produce the same object.

**Q37. Why does `ResponseEntity.noContent().body(x)` fail to compile?**
`noContent()` returns a `HeadersBuilder`, which has only `build()`. Only `BodyBuilder` (for example from `ok()` or `status()`) has `body(...)`.

**Q38. How do you return a 201 with a `Location` header?**
`ResponseEntity.created(URI.create("/api/public/categories/" + id)).body(category)`, or `ResponseEntity.status(HttpStatus.CREATED).location(uri).body(category)`.

**Q39. What does `ResponseEntity.of(optional)` do?**
It returns `200` with the value when the `Optional` is present, and `404 Not Found` with no body when it is empty.

**Q40. What is the difference between `ResponseEntity<String>` and `ResponseEntity<Map<String, String>>` when returning a message?**
A `String` body is sent as plain text. A `Map` is serialized to a JSON object, so clients receive structured data.

**Q41. What is the difference between `ResponseEntity` and `HttpEntity`?**
`ResponseEntity` represents the outgoing response (status, headers, body). `HttpEntity` is the general wrapper for headers and body, and it is used as a method parameter to read the incoming request's headers and body.

---

## 15. Returning an error status from `ResponseStatusException` in `deleteCategory`

### The compile error

```java
catch (ResponseStatusException e) {
    return new ResponseEntity<>(e.getReason(), e.getMessage());   // compile error
}
```

- The constructor is `ResponseEntity(body, status)`. The second argument must be an `HttpStatusCode` or `HttpStatus`.
- `e.getMessage()` returns a `String`, so there is no matching constructor. The compiler reports `no suitable constructor found for ResponseEntity(String,String)`.
- Any Spring version gives this error. The version only changes which getter returns the status.

### The fix

```java
catch (ResponseStatusException e) {
    return new ResponseEntity<>(e.getReason(), e.getStatusCode());
}
```

- `e.getReason()` is the body. It can be `null` if no reason was set.
- `e.getStatusCode()` is the status, such as 404 for a not-found exception.
- Spring 6 and newer (including Spring Boot 4, used by this project): `getStatusCode()`.
- Spring 5 and older: `getStatus()`, which returns `HttpStatus`.

### Two ways to write the same response

The selected code in `deleteCategory` shows the two styles:

```java
return new ResponseEntity<>(status, HttpStatus.OK);               // constructor: body first, status second
return ResponseEntity.status(HttpStatus.OK).body(status);         // builder: status first, body last
```

- Both return 200 with `status` as the body.
- The order is the common mix-up: the constructor takes `(body, status)`, but the builder reads `status(...)` then `.body(...)`.
- Use the constructor when you need the status as a value you already have. Use the builder when you also want headers.

### Interview Questions - ResponseEntity errors

**Q42. Why does `new ResponseEntity<>(e.getReason(), e.getMessage())` fail to compile?**
The second constructor argument must be a status. `e.getMessage()` is a `String`, so no constructor matches.

**Q43. Which getter should you use for the status of a `ResponseStatusException`?**
`getStatusCode()` in Spring 6 and newer. `getStatus()` was used in Spring 5 and older.

### Constructor vs builder: the same response, written two ways

```java
return new ResponseEntity<>(status, HttpStatus.OK);          // constructor: body first, status second
return ResponseEntity.status(HttpStatus.OK).body(status);    // builder: status first, body last
```

- Both return 200 OK with `status` as the body.
- The constructor takes `(body, status)`. The builder reads `status(...)` then `.body(...)`. This order is the common mix-up.
- The builder is easier to extend. You can add `.header(...)` before `.body(...)`.

### Why `new ResponseEntity.status(...)` is an error

```java
return new ResponseEntity.status(HttpStatus.OK).body(status);   // compile error
```

- `new` only works with a constructor. `status` is a static factory method, not a constructor.
- Java reads `new ResponseEntity.status(...)` as "create an object of a class named `status` nested inside `ResponseEntity`". No such class exists, so the compiler reports `cannot find symbol` or `'(' expected`.
- `ResponseEntity.status(...)` returns a `BodyBuilder`, not a `ResponseEntity`. Call `.body(...)` on it, and do not put `new` in front.

```java
return ResponseEntity.status(HttpStatus.OK).body(status);   // correct
return new ResponseEntity<>(status, HttpStatus.OK);          // correct (constructor form)
```

**Q44. What is the difference between `new ResponseEntity<>(body, status)` and `ResponseEntity.status(status).body(body)`?**
Both produce the same response. The first calls a constructor with the body first. The second uses a builder with the status first, then the body.

**Q45. Why does `new ResponseEntity.status(...)` fail to compile?**
`new` needs a constructor, and `status` is a static factory method. The compiler reads it as a nested class named `status`, which does not exist. Call `ResponseEntity.status(...)` without `new`.

---

## 16. Updating items in a `List`

### Add, delete, update

- **Add:** `categoryList.add(category)` appends to the end.
- **Delete:** find the item, then `categoryList.remove(category)`.
- **Update:** find the item, then change it. There are two ways.

### Index lookup vs key lookup

- **Index lookup:** "the item at position N". Uses `get(int)`, `set(int, E)`, `remove(int)`. Positions start at 0.
- **Key lookup:** "the item whose `categoryId` is X". You search the list for it.
- An ID is not a position. If ID 1 is deleted, the item with ID 2 moves to index 0, so IDs and indexes stop matching.

### The error `Required type: int, Provided: Long`

```java
categoryList.get(categoryId);   // compile error: get needs int, categoryId is Long
categoryList.set(categoryId, category);   // same error
```

- `get`, `set` and `remove(int)` take an `int` index. `categoryId` is a `Long` ID.
- Java does not convert `Long` to `int` automatically. `(int) categoryId` compiles, but it uses the ID as a position, which is wrong.
- Fix: search by ID to get the object, not by position.

### Update by ID: change the existing object (preferred)

```java
@Override
public Category updateCategory(Category category, Long categoryId) {
    Category existing = categoryList.stream()
            .filter(c -> c.getCategoryId().equals(categoryId))
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    existing.setCategoryName(category.getCategoryName());
    return existing;
}
```

- The object stays in the list, so its position does not change.
- Only the fields you copy are changed.

### Update by ID: replace the object at its position

When you want to swap the whole object, you need its index. Find the index with a loop, then call `set`:

```java
int index = -1;
for (int i = 0; i < categoryList.size(); i++) {
    if (categoryList.get(i).getCategoryId().equals(categoryId)) {
        index = i;
        break;
    }
}
if (index == -1) {
    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found");
}
category.setCategoryId(categoryId);
categoryList.set(index, category);
return category;
```

- The `int` here is the loop counter `i`, not the `Long` ID.
- Keep the ID on the new object, or the next lookup by ID will fail.

### Concepts behind the error

- **Method overloading:** `List` has `remove(int index)` and `remove(Object o)`. Java picks by argument type. Passing a `Long` picks `remove(Object)`, which removes by equality, not by position.
- **Primitives vs wrappers:** `int` is a primitive. `Long` is a wrapper object. Java converts between `int` and `Integer` (boxing), but not between `long`/`Long` and `int` without an explicit cast.
- **Stream filter:** `filter(...).findFirst()` is the standard way to find an item by a field value.

### Interview Questions - List updates

**Q46. Why does `list.get(categoryId)` fail when `categoryId` is a `Long`?**
`get` takes an `int` position. A `Long` ID is a value that identifies an item, not a position. Use a stream filter to find the item by ID.

**Q47. What is the difference between index lookup and key lookup?**
Index lookup returns the item at a position (`get(i)`). Key lookup searches for an item whose field matches a value (`stream().filter(...)`).

**Q48. Why should you not use an ID as a list index?**
IDs are not positions. After a delete, items shift to new indexes, so an ID can point to the wrong item or to nothing.

**Q49. Why does `list.remove(categoryId)` behave differently from `list.remove(0)`?**
`remove(int)` removes by position. `remove(Object)` removes by equality. Java picks the overload from the argument type: an `int` picks the position version, and a `Long` picks the object version.

**Q50. Does updating an object through a `List` reference change the list?**
Yes. The list holds references, so changing the fields of a stored object changes what the list shows. Use `set(index, newObject)` only when you want to replace the object itself.

---

## 17. Databases, DBMS, SQL, ORM and JPA

### 17.1 What is a database?

- A **database** is an organized collection of related data, stored so it can be searched, changed and shared reliably.
- Your `categoryList` is a database of sorts, but it has three limits: it lives in memory, it is only visible to one running app, and it has no rules for keeping data correct.
- A real database stores data on disk, handles many users at once, and enforces rules.

### 17.2 What is a DBMS?

- A **DBMS (Database Management System)** is the software that creates, stores, reads, updates and protects a database.
- You never touch the files directly. You send commands (usually SQL) to the DBMS, and it does the work.

```
 Your app (Spring Boot)
        |
        |  SQL: SELECT * FROM categories;
        v
 +---------------------+
 |        DBMS         |   <- MySQL, PostgreSQL, Oracle, SQL Server, H2
 |  - parses the SQL   |
 |  - checks rules     |
 |  - manages locks    |
 |  - writes to disk   |
 +---------------------+
        |
        v
 Database files on disk
```

- Common examples: **MySQL**, **PostgreSQL**, **Oracle**, **Microsoft SQL Server**, **MariaDB**. **H2** is an in-memory DBMS often used for learning and tests.

### 17.3 Types of DBMS

| Type | How data is stored | Examples | Typical use |
|---|---|---|---|
| **Relational (RDBMS)** | Tables with rows and columns, linked by keys | MySQL, PostgreSQL, Oracle, SQL Server | Orders, users, payments, most business apps |
| **Document** | JSON-like documents | MongoDB | Flexible or nested data, catalogs |
| **Key-value** | Key maps to a value | Redis | Caching, sessions |
| **Column-family** | Columns grouped per row, many columns | Cassandra | Large write-heavy data, logs |
| **Graph** | Nodes and edges | Neo4j | Social networks, recommendations |
| **Object-oriented** | Objects stored directly | ObjectDB | Rarely used today |
| **In-memory** | Data kept in RAM | H2 (in-memory mode), SAP HANA | Tests, fast caches |

- **NoSQL** is the umbrella term for the non-relational types (document, key-value, column-family, graph).
- An e-commerce app like yours usually uses a **relational** DBMS, because orders, customers and products are related and must stay consistent.

### 17.4 Database terminology

Use this example table throughout:

```
categories
+-------------+---------------+
| category_id | category_name |   <- column names (fields)
+-------------+---------------+
|      1      | Electronics   |   <- row (record)
|      2      | Books         |
+-------------+---------------+
```

| Term | Meaning | Example |
|---|---|---|
| **Table** | A set of rows with the same columns | `categories` |
| **Row / record** | One entry in a table | `(1, 'Electronics')` |
| **Column / field** | One attribute of every row | `category_name` |
| **Schema** | The structure: table names, columns, types, rules | The `CREATE TABLE` statement |
| **Data type** | What a column holds | `BIGINT`, `VARCHAR(100)`, `DATE` |
| **Primary key (PK)** | Column(s) that uniquely identify a row, never null | `category_id` |
| **Foreign key (FK)** | Column that points to a primary key in another table | `products.category_id` |
| **Index** | Extra structure that speeds up searches on a column | Index on `category_name` |
| **Constraint** | A rule the DBMS enforces | `NOT NULL`, `UNIQUE`, `CHECK`, FK |
| **Relationship** | How tables link | One-to-many, many-to-many |
| **Join** | Combines rows from two tables using a key | Products with their category name |
| **Transaction** | A group of changes that succeed or fail together | Debit one account, credit another |
| **Normalization** | Splitting tables so each fact is stored once | Categories in their own table |

#### Relationships

```
One-to-one:    user  ----  user_profile         (one user has one profile)
One-to-many:   category ----< product           (one category has many products)
Many-to-many:  product >----< tag               (needs a join table: product_tag)
```

#### ACID (what a transaction guarantees)

- **Atomicity:** all changes happen, or none do.
- **Consistency:** the data follows all rules before and after.
- **Isolation:** concurrent transactions do not see each other's half-done work.
- **Durability:** once committed, the data survives a crash.

### 17.5 What is SQL?

- **SQL (Structured Query Language)** is the standard language for talking to relational databases.
- It is declarative: you say **what** you want, and the DBMS decides **how** to get it.

SQL is grouped by purpose:

| Group | Purpose | Commands |
|---|---|---|
| **DDL** (Data Definition) | Create and change structure | `CREATE`, `ALTER`, `DROP` |
| **DML** (Data Manipulation) | Insert, change, delete rows | `INSERT`, `UPDATE`, `DELETE` |
| **DQL** (Data Query) | Read rows | `SELECT` |
| **DCL** (Data Control) | Permissions | `GRANT`, `REVOKE` |
| **TCL** (Transaction Control) | Group changes | `BEGIN`, `COMMIT`, `ROLLBACK` |

Examples for the `categories` table:

```sql
-- DDL: create the table
CREATE TABLE categories (
    category_id   BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

-- DML: add rows
INSERT INTO categories (category_name) VALUES ('Electronics');
INSERT INTO categories (category_name) VALUES ('Books');

-- DQL: read rows
SELECT category_id, category_name FROM categories;
SELECT * FROM categories WHERE category_name = 'Books';

-- DML: change a row
UPDATE categories SET category_name = 'Home Electronics' WHERE category_id = 1;

-- DML: remove a row
DELETE FROM categories WHERE category_id = 2;
```

A related-table example, showing a foreign key and a join:

```sql
CREATE TABLE products (
    product_id   BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    category_id  BIGINT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

SELECT p.product_name, c.category_name
FROM products p
JOIN categories c ON p.category_id = c.category_id;
```

- The `WHERE` clause filters rows. The `WHERE` in `UPDATE` and `DELETE` is important: without it, every row is changed or deleted.

### 17.6 The problem: objects and tables do not match

Java and SQL store data differently:

| Java | SQL |
|---|---|
| Objects with references to other objects | Flat rows, linked by keys |
| Inheritance, collections in fields | No inheritance, no list columns |
| `Category` has a `List<Product>` | A join table or foreign key |

Writing `INSERT`, `SELECT` and mapping results back into objects by hand (with JDBC) is repetitive and easy to get wrong. This gap is called the **object-relational impedance mismatch**.

### 17.7 What is ORM?

- **ORM (Object-Relational Mapping)** is a technique that maps Java classes to database tables, and Java objects to rows.
- You work with objects. The ORM generates the SQL and converts the results back into objects.

```
Java class                         Database table
--------------------------         ----------------------------
class Category                     table categories
  Long categoryId        <------>    category_id   BIGINT  (PK)
  String categoryName    <------>    category_name VARCHAR

category.setCategoryName("Books");
  |
  | ORM generates:
  v
UPDATE categories SET category_name = 'Books' WHERE category_id = 1;
```

- ORM tools: **Hibernate**, EclipseLink, OpenJPA, MyBatis (a lighter, SQL-first tool).

### 17.8 What is JPA?

- **JPA (Jakarta Persistence API)**, formerly Java Persistence API, is a **specification**: a set of interfaces and annotations that define how Java objects are mapped and saved.
- JPA is **not** an implementation. It defines the rules. An ORM provider implements them.
- **Hibernate** is the most common JPA provider, and Spring Boot uses it by default.
- Spring Data JPA adds a repository layer on top of JPA, so you write interfaces instead of implementations.

```
Your code
  |  uses JPA annotations and interfaces (the standard)
  v
JPA (jakarta.persistence)            <- specification
  |  implemented by
  v
Hibernate                            <- ORM provider
  |  generates SQL, uses a JDBC driver
  v
JDBC driver (mysql-connector, org.h2.Driver, ...)
  |
  v
DBMS (MySQL, H2, PostgreSQL, ...)
```

#### Main JPA building blocks

| Piece | Purpose |
|---|---|
| `@Entity` | Marks a class as a table-backed object |
| `@Table(name = "...")` | Sets the table name (optional) |
| `@Id` | Marks the primary key field |
| `@GeneratedValue` | Lets the DB generate the key (auto-increment) |
| `@Column` | Sets column name, length, nullable, unique |
| `EntityManager` | The JPA object that saves, loads and removes entities |
| `JpaRepository` | Spring Data interface that gives save, find, delete methods without code |

### 17.9 Example: Category as a JPA entity

```java
import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

    @Column(name = "category_name", nullable = false, unique = true, length = 100)
    private String categoryName;

    public Category() { }                 // JPA needs a no-arg constructor

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
}
```

Repository (Spring Data JPA writes the implementation for you):

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    // Spring generates the SQL from the method name:
    Optional<Category> findByCategoryName(String categoryName);
}
```

- `JpaRepository<Category, Long>`: the entity type, then the type of its primary key.
- Free methods: `save`, `findAll`, `findById`, `deleteById`, `existsById`, `count`.

Service code that replaces your in-memory list:

```java
@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<Category> getAllCategoryList() {
        return categoryRepository.findAll();          // SELECT * FROM categories
    }

    @Override
    public void createCategory(Category category) {
        categoryRepository.save(category);            // INSERT INTO categories ...
    }

    @Override
    public Category updateCategory(Category category, Long categoryId) {
        Category existing = categoryRepository.findById(categoryId)   // SELECT ... WHERE category_id = ?
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        existing.setCategoryName(category.getCategoryName());
        return categoryRepository.save(existing);     // UPDATE categories SET ...
    }

    @Override
    public String deleteCategory(Long categoryId) {
        Category existing = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        categoryRepository.delete(existing);          // DELETE FROM categories WHERE category_id = ?
        return "CategoryId with " + categoryId + " deleted successfully";
    }
}
```

- Notice that the `updateCategory` and `deleteCategory` methods no longer search a list with streams. The database does the lookup with `WHERE category_id = ?`.
- With JPA, the `categoryId` set by the database (`GenerationType.IDENTITY`) replaces your `size()+1` logic, which can produce duplicates after a delete.

Dependencies to add (in `pom.xml`): `spring-boot-starter-data-jpa` for JPA and Hibernate, and a database driver such as `com.h2database:h2` (for learning) or `com.mysql:mysql-connector-j` (for MySQL).

`application.properties` (H2 example):

```properties
spring.datasource.url=jdbc:h2:mem:ecomdb
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

- `ddl-auto=update` creates or changes tables to match your entities. Use `validate` or Flyway/Liquibase in production.
- `show-sql=true` prints the SQL Hibernate generates. This is useful for learning.

### 17.10 Advantages of JPA (and ORM)

| Advantage | What it means for you |
|---|---|
| **Less boilerplate** | No hand-written `INSERT`/`SELECT` for basic CRUD |
| **Portability** | Same code runs on MySQL, PostgreSQL, H2 with a config change |
| **Standard API** | Any JPA provider works; you are not locked to Hibernate |
| **Objects stay objects** | Work with `Category` and its fields, not result sets |
| **Relationships** | `@OneToMany` and `@ManyToOne` load related objects |
| **Transactions** | Spring's `@Transactional` groups changes and rolls back on error |
| **Caching and dirty checking** | Hibernate tracks changed fields and writes only what changed |
| **Schema generation** | Tables can be created from entities during development |
| **Testability** | Repositories can be tested with an in-memory H2 database |

Trade-offs to know:

- The generated SQL can be slow if used carelessly (for example, the **N+1 select** problem when loading related lists).
- For complex reporting queries, raw SQL or JPQL is often clearer.
- You still need to understand SQL to debug and tune performance.

### 17.11 Data layer concepts

#### Layered architecture

```
+-------------------------------+
|  Controller  (HTTP layer)     |  CategoryController      - handles requests, returns ResponseEntity
+-------------------------------+
               |
               v
+-------------------------------+
|  Service  (business logic)    |  CategoryServiceImpl     - rules, checks, calls repository
+-------------------------------+
               |
               v
+-------------------------------+
|  Repository  (data access)    |  CategoryRepository      - save, find, delete
+-------------------------------+
               |
               v
+-------------------------------+
|  Entity  (table mapping)      |  Category                - @Entity, one object per row
+-------------------------------+
               |
               v
+-------------------------------+
|  Database  (DBMS)             |  categories table
+-------------------------------+
```

- Each layer talks only to the layer below it. The controller never writes SQL.
- This separation makes each layer easy to test and replace.

#### Key data layer terms

| Term | Meaning |
|---|---|
| **Entity** | A class mapped to a table; one object is one row |
| **Repository / DAO** | The object that reads and writes entities. "Repository" is the Spring Data name; "DAO" (Data Access Object) is the older name for the same idea |
| **DTO (Data Transfer Object)** | A plain object sent to or from the client, separate from the entity, so the API shape does not depend on the table |
| **Transaction** | A unit of work. Spring's `@Transactional` starts one and commits or rolls back |
| **Connection pool** | A set of reusable DB connections. Spring Boot uses **HikariCP** by default, so connections are not opened per request |
| **Lazy vs eager loading** | Lazy loads related data only when accessed; eager loads it immediately |
| **Migration** | Versioned scripts that change the schema over time (Flyway, Liquibase) |

#### Why separate the entity from the DTO

```java
// Entity: matches the table, may contain internal fields
@Entity class Category { Long categoryId; String categoryName; Instant createdAt; }

// DTO: what the API client sees
record CategoryDto(Long categoryId, String categoryName) {}
```

- Changing the table (adding `createdAt`) does not automatically change your public API.
- Internal fields are not exposed by accident.

#### Transactions example

```java
@Transactional
public void transferStock(Long fromId, Long toId, int qty) {
    Product from = productRepository.findById(fromId).orElseThrow();
    Product to   = productRepository.findById(toId).orElseThrow();
    from.setStock(from.getStock() - qty);
    to.setStock(to.getStock() + qty);
    // If an exception is thrown here, both changes are rolled back (atomicity).
}
```

### 17.12 Interview Questions - Databases, SQL, ORM and JPA

**Q51. What is a DBMS?**
Software that creates, stores, queries and protects a database. Examples: MySQL, PostgreSQL, Oracle, SQL Server.

**Q52. What are the main types of DBMS?**
Relational (tables, SQL), document (MongoDB), key-value (Redis), column-family (Cassandra), graph (Neo4j), and in-memory (H2 in memory mode). NoSQL covers the non-relational types.

**Q53. What is a primary key and a foreign key?**
A primary key uniquely identifies each row and cannot be null. A foreign key is a column that references a primary key in another table, which enforces the relationship.

**Q54. What is the difference between DDL, DML and DQL?**
DDL changes structure (`CREATE`, `ALTER`, `DROP`). DML changes rows (`INSERT`, `UPDATE`, `DELETE`). DQL reads rows (`SELECT`).

**Q55. What does a `WHERE` clause do in `UPDATE` or `DELETE`?**
It limits which rows change. Without it, every row in the table is affected.

**Q56. What is ACID?**
Atomicity (all or nothing), Consistency (rules hold), Isolation (concurrent transactions don't interfere), Durability (committed data survives crashes).

**Q57. What is ORM?**
A technique that maps classes to tables and objects to rows, so the code works with objects and the ORM generates the SQL.

**Q58. What is the difference between JPA and Hibernate?**
JPA is the specification (interfaces and annotations). Hibernate is an implementation of it. Spring Boot uses Hibernate as the JPA provider by default.

**Q59. What does `JpaRepository<Category, Long>` give you?**
The entity type (`Category`), the primary key type (`Long`), and ready-made methods like `save`, `findAll`, `findById` and `deleteById`. Spring generates the implementation.

**Q60. What is the advantage of JPA over raw JDBC?**
Less repetitive SQL and mapping code, portability across databases, relationship handling, transactions, and a standard API that any provider can implement.

**Q61. What is the N+1 select problem?**
Loading a list of N parents and then issuing one extra query per parent to load a related collection. It produces N+1 queries instead of one or two. Fix it with a join fetch or an entity graph.

**Q62. Why keep an entity separate from a DTO?**
The entity matches the table, while the DTO is the API contract. Keeping them separate lets the table change without breaking clients and avoids exposing internal fields.

**Q63. What is a connection pool and why is it used?**
A set of open database connections that are reused. Opening a connection per request is slow, so Spring Boot uses HikariCP by default.

---

## 18. `@GeneratedValue` and `GenerationType`

### What it does

- `@Id` marks the primary key. `@GeneratedValue` tells JPA **who creates the key value** when a new row is saved.
- The strategy is set with `GenerationType`, an enum in `jakarta.persistence`.

### How many types are there?

There are **4** values:

| Value | Meaning |
|---|---|
| `GenerationType.AUTO` | JPA picks a strategy based on the database and provider |
| `GenerationType.IDENTITY` | The database auto-increment column creates the key |
| `GenerationType.SEQUENCE` | A database sequence object creates the key |
| `GenerationType.TABLE` | A separate table stores the last used key value |

### 18.1 `AUTO`

```java
@Id
@GeneratedValue(strategy = GenerationType.AUTO)
private Long categoryId;
```

- Hibernate chooses the strategy. On many databases this is a sequence.
- It is convenient but hides the choice. Check the generated SQL with `spring.jpa.show-sql=true`.

### 18.2 `IDENTITY`

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long categoryId;
```

- Uses the database's auto-increment column (`AUTO_INCREMENT` in MySQL, `IDENTITY` in SQL Server and H2).
- The key is known only after the `INSERT` runs, so Hibernate inserts the row immediately.
- Simple and common for MySQL. Your project's `Category` should use this instead of `size()+1`.

Generated SQL (H2):

```sql
CREATE TABLE categories (
    category_id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);
INSERT INTO categories (category_name) VALUES ('Electronics');
```

### 18.3 `SEQUENCE`

```java
@Entity
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "category_seq")
    @SequenceGenerator(name = "category_seq", sequenceName = "category_seq", allocationSize = 1)
    private Long categoryId;

    private String categoryName;
}
```

- A sequence is a separate database object that returns the next number on request.
- Supported by Oracle, PostgreSQL, H2, SQL Server. MySQL does not have sequences (before 8.x style workarounds), so use `IDENTITY` there.
- `allocationSize` must match the database sequence's increment. Hibernate fetches that many IDs at once; `1` means one call per insert.
- The key is known **before** the insert, so Hibernate can batch inserts.

### 18.4 `TABLE`

```java
@Id
@GeneratedValue(strategy = GenerationType.TABLE, generator = "category_gen")
@TableGenerator(name = "category_gen", table = "id_generator",
                pkColumnName = "gen_name", valueColumnName = "gen_value",
                pkColumnValue = "category", allocationSize = 1)
private Long categoryId;
```

- Keeps the next value in an ordinary table, one row per generator name.
- Portable across all databases, but slower because each key needs a table read and update. Rarely used now.

### 18.5 Sample code and output

Entity using `IDENTITY` (the recommended choice for MySQL and H2 in this project):

```java
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

    @Column(name = "category_name", nullable = false, unique = true, length = 100)
    private String categoryName;

    public Category() { }
    public Category(String categoryName) { this.categoryName = categoryName; }

    public Long getCategoryId() { return categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    @Override
    public String toString() {
        return "Category{categoryId=" + categoryId + ", categoryName='" + categoryName + "'}";
    }
}
```

Service code:

```java
Category c1 = categoryRepository.save(new Category("Electronics"));
Category c2 = categoryRepository.save(new Category("Books"));
System.out.println(c1);
System.out.println(c2);
```

Example output with `spring.jpa.show-sql=true` (values depend on your run):

```
Hibernate: insert into categories (category_name) values (?)
Hibernate: insert into categories (category_name) values (?)
Category{categoryId=1, categoryName='Electronics'}
Category{categoryId=2, categoryName='Books'}
```

- The ID is never set in Java code. The database assigns `1` and `2`, and `save` returns the object with the ID filled in.
- Always use the object returned by `save`, because it carries the generated ID.

### 18.6 Which one to choose?

| Database | Recommended |
|---|---|
| MySQL, MariaDB | `IDENTITY` |
| H2 (learning) | `IDENTITY` or `AUTO` |
| PostgreSQL, Oracle | `SEQUENCE` |
| Any, legacy or portable | `TABLE` (rare) |

- Do not assign IDs manually with `size()+1` in a database app. After a delete, the count can repeat an existing ID.

### 18.7 Interview Questions - GenerationType

**Q64. How many values does `GenerationType` have?**
Four: `AUTO`, `IDENTITY`, `SEQUENCE` and `TABLE`.

**Q65. What is the difference between `IDENTITY` and `SEQUENCE`?**
`IDENTITY` uses the table's auto-increment column and gives the ID after the insert. `SEQUENCE` uses a separate database object, gives the ID before the insert, and allows batching.

**Q66. What does `allocationSize` do?**
It tells Hibernate how many IDs to fetch from a sequence or table at once. It must match the database's increment, or IDs can clash.

**Q67. Why is `TABLE` rarely used?**
Every new key needs a read and an update on a separate table, which is slower than `IDENTITY` or `SEQUENCE`.

**Q68. Why should you not generate IDs with `list.size() + 1`?**
After a delete, the next ID can duplicate an existing one. The database should generate the ID.