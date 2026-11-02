package com.bank.app.controller;

import com.bank.app.Customer;
import com.bank.app.service.CustomerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Controller
@RequestMapping("/api/customers")
public class CustomerController {

    private CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.status(HttpStatus.OK).body(customerService.getAllCustomer());
    }

    @GetMapping("/{customerId}")
    ResponseEntity<Customer> getCustomerById(@PathVariable Long customerId){
        try{
            Customer customer = customerService.findById(customerId);
            return ResponseEntity.status(HttpStatus.OK).body(customer);
        }catch(ResponseStatusException e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

    }

    @PostMapping
    ResponseEntity<Customer> createCustomer(@RequestBody Customer customer){
        customerService.createCustomer(customer);
        return ResponseEntity.status(HttpStatus.CREATED).body(customer);
    }

    @PutMapping("/{customerId}")
    ResponseEntity<Customer> updateCustomer(@PathVariable Long customerId, @RequestBody Customer customer){
        try{
            customerService.updateCustomer(customer, customerId);
            return ResponseEntity.status(HttpStatus.OK).body(customer);
        }catch(ResponseStatusException e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{customerId}")
    ResponseEntity<String> deleteCustomer(@PathVariable Long customerId) {
        try{

            return new ResponseEntity<>(customerService.deleteCustomer(customerId),HttpStatus.OK);
        }catch (ResponseStatusException e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
