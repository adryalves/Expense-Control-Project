using System;
using System.Collections.Generic;

namespace expense_control_api.Models;

public class Person
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public int Age { get; set; }

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
