using expense_control_api.DTOs;
using expense_control_api.Results;

namespace expense_control_api.Interfaces
{
    public interface ITransactionService
    {
        Task<Result<TransactionResponse>> GetTransactionById(Guid id);
        Task<Result<TransactionListResponse>> GetAllTransaction();
        Task<Result<TransactionResponse>> CreateTransaction(TransactionRequest transactionRequest);

    }
}
