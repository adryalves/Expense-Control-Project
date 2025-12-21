using AutoMapper;
using expense_control_api.Data;
using expense_control_api.DTOs;
using expense_control_api.Enums;
using expense_control_api.Interfaces;
using expense_control_api.Models;
using expense_control_api.Results;
using Microsoft.EntityFrameworkCore;

namespace expense_control_api.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ExpenseControlDbContext _context;
        private readonly IMapper _mapper;

        public TransactionService(ExpenseControlDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Result<TransactionResponse>> CreateTransaction(TransactionRequest transactionRequest)
        {
            var category = await _context.categories.FindAsync(transactionRequest.CategoryId);
            if (category == null) return Result<TransactionResponse>.Fail("Não existe uma categoria correspondente a esse identificador");

            var person = await _context.people.FindAsync(transactionRequest.PersonId);
            if (person == null) return Result<TransactionResponse>.Fail("Não existe uma pessoa correspondente a esse identificador");

            var validateCategory = ValidateCategory(category.Purpose, transactionRequest.Type);
            if (!validateCategory) return Result<TransactionResponse>.Fail("O tipo de transação escolhido não corresponde com a categoria informada");

            if (person.Age < 18 && transactionRequest.Type == TransactionType.Income) return Result<TransactionResponse>.Fail("Usuário menores de idade apenas podem ter transação do tipo de despesa");

            var transaction = _mapper.Map<Transaction>(transactionRequest);

            await _context.transactions.AddAsync(transaction);
            await _context.SaveChangesAsync();

            var response = _mapper.Map<TransactionResponse>(transaction);
            return Result<TransactionResponse>.Ok(response);
        }

        public async Task<Result<TransactionListResponse>> GetAllTransaction()
        {
            var transactions = await _context.transactions.ToListAsync();

            var response = new TransactionListResponse
            {
                TransactionList = _mapper.Map<List<TransactionResponse>>(transactions)
            };

            return Result<TransactionListResponse>.Ok(response);
        }

        public async Task<Result<TransactionResponse>> GetTransactionById(Guid id)
        {
            var transaction = await _context.transactions.FindAsync(id);
            var response = _mapper.Map<TransactionResponse>(transaction);
            return Result<TransactionResponse>.Ok(response);
        }

      

            


            

      

          

        public static bool ValidateCategory(CategoryPurpose categoryPurpose, TransactionType transactionType)
        {
            if (categoryPurpose == CategoryPurpose.Both) return true;
            if (categoryPurpose == CategoryPurpose.Expense && transactionType == TransactionType.Expense) return true;
            if (categoryPurpose == CategoryPurpose.Income && transactionType == TransactionType.Income) return true;

            return false;
        }


  }
}
