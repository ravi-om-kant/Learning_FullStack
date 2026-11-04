package com.ecommerce.project.exceptions;

import org.springframework.http.HttpStatus;

public class APIException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private final HttpStatus status;

    public APIException(){
        super();
        this.status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    public APIException(String message) {
        this(message, HttpStatus.BAD_REQUEST);
    }

    public APIException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}