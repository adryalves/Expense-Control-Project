namespace expense_control_api.DTOs
{
    public class PaginatedResultDTO<T>
    {

     public IEnumerable<T> Data { get; set; } = Enumerable.Empty<T>();
     public int CurrentPage { get; set; }
     public int PageSize { get; set; }
     public int TotalRecords { get; set; }
     public int TotalPages => (int)Math.Ceiling(TotalRecords / (double)PageSize);
     }
   
}
