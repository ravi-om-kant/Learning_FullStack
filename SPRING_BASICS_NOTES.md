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