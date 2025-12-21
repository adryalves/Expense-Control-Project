using AutoMapper;
using expense_control_api.Data;
using expense_control_api.DTOs;
using expense_control_api.Enums;
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

        public async Task<Result<CategoriesSummaryResponse>> GetCategoriesSummary()
        {
            var categoriesSummary = await _context.categories.Select(
                c => new CategorySummaryItem
                {
                    Id = c.Id,
                    Description = c.Description,
                    Purpose = c.Purpose,
                    Income = c.Transactions.Where(t => t.Type == TransactionType.Income).Sum(t => (decimal?)t.Amount) ?? 0,
                    Expense = c.Transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => (decimal?)t.Amount) ?? 0,
                }).ToListAsync();

            foreach(var category in categoriesSummary)
            {
                category.Balance = category.Income - category.Expense;
            }

            var response = new CategoriesSummaryResponse
            {
                CategorySummary = categoriesSummary,
                TotalIncome = categoriesSummary.Sum(i => i.Income),
                TotalExpense = categoriesSummary.Sum(e => e.Expense),
                TotalBalance = categoriesSummary.Sum(b => b.Balance)
            };

            return Result<CategoriesSummaryResponse>.Ok(response);
        }
       


    }
}


