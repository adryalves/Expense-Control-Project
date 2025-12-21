using AutoMapper;
using expense_control_api.DTOs;
using expense_control_api.Models;

namespace expense_control_api.Mappings
{
    public class PersonProfile : Profile
    {
        public PersonProfile()
        {
            CreateMap<PersonRequest, Person>();
            CreateMap<Person, PersonResponse>();
        }
    }
}
