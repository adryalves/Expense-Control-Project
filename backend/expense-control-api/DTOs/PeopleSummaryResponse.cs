using expense_control_api.DTOs;

namespace expense_control_api.DTOs
{
    public class PeopleSummaryResponse
    {
        public List<PersonSummaryItem> PersonSummary { get; set; } = new();
        public decimal TotalIncome { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal TotalBalance { get; set; }

    }
}
    public class PersonSummaryItem
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public int Age { get; set; }
        public decimal Income { get; set; }
        public decimal Expense {  get; set; }
        public decimal Balance {  get; set; }
    }
