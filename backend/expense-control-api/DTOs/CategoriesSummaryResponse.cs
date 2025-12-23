using expense_control_api.Enums;

namespace expense_control_api.DTOs
{
    public class CategoriesSummaryResponse
    {
        public List<CategorySummaryItem> CategorySummary { get; set; } = new();
        public decimal TotalIncome { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal TotalBalance { get; set; }
    }

    public class CategorySummaryItem
    {
        public Guid Id { get; set; }
        public string Description { get; set; }
        public CategoryPurpose Purpose { get; set; }
        public decimal Income { get; set; }
        public decimal Expense { get; set; }
        public decimal Balance { get; set; }

    }

}