using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;
using expense_control_api.Models;

namespace expense_control_api.Data;

public partial class ExpenseControlDbContext : DbContext
{

    public ExpenseControlDbContext(DbContextOptions<ExpenseControlDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Category> categories { get; set; }

    public virtual DbSet<Person> people { get; set; }

    public virtual DbSet<Transaction> transactions { get; set; }

   

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_unicode_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.Property(e => e.Description).HasMaxLength(150);
            entity.Property(e => e.Purpose).HasConversion<string>().HasColumnType("enum('EXPENSE','INCOME','BOTH')");
        });

        modelBuilder.Entity<Person>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.Property(e => e.Name).HasMaxLength(150);
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasIndex(e => e.CategoryId, "fk_transactions_category");

            entity.HasIndex(e => e.PersonId, "fk_transactions_person");

            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.Description).HasMaxLength(200);
            entity.Property(e => e.Type).HasConversion<string>().HasColumnType("enum('EXPENSE','INCOME')");

            entity.Property(e => e.CategoryId)
                .HasColumnName("category_id")
                .HasColumnType("char(36)");

            entity.Property(e => e.PersonId)
                .HasColumnName("person_id")
                .HasColumnType("char(36)");



            entity.HasOne(d => d.Category).WithMany(p => p.Transactions)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_transactions_category");

            entity.HasOne(d => d.Person).WithMany(p => p.Transactions)
                .HasForeignKey(d => d.PersonId)
                .HasConstraintName("fk_transactions_person");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
