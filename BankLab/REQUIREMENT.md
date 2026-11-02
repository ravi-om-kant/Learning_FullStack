# Customer Management CRUD API

## Manager's Brief

Our bank's IT team needs a simple Customer Management Service to maintain customer records. This is an internal API that other systems (such as loan processing and account management) will call.

As the backend developer, you are assigned to build a CRUD API for customer details using:

- Spring Boot
- Spring Data JPA
- H2 in-memory database

**Deliverable:** A set of REST endpoints that support Create, Read, Update, and Delete operations for customers.

---

## 1. Customer Entity

Create a `Customer` entity in the `com.bank.app` package.

| Field         | Type    | Constraints                          |
|---------------|---------|--------------------------------------|
| `id`          | Long    | Primary key, auto-generated          |
| `firstName`   | String  |                                      |
| `lastName`    | String  |                                      |
| `email`       | String  | Unique                               |
| `phoneNumber` | String  |                                      |

---

## 2. Repository

Create a Spring Data JPA repository named `CustomerRepository`.

- It should extend `JpaRepository<Customer, Long>` to provide CRUD operations.

---

## 3. Service Layer

Implement a `CustomerService` class in the service layer. It should provide the following methods:

| Operation             | Method Name        |
|-----------------------|--------------------|
| Create a customer     | `createCustomer`   |
| Retrieve all customers| `getAllCustomers`  |
| Retrieve a customer by ID | `getCustomerById` |
| Update a customer     | `updateCustomer`   |
| Delete a customer     | `deleteCustomer`   |

---

## 4. REST Controller

Create a REST controller named `CustomerController` under the base path `/api/customers`.

| HTTP Method | Endpoint              | Description                                                        |
|-------------|-----------------------|--------------------------------------------------------------------|
| POST        | `/api/customers`      | Accepts a JSON request to create a new customer and returns the created customer. |
| GET         | `/api/customers`      | Returns a list of all customers.                                   |
| GET         | `/api/customers/{id}` | Returns a single customer by ID.                                   |
| PUT         | `/api/customers/{id}` | Updates an existing customer's details and returns the updated customer. |
| DELETE      | `/api/customers/{id}` | Deletes a customer and returns a confirmation message.             |