namespace expense_control_api.DTOs
{
    public class PersonResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public int Age { get; set; }
   
    }
}
