package com.bank.app.service;

import com.bank.app.Customer;

import java.util.List;

public interface CustomerService {
    List<Customer> getAllCustomer();
    Customer findById(Long id);
    Customer createCustomer(Customer customer);
    String deleteCustomer(Long customerId);
    Customer updateCustomer(Customer customer, Long customerId);
}
