using AutoMapper;
using expense_control_api.Data;
using expense_control_api.DTOs;
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

    }
}
