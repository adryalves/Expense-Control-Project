using expense_control_api.Enums;

namespace expense_control_api.DTOs
{
    public class TransactionResponse
    {
        public Guid Id { get; set; }
        public string Description { get; set; } = null!;
        public decimal Amount { get; set; }
        public TransactionType Type { get; set; }
        public Guid PersonId { get; set; }
        public Guid CategoryId { get; set; }
    }
}
