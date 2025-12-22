﻿using expense_control_api.DTOs;
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
                return BadRequest(ex.Message);
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
                return BadRequest(ex.Message);
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
                return BadRequest(ex.Message);
            }

        }

        [HttpGet("GetPeopleSummary")]
        public async Task<ActionResult> GetPeopleSumamry()
        {
            try
            {
                var peopleSummary = await _personService.GetPeopleSummary();

                if(!peopleSummary.Success)
                    return BadRequest(new { error = peopleSummary.Error });

                return Ok(peopleSummary.Data);
            }

            catch (Exception ex)
            {
                return BadRequest(ex.Message);
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
                return BadRequest(ex.Message);
            }
        }

        [HttpPut]
        public async Task<ActionResult> UpdatePerson([FromQuery] Guid id, [FromBody] PersonRequest request)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);

                var person = await _personService.GetPersonById(id);

                if(person.Data == null) return NotFound("Não foi encontrada uma pessoa com esse id");

                var personUpdated = await _personService.UpdatePerson(id, request);

                if(!personUpdated.Success)
                    return BadRequest(new { error = personUpdated.Error });

                return Ok(personUpdated.Data);
            }

            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
