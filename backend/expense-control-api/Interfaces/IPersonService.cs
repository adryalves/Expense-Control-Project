using expense_control_api.DTOs;
using expense_control_api.Results;

namespace expense_control_api.Interfaces
{
    public interface IPersonService
    {
        Task<Result<PersonResponse>> CreatePerson(PersonRequest personRequest);
        Task<Result<PaginatedResultDTO<PersonResponse>>> GetAllPeople(int page = 1, int pageSize = 10);
        Task<Result<PersonResponse>> GetPersonById(Guid id);
        Task<Result<bool>> DeletePerson(Guid id);
        Task<Result<PeopleSummaryResponse>> GetPeopleSummary();
        Task<Result<PersonResponse>> UpdatePerson(Guid id, PersonRequest request);
    }
}
