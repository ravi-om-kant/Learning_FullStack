package com.bank.app.service;


import com.bank.app.Customer;
import com.bank.app.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerServiceImpl implements CustomerService{

    CustomerRepository customerRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public List<Customer> getAllCustomer() {

        return customerRepository.findAll();
    }

    @Override
    public Customer findById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        return customer;
    }

    @Override
    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    @Override
    public String deleteCustomer(Long customerId) {
//        Optional<Customer> customer = customerRepository.findById(customerId);
        Customer customer = findById(customerId);
//        if(customer) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found");
        customerRepository.delete(customer);
        return "Customer with "+customerId+" deleted successfully!";
    }

    @Override
    public Customer updateCustomer(Customer customer, Long customerId) {
        Customer savedCustomer = findById(customerId);
        savedCustomer.setFirstName(customer.getFirstName());
        savedCustomer.setLastName(customer.getLastName());
        savedCustomer.setEmail(customer.getEmail());
        savedCustomer.setPhoneNumber( customer.getPhoneNumber());
        return customerRepository.save(savedCustomer);
    }
}
