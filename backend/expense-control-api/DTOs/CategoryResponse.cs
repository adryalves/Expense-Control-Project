using expense_control_api.Enums;

namespace expense_control_api.DTOs
{
    public class CategoryResponse
    {
        public Guid Id { get; set; }
        public string Description { get; set; } = null!;
        public CategoryPurpose Purpose { get; set; }

    }
}
