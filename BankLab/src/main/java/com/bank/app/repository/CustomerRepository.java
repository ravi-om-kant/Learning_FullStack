package com.bank.app.repository;

import com.bank.app.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
//    String delete(Optional<Customer> customer);
}
