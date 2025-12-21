using expense_control_api.DTOs;
using expense_control_api.Interfaces;
using expense_control_api.Models;
using Microsoft.AspNetCore.Mvc;
using System;

namespace expense_control_api.Controllers
{
    [Route("/api/v1.0/category")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpPost]
        public async Task<ActionResult<CategoryResponse>> CreateCategory([FromBody] CategoryRequest request)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                
                    var category = await _categoryService.CreateCategory(request);

                if(!category.Success)
                    return BadRequest(new { error = category.Error });

                return Ok(category.Data);
             

            }

            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpGet("All")]
        public async Task<ActionResult<CategoryListResponse>> GetAllCategories()
        {
            try
            {
                var categories = await _categoryService.GetAllCategories();

                if(!categories.Success)
                    return BadRequest(new { error = categories.Error });

                return Ok(categories.Data.CategoryList);
            }

            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryResponse>> GetCategoryById(Guid id)
        {
            try
            {
                var category = await _categoryService.GetCategoryById(id);
                if (category == null) return NotFound("Não foi encontrada uma categoria com esse id");

                if(!category.Success)
                    return BadRequest(new { error = category.Error });

                return Ok(category.Data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPut]
        public async Task<ActionResult<CategoryResponse>> UpdateCategory(Guid id, CategoryRequest request)
        {
            try
            {
                var category = await _categoryService.GetCategoryById(id);
                if (category.Data == null) return NotFound("Não foi encontrada uma categoria com esse id");

                var updatedCategory = await _categoryService.UpdateCategory(id, request);

                if(!updatedCategory.Success)
                    return BadRequest(new { error = updatedCategory.Error });

                return Ok(updatedCategory);
            }

            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
    }
}
