namespace expense_control_api.DTOs
{
    public class CategoryListResponse
    {
        public List<CategoryResponse> CategoryList { get; set; } = new();
    }
}
