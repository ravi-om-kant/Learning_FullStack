package com.ecommerce.project.exceptions;

public class ResponseNotFoundException extends RuntimeException {

    String resourceName;
    String fieldName;
    String field;
    Long fieldId;

    public ResponseNotFoundException(String message, String resourceName, String fieldName, String field) {
//        super(message, cause, enableSuppression, writableStackTrace);
        super(String.format("%s not found with %s: %s", resourceName, field, fieldName));
        this.resourceName = resourceName;
        this.fieldName = fieldName;
        this.field = field;
    }

    public ResponseNotFoundException(String message, String resourceName, Long fieldId) {
//        super(message, cause, enableSuppression, writableStackTrace);
        super(String.format("%s not found with %s: %d", message, resourceName, fieldId));
        this.resourceName = resourceName;
        this.field = field;
        this.fieldId = fieldId;
    }

}
