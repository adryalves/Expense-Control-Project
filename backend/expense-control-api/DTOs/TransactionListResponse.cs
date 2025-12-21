namespace expense_control_api.DTOs
{
    public class TransactionListResponse
    {
        public List<TransactionResponse> TransactionList { get; set; } = new();
    }
}
