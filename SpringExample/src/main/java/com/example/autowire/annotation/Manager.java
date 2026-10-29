package com.example.autowire.annotation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class Manager {

    /** -------- NOTES: --------
     * @Autowire will check in the Construstor what perticular Class needs which is EMployee,
     * it will automatically inject the bean of type Employee(employee).
     * If it has bean that it is managing of type employee, then it will automatically inject that.
     *
     * Field Injection: Is used when we have lots of Field.
     *
     * @Qualifier:
     */

    // Field Injection

    @Autowired
    @Qualifier("employee")
    private Employee employee;


    // Constructor Injection
//    @Autowired
//    public Manager(Employee employee) {
//        this.employee = employee;
//    }

    @Override
    public String toString() {
        return "Manager{" +
                "employee=" + employee +
                '}';
    }



}
