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


## 19. Validation with `@Valid` and Lombok

### 19.1 What problem this solves

A client can send anything in the JSON body. Without checks, an empty category name goes straight to the database, or fails much later with a confusing error.

Validation means checking the data **at the boundary** (when it enters the controller) and rejecting bad input before any service or database code runs.

Two libraries are used in this project:

| Library | Role |
|---|---|
| **Jakarta Bean Validation** (`jakarta.validation.*`) | The standard API. It only defines annotations such as `@NotBlank`. |
| **Hibernate Validator** | The implementation of that API. It reads the annotations and does the checks. |

The dependency in `pom.xml` brings in the implementation:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

Spring Boot 2.3 and later no longer add this automatically with `spring-boot-starter-web`, so it must be declared.

### 19.2 The model: rules written on the fields

```java
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long categoryId;

    @NotBlank(message = "Category name is Required")
    private String categoryName;
}
```

- The rule lives next to the field, so there is one place to read it.
- `@NotBlank` fails for `null`, `""` and `"   "` (only spaces).
- The `message` is what the caller sees when the rule fails.

### 19.3 The controller: `@Valid` turns the check on

```java
@RequestMapping(value = "/public/categories", method = RequestMethod.POST)
public ResponseEntity<String> createCategory(@Valid @RequestBody Category category) {
    categoryService.createCategory(category);
    ...
}
```

Step by step:

1. `@RequestBody` converts the JSON into a `Category` object (Jackson).
2. `@Valid` tells Spring: "after you build this object, run the validation rules on it."
3. If any rule fails, Spring **stops before the method runs**. The service and database are never called.
4. Spring throws `MethodArgumentNotValidException`, which gives an HTTP **400 Bad Request**.

Without `@Valid`, the annotations on `Category` are ignored. The rules exist but nothing runs them.

**Example request and response**

```
POST /api/public/categories
{ "categoryName": "" }
```

```
HTTP 400 Bad Request
{ "timestamp": "...", "status": 400, "error": "Bad Request", "path": "/api/public/categories" }
```

The default body does not show the message. To show it, add a handler with `@RestControllerAdvice` (see 19.7).

### 19.4 Common constraint annotations

| Annotation | Checks | Use for |
|---|---|---|
| `@NotNull` | Not `null` (empty text is allowed) | Numbers, objects, IDs |
| `@NotEmpty` | Not `null` and not empty (`size > 0`) | Lists, collections, text (spaces allowed) |
| `@NotBlank` | Not `null`, not empty, and not only spaces | Text such as names, emails |
| `@Size(min=2, max=50)` | Length of text or size of a collection | Text limits |
| `@Min(1)` / `@Max(100)` | Numeric range | Quantity, price |
| `@Positive` / `@PositiveOrZero` | Greater than 0 / 0 or more | Price, stock |
| `@Email` | Email format | Email fields |
| `@Pattern(regexp="...")` | Matches a regex | Phone, postcode |
| `@Past` / `@Future` | Date is before or after now | Birth date, expiry |

Choosing between the three text checks is a common interview question:
- `@NotNull` is the weakest: `""` passes.
- `@NotEmpty` rejects `""` but allows `"   "`.
- `@NotBlank` is the strictest and is the usual choice for text.

### 19.5 Nested objects and lists

Rules on a child object only run when the parent field is marked `@Valid`:

```java
public class Product {
    @NotBlank
    private String name;

    @Valid                       // without this, Address's rules are skipped
    private Address address;

    @Valid                       // checks each item in the list
    private List<Review> reviews;
}
```

### 19.6 `@Valid` vs `@Validated`

- `@Valid` (`jakarta.validation`) is the standard one. Use it on request bodies and on nested fields.
- `@Validated` (`org.springframework.validation.annotation`) is Spring's version. It supports **validation groups** (for example, different rules for create and update). Use it on the class or on a method parameter.

### 19.7 Customising the error response with `@RestControllerAdvice`

Instead of the default body, one class can turn every validation error into a clean response for the whole app:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
          .forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }
}
```

```
HTTP 400
{ "categoryName": "Category name is Required" }
```

Note: this project does not have a `@RestControllerAdvice` class yet.

### 19.8 Things to watch in this project

- **`PUT /public/categories/{id}` has no `@Valid`.** An update with a blank name is accepted. Add `@Valid` to its `@RequestBody` too.
- **Validation errors are not handled.** Without an advice class, the caller gets only a generic 400.
- **Validation is not a replacement for database constraints.** Use `@Column(nullable = false, unique = true)` as well, because other code paths can still write bad data.
- **Do not put `@Valid` on a `@PathVariable`.** Use `@Min`/`@Positive` on the parameter and add `@Validated` on the class instead.

### 19.9 What is Lombok?

Lombok is a **compile-time** library. It generates Java code (getters, setters, constructors, `toString`, `equals`, `hashCode`) while the code is compiled. The source file stays short, and the `.class` file contains the full methods.

In `pom.xml`:

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.48</version>
    <scope>provided</scope>
</dependency>
```

`provided` means it is used only at compile time and is not packed into the final jar.

### 19.10 The Lombok annotations on `Category`

| Annotation | What it generates |
|---|---|
| `@Getter` | `getCategoryId()`, `getCategoryName()` |
| `@Setter` | `setCategoryId(...)`, `setCategoryName(...)` |
| `@ToString` | `toString()` of the form `Category(categoryId=1, categoryName=Books)` |
| `@EqualsAndHashCode` | `equals()` and `hashCode()` based on the fields |
| `@Data` | All of the above, plus `@RequiredArgsConstructor` |
| `@NoArgsConstructor` | `public Category() {}`. JPA needs this. |
| `@AllArgsConstructor` | A constructor with every field as a parameter |

`@Data` is a shortcut for `@Getter + @Setter + @ToString + @EqualsAndHashCode + @RequiredArgsConstructor`.

The block commented out at the bottom of `Category.java` is exactly what `@Data` replaces. About 20 lines become 5 annotations.

### 19.11 Lombok gotchas (important for JPA)

- **`@Data` on an `@Entity` can break things.** Its `equals`/`hashCode` use all fields, and its `toString` can load lazy relations. For big entities, prefer `@Getter @Setter` and write `equals`/`hashCode` on the ID only.
- **`@AllArgsConstructor` plus `@NoArgsConstructor`** gives two constructors. JPA needs the no-arg one, so keep it.
- **IDE support.** If the IDE shows "cannot find getCategoryName()", install the Lombok plugin and turn on annotation processing. The code still compiles from Maven.

### 19.12 How validation and Lombok help build apps faster

| Without | With |
|---|---|
| Hand-written checks in every controller (`if (name == null) ...`) | One annotation on the field, checked everywhere `@Valid` is used |
| 20 lines of getters/setters/constructors per class | A few annotations, generated at compile time |
| Rules spread across controller, service and UI | Rules in one place on the model |
| Bad data reaches the database and fails with a SQL error | Bad data is rejected early with a clear message |
| Change a rule in ten places | Change the annotation once |

### 19.13 Interview Questions - Validation and Lombok

**Q69. What does `@Valid` do?**
It tells Spring to run the Bean Validation rules on the object before the controller method runs. If a rule fails, Spring throws `MethodArgumentNotValidException` and the method is not called.

**Q70. What is the difference between Bean Validation and Hibernate Validator?**
Bean Validation (Jakarta) is the specification: it defines annotations like `@NotBlank`. Hibernate Validator is the implementation that checks them.

**Q71. What is the difference between `@NotNull`, `@NotEmpty` and `@NotBlank`?**
`@NotNull` rejects only `null`. `@NotEmpty` rejects `null` and `""`. `@NotBlank` rejects `null`, `""` and whitespace-only strings. It applies only to `String`.

**Q72. What status code does a failed `@Valid` return by default?**
400 Bad Request.

**Q73. What is the difference between `@Valid` and `@Validated`?**
`@Valid` is the standard annotation and is used on request bodies and nested fields. `@Validated` is Spring's version and supports validation groups.

**Q74. Why does a nested object need `@Valid` on its field?**
Validation does not go into child objects by default. Without `@Valid` on the field, the child's rules are ignored.

**Q75. What is Lombok and why use it?**
A compile-time library that generates getters, setters, constructors, `toString`, `equals` and `hashCode`. It removes boilerplate, so the class stays short and readable.

**Q76. What does `@Data` include?**
`@Getter`, `@Setter`, `@ToString`, `@EqualsAndHashCode` and `@RequiredArgsConstructor`.

**Q77. Why is `@Data` risky on a JPA entity?**
Its `equals`/`hashCode` use every field, and its `toString` can trigger lazy loading. Both can cause subtle bugs or slow queries in entities.

**Q78. Why do JPA entities need a no-argument constructor?**
Hibernate creates entity objects through reflection, and it needs an empty constructor to do so. `@NoArgsConstructor` provides it.

**Q79. Is Lombok code present in the compiled `.class` file?**
Yes. Lombok changes the compiled output, so the generated methods exist in the `.class` file. The source file does not contain them.

---

## 20. `GlobalExceptionHandler` — Centralized Error Handling

### Overview

This class is a **centralized error handler** for your entire Spring Boot application. Without it, Spring would return a generic 500 error page or a raw exception stack trace to the API client. With it, you get clean, structured JSON error responses.

---

### `@RestControllerAdvice` — The Key Annotation

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
```

This is a combination of two annotations:

| Annotation | What it does |
|---|---|
| `@ControllerAdvice` | Makes this class intercept exceptions thrown from **any** `@Controller` or `@RestController` across the whole app |
| `@ResponseBody` | Automatically serializes the return value to JSON |

**Flow without this:**
```
POST /api/products → Validation fails → Spring throws exception → Client gets 500 HTML error page
```

**Flow with this:**
```
POST /api/products → Validation fails → Spring throws exception → GlobalExceptionHandler catches it → Client gets clean JSON: {"name": "must not be blank"}
```

---

### `@ExceptionHandler` — Targeting Specific Exceptions

```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
```

- `@ExceptionHandler(MethodArgumentNotValidException.class)` tells Spring: *"When this specific exception type is thrown anywhere in the app, call this method instead of the default handler."*
- `MethodArgumentNotValidException` is thrown automatically by Spring when `@Valid` or `@Validated` fails on a request body (i.e., a `@RequestBody` annotated parameter fails its bean validation constraints like `@NotBlank`, `@Size`, `@Min`, etc.)

---

### Method 1: `handleValidationExceptions` (Active — has `@ExceptionHandler`)

```java
Map<String, String> fieldErrors = new LinkedHashMap<>();
ex.getBindingResult().getFieldErrors()
        .forEach(fieldError -> fieldErrors.put(
                fieldError.getField(),
                fieldError.getDefaultMessage())
        );
return fieldErrors;
```

#### `ex.getBindingResult()`
- `BindingResult` is Spring's object that holds ALL validation errors collected during binding and validation.
- It knows which fields failed and why.

#### `.getFieldErrors()`
- Returns only **field-level** errors (errors tied to a specific field like `name`, `price`, `email`).
- Each `FieldError` contains:
  - `.getField()` → the field name (e.g., `"name"`)
  - `.getDefaultMessage()` → the message from the constraint annotation (e.g., `"must not be blank"`)

#### `LinkedHashMap`
- Preserves **insertion order** — errors appear in the same order the fields are defined in the class, which is nicer for the API consumer than a random `HashMap`.

**Example output for a failed POST request:**
```json
{
  "name": "Product name must not be blank",
  "description": "must not be blank",
  "price": "must be greater than 0"
}
```

---

### Method 2: `myMethodArgumentNotValidException` (Inactive — no `@ExceptionHandler`)

```java
public Map<String, String> myMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
    ...
    ex.getBindingResult()
            .getAllErrors()
            ...
```

This method **will never be called** because it has no `@ExceptionHandler` annotation. It is likely a draft or experiment. Key differences from method 1:

| | Method 1 | Method 2 |
|---|---|---|
| **Annotation** | `@ExceptionHandler` present ✅ | Missing ❌ — never fires |
| **Error source** | `.getFieldErrors()` | `.getAllErrors()` |
| **Scope** | Field-level errors only | Field + class-level errors |
| **Cast** | Not needed | `((FieldError) error)` cast required |

#### Why `.getAllErrors()` needs a cast
`getAllErrors()` returns `List<ObjectError>`. `ObjectError` is the parent class. `FieldError` extends `ObjectError` and adds `.getField()`. Since `ObjectError` doesn't have `.getField()`, you must cast down: `((FieldError) error).getField()`. This cast would crash (`ClassCastException`) if a class-level constraint error (not a field error) was in the list.

---

### The Bug / Issue to Fix

The second method `myMethodArgumentNotValidException` has two problems:

1. **No `@ExceptionHandler`** — it is dead code, never invoked.
2. **Unsafe cast** — if `getAllErrors()` contains a non-`FieldError` `ObjectError`, the cast to `FieldError` throws `ClassCastException`.

You should either delete it, or if you intended to capture class-level errors too, fix it like this:

```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public Map<String, String> handleAllValidationErrors(MethodArgumentNotValidException ex) {
    Map<String, String> fieldErrors = new LinkedHashMap<>();
    ex.getBindingResult().getAllErrors().forEach(error -> {
        String fieldName = (error instanceof FieldError fe) ? fe.getField() : error.getObjectName();
        String errorMessage = error.getDefaultMessage();
        fieldErrors.put(fieldName, errorMessage);
    });
    return fieldErrors;
}
```

---

### Full Request Lifecycle (How it all fits together)

```
Client sends POST /api/category
         │
         ▼
  @PostMapping method in Controller
  @RequestBody @Valid CategoryDTO dto    ← @Valid triggers validation
         │
  Hibernate Validator runs @NotBlank, @Size, etc. on CategoryDTO fields
         │
         ├── All valid → method executes normally
         │
         └── Any invalid → Spring throws MethodArgumentNotValidException
                    │
                    ▼
         GlobalExceptionHandler.handleValidationExceptions()
                    │
                    ▼
         Returns Map<String, String> → Spring serializes to JSON → 400 response to client
```

---

### Summary of Key Concepts

| Concept | Purpose |
|---|---|
| `@RestControllerAdvice` | Intercepts exceptions app-wide and returns JSON |
| `@ExceptionHandler` | Routes a specific exception type to a handler method |
| `MethodArgumentNotValidException` | Thrown when `@Valid` fails on `@RequestBody` |
| `BindingResult` | Holds all validation errors |
| `getFieldErrors()` | Field-specific errors only |
| `getAllErrors()` | All errors including class-level |
| `LinkedHashMap` | Preserves field order in the JSON response |

The main thing to remember: without `@ExceptionHandler` on method 2, it is completely ignored by Spring — it is just an ordinary method that happens to sit in the class.

---

### 20.1 Interview Questions — GlobalExceptionHandler

**Q80. What does `@RestControllerAdvice` do?**
It marks a class as a global exception handler for all controllers. It combines `@ControllerAdvice` (intercepts exceptions app-wide) and `@ResponseBody` (serializes return values to JSON automatically).

**Q81. What does `@ExceptionHandler` do?**
It maps a specific exception type to a handler method. When that exception is thrown anywhere in the app, Spring calls the annotated method instead of the default error handler.

**Q82. What is `MethodArgumentNotValidException` and when is it thrown?**
It is thrown by Spring when `@Valid` or `@Validated` on a `@RequestBody` parameter fails. It carries all the validation errors collected by Hibernate Validator.

**Q83. What is `BindingResult`?**
An object that holds all validation errors after Spring binds and validates a request. It contains field errors (tied to a specific field) and global errors (tied to the whole object).

**Q84. What is the difference between `getFieldErrors()` and `getAllErrors()` on `BindingResult`?**
`getFieldErrors()` returns only field-level errors tied to a specific field name. `getAllErrors()` returns all errors including class-level constraint errors that are not tied to any single field.

**Q85. Why does method 2 (`myMethodArgumentNotValidException`) never get called?**
It has no `@ExceptionHandler` annotation. Without it, Spring has no reason to call that method when an exception is thrown. It is treated as an ordinary, unreachable method.

**Q86. Why is `LinkedHashMap` used instead of `HashMap` for the error response?**
`LinkedHashMap` preserves insertion order, so errors appear in the same order as the fields in the class. A `HashMap` has no guaranteed order, making the response unpredictable for the API consumer.

**Q87. Why is the cast `((FieldError) error)` in method 2 unsafe?**
`getAllErrors()` can return both `FieldError` and `ObjectError` instances. `ObjectError` is the parent and does not have a `.getField()` method. Casting a plain `ObjectError` to `FieldError` throws `ClassCastException` at runtime.

**Q88. What HTTP status code does `MethodArgumentNotValidException` return by default?**
400 Bad Request.

**Q89. How would you safely handle both field-level and class-level errors in one handler?**
Use `instanceof` to check the type before casting:
```java
String fieldName = (error instanceof FieldError fe) ? fe.getField() : error.getObjectName();
```
This avoids `ClassCastException` when a non-field error is in the list.

**Q90. Can you have multiple `@ExceptionHandler` methods in one `@RestControllerAdvice` class?**
Yes. Each method handles a different exception type. Spring picks the most specific matching handler when an exception is thrown.

---

## 20.2 Why the handler returns 200 instead of 400

The handler method returns a plain `Map<String, String>`:

```java
public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
    ...
    return fieldErrors;   // ← plain object, no status specified
}
```

When a `@RestControllerAdvice` method returns a plain object with **no `ResponseEntity` and no `@ResponseStatus` annotation**, Spring has no instruction about the HTTP status, so it defaults to **200 OK** — even though the body contains error messages.

Spring's logic is: *"You gave me a body to serialize, I'll send it with 200 unless you tell me otherwise."*

To get 400, there are two options:

**Option 1 — Wrap in `ResponseEntity`:**
```java
public ResponseEntity<Map<String, String>> handleValidationExceptions(...) {
    ...
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(fieldErrors);
}
```

**Option 2 — Add `@ResponseStatus` on the method:**
```java
@ResponseStatus(HttpStatus.BAD_REQUEST)
public Map<String, String> handleValidationExceptions(...) {
    ...
    return fieldErrors;
}
```

Both produce the same result: the same JSON body, but with **400** in the status line.

The body content (field → message map) is already correct — the only problem is the missing status instruction.

**Option 3 - Add a custom `buildError` method:**
```java
// filename: global-exception-handler.java

package com.ecommerce.project.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleRequestValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.put(error.getField(), error.getDefaultMessage()));

        return badRequest(fieldErrors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(
            ConstraintViolationException ex) {

        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(violation ->
                fieldErrors.put(
                        violation.getPropertyPath().toString(),
                        violation.getMessage()));

        return badRequest(fieldErrors);
    }

    private ResponseEntity<Map<String, Object>> badRequest(
            Map<String, String> fieldErrors) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation failed");
        body.put("fieldErrors", fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }
}

```

---

### Interview Questions — Handler returning wrong status

**Q91. Why does a `@RestControllerAdvice` handler return 200 even when it handles a validation error?**
Because the method returns a plain object with no `ResponseEntity` and no `@ResponseStatus`. Spring defaults to 200 OK when no status instruction is given, regardless of which exception was caught.

**Q92. What are the two ways to set the HTTP status on a `@ExceptionHandler` method?**
Return a `ResponseEntity` with the desired status (e.g., `ResponseEntity.status(HttpStatus.BAD_REQUEST).body(...)`), or annotate the method with `@ResponseStatus(HttpStatus.BAD_REQUEST)`.

**Q93. What is the difference between the two approaches for setting the status on an exception handler?**
`ResponseEntity` gives full control — you can also set headers and choose the body at runtime. `@ResponseStatus` is simpler and fixes the status at compile time, but you cannot change it per-request and you cannot add custom headers.

**Q94. If the JSON body is correct but the status is 200, what is missing?**
A status instruction — either a `ResponseEntity` wrapping the return value, or a `@ResponseStatus` annotation on the handler method.

**Q95. Does returning a plain `Map` from a `@RestControllerAdvice` method affect the body?**
No. The body is serialized correctly to JSON regardless. Only the HTTP status is wrong when no status is specified.

---

## 21. Custom Exceptions — Why and How

### 21.1 Why not just use `ResponseStatusException`?

`ResponseStatusException` works, but it has three problems when used inside the service layer:

**Problem 1 — It mixes HTTP into the service layer**

```java
// Service layer — should only know business logic
.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
```

The service now knows about `HttpStatus`, which is an HTTP concept. The service should only know *what went wrong* (category not found), not *how to express it over HTTP* (404). That mapping belongs in the handler.

**Problem 2 — The error message is a loose string, not structured data**

`ResponseStatusException` carries a `String reason`. You cannot attach structured fields like resource name, field name, or field value. The handler gets a string and can only forward it as-is.

**Problem 3 — Every caller formats the message differently**

```java
// In deleteCategory
new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found")

// In updateCategory
new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource Not Found")
```

There is no consistency. Each developer writes their own message.

---

### 21.2 What a custom exception gives you

| Concern | `ResponseStatusException` | Custom exception |
|---|---|---|
| Where HTTP status lives | Inside the service | In `GlobalExceptionHandler` only |
| What the service throws | An HTTP concept | A domain concept (`ResourceNotFound`) |
| Structured data on the exception | No | Yes — fields, IDs, resource names |
| Consistent message format | Only if you remember | Always — the constructor enforces it |
| Readable throw site | Moderate | High — the class name explains intent |
| Testing | Test the status code | Test the exception type and its fields |

---

### 21.3 Your current custom exception — `ResponseNotFoundException`

```java
package com.ecommerce.project.exceptions;

public class ResponseNotFoundException extends RuntimeException {

    String resourceName;
    String fieldName;
    String field;
    Long fieldId;

    // Constructor for String-valued fields
    public ResponseNotFoundException(String message, String resourceName, String fieldName, String field) {
        super(String.format("%s not found with %s: %s", resourceName, field, fieldName));
        this.resourceName = resourceName;
        this.fieldName = fieldName;
        this.field = field;
    }

    // Constructor for Long-valued fields (IDs)
    public ResponseNotFoundException(String message, String resourceName, Long fieldId) {
        super(String.format("%s not found with %s: %d", message, resourceName, fieldId));
        this.resourceName = resourceName;
        this.field = field;   // ← bug: 'field' here is the unset instance variable (null), not a parameter
        this.fieldId = fieldId;
    }
}
```

Key design decisions:
- Extends `RuntimeException` — no `throws` clause needed anywhere.
- Takes the resource name and field info as constructor parameters — the message is built once, consistently.
- The service throws it with meaning: `new ResponseNotFoundException("Category", "categoryId", categoryId)` reads like English.

**How the service uses it:**

```java
// deleteCategory
Category category = categoryRepository.findById(categoryId)
        .orElseThrow(() -> new ResponseNotFoundException("DeleteCategory", "categoryId", categoryId));

// updateCategory
Category savedCategory = categoryRepository.findById(categoryId)
        .orElseThrow(() -> new ResponseNotFoundException("Category", "categoryId", categoryId));
```

The service no longer imports `HttpStatus`. It only says "this resource was not found" and passes the details. The handler decides the status code.

---

### 21.4 The missing piece — a handler for it in `GlobalExceptionHandler`

Right now `GlobalExceptionHandler` only handles `MethodArgumentNotValidException`. `ResponseNotFoundException` has no handler, so Spring falls back to its default and returns **500 Internal Server Error**.

To fix that, add a second handler:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(err -> fieldErrors.put(err.getField(), err.getDefaultMessage()));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(fieldErrors);
    }

    @ExceptionHandler(ResponseNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleResponseNotFoundException(ResponseNotFoundException ex) {
        Map<String, String> response = new LinkedHashMap<>();
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
}
```

Now the HTTP status (404) lives only in the handler. The service never mentions it.

---

### 21.5 Full workflow — end to end

```
Client sends DELETE /api/admin/categories/99
         │
         ▼
  CategoryController.deleteCategory(99L)
         │
         ▼
  categoryRepository.findById(99L)   → Optional.empty()
         │
         ▼
  .orElseThrow(() -> new ResponseNotFoundException("DeleteCategory", "categoryId", 99L))
         │
         ▼
  ResponseNotFoundException is thrown
  getMessage() → "DeleteCategory not found with categoryId: 99"
         │
         ▼
  Spring sees an unhandled exception, checks @RestControllerAdvice beans
         │
         ▼
  GlobalExceptionHandler.handleResponseNotFoundException(ex) is called
         │
         ▼
  Returns ResponseEntity:
    Status: 404 Not Found
    Body:   { "message": "DeleteCategory not found with categoryId: 99" }
         │
         ▼
  Client receives:
  HTTP/1.1 404 Not Found
  Content-Type: application/json
  { "message": "DeleteCategory not found with categoryId: 99" }
```

---

### 21.6 Known issue in the current `ResponseNotFoundException`

In constructor 2 (the 3-parameter one), there is a bug:

```java
public ResponseNotFoundException(String message, String resourceName, Long fieldId) {
    super(String.format("%s not found with %s: %d", message, resourceName, fieldId));
    this.resourceName = resourceName;
    this.field = field;   // ← 'field' is the instance variable, not a parameter — always null
    this.fieldId = fieldId;
}
```

`field` on the right side of the assignment refers to the instance variable `field`, which has never been set, so it is always `null`. The parameter `String field` does not exist in this constructor. The line assigns `null` to `null` — harmless but useless and confusing. If you need `field` stored, the constructor needs a `String field` parameter.

---

### 21.7 Interview Questions — Custom Exceptions

**Q96. Why is throwing `ResponseStatusException` from the service layer a bad practice?**
It couples the service to HTTP concepts. The service should only express what went wrong in domain terms. Mapping that to an HTTP status code is the responsibility of the exception handler in the web layer.

**Q97. What does extending `RuntimeException` give a custom exception?**
It makes the exception unchecked, so no method in the call chain needs a `throws` clause. Spring's exception handling works with unchecked exceptions seamlessly.

**Q98. What happens if you throw a custom exception that has no `@ExceptionHandler` in `@RestControllerAdvice`?**
Spring falls back to its default error handler and returns `500 Internal Server Error`, even if the exception represents a "not found" situation.

**Q99. How does a custom exception keep the error message consistent?**
The message format is built inside the constructor with `String.format(...)`. Every caller passes the same kind of data (resource name, field name, value), and the constructor always formats it the same way.

**Q100. What is the difference between `ex.getMessage()` and `ex.getReason()` in an exception handler?**
`getMessage()` is a method on `Throwable` (the root of all exceptions) and returns the message passed to `super(...)`. `getReason()` is specific to `ResponseStatusException`. For a custom exception that extends `RuntimeException`, use `getMessage()`.

**Q101. Where should the HTTP status code live — in the service or in the handler?**
In the handler only. The service throws a domain exception describing what went wrong. The handler decides what HTTP status that maps to and builds the response.

**Q102. What is the advantage of storing fields like `resourceName` and `fieldId` on the exception object?**
The handler can read them to build a richer, structured response — for example separate JSON keys for the resource name and the missing ID — rather than parsing a string message.

---

## 22. `APIException` — General Purpose Custom Exception

### 22.1 The class

```java
package com.ecommerce.project.exceptions;

import org.springframework.http.HttpStatus;

public class APIException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private final HttpStatus status;

    public APIException() {
        super();
        this.status = HttpStatus.INTERNAL_SERVER_ERROR;   // default: 500
    }

    public APIException(String message) {
        this(message, HttpStatus.BAD_REQUEST);            // default: 400
    }

    public APIException(String message, HttpStatus status) {
        super(message);
        this.status = status;                             // caller chooses the status
    }

    public HttpStatus getStatus() {
        return status;
    }
}
```

---

### 22.2 What makes it different from `ResponseNotFoundException`

| Point | `ResponseNotFoundException` | `APIException` |
|---|---|---|
| **Purpose** | One specific situation: resource not found | General — any API-level business error |
| **HTTP status** | Handler hardcodes `404` | Stored on the exception itself via `getStatus()` |
| **Constructors** | Takes resource name, field name, field value | Takes a message and an optional `HttpStatus` |
| **Service throws** | Domain-specific: `new ResponseNotFoundException("Category", "categoryId", 1L)` | General: `new APIException("Duplicate name", HttpStatus.CONFLICT)` |
| **Handler reads status from** | Does not — handler hardcodes `HttpStatus.NOT_FOUND` | `e.getStatus()` — the exception itself carries it |

---

### 22.3 Three constructors — when to use each

```java
// 1. No-arg — used when you have no message and want 500
throw new APIException();
// Message: null, Status: 500

// 2. Message only — defaults to 400 Bad Request
throw new APIException("Category name already exists");
// Message: "Category name already exists", Status: 400

// 3. Message + status — full control
throw new APIException("Payment service unavailable", HttpStatus.SERVICE_UNAVAILABLE);
// Message: "Payment service unavailable", Status: 503
```

The 2-argument constructor delegates to the 3-argument one using `this(message, HttpStatus.BAD_REQUEST)`. This is called **constructor chaining** — one constructor calls another constructor in the same class with `this(...)`.

---

### 22.4 `serialVersionUID` — why it is there

```java
private static final long serialVersionUID = 1L;
```

- `Throwable` (the root of all exceptions) implements `java.io.Serializable`.
- Serializable classes should declare `serialVersionUID` so Java can verify that a serialized object matches the current class when it is deserialized.
- If you don't declare it, Java computes one automatically from the class structure. If the class changes later, the computed value changes and deserialization from an older version fails.
- For exceptions, serialization rarely matters in practice (exceptions are not usually saved to disk), but IDEs and static analysis tools warn if it is missing. Setting it to `1L` silences the warning.

---

### 22.5 The handler for `APIException`

```java
@ExceptionHandler(APIException.class)
ResponseEntity<String> myAPIException(APIException e) {
    String message = e.getMessage();
    return new ResponseEntity<>(message, e.getStatus());   // status comes from the exception
}
```

Key point: `e.getStatus()` reads the `HttpStatus` that was stored when the exception was constructed. The handler does not hardcode any status. The same handler works for `400`, `409`, `503`, or any other status the thrower chose.

---

### 22.6 Full updated `GlobalExceptionHandler`

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // METHOD 1 — validation errors from @Valid on @RequestBody
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(fieldError -> fieldErrors.put(
                        fieldError.getField(),
                        fieldError.getDefaultMessage()));
        return fieldErrors;
    }

    // METHOD 3 — constraint violations from @Validated on @PathVariable / @RequestParam
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(violation ->
                fieldErrors.put(
                        violation.getPropertyPath().toString(),
                        violation.getMessage()));
        return badRequest(fieldErrors);
    }

    // Helper — builds a structured 400 body
    ResponseEntity<Map<String, Object>> badRequest(Map<String, String> fieldErrors) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation failed");
        body.put("fieldErrors", fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }

    // Custom exception — resource not found
    @ExceptionHandler(ResponseNotFoundException.class)
    ResponseEntity<String> myResponseNotFoundException(ResponseNotFoundException e) {
        return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
    }

    // Custom exception — general API business error
    @ExceptionHandler(APIException.class)
    ResponseEntity<String> myAPIException(APIException e) {
        return new ResponseEntity<>(e.getMessage(), e.getStatus());
    }
}
```

---

### 22.7 `ConstraintViolationException` vs `MethodArgumentNotValidException`

These are two different exceptions for two different validation triggers:

| | `MethodArgumentNotValidException` | `ConstraintViolationException` |
|---|---|---|
| **Triggered by** | `@Valid` on `@RequestBody` | `@Validated` on the class + constraint on `@PathVariable` or `@RequestParam` |
| **Thrown by** | Spring MVC | Hibernate Validator (Bean Validation) |
| **Errors read from** | `ex.getBindingResult().getFieldErrors()` | `ex.getConstraintViolations()` |
| **Example** | POST body with blank `categoryName` | GET `/categories/{id}` where `id` fails `@Min(1)` |

---

### 22.8 Constructor chaining with `this(...)`

```java
public APIException(String message) {
    this(message, HttpStatus.BAD_REQUEST);   // calls the 3-arg constructor
}
```

- `this(...)` inside a constructor calls another constructor in the **same class**.
- It must be the **first statement** in the constructor body.
- It avoids duplicating the `super(message)` call and status assignment in every constructor.
- Do not confuse with `super(...)`, which calls a constructor in the **parent class**.

---

### 22.9 When to use which exception

| Situation | Throw |
|---|---|
| A required resource is not found (404) | `ResponseNotFoundException` |
| A business rule is violated (e.g. duplicate name) | `APIException("Duplicate category name")` — defaults to 400 |
| An external service is down | `APIException("Payment service unavailable", HttpStatus.SERVICE_UNAVAILABLE)` |
| Input validation fails on `@RequestBody` | Let `@Valid` throw `MethodArgumentNotValidException` automatically |
| Input validation fails on `@PathVariable` | Let `@Validated` throw `ConstraintViolationException` automatically |

---

### 22.10 Interview Questions — `APIException`

**Q103. What is the key design difference between `APIException` and `ResponseNotFoundException`?**
`APIException` stores the `HttpStatus` on itself via a constructor parameter and exposes it through `getStatus()`. The handler reads that status dynamically. `ResponseNotFoundException` carries no status — the handler hardcodes `HttpStatus.NOT_FOUND` for it.

**Q104. What does constructor chaining with `this(...)` do?**
It calls another constructor in the same class. It must be the first statement. It is used to avoid repeating shared logic across constructors.

**Q105. What is `serialVersionUID` and why is it set to `1L` on `APIException`?**
`Throwable` implements `Serializable`, so all exceptions can be serialized. `serialVersionUID` is the version token used during deserialization to confirm the class has not changed. Setting it to `1L` explicitly prevents IDE warnings and avoids deserialization failures if the class is later modified.

**Q106. What is the difference between `MethodArgumentNotValidException` and `ConstraintViolationException`?**
`MethodArgumentNotValidException` is thrown when `@Valid` fails on a `@RequestBody`. `ConstraintViolationException` is thrown when `@Validated` is on the class and a constraint on `@PathVariable` or `@RequestParam` fails.

**Q107. Why can the same `@ExceptionHandler(APIException.class)` method handle both 400 and 503 responses?**
Because it reads the status from `e.getStatus()` instead of hardcoding it. The thrower decides the status at the time the exception is constructed, and the handler just forwards it.

**Q108. What is the default HTTP status when `new APIException(message)` is thrown?**
400 Bad Request. The single-argument constructor delegates to `this(message, HttpStatus.BAD_REQUEST)`.

**Q109. What happens when `new APIException()` (no arguments) is thrown?**
The message is `null` and the status is `500 Internal Server Error`, since the no-arg constructor sets `this.status = HttpStatus.INTERNAL_SERVER_ERROR`.

---

## 23. DTOs and Custom Responses (from Pagination concepts)

### 23.1 The problem — returning a raw entity or a plain list

Right now the controller returns `List<Category>` directly:

```java
@GetMapping("/public/categories")
public ResponseEntity<List<Category>> getAllCategoryList() {
    return new ResponseEntity<>(categoryService.getAllCategoryList(), HttpStatus.OK);
}
```

This works for small data, but it has three problems:

**Problem 1 — The entity leaks into the API contract**

`Category` is a JPA entity. It has `@Entity`, `@Id`, `@GeneratedValue`, validation annotations. If you rename `categoryId` to `id` in the database, the JSON key changes too — breaking every client that depended on `"categoryId"`.

**Problem 2 — You expose everything in the entity**

If `Category` gains an internal field like `createdAt`, `deletedAt`, or `createdByUserId`, those fields appear in the JSON automatically. The client sees data it was never meant to see.

**Problem 3 — Pagination metadata has nowhere to go**

When you paginate, the client needs more than just the list. It needs:
- the actual items for this page
- which page number this is
- how many items per page
- how many total items exist
- how many total pages exist
- whether this is the last page

A plain `List<Category>` can carry none of that.

---

### 23.2 What is a DTO?

A **DTO (Data Transfer Object)** is a plain Java class whose only job is to carry data between layers. It has no JPA annotations, no business logic, no database knowledge — only fields, getters and setters (or a record).

```java
// Entity — lives in the database layer
@Entity
@Data
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long categoryId;

    @NotBlank(message = "Category name is Required")
    private String categoryName;
}

// DTO — lives in the API layer, what the client actually sees
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    private Long categoryId;
    private String categoryName;
}
```

They look similar now, but they serve different masters:
- `Category` is owned by the database. Its shape follows the table.
- `CategoryDTO` is owned by the API contract. Its shape follows what clients need.

As the project grows they will diverge — the entity gets audit fields, soft-delete flags, version columns; the DTO stays lean and stable.

---

### 23.3 What is a Custom Response?

A **custom response** is a wrapper class that holds not just the data but also metadata about the response — especially pagination info.

For the category list with pagination, it looks like this:

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private List<CategoryDTO> content;      // the page's items
    private Integer pageNumber;             // current page (0-based)
    private Integer pageSize;              // items per page
    private Long totalElements;            // total items in the database
    private Integer totalPages;            // total number of pages
    private Boolean lastPage;              // true if this is the last page
}
```

The client gets one JSON object that answers all questions at once:

```json
{
  "content": [
    { "categoryId": 1, "categoryName": "Electronics" },
    { "categoryId": 2, "categoryName": "Books" }
  ],
  "pageNumber": 0,
  "pageSize": 2,
  "totalElements": 10,
  "totalPages": 5,
  "lastPage": false
}
```

Without `CategoryResponse`, the client would have to make a second call to find out how many pages exist. With it, everything arrives in one response.

---

### 23.4 How Spring Data pagination works

Spring Data JPA has built-in support for pagination through `Pageable` and `Page<T>`.

**Step 1 — Repository: no code needed**

`JpaRepository` already has:

```java
Page<Category> findAll(Pageable pageable);
```

You do not write this method. It is inherited from `JpaRepository`.

**Step 2 — Service: build `Pageable`, call the repository, map to DTO**

```java
@Override
public CategoryResponse getAllCategories(Integer pageNumber, Integer pageSize) {
    // Build the page request: which page, how many items
    Pageable pageDetails = PageRequest.of(pageNumber, pageSize);

    // Repository returns a Page<Category>
    Page<Category> categoryPage = categoryRepository.findAll(pageDetails);

    // Map each Category entity → CategoryDTO
    List<CategoryDTO> categoryDTOs = categoryPage.getContent()
            .stream()
            .map(category -> new CategoryDTO(
                    category.getCategoryId(),
                    category.getCategoryName()))
            .collect(Collectors.toList());

    // Build the custom response with the data + pagination metadata
    CategoryResponse categoryResponse = new CategoryResponse();
    categoryResponse.setContent(categoryDTOs);
    categoryResponse.setPageNumber(categoryPage.getNumber());
    categoryResponse.setPageSize(categoryPage.getSize());
    categoryResponse.setTotalElements(categoryPage.getTotalElements());
    categoryResponse.setTotalPages(categoryPage.getTotalPages());
    categoryResponse.setLastPage(categoryPage.isLast());

    return categoryResponse;
}
```

**Step 3 — Controller: accept page params, return `CategoryResponse`**

```java
@GetMapping("/public/categories")
public ResponseEntity<CategoryResponse> getAllCategories(
        @RequestParam(name = "pageNumber", defaultValue = "0") Integer pageNumber,
        @RequestParam(name = "pageSize", defaultValue = "10") Integer pageSize) {

    CategoryResponse categoryResponse = categoryService.getAllCategories(pageNumber, pageSize);
    return ResponseEntity.ok(categoryResponse);
}
```

Client calls:
```
GET /api/public/categories?pageNumber=0&pageSize=2
```

---

### 23.5 What `Page<T>` gives you

`Page<Category>` is the object Spring Data returns from `findAll(pageable)`. It is a wrapper around the results of one page, plus metadata:

| Method | Returns | Meaning |
|---|---|---|
| `getContent()` | `List<Category>` | The items on this page |
| `getNumber()` | `int` | Current page number (0-based) |
| `getSize()` | `int` | Items per page |
| `getTotalElements()` | `long` | Total items in the whole table |
| `getTotalPages()` | `int` | Total number of pages |
| `isLast()` | `boolean` | Whether this is the last page |
| `isFirst()` | `boolean` | Whether this is the first page |
| `hasNext()` | `boolean` | Whether a next page exists |
| `hasPrevious()` | `boolean` | Whether a previous page exists |

---

### 23.6 Full flow — what happens on `GET /api/public/categories?pageNumber=0&pageSize=2`

```
Client → GET /api/public/categories?pageNumber=0&pageSize=2
              │
              ▼
  CategoryController.getAllCategories(0, 2)
              │
              ▼
  categoryService.getAllCategories(0, 2)
              │
              ▼
  PageRequest.of(0, 2)   → Pageable object: "page 0, 2 items"
              │
              ▼
  categoryRepository.findAll(pageable)
              │   Hibernate generates:
              │   SELECT * FROM categories LIMIT 2 OFFSET 0;
              │   SELECT COUNT(*) FROM categories;   (for totalElements)
              ▼
  Page<Category> {content=[Electronics, Books], total=10, pages=5}
              │
              ▼
  Map List<Category> → List<CategoryDTO>   (strip JPA annotations, keep only API fields)
              │
              ▼
  Build CategoryResponse {content, pageNumber=0, pageSize=2, totalElements=10, totalPages=5, lastPage=false}
              │
              ▼
  ResponseEntity.ok(categoryResponse)
              │
              ▼
  Jackson serializes CategoryResponse → JSON
              │
              ▼
  Client receives:
  HTTP 200 OK
  {
    "content": [
      {"categoryId": 1, "categoryName": "Electronics"},
      {"categoryId": 2, "categoryName": "Books"}
    ],
    "pageNumber": 0,
    "pageSize": 2,
    "totalElements": 10,
    "totalPages": 5,
    "lastPage": false
  }
```

---

### 23.7 Why not just return `Page<Category>` directly?

Spring Data's `Page<Category>` can be serialized to JSON, but:

1. It includes Spring-internal fields in the JSON (`pageable`, `sort`, `empty`, `first`) that the client doesn't need and may confuse.
2. It exposes the `Category` entity directly — the same problem as returning `List<Category>`.
3. `CategoryResponse` gives you full control of the JSON shape. You include only what the client needs, with names you choose.

---

### 23.8 Summary — Entity vs DTO vs Custom Response

| | Entity (`Category`) | DTO (`CategoryDTO`) | Custom Response (`CategoryResponse`) |
|---|---|---|---|
| **Lives in** | Database / persistence layer | API / web layer | API / web layer |
| **Has JPA annotations** | Yes | No | No |
| **Has validation annotations** | Yes | Optionally | No |
| **Returned to client** | No (should not be) | Yes | Yes |
| **Carries pagination metadata** | No | No | Yes |
| **Changes when DB schema changes** | Yes | No | No |
| **Purpose** | Map to a table row | Shape the API response for one item | Shape the API response for a collection + metadata |

---

### 23.9 Interview Questions — DTOs and Custom Responses

**Q110. What is a DTO?**
A Data Transfer Object — a plain class that carries data between layers. It has no JPA annotations, no business logic, and its shape is driven by what the API consumer needs, not what the database stores.

**Q111. Why should you not return a JPA entity directly from a controller?**
The entity is coupled to the database schema. If the schema changes, the JSON changes too — breaking clients. It may also expose internal fields (audit timestamps, soft-delete flags) that the client should not see.

**Q112. What is a custom response class?**
A wrapper class that holds both the data (as a list of DTOs) and metadata about the response. In pagination, it includes the page content plus page number, page size, total elements, total pages, and whether this is the last page.

**Q113. What does `PageRequest.of(pageNumber, pageSize)` create?**
A `Pageable` object that tells Spring Data JPA which page to fetch and how many items per page. Page numbers are 0-based.

**Q114. What does `Page<T>` contain?**
The items for the current page (`getContent()`), plus metadata: current page number, page size, total elements across all pages, total pages, and whether this is the first or last page.

**Q115. Why is `Page<Category>` not returned directly to the client?**
It serializes Spring-internal fields (`pageable`, `sort`, `empty`) into the JSON, it exposes the entity, and you lose control of the JSON shape. A custom response class gives you clean, predictable output.

**Q116. What SQL does `findAll(pageable)` generate?**
Two queries: one `SELECT` with `LIMIT` and `OFFSET` to fetch the page's rows, and one `SELECT COUNT(*)` to compute the total number of elements for `totalPages` and `totalElements`.

**Q117. What is the difference between `pageNumber` and `pageSize`?**
`pageNumber` is which page you are on (0 = first page). `pageSize` is how many items appear on each page. Page 0 with size 10 fetches rows 1–10; page 1 with size 10 fetches rows 11–20.

**Q118. What does `@RequestParam(defaultValue = "0")` do?**
It reads a query parameter from the URL. If the client does not send it, the default value is used instead of throwing an error. This allows `GET /categories` and `GET /categories?pageNumber=2` to both work.

**Q119. At which layer should the mapping from Entity to DTO happen?**
In the service layer. The controller receives a DTO or a custom response from the service. The repository returns entities. The service sits between them and does the conversion, keeping each layer focused on its own concern.

---

## 24. Pagination Request & Response with DTOs — Concept, Pros/Cons, and Our Project

Section 23 showed *what* a DTO and a response wrapper are. This section answers the practical question: **how do I add `page` and `limit` to the API without changing the database?**

### 24.1 The target contract

```
GET /api/public/categories?page=1&limit=10

200 OK
{
  "content": [
    { "categoryId": 1, "categoryName": "Electronics" },
    { "categoryId": 2, "categoryName": "Books" }
  ],
  "pageNumber": 1,
  "pageSize": 10,
  "totalElements": 23,
  "totalPages": 3,
  "lastPage": false
}
```

Two contracts are involved, and they are independent:

| Contract | What it is | Our example |
|---|---|---|
| **Request contract** | Inputs the client sends | `page=1`, `limit=10` (query parameters) |
| **Response contract** | Output the client receives | `content` + pagination metadata |

Neither contract is the database table. Pagination itself is done by the database (`LIMIT` / `OFFSET`), but the *names and shape* of the parameters and the response are an API decision. That is the layer a DTO controls.

### 24.2 Where each piece lives

```
 Client
   |   GET /api/public/categories?page=1&limit=10
   v
 +-----------------------------------------+
 | CONTROLLER  (web layer)                 |
 |   @RequestParam page, limit             |   <- request contract
 |   returns CategoryResponse              |   <- response contract
 +--------------------+--------------------+
                      | page=1, limit=10
                      v
 +-----------------------------------------+
 | SERVICE  (business layer)               |
 |   PageRequest.of(page - 1, limit)       |   <- 1-based to 0-based
 |   Page<Category> -> List<CategoryDTO>   |   <- entity to DTO mapping
 |   -> CategoryResponse                   |
 +--------------------+--------------------+
                      | Pageable
                      v
 +-----------------------------------------+
 | REPOSITORY  (Spring Data JPA)           |
 |   findAll(Pageable)                     |   <- no code written
 +--------------------+--------------------+
                      | SELECT ... LIMIT ? OFFSET ?
                      | SELECT COUNT(*)
                      v
 +-----------------------------------------+
 | DATABASE  (category table)              |   <- UNCHANGED
 +-----------------------------------------+

 Return path (inside out):

   Category rows  ->  Page<Category>  ->  List<CategoryDTO>  ->  CategoryResponse  ->  JSON
   (entity)           (Spring type)       (API item shape)       (API envelope)
```

The key idea: the database returns entities, the service reshapes them, and the controller only ever exposes the reshaped version. Changing the reshaping (adding a `page` parameter, renaming a metadata field, hiding a column) touches the service and web layers only.

### 24.3 Page numbering: client is 1-based, Spring is 0-based

Humans count pages from 1. Spring Data counts from 0. The service converts between them:

| Client sends | Spring `PageRequest.of(...)` | Rows fetched (limit 10) |
|---|---|---|
| `page=1` | `PageRequest.of(0, 10)` | 1 to 10 |
| `page=2` | `PageRequest.of(1, 10)` | 11 to 20 |
| `page=3` | `PageRequest.of(2, 10)` | 21 to 30 |
| `page=0` | `PageRequest.of(-1, 10)` **throws** | must be rejected with a 400 |

Section 23 used `pageNumber` (0-based) in the examples. Either choose 0-based everywhere, or keep the client-facing `page` 1-based and convert once in the service, as above. Pick one and document it; mixing them is the most common pagination bug.

### 24.4 The concept: a DTO is a boundary

```
   DATABASE          |        SERVICE         |             API (what clients see)
                     |                        |
 category row  -->  Category (entity)  -->  CategoryDTO  -->  CategoryResponse --> JSON
 (table shape)      (DB-owned)              (API-owned)       (API-owned envelope)
                     |                        |
                     |<--- mapping happens here
```

- The **entity** follows the database. It changes when the table changes.
- The **DTO / response** follows the API contract. It changes when the client needs something different.
- The **boundary** is the place where one is converted into the other. Without a DTO, the boundary does not exist and the two shapes are the same class.

### 24.5 Pros of using DTOs for pagination

1. **Add API fields without changing the DB.** `page`, `limit`, `totalPages`, `lastPage` live only in the request and response classes. The `category` table and `ddl-auto=update` are not involved.
2. **Control the response shape.** You decide the field names and which fields appear. Internal columns (audit timestamps, soft-delete flags) stay hidden.
3. **Separate request and response shapes.** A create request may need `categoryName` only, while the response also includes `categoryId`. One entity cannot express both cleanly.
4. **Safe to evolve.** Renaming a column does not rename the JSON key. You can ship `CategoryDTOv2` alongside `v1` while old clients keep working.
5. **Avoids serialization failures as the model grows.** When `Category` gets a `List<Product>` relationship, returning the entity lets Jackson walk lazy Hibernate proxies (a common source of `LazyInitializationException` and infinite recursion). A DTO contains only the fields you map.
6. **Smaller payloads.** Only the fields the screen needs are sent.
7. **Per-operation validation.** `@NotBlank` on a create request DTO does not force the same rule on an update, or on a response.

### 24.6 Cons of using DTOs

1. **More files and more code.** Every entity typically gets a response DTO, a request DTO, and a mapping method. For a one-table CRUD app this feels like ceremony.
2. **Mapping code to maintain.** Each new field must be added in the entity, the DTO, and the mapper. Forget one and the field silently comes back `null`; the compiler does not warn you.
3. **Duplication and drift.** Two classes describe the same data. They can fall out of sync.
4. **Performance cost is negligible, but not zero.** Copying fields is cheap, but mapping large lists allocates new objects. This rarely matters, but it is a cost.
5. **Over-engineering risk.** A tiny app may never need the decoupling, and the boilerplate slows learning or prototyping.
6. **Tooling dependency if automated.** MapStruct or ModelMapper remove the boilerplate but add build configuration and a new thing to debug.

Summary: DTOs trade **upfront code** for **long-term decoupling**. They pay off as the API grows, the entity grows, or more than one client depends on the API.

### 24.7 Drawbacks of NOT using DTOs (returning the entity directly)

| Drawback | What it looks like |
|---|---|
| **API coupled to the table** | Renaming `categoryName` to `name` in the entity silently breaks clients. |
| **Internal data leaks** | Any field added to the entity appears in every response automatically. |
| **Cannot add envelope fields without changing the return type** | `List<Category>` has nowhere to put `totalPages`. You must change the signature anyway. |
| **Input and output are the same class** | `@Id` can be sent by the client on create (see 24.8). |
| **Validation rules are shared** | The same `@NotBlank` applies to create, update and every read path. |
| **Relationship crashes later** | Entity relationships are serialized by Jackson, causing lazy-load errors or cycles. |

Not using a DTO is **not** always wrong. For a single-table app with no relationships and no pagination metadata, returning the entity is simple and acceptable. The cost grows with each of the drawbacks above.

### 24.8 Analysis of our current project (`sb-ecom`)

The project today has one entity (`Category`) and no DTO classes. These are the relevant facts, with file references:

| # | Location | What the code does | Effect on pagination |
|---|---|---|---|
| 1 | `CategoryController.java:34` | `GET /public/categories` returns `ResponseEntity<List<Category>>` | The entity is the response. There is no place for `totalPages` or `lastPage`. |
| 2 | `CategoryServiceImpl.java:25-31` | Throws `APIException(NO_CONTENT)` when the table is empty | For pagination, a page past the end should return **200 with empty `content`** and the correct totals, not an error. The check has to be redesigned. |
| 3 | `CategoryController.java:44` | `POST` takes `@Valid @RequestBody Category` | The client can send `categoryId`. Spring Data `save()` treats a non-null id as an existing row and calls `merge`, so a POST with an existing id can **overwrite** that category. This is a real risk to verify with the H2 console. A `CategoryRequestDTO` without `categoryId` makes it impossible. |
| 4 | `CategoryController.java:49` | The `POST` success message concatenates the whole category list into a string | Returning the full list on every write does not scale. Pagination makes it worse. A `CategoryDTO` response is the right fix. |
| 5 | `CategoryController.java:63` | `PUT` takes `@RequestBody Category` **without `@Valid`** | The `@NotBlank` and `@Size(min = 5)` rules are not enforced on update. A DTO with `@Valid` closes this gap. |
| 6 | `Category.java` | One class is the JPA entity, the validation model, and the JSON shape | This is the single-class design that DTOs split. |
| 7 | `application.properties` | `ddl-auto=update`, H2 in-memory | Adding DTO classes does not touch the schema. A new field on the entity would, so DTO classes are the safer place to add API-only fields. |

#### What changes to add pagination, with the database untouched

| Layer | Change | Database change? |
|---|---|---|
| Model `Category` | None | No |
| Repository `CategoryRepository` | None. `JpaRepository` already provides `findAll(Pageable)` | No |
| New `CategoryDTO` | Create | No |
| New `CategoryResponse` | Create the envelope | No |
| `CategoryService` / `Impl` | New method returning `CategoryResponse`, with mapping | No |
| `CategoryController` | Add `page` and `limit` as `@RequestParam` | No |

Sketch of the changes (not yet applied to the project):

```java
// NEW: API item shape (no JPA annotations)
public record CategoryDTO(Long categoryId, String categoryName) {}

// NEW: API envelope
public record CategoryResponse(
        List<CategoryDTO> content,
        Integer pageNumber,
        Integer pageSize,
        Long totalElements,
        Integer totalPages,
        Boolean lastPage) {}
```

```java
// Controller: the two request parameters
@GetMapping("/public/categories")
public ResponseEntity<CategoryResponse> getAllCategories(
        @RequestParam(name = "page", defaultValue = "1") @Min(1) Integer page,
        @RequestParam(name = "limit", defaultValue = "10") @Min(1) @Max(100) Integer limit) {
    return ResponseEntity.ok(categoryService.getAllCategories(page, limit));
}
```

```java
// Service: the conversion lives here
@Override
public CategoryResponse getAllCategories(Integer page, Integer limit) {
    Pageable pageable = PageRequest.of(page - 1, limit);          // 1-based to 0-based
    Page<Category> categoryPage = categoryRepository.findAll(pageable);

    List<CategoryDTO> content = categoryPage.getContent().stream()
            .map(c -> new CategoryDTO(c.getCategoryId(), c.getCategoryName()))
            .toList();

    return new CategoryResponse(
            content,
            page,
            limit,
            categoryPage.getTotalElements(),
            categoryPage.getTotalPages(),
            categoryPage.isLast());
}
```

Notes on the sketch:
- `@Min` / `@Max` need `@Validated` on the controller class to take effect as method-parameter validation. Without it, `page=0` reaches `PageRequest.of(-1, ...)` and throws. Either add `@Validated` or check the value manually.
- The request/response names are a choice. `page`/`limit` in the URL and `pageNumber`/`pageSize` in the body is a common style, and keeping them distinct makes the 1-based and 0-based difference visible.
- An empty table or an out-of-range page now returns `200` with `content: []`. The `APIException(NO_CONTENT)` check in `CategoryServiceImpl` should be removed, or the endpoint will still fail on an empty table.

#### Middle option: pagination without a DTO

If you want to keep returning entities, a generic wrapper still works:

```java
public record PageResponse<T>(List<T> content, int pageNumber, int pageSize,
                              long totalElements, int totalPages, boolean lastPage) {}
```

`PageResponse<Category>` gives the envelope without a DTO. It still exposes the entity, so drawbacks in 24.7 remain. It is a valid stepping stone; the DTO is the step that removes the coupling.

#### Recommendation for this project

1. Add `CategoryDTO` and `CategoryResponse` first. This gives pagination with no DB change.
2. Add a `CategoryRequestDTO` (`categoryName` only, with `@NotBlank` and `@Size`) and use it for `POST` and `PUT`. This closes findings 3 and 5.
3. Remove the `NO_CONTENT` exception from the list path and return `200` with empty content.
4. Verify finding 3 with a quick test before changing it: POST a category with an existing `categoryId` and check whether the name changes.

### 24.9 Pros and cons at a glance

| | Return entity (current) | Return DTO + response envelope |
|---|---|---|
| Add `page` / `limit` | Changes return type | Changes controller and service only |
| DB schema change needed | No | No |
| Hides internal fields | No | Yes |
| Separate create and read shapes | No | Yes |
| Amount of code | Least | More (DTO + mapping) |
| Safe against entity changes | No | Yes |
| Risk of drift | None | Mapping must be kept in sync |
| Good for | Learning, tiny apps | Any API that will grow or be consumed by others |

### 24.10 Interview Questions — DTOs with Pagination

**Q120. Does adding pagination require a database change?**
No. Pagination is `LIMIT` and `OFFSET` in SQL, which Spring Data generates from a `Pageable`. The `page` and `limit` parameters and the response envelope live in the API layer. The table is unchanged.

**Q121. What is the difference between a request contract and a response contract?**
The request contract is the input the client sends (path variables, query parameters, body). The response contract is the output (body and status). They are designed separately and often use different DTOs.

**Q122. Why does the service convert 1-based `page` to 0-based?**
Clients usually expect page 1 to be the first page, while `PageRequest.of` counts pages from 0. The conversion is `page - 1`. `page=0` must be rejected because it would produce `-1`.

**Q123. What is the main drawback of returning a JPA entity directly?**
The API becomes coupled to the table. Renaming a field or adding an internal column changes the JSON. It also leaves no place for envelope fields like `totalPages`, and it can break when relationships are serialized.

**Q124. Why should POST not accept the entity as its request body?**
The entity contains `@Id`. A client can send an id that already exists, and `save()` will then merge into that row, overwriting it. A request DTO without the id prevents this.

**Q125. What does a DTO cost you?**
More classes and mapping code, which must be kept in sync with the entity. The trade-off is decoupling from the database and control over the API shape.

**Q126. How would you handle an empty page for a paginated endpoint?**
Return `200 OK` with `content: []`, the correct `totalElements`, and `lastPage` set. Throwing an error for an empty result breaks clients that expect a consistent shape.

---

## 25. End-to-End Flow — Client → Server → DB and Back, with DTOs

This section traces one request in each direction. There are two directions, and each has its own DTO shape:

- **Inbound (write):** the client sends a **request DTO**, the server converts it to an **entity**, and the database stores the entity.
- **Outbound (read):** the database returns **entities**, the server converts them to **response DTOs**, and the client receives JSON.

The entity never crosses the HTTP boundary in either direction. The DTO never touches JPA.

### 25.1 The players

| Player | Class in our project (or planned) | Knows about | Does not know about |
|---|---|---|---|
| Client | Postman, browser, React | JSON contract | Java classes, table |
| Controller | `CategoryController` | HTTP, DTOs, service interface | Entity internals, SQL |
| Service | `CategoryServiceImpl` | DTOs **and** entities, mapping | HTTP status details (only via exceptions) |
| Mapper | Logic in the service (or MapStruct) | Both DTO and entity | Transport, database |
| Repository | `CategoryRepository` | Entity, JPQL/SQL | DTOs, JSON |
| Database | H2 table `category` | Columns | Everything in Java |

The service is the only layer that sees both sides, which is why the conversion lives there.

### 25.2 Inbound flow: POST a new category

**Request body from client**

```json
{ "categoryName": "Electronics" }
```

This is a `CategoryRequestDTO`. It has no `categoryId`, because the client does not choose the id.

**Full path**

```
 CLIENT                    CONTROLLER                   SERVICE                         REPOSITORY              DATABASE
 ------                    ----------                   -------                         ----------              --------

 POST /api/public/categories
 Content-Type: application/json
 { "categoryName": "Electronics" }
        |
        |  HTTP request bytes
        v
                       1. DispatcherServlet
                          finds CategoryController
                          by URL + method
                              |
                              v
                       2. Jackson reads JSON
                          and builds
                          CategoryRequestDTO
                          (categoryName = "Electronics")
                              |
                              v
                       3. @Valid runs
                          @NotBlank, @Size(min=5)
                          on the DTO
                          -- fails? -> 400, stop here
                              |
                              v
                       4. controller calls
                          categoryService
                          .createCategory(dto)  ---->  5. service maps
                                                          DTO -> entity:
                                                          Category c = new Category();
                                                          c.setCategoryName(dto.categoryName());
                                                          (categoryId stays null)
                                                              |
                                                              v
                                                       6. categoryRepository
                                                          .save(c)  ----------->  7. Hibernate sees
                                                                                     id == null -> INSERT
                                                                                     INSERT INTO category
                                                                                     (category_name)
                                                                                     VALUES ('Electronics')
                                                                                         |
                                                                                         v
                                                                                     8. DB generates
                                                                                        category_id = 7
                                                                                        and returns row
                                                       <----------- 9. save() returns
                                                                      managed Category
                                                                      (categoryId = 7)
                              |
                              v
                       10. controller builds
                           response DTO
                           CategoryDTO(7, "Electronics")
                           returns 201 Created
        |
        |  HTTP response
        v
 201 Created
 { "categoryId": 7, "categoryName": "Electronics" }
```

**Step by step**

| Step | Where | What happens | Object |
|---|---|---|---|
| 1 | Spring MVC | Matches `POST /api/public/categories` to the controller method | — |
| 2 | Jackson | JSON → Java object | `CategoryRequestDTO` |
| 3 | Bean Validation | Checks rules on the DTO. Failure returns `400` before any Java business code runs | `CategoryRequestDTO` |
| 4 | Controller | Passes the DTO to the service. The controller does not create an entity | `CategoryRequestDTO` |
| 5 | Service | **Maps** DTO → entity. The id is still `null` | `Category` (transient) |
| 6 | Repository | `save(entity)` | `Category` |
| 7 | Hibernate | Sees `id == null` and issues an `INSERT` | SQL |
| 8 | Database | Generates the primary key and stores the row | Row |
| 9 | Repository | Returns the managed entity, now with its id | `Category` (managed) |
| 10 | Service → Controller | Maps entity → response DTO | `CategoryDTO` |
| 11 | Jackson | Java object → JSON, status `201` | JSON |

**Why the id is missing in the request.** The database owns the id (`GenerationType.AUTO`). If the client could send `categoryId`, a POST with an existing id would make Hibernate `merge` into that row instead of inserting. The request DTO has no such field, so this cannot happen.

### 25.3 Inbound flow: PUT an update

The client sends the same shape, but the id comes from the URL.

```
 CLIENT
 PUT /api/public/categories/7
 { "categoryName": "Consumer Electronics" }
        |
        v
 CONTROLLER
   @PathVariable Long categoryId = 7        <- identity comes from URL
   @Valid @RequestBody CategoryRequestDTO   <- new values come from body
        |
        v
 SERVICE
   Category saved = repo.findById(7)        ---->  SELECT ... WHERE category_id = 7
                                              <----  managed Category (id=7, old name)
   saved.setCategoryName(dto.categoryName()) <- copy only the allowed field
   repo.save(saved)                          ---->  UPDATE category SET category_name=...
                                                       WHERE category_id = 7
        |
        v
 CONTROLLER
   returns CategoryDTO(7, "Consumer Electronics")  -> 200 OK
```

Two rules make this safe:

1. **Load first, then copy fields.** The service fetches the existing entity, so the id and any internal fields it has (audit columns, for example) are preserved.
2. **Copy only the fields the DTO carries.** This is the step that stops a client from changing fields it should not touch.

Compare with our current `PUT`, which takes `@RequestBody Category` without `@Valid`. In that version the client's whole entity is the input, so the validation rules are not applied and any future field on the entity becomes writable by the client.

### 25.4 Outbound flow: GET the category list (pagination)

**Full path**

```
 CLIENT                    CONTROLLER                   SERVICE                           REPOSITORY              DATABASE
 ------                    ----------                   -------                           ----------              --------

 GET /api/public/categories?page=1&limit=10
        |
        v
                       1. @RequestParam page=1, limit=10
                          (validated: >= 1, <= 100)
                              |
                              v
                       2. service.getAllCategories(1, 10)  -->  3. PageRequest.of(0, 10)
                                                                    (1-based -> 0-based)
                                                                        |
                                                                        v
                                                                4. repo.findAll(pageable)  ---->  5. SELECT ... LIMIT 10 OFFSET 0
                                                                                                  SELECT COUNT(*) FROM category
                                                                                                      |
                                                                                                      v
                                                                                                  6. rows + count
                                                                        <---------------------------  Page<Category>
                                                                                                     (entities, managed)
                                                                    7. map entity -> DTO:
                                                                       List<CategoryDTO>
                                                                       c -> new CategoryDTO(id, name)
                                                                    8. wrap in envelope:
                                                                       CategoryResponse(content,
                                                                         pageNumber, pageSize,
                                                                         totalElements, totalPages, lastPage)
                              <---------------------------------- 9. returns CategoryResponse
                              |
                              v
                       10. Jackson: object -> JSON, status 200
        |
        v
 200 OK
 { "content": [ {"categoryId":1,"categoryName":"Electronics"}, ... ],
   "pageNumber": 1, "pageSize": 10,
   "totalElements": 23, "totalPages": 3, "lastPage": false }
```

**Step by step**

| Step | Where | What happens | Object |
|---|---|---|---|
| 1 | Controller | Reads and validates query params | `Integer` page, limit |
| 2 | Controller → Service | Passes primitives, not HTTP objects | `int`, `int` |
| 3 | Service | Converts client page to Spring page | `Pageable` |
| 4–5 | Repository / Hibernate | Two SQL statements: the page and the total count | SQL |
| 6 | Database | Returns the rows and the count | Rows |
| 7 | Service | Maps each entity to an item DTO. The entity stays inside the service | `CategoryDTO` |
| 8 | Service | Wraps items and metadata | `CategoryResponse` |
| 9 | Service → Controller | Returns the response DTO | `CategoryResponse` |
| 10 | Jackson | Serializes to JSON | JSON |

**What the client never sees:** `Page`, `Pageable`, `Sort`, the entity class, Hibernate proxies, or the table name. Only the envelope and the item DTOs.

### 25.5 Outbound flow: a single item (GET by id)

```
 CLIENT
 GET /api/public/categories/7
        |
        v
 CONTROLLER  @PathVariable Long categoryId = 7
        |
        v
 SERVICE
   repo.findById(7)  ----> SELECT ... WHERE category_id = 7
                     <----  Category (managed)  or  empty
   if empty -> throw ResponseNotFoundException -> GlobalExceptionHandler -> 404
   else     -> new CategoryDTO(c.getCategoryId(), c.getCategoryName())
        |
        v
 CONTROLLER  returns CategoryDTO
        |
        v
 200 OK { "categoryId": 7, "categoryName": "Consumer Electronics" }
```

### 25.6 Where the conversions happen

```
 INBOUND (client to DB)

   JSON  --Jackson-->  CategoryRequestDTO  --service maps-->  Category (entity)  --Hibernate-->  SQL INSERT/UPDATE
   client              controller/web                         service                           database


 OUTBOUND (DB to client)

   SQL SELECT  -->  Category (entity)  --service maps-->  CategoryDTO  --wrap-->  CategoryResponse  --Jackson-->  JSON
   database         service                             service                  controller           client
```

Rule of thumb: **DTO types appear in the controller, entity types appear in the repository, and the service is where they meet.**

### 25.7 Error flow

Errors take a separate path, and they also should not leak the entity.

```
 CLIENT  POST /api/public/categories  { "categoryName": "Ele" }      <- 3 chars, violates @Size(min=5)
        |
        v
 CONTROLLER  @Valid fails -> MethodArgumentNotValidException
        |
        v
 GlobalExceptionHandler  -> 400 Bad Request
        { "Category name must contain least 5 characters" }
        |
        v
 CLIENT  (no DB call happened, nothing stored)


 CLIENT  DELETE /api/admin/categories/999                              <- does not exist
        |
        v
 SERVICE  repo.findById(999) -> empty -> throw ResponseNotFoundException
        |
        v
 GlobalExceptionHandler -> 404 Not Found   (no entity or stack trace in the body)
```

### 25.8 Our project today vs. the target flow

```
 TODAY (no DTO)

   POST: JSON --Jackson--> Category (entity, with categoryId!) --save()--> DB
   GET : DB --> Category (entity) --Jackson--> JSON (every column)

 TARGET (with DTO)

   POST: JSON --> CategoryRequestDTO --map--> Category --save()--> DB
   GET : DB --> Category --map--> CategoryDTO --wrap--> CategoryResponse --> JSON
   PUT : JSON --> CategoryRequestDTO --> load Category, copy fields --> save()
```

| Flow | Today | With DTO | Gain |
|---|---|---|---|
| POST input | Entity, includes `categoryId` | Request DTO, no id | Client cannot overwrite a row |
| PUT input | Entity, no `@Valid` | Request DTO with `@Valid` | Validation applied on update |
| GET output | Entity list | Response DTO + envelope | Pagination metadata; hidden columns |
| Error output | Handled | Handled (unchanged) | No change needed |
| DB schema | `category` table | `category` table | No change |

### 25.9 Checklist for tracing any DTO flow

1. Which DTO does the **request** body bind to? Is there an `@Valid`?
2. Which fields does the request DTO carry? Is the id absent?
3. Where is the **mapping** done? (It should be the service.)
4. Does the service load the entity before updating, or build a new one?
5. Which entity fields are copied? Are internal fields left alone?
6. What does the **response** DTO carry? Is any entity returned directly?
7. What status code does each path return, and does the error path avoid entities?

### 25.10 Interview Questions — End-to-End DTO Flow

**Q127. Which layer converts the request DTO into an entity, and why there?**
The service. The controller is web-layer code and should not know about JPA. The repository works only with entities. The service is the only layer that sees both shapes, so it does the mapping.

**Q128. What happens if the client sends `categoryId` in a POST body and the request DTO has no such field?**
Jackson ignores the unknown property (depending on configuration), so the id is not copied into the entity. The database assigns a new id on insert.

**Q129. When does `save()` perform an INSERT versus an UPDATE?**
Hibernate checks the id. If it is `null`, it does an INSERT. If it is set, it loads and merges the row, then UPDATEs it. This is why a request DTO should not carry the id on create.

**Q130. Why load the entity before updating it, rather than building a new one from the DTO?**
Loading keeps the existing id and any fields the DTO does not carry (audit timestamps, created-by). Building a new object would overwrite those with `null`.

**Q131. Which step runs first on a bad request, validation or the service?**
Validation, on the controller side, through `@Valid`. A failure returns `400` before the service is called, so no database work happens.

**Q132. Why does the client never receive the `Page` object?**
`Page` carries Spring internals (`pageable`, `sort`). The service copies the content and metadata into a `CategoryResponse`, which is the stable API contract.

**Q133. What is the difference between the request DTO and the response DTO?**
The request DTO holds what the client is allowed to send (no id, validated). The response DTO holds what the client is allowed to read (usually includes the id and may hide fields). They can differ even for the same entity.

**Q134. How does an entity relationship affect the DTO flow?**
If `Category` later has a `List<Product>`, the response DTO maps only the fields needed (for example, product names). Returning the entity would let Jackson traverse lazy relationships and cause errors or recursion.
