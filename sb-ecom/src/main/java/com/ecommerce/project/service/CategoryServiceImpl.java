package com.ecommerce.project.service;

import com.ecommerce.project.exceptions.APIException;
import com.ecommerce.project.exceptions.ResponseNotFoundException;
import com.ecommerce.project.model.Category;
import com.ecommerce.project.payload.CategoryDTO;
import com.ecommerce.project.payload.CategoryResponse;
import com.ecommerce.project.repositories.CategoryRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.ui.ModelMap;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class CategoryServiceImpl implements CategoryService {
    private List<Category> categoryList = new ArrayList<>();

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public CategoryResponse getAllCategoryList(Integer pageNumber, Integer pageSize) {


//        public List<Category> getAllCategoryList() {
//        return List.of();
//        ResponseStatusException categoryListCreated = new ResponseStatusException(HttpStatus.CREATED, categoryList.toString());
//        return categoryList;

        /* IMPLEMENT PAGINATION USING 'Pageable'*/
        Pageable pageDetails = PageRequest.of(pageNumber, pageSize);
        Page<Category> categoryPage = categoryRepository.findAll(pageDetails);

        List<Category> categoryList = categoryPage.getContent();

        if(categoryList.isEmpty()){
            throw new APIException("Category List is Empty", HttpStatus.NO_CONTENT);
        }
        List<CategoryDTO> categoryDTOS = categoryList.stream()
                .map(category -> modelMapper.map(category, CategoryDTO.class))
                .toList();

        CategoryResponse categoryResponse = new CategoryResponse();
        categoryResponse.setContent(categoryDTOS);
        categoryResponse.setTotalPages(categoryPage.getTotalPages());
        categoryResponse.setHasNext(categoryPage.hasNext());
        categoryResponse.setPageNumber(categoryPage.getNumber());
        categoryResponse.setPageSize(categoryPage.getSize());

//        return categoryList;
        return categoryResponse;
    }

    @Override
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
//        public void createCategory(Category category) {
//        if (category.getCategoryId() == null) {
//            category.setCategoryId((long) (categoryList.size() + 1));
//        }
//        categoryList.add(category);
//        return "Category created successfully: " + categoryList.get(categoryList.size()-1)
//                + " | All categories: " + categoryList+"RequestBody: "+category.toString();
//        Category savedCategory = categoryRepository.findByCategoryName(category.getCategoryName());
//        if(!Objects.isNull(savedCategory)) {
//            throw new APIException("Category with the name '"+category.getCategoryName()+"' already exists !!!");
//        }
        Category category = modelMapper.map(categoryDTO, Category.class);
        Category categoryFromDB = categoryRepository.findByCategoryName(category.getCategoryName());
        if(Objects.nonNull(categoryFromDB)){
            throw new APIException("Category "+category.getCategoryName()+" Already Exists", HttpStatus.CONFLICT);
        }
        Category savedCategory = categoryRepository.save(category);
        return modelMapper.map(savedCategory, CategoryDTO.class);
//        return savedCategoryDTO;
    }

    @Override
    public String deleteCategory(Long categoryId) {
        // Have used this because we need categorize object to delete it from categoryList, because we only got categoryId as params/request body to delete and we need entire content with that id to be deleted.
//        Category category = categoryList.stream().filter(c -> c.getCategoryId().equals(categoryId)).findFirst()
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
//
//        categoryList.remove(category);
        /*
        List<Category> categories = categoryRepository.findAll();
        Category category = categories.stream()
                .filter(c -> c.getCategoryId().equals(categoryId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        */

//        Category category = categoryRepository.findById(categoryId)
//                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        Category category = categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new ResponseNotFoundException("DeleteCategory", "categoryId", categoryId));
        categoryRepository.delete(category);
        return "CategoryId with " + categoryId + " deleted successfully";
    }

    // Code Generated by AI is for learning and experimentation purposes only.
    // | filename: category-service.java - Best Practice
    @Override
    public CategoryDTO updateCategory(CategoryDTO categoryDTO, Long categoryId) {
//        public Category updateCategory(Category category, Long categoryId) {
//        Category savedCategory = categoryRepository.findById(categoryId)
//                .orElseThrow(() ->
//                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        Category savedCategory = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new ResponseNotFoundException("Category", "categoryId", categoryId));

        /*
        One minor issue — updateCategory

        // CategoryServiceImpl.java:111
        Category category = modelMapper.map(categoryDTO, Category.class);
        savedCategory.setCategoryName(category.getCategoryName());
        You're mapping categoryDTO → category just to call .getCategoryName(). Simpler:
        savedCategory.setCategoryName(categoryDTO.getCategoryName());
        Small but avoids creating a throwaway object.
        * */
        Category category = modelMapper.map(categoryDTO, Category.class);
        savedCategory.setCategoryName(category.getCategoryName());
        savedCategory = categoryRepository.save(savedCategory);
        return modelMapper.map(savedCategory, CategoryDTO.class);
//        return categoryRepository.save(savedCategory);
    }
    /*
    @Override
    public Category updateCategory(Category category, Long categoryId) {
//        List<Category> savedCategoryOptional = categoryRepository.findById(categoryId);
        Optional<Category> savedCategoryOptional = categoryRepository.findById(categoryId);
        Category savedCategory = savedCategoryOptional
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource Not Found"));

        category.setCategoryId(categoryId);
        savedCategory = categoryRepository.save(category);
        return savedCategory;
    }
    */


/*
    // Way to update the data more accurately present above
    @Override
    public Category updateCategory(Category category, Long categoryId) {
        List<Category> categories = categoryRepository.findAll();
        Optional<Category> optionalCategory = categories.stream().filter(c -> c.getCategoryId().equals(categoryId))
                .findFirst();

        if (optionalCategory.isPresent()) {
            Category updatedCategory = optionalCategory.get();
            updatedCategory.setCategoryName(category.getCategoryName());
            Category savedCategory = categoryRepository.save(updatedCategory);
            return savedCategory;
        }
//        optionalCategory.setCategoryName(category.getCategoryName());
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found");
    }
*/
}
