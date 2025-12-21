using expense_control_api.DTOs;
using expense_control_api.Interfaces;
using expense_control_api.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace expense_control_api.Controllers
{
    [Route("/api/v1.0/transaction")]
    [ApiController]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpPost]
        public async Task<ActionResult> CreateTransaction([FromBody] TransactionRequest request)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);

                var transaction = await _transactionService.CreateTransaction(request);

                if (!transaction.Success)
                    return BadRequest(new { error = transaction.Error });

                return Ok(transaction.Data);

            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }

        [HttpGet("All")]
        public async Task<ActionResult> GetAllTransactions()
        {
            try
            {
                var transactions = await _transactionService.GetAllTransaction();

                if (!transactions.Success)
                    return BadRequest(new { error = transactions.Error });

                return Ok(transactions.Data.TransactionList);

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetTransactionById(Guid id)
        {
            try
            {
                var transaction = await _transactionService.GetTransactionById(id);

                if (transaction.Data == null) return NotFound("Não foi encontrada uma transação com esse identificador");

                if(!transaction.Success)
                    return BadRequest(new { error = transaction.Error });

                return Ok(transaction.Data);
            }

            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

    }
}

