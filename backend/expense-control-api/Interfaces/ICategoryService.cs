using expense_control_api.DTOs;
using expense_control_api.Results;
using Microsoft.EntityFrameworkCore;

namespace expense_control_api.Interfaces
{
    public interface ICategoryService
    {
        Task<Result<CategoryResponse>> CreateCategory(CategoryRequest categoryRequest);
        Task<Result<CategoryListResponse>> GetAllCategories();
        Task<Result<CategoryResponse>> GetCategoryById(Guid id);
        Task<Result<CategoryResponse>> UpdateCategory(Guid id, CategoryRequest categoryRequest);
    }
}
