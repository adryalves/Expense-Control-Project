using expense_control_api.DTOs;
using expense_control_api.Results;

namespace expense_control_api.Interfaces
{
    public interface ITransactionService
    {
        Task<Result<TransactionResponse>> GetTransactionById(Guid id);
        Task<Result<PaginatedResultDTO<TransactionResponse>>> GetAllTransaction(int page = 1, int pageSize = 10);
        Task<Result<TransactionResponse>> CreateTransaction(TransactionRequest transactionRequest);
        Task<Result<TransactionResponse>> UpdateTransaction(Guid id, TransactionRequest transactionRequest);

    }
}
