using expense_control_api.DTOs;
using expense_control_api.Interfaces;
using expense_control_api.Models;
using expense_control_api.Results;
using Microsoft.AspNetCore.Mvc;

namespace expense_control_api.Controllers
{
    [Route("/api/v1.0/person")]
    [ApiController]
    public class PersonController : ControllerBase
    {
        private readonly IPersonService _personService;

        public PersonController(IPersonService personService)
        {
            _personService = personService;
        }

        [HttpPost]
        public async Task<ActionResult<PersonResponse>> CreatePerson([FromBody] PersonRequest request)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                
                    var person = await _personService.CreatePerson(request);

                if (!person.Success)
                    return BadRequest(new { error = person.Error });

                return Ok(person.Data);
            }

            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpGet("All")]
        public async Task<ActionResult<PersonListResponse>> GetAllPeople()
        {
            try
            {
                var people = await _personService.GetAllPeople();

                if (!people.Success)
                    return BadRequest(new { error = people.Error });

                return Ok(people.Data.PersonList);
               
            }

            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PersonResponse>> GetPersonById(Guid id)
        {
            try
            {
                var person = await _personService.GetPersonById(id);
                if (person.Data == null) return NotFound("Não foi encontrada uma pessoa com esse Id");

                if (!person.Success)
                    return BadRequest(new { error = person.Error });

                return Ok(person.Data);
            }

            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpDelete]
        public async Task<IActionResult> DeletePerson(Guid id)
        {
            try
            {              
                var delete =  await _personService.DeletePerson(id);

                if (!delete.Success)
                    return BadRequest(new { error = delete.Error });

                return Ok(delete.Data);

            }

            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
    }
}
