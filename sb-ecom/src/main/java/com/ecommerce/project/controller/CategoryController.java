package com.ecommerce.project.controller;

import com.ecommerce.project.model.Category;
import com.ecommerce.project.service.CategoryService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api")
public class CategoryController {

    private static final Logger log = LoggerFactory.getLogger(CategoryController.class);
    // @Autowired // Field Injection
    private CategoryService categoryService;

    // Constructor injection
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/public/categories")
    public ResponseEntity<List<Category>> getAllCategoryList() {
        List<Category> categoryList = categoryService.getAllCategoryList();
//        if(categoryList.isEmpty()){
//            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
//        }
        return new ResponseEntity<>(categoryList, HttpStatus.OK);
    }

    //    @PostMapping("/public/categories")
    @RequestMapping(value = "/public/categories", method = RequestMethod.POST)
    public ResponseEntity<String> createCategory(@Valid @RequestBody Category category) {
        categoryService.createCategory(category);
        List<Category> categoryList = categoryService.getAllCategoryList();
//        return "Category created successfully: " + categoryService.getAllCategoryList().get(categoryList.size()-1)
//                + " | All categories: " + categoryList+"RequestBody: "+category.toString();
        return new ResponseEntity<>("Category created successfully: " + categoryList, HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/categories/{categoryId}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long categoryId) {

        String status = categoryService.deleteCategory(categoryId);
        log.error("++++++++++++++++++++++++++" + status);
        return ResponseEntity.status(HttpStatus.OK).body(status);
//            return new ResponseEntity<>(status, HttpStatus.OK);
//        return categoryService.deleteCategory(categoryId);
    }

    @PutMapping("/public/categories/{categoryId}")
    public ResponseEntity<? extends Object> updateCategory(@RequestBody Category category, @PathVariable Long categoryId) {
        Category updatedCategory = categoryService.updateCategory(category, categoryId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body("Category updated successfully" + categoryId);
//        try{
//        }catch(ResponseStatusException e){
//            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
//        }
    }
}
