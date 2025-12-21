using expense_control_api.Enums;
using System.ComponentModel.DataAnnotations;

namespace expense_control_api.DTOs
{
    public class CategoryRequest
    {
        [Required(ErrorMessage = "É obrigatório inserir uma descrição")]
        public string Description { get; set; } = null!;

        [Required(ErrorMessage = "É obrigatório inserir uma finalidade para a categoria")]
        [EnumDataType(typeof(CategoryPurpose),
        ErrorMessage = "Finalidade inválida. Valores permitidos: Expense, Income, Both.")]
        public CategoryPurpose Purpose { get; set; }
    }
}
