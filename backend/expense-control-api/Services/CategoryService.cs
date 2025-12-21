using AutoMapper;
using expense_control_api.Data;
using expense_control_api.DTOs;
using expense_control_api.Interfaces;
using expense_control_api.Models;
using expense_control_api.Results;
using Microsoft.EntityFrameworkCore;
using System;

namespace expense_control_api.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ExpenseControlDbContext _context;
        private readonly IMapper _mapper;

        public CategoryService(ExpenseControlDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Result<CategoryResponse>> CreateCategory(CategoryRequest categoryRequest)
        {
            var category = _mapper.Map<Category>(categoryRequest);

            await _context.categories.AddAsync(category);
            await _context.SaveChangesAsync();

            var response = _mapper.Map<CategoryResponse>(category);
            return Result<CategoryResponse>.Ok(response);
        }

        public async Task<Result<CategoryListResponse>> GetAllCategories()
        {

            var categories = await _context.categories.ToListAsync();
            var response = new CategoryListResponse
            {
                CategoryList = _mapper.Map<List<CategoryResponse>>(categories)
            };
            return Result<CategoryListResponse>.Ok(response);
        }


        public async Task<Result<CategoryResponse>> GetCategoryById(Guid id)
        {
            var category = await _context.categories.FindAsync(id);

            if (category == null) return null;

            var response = _mapper.Map<CategoryResponse>(category);
            return Result<CategoryResponse>.Ok(response);
        }

        public async Task<Result<CategoryResponse>> UpdateCategory(Guid id,  CategoryRequest categoryRequest)
        {
            var category = await _context.categories.FindAsync(id);
            if(category != null)
            {
                category.Purpose = categoryRequest.Purpose;
                category.Description = categoryRequest.Description;
            }
            await _context.SaveChangesAsync();

            var response = _mapper.Map<CategoryResponse>(category);
            return Result<CategoryResponse>.Ok(response); 
        }

       


    }
}
