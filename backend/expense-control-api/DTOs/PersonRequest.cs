using System.ComponentModel.DataAnnotations;

namespace expense_control_api.DTOs
{
    public class PersonRequest
    {
        [Required(ErrorMessage = "É obrigatório inserir um nome")]
        public string Name { get; set; }

        [Range(1, 130, ErrorMessage = "A idade precisa ser positiva")]
        public int Age { get; set; }
    }
}
