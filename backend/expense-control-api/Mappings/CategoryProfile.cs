using AutoMapper;
using expense_control_api.DTOs;
using expense_control_api.Models;

namespace expense_control_api.Mappings
{
    public class CategoryProfile : Profile
    {
        public CategoryProfile()
        {
            CreateMap<CategoryRequest, Category>();
            CreateMap<Category,CategoryResponse>();
        }
    }
}
