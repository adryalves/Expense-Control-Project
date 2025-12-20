using expense_control_api.Enums;
using System;
using System.Collections.Generic;

namespace expense_control_api.Models;

public class Transaction
{
    public Guid Id { get; set; }

    public string Description { get; set; } = null!;

    public decimal Amount { get; set; }

    public TransactionType Type { get; set; } 

    public Guid PersonId { get; set; }

    public Guid CategoryId { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual Person Person { get; set; } = null!;
}
