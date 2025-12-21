using expense_control_api.Enums;
using System.ComponentModel.DataAnnotations;

namespace expense_control_api.DTOs
{
    public class TransactionRequest
    {
       
        [Required(ErrorMessage = "A descrição é obrigatória")]
        [StringLength(150, MinimumLength = 3)]
        public string Description { get; set; } = null!;

        [Required(ErrorMessage = "O valor é obrigatório")]
        [Range(0.01, double.MaxValue, ErrorMessage = "O valor precisa ser positivo")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "O tipo de transação é obrigatória")]
        [EnumDataType(typeof(TransactionType),
              ErrorMessage = "Tipo inválido. Valores permitidos: Expense, Income.")]
        public TransactionType Type { get; set; }

        [Required(ErrorMessage = "O id da pessoa é obrigatório")]
        public Guid PersonId { get; set; }

        [Required(ErrorMessage = "O id da categoria é obrigatório")]
        public Guid CategoryId { get; set; }

    }
}
