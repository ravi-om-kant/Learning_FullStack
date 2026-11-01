package com.ecommerce.project.service;

import com.ecommerce.project.model.Category;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class CategoryServiceImpl implements CategoryService {
    private List<Category> categoryList = new ArrayList<>();



    @Override
    public List<Category> getAllCategoryList() {
//        return List.of();
//        ResponseStatusException categoryListCreated = new ResponseStatusException(HttpStatus.CREATED, categoryList.toString());
        return categoryList;
    }

    @Override
    public void createCategory(Category category) {
//        if (category.getCategoryId() == null) {
//            category.setCategoryId((long) (categoryList.size() + 1));
//        }
        categoryList.add(category);
//        return "Category created successfully: " + categoryList.get(categoryList.size()-1)
//                + " | All categories: " + categoryList+"RequestBody: "+category.toString();
    }

    @Override
    public String deleteCategory(Long categoryId) {
        // Have used this because we need categorize object to delete it from categoryList, because we only got categoryId as params/request body to delete and we need entire content with that id to be deleted.
        Category category = categoryList.stream().filter(c -> c.getCategoryId().equals(categoryId)).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
//                .orElse(null);
//        if(Objects.isNull(category)){
//            return "No Category Found to Delete";
//        }
        categoryList.remove(category);
        return "CategoryId with "+categoryId+" deleted successfully";
    }

    @Override
    public Category updateCategory(Category category, Long categoryId) {
         Optional<Category> optionalCategory = categoryList.stream().filter(c -> c.getCategoryId().equals(categoryId))
                .findFirst();
         if(optionalCategory.isPresent()){
             Category updatedCategory = optionalCategory.get();
             updatedCategory.setCategoryName(category.getCategoryName());
             return updatedCategory;
         }
//        optionalCategory.setCategoryName(category.getCategoryName());
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found");
    }

}
