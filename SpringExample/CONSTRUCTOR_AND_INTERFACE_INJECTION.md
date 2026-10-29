# Loose Coupling
   - Loose coupling is a design principle that aims to reduce the dependencies between components within a system.
# Inversion of Control (IOC)
   - Inversion of Control is a design principle where the control of object creation and lifecycle management is transferred from the applicaiton code to an external container or framework.

# Beans
   - Object that are managed by framework are known as beens.
   - `Bean Defination`: A bean definition includes configuration metadata that the container needs to know to create and manage the bean.
   - `Bean Configuration`: 
     - Bean definitions can be provided in various ways, including XML configuration files, annotation, and Java-based configuration.
     - Beans are configured using XML files, where each bean is defined within <bean> tags with attributes specifying class, properties, and dependencies.
     - Beans can be configured using annotation like @Component, @Service, @Respository etc, which are scanned by Spring and managed by Beans.

# LifeCycle of Bean

Instanciation -> Population of Properties -> Initialization -> Ready for Use -> Destruction

# Dependency Injection
   - DI is a design pattern used in software development to achieve loose coupling between classes by removing the direct dependency instantiation from dependency class.
   - Two Type of DI
     - Constructor Injection
     - Setter Injection
   - Constructor Injection:
     - Dependencies are provided to the dependency class through its constructor.
     - Dependencies are passed as an arguments to the constructor when the dependent classis instantiated.
     - Contractor Injection ensures that the dependencies are available when the object is created.

# Autowire can be implement in 3 types
- Autowiring by type
- Autowiring by name
- Autowiring by constructor


    

# Constructor Injection & Interface-Based Loose Coupling in Java / Spring Boot

---

## The Problem This Solves

When one class directly creates another class inside itself, they become **tightly coupled** — locked together, hard to change, hard to test.

The solution is to **pass dependencies from outside** through the constructor, using an **interface** as the type. This is called **Constructor Injection**.

---

## Your Project: Side-by-Side Comparison

### Tight Coupling — `com.tight.coupling`

```
TightCouplingExample
       |
  UserManager  <--- creates UserDatabase internally (hardwired)
       |
  UserDatabase
```

**`UserManager.java` (tight)**

```java
public class UserManager {
    private UserDatabase userDatabase = new UserDatabase(); // creates it itself

    public String getUserInfo() {
        return userDatabase.getUserDetails();
    }
}
```

**Problem:**
- `UserManager` is responsible for creating `UserDatabase`
- They are glued together — you cannot swap `UserDatabase` for anything else
- To change data source (file, API, cache), you must edit `UserManager` itself
- Hard to test — you cannot replace `UserDatabase` with a fake/mock in unit tests

---

### Loose Coupling — `com.loose.coupling`

```
LooseCouplingExample
       |
       +--creates--> UserDatabaseProvider (implements UserDataProvider)
       |
       +--passes into constructor--> UserManager
                                          |
                                    UserDataProvider (interface)
```

**`UserDataProvider.java` — the Interface (a Contract)**

```java
public interface UserDataProvider {
    public String getUserDetails(); // contract: whoever implements me MUST have this method
}
```

An interface is just a **contract** — it says "I promise to have these methods" but does NOT implement them itself.

---

**`UserDatabaseProvider.java` — Implements the Contract**

```java
public class UserDatabaseProvider implements UserDataProvider {

    @Override
    public String getUserDetails() {
        return "Users Details from Database";
    }
}
```

`implements UserDataProvider` means: "I agree to the contract and here is my implementation."

---

**`UserManager.java` (loose) — Constructor Injection**

```java
public class UserManager {
    private UserDataProvider userDataProvider; // type is INTERFACE, not concrete class

    public UserManager(UserDataProvider userDataProvider) { // constructor receives it
        this.userDataProvider = userDataProvider;           // stores it
    }

    public String getUserInfo() {
        return userDataProvider.getUserDetails();
    }
}
```

**What is happening step by step:**

1. `private UserDataProvider userDataProvider;`
   - Declares a field of type **interface** (not a concrete class)
   - `UserManager` does NOT know which specific class will be used — it only knows the contract

2. `public UserManager(UserDataProvider userDataProvider)`
   - This is the **constructor** — runs automatically when the object is created
   - Someone from outside passes in an object that implements `UserDataProvider`

3. `this.userDataProvider = userDataProvider;`
   - `this` refers to the current object being created
   - Stores the received object into the field for later use

---

**`LooseCouplingExample.java` — Wiring It Together**

```java
public class LooseCouplingExample {
    public static void main(String[] args) {
        UserDataProvider userDataProvider = new UserDatabaseProvider(); // create the impl
        // UserManager does NOT create this — it receives it
    }
}
```

The **caller** decides which implementation to use and passes it in.

---

## Why Interface as the Type?

```java
private UserDataProvider userDataProvider;  // GOOD — interface type
// vs
private UserDatabaseProvider userDataProvider;  // BAD — concrete type (tight again)
```

By using the **interface type**, `UserManager` becomes flexible.

You can create multiple implementations and swap them without changing `UserManager`:

```java
public class UserFileProvider implements UserDataProvider {
    @Override
    public String getUserDetails() {
        return "Users Details from File";
    }
}

public class UserApiProvider implements UserDataProvider {
    @Override
    public String getUserDetails() {
        return "Users Details from REST API";
    }
}
```

Now pass any of them:

```java
new UserManager(new UserDatabaseProvider()); // reads from DB
new UserManager(new UserFileProvider());     // reads from file
new UserManager(new UserApiProvider());      // reads from API
```

`UserManager` stays **unchanged** in all three cases.

---

## The `this` Keyword

Inside a constructor or method, `this` always means "the current object."

```java
public UserManager(UserDataProvider userDataProvider) {
    //                    ^                ^
    //              field name       parameter name (same name — ambiguous!)
    //
    this.userDataProvider = userDataProvider;
    // this.userDataProvider = the field on the object
    //      userDataProvider  = the parameter passed in
}
```

When the field name and parameter name are the same, `this.fieldName` removes the ambiguity — "assign the parameter to THIS object's field."

---

## How Spring Boot Automates All of This

In plain Java you wire things manually:

```java
UserDataProvider provider = new UserDatabaseProvider();
UserManager manager = new UserManager(provider);
```

In **Spring Boot**, you add annotations and Spring does the wiring for you automatically:

```java
@Service  // tells Spring: manage this class
public class UserManager {

    private UserDataProvider userDataProvider;

    @Autowired  // tells Spring: inject the dependency here
    public UserManager(UserDataProvider userDataProvider) {
        this.userDataProvider = userDataProvider;
    }

    public String getUserInfo() {
        return userDataProvider.getUserDetails();
    }
}

@Repository  // tells Spring: manage this class too
public class UserDatabaseProvider implements UserDataProvider {
    @Override
    public String getUserDetails() {
        return "Users Details from Database";
    }
}
```

**Spring's process:**
1. Scans all classes annotated with `@Service`, `@Repository`, `@Component`, etc.
2. Sees `UserManager` needs a `UserDataProvider`
3. Finds `UserDatabaseProvider` which implements that interface
4. Creates `UserDatabaseProvider` first
5. Passes it into `UserManager`'s constructor automatically

This is called **Dependency Injection (DI)** and it is the heart of Spring Boot.

---

## Summary

| Concept | What it means |
|---|---|
| **Constructor** | Special method that runs when object is created — used to set up initial state |
| **Interface** | A contract — defines method signatures but no implementation |
| **`implements`** | A class agreeing to fulfill an interface's contract |
| **`this`** | Refers to the current object inside a method/constructor |
| **Tight Coupling** | A class creates its own dependencies internally — hard to change or test |
| **Loose Coupling** | Dependencies are passed in from outside — flexible and swappable |
| **Constructor Injection** | Passing dependencies through the constructor — the recommended pattern |
| **Dependency Injection (DI)** | Spring Boot automatically wires and injects the right implementation for you |

---

## One-Line Mental Model

> `UserManager` says: *"Give me anything that can `getUserDetails()` and I will work with it."*
> Spring Boot says: *"I found `UserDatabaseProvider` — it qualifies. Here you go."*



# Annotation:
- Annotations in Java provides a way to add metadata to your code.
- Common Annotations:
  - `@Component:`This annotation simply marks a Java Class as a bean or a managed component. 
  - `@Autowire:`Using which spring will autowire the dependency with the matching type.
  - `@Qualifier:`If there are multiple types, you can specify qualifier as to which bean should be matched.
  - `@Value:` Is used to inject property value into  your beans.
  - `@Repository`:Is used to define data repository, It's a specialized version of the component annotation that we see on the screen.
  - `@Service:`: It's a specialization of component annotation and it is used to indicate that this class is providing business services.
  - `@Controller:` Is used to create a web controller that will handle HTTP requersts.
  - `@RequestMapping:`
  - `@SpringBootApplication:`


# Components and Components Scan
- Components refers to a Java class that is managed by a Spring IOC container. It's a container that manages the Spring Beans.
- Components are like a bean only, but it's specifically designed to be auto-detected and configured from classpath scanning. (Component is a special kind of bean that is used to be auto-detected)
- `Defining Component in Spring:`
  - Using XML:
    - `<bean id="myComponent" class="com.example.MyComponent"/>`
  - Using Annotations
    ```java
    import org.springframework.stereotype.Component;
    
    @Component //Marks the Class as a spring component
    public class MyComponent{
        // Class Implementation
    }    
    ```
- **Component Scanning:** It's a feature helps to automatically detect and register beans from predefined package paths.
- Will create a component, spring needs to know where it needs to check the component and register itself. Because Component is a bean that auto registers itself right now in order to tell spring, I want you to scan this particular package specifically and look for all the components.