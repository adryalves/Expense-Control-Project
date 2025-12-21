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

        /// <summary>
        /// Recebe o DTO de categoria, converte para o modelo do bd e cria no banco e retorna o DTO da categoria criada
        /// </summary>
        public async Task<Result<CategoryResponse>> CreateCategory(CategoryRequest categoryRequest)
        {
            var category = _mapper.Map<Category>(categoryRequest);

            await _context.categories.AddAsync(category);
            await _context.SaveChangesAsync();

            var response = _mapper.Map<CategoryResponse>(category);
            return Result<CategoryResponse>.Ok(response);
        }

        /// <summary>
        /// Busca e retorna todas as categorias existentes no sistema
        /// </summary>
        public async Task<Result<CategoryListResponse>> GetAllCategories()
        {

            var categories = await _context.categories.ToListAsync();
            var response = new CategoryListResponse
            {
                CategoryList = _mapper.Map<List<CategoryResponse>>(categories)
            };
            return Result<CategoryListResponse>.Ok(response);
        }

        /// <summary>
        /// Busca e retorna a categoria existente no sistema com o id informado
        /// </summary>
        public async Task<Result<CategoryResponse>> GetCategoryById(Guid id)
        {
            var category = await _context.categories.FindAsync(id);

            if (category == null) return null;

            var response = _mapper.Map<CategoryResponse>(category);
            return Result<CategoryResponse>.Ok(response);
        }

        /// <summary>
        /// Recebe o id de uma categoria, busca ela no banco e então atualiza os seus campos, salva no banco e retorna o valor atualizado do modelo
        /// </summary>
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

        /// <summary>
        /// Busca todas as categorias do sistema, e para cada categoria calcula-se o total de receitas, despesas e saldos. Além disso, calcula-se o total
        /// desses mesmos atributos porém referente ao valor total de todas as categorias do sistema
        /// </summary>
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


