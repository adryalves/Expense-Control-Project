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
    public class PersonService : IPersonService
    {

        private readonly ExpenseControlDbContext _context;
        private readonly IMapper _mapper;   


        public PersonService(ExpenseControlDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        /// <summary>
        /// Recebe o DTO de person, converte para o modelo do banco de dados, cria a pessoa e retorna o 
        /// DTO de resposta com os dados da pessoa criada
        /// </summary>
        public async Task<Result<PersonResponse>> CreatePerson(PersonRequest personRequest)
        {
            var person = _mapper.Map<Person>(personRequest);

            await _context.people.AddAsync(person);
            await _context.SaveChangesAsync();

            var response = _mapper.Map<PersonResponse>(person);

            return Result<PersonResponse>.Ok(response);
            
        }

        /// <summary>
        /// Busca por todas as pessoas no sistema e retorna essa lista mapeada para o DTO de resposta
        /// </summary>
        public async Task<Result<PersonListResponse>> GetAllPeople()
        {
            var people = await _context.people.ToListAsync();

            var response = new PersonListResponse
            {
                PersonList = _mapper.Map<List<PersonResponse>>(people)
            };

            return Result<PersonListResponse>.Ok(response);
        }

        /// <summary>
        /// Recebe um id, busca no sistema um item na tabela pessoas com esse identificador e retorna ele mapeado para o DTO de resposta
        /// </summary>
        public async Task<Result<PersonResponse>> GetPersonById(Guid id)
        {
            var person = await _context.people.FindAsync(id);
            var response = _mapper.Map<PersonResponse>(person);

            return Result<PersonResponse>.Ok(response);
        }

        /// <summary>
        /// Recebe um id, busca no sistema um item na tabela pessoas com esse identificador e caso exista, apaga esse elemento da tabela
        /// </summary>
        public async Task<Result<bool>> DeletePerson(Guid id)
        {
            var person = await _context.people.FindAsync(id);
            if (person == null) return Result<bool>.Fail("Não foi encontrada uma pessoa com esse identificador");
                
            _context.people.Remove(person);
            await _context.SaveChangesAsync();
           return Result<bool>.Ok(true);
        }

        /// <summary>
        /// Busca todas as pessoas  do sistema, e para cada pessoa calcula-se o total de receitas, despesas e saldos. Além disso, calcula-se o total
        /// desses mesmos atributos porém referente ao valor total de todas as categorias do sistema
        /// </summary>
        public async Task<Result<PeopleSummaryResponse>> GetPeopleSummary()
        {
            var peopleSummary = await _context.people.Select(
                p => new PersonSummaryItem
                {
                    Id = p.Id,
                    Name = p.Name,
                    Age = p.Age,
                    Income = p.Transactions.Where(t => t.Type == TransactionType.Income).Sum(t => (decimal?)t.Amount) ?? 0,
                    Expense = p.Transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => (decimal?)t.Amount) ?? 0,

                }).ToListAsync();

            foreach(var person in peopleSummary)
            {
                person.Balance = person.Income - person.Expense;
            }

            var response = new PeopleSummaryResponse
            {
                PersonSummary = peopleSummary,
                TotalIncome = peopleSummary.Sum(i => i.Income),
                TotalExpense = peopleSummary.Sum(e => e.Expense),
                TotalBalance = peopleSummary.Sum(b => b.Balance)
            };

            return Result<PeopleSummaryResponse>.Ok(response); 
        }
    }
}
