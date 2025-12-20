using expense_control_api.Enums;
using System;
using System.Collections.Generic;

namespace expense_control_api.Models;

public class Category
{
    public Guid Id { get; set; }

    public string Description { get; set; } = null!;

    public CategoryPurpose Purpose { get; set; } 

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
