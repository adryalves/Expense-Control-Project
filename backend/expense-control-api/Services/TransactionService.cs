using AutoMapper;
using expense_control_api.Data;
using expense_control_api.DTOs;
using expense_control_api.Enums;
using expense_control_api.Interfaces;
using expense_control_api.Models;
using expense_control_api.Results;
using Microsoft.AspNetCore.Mvc.RazorPages;
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


        /// <summary>
        /// Recebe o DTO de transaction, antes de criar valida se os identificadores de categoria e pessoas correspondem
        /// a itens existentes no banco de dados. Após isso, valida se a o tipo de transação corresponde a finalidade da categoria correspondente,
        /// depois valida para que caso a pessoa informada seja menor de idade, apenas transações do tipo despesa são aceitas,
        /// após todas as validações. Converte para o modelo do banco de dados, cria a transação e retorna o 
        /// DTO de resposta com os dados da transação criada
        /// </summary>
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

        /// <summary>
        /// Busca e retorna todas as transações existentes no sistema mapeadas para o DTO de resposta
        /// </summary>
        public async Task<Result<PaginatedResultDTO<TransactionResponse>>> GetAllTransaction(int page = 1, int pageSize = 10)
        {
            var transactions = _context.transactions.AsNoTracking().OrderBy(t => t.Description);
            var transactionsCount = await transactions.CountAsync();
            var paginatedTransaction = await transactions.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            var transactionList = _mapper.Map<List<TransactionResponse>>(paginatedTransaction);

            var response = new PaginatedResultDTO<TransactionResponse>
            {
                Data = transactionList,
                CurrentPage = page,
                PageSize = pageSize,
                TotalRecords = transactionList.Count
            };

            return Result<PaginatedResultDTO<TransactionResponse>>.Ok(response);
        }

        /// <summary>
        /// Recebe um id, busca no sistema um item na tabela transações com esse identificador e retorna ele mapeado para o DTO de resposta
        /// </summary>
        public async Task<Result<TransactionResponse>> GetTransactionById(Guid id)
        {
            var transaction = await _context.transactions.FindAsync(id);
            var response = _mapper.Map<TransactionResponse>(transaction);
            return Result<TransactionResponse>.Ok(response);
        }

        /// <summary>
        /// Esse método é para atualizar transação, porém antes de atualizar ele precisa realizar as mesmas validações feitas ao cadastrar para manter consistencia.
        /// Depois das devidas validações, ele busca o elemento no banco e atualiza os valores baseados nos valores recebidos e retorna o objeto atualizado
        /// </summary>
        public async Task<Result<TransactionResponse>> UpdateTransaction(Guid id, TransactionRequest transactionRequest)
        {
            var category = await _context.categories.FindAsync(transactionRequest.CategoryId);
            if (category == null) return Result<TransactionResponse>.Fail("Não existe uma categoria correspondente a esse identificador");

            var person = await _context.people.FindAsync(transactionRequest.PersonId);
            if (person == null) return Result<TransactionResponse>.Fail("Não existe uma pessoa correspondente a esse identificador");

            var validateCategory = ValidateCategory(category.Purpose, transactionRequest.Type);
            if (!validateCategory) return Result<TransactionResponse>.Fail("O tipo de transação escolhido não corresponde com a categoria informada");

            if (person.Age < 18 && transactionRequest.Type == TransactionType.Income) return Result<TransactionResponse>.Fail("Usuário menores de idade apenas podem ter transação do tipo de despesa");

            var transaction = await _context.transactions.FindAsync(id);

            if (transaction == null) return Result<TransactionResponse>.Fail("Não existe uma transação com esse identificador");

            transaction.Description = transactionRequest.Description;
            transaction.Amount = transactionRequest.Amount;
            transaction.Type = transactionRequest.Type;
            transaction.Category = category;
            transaction.Person = person;

            await _context.SaveChangesAsync();

            var response = _mapper.Map<TransactionResponse>(transaction);
            return Result<TransactionResponse>.Ok(response);
        }


        /// <summary>
        /// Esse método serve para validar se o tipo de transação corresponde a finalidade da categoria informada
        /// caso a finalidade da categoria seja 'Both', então quer dizer que independente do tipo de transação, essa categoria é válida
        /// porém, caso não seja essa, é preciso que o tipo de transação corresponda a finalidade da categoria.
        /// Esse método retorna true caso o tipo de transação seja válido, ou seja corresponde a finalidade da categoria
        /// </summary>
        public static bool ValidateCategory(CategoryPurpose categoryPurpose, TransactionType transactionType)
        {
            if (categoryPurpose == CategoryPurpose.Both) return true;
            if (categoryPurpose == CategoryPurpose.Expense && transactionType == TransactionType.Expense) return true;
            if (categoryPurpose == CategoryPurpose.Income && transactionType == TransactionType.Income) return true;

            return false;
        }

      
  }
}
