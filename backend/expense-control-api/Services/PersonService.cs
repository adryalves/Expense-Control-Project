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

        public async Task<Result<PersonResponse>> CreatePerson(PersonRequest personRequest)
        {
            var person = _mapper.Map<Person>(personRequest);

            await _context.people.AddAsync(person);
            await _context.SaveChangesAsync();

            var response = _mapper.Map<PersonResponse>(person);

            return Result<PersonResponse>.Ok(response);
            
        }

        public async Task<Result<PersonListResponse>> GetAllPeople()
        {
            var people = await _context.people.ToListAsync();

            var response = new PersonListResponse
            {
                PersonList = _mapper.Map<List<PersonResponse>>(people)
            };

            return Result<PersonListResponse>.Ok(response);
        }

        public async Task<Result<PersonResponse>> GetPersonById(Guid id)
        {
            var person = await _context.people.FindAsync(id);
            var response = _mapper.Map<PersonResponse>(person);

            return Result<PersonResponse>.Ok(response);
        }

        public async Task<Result<bool>> DeletePerson(Guid id)
        {
            var person = await _context.people.FindAsync(id);
            if (person == null) return Result<bool>.Fail("Não foi encontrada uma pessoa com esse identificador");
                
            _context.people.Remove(person);
            await _context.SaveChangesAsync();
           return Result<bool>.Ok(true);
        }

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
