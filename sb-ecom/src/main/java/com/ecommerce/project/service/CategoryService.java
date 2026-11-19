package com.ecommerce.project.service;

import com.ecommerce.project.model.Category;
import com.ecommerce.project.payload.CategoryDTO;
import com.ecommerce.project.payload.CategoryResponse;

import java.util.List;

public interface CategoryService {
//    List<Category> getAllCategoryList();
    CategoryResponse getAllCategoryList(Integer pageNumber, Integer pageSize);
//    void createCategory(Category category);
    CategoryDTO createCategory(CategoryDTO category);
    String deleteCategory(Long categoryId);
//    Category updateCategory(Category category, Long categoryId);
    CategoryDTO updateCategory(CategoryDTO category, Long categoryId);
}
