using AutoMapper;
using expense_control_api.DTOs;
using expense_control_api.Models;


namespace expense_control_api.Mappings
{
    public class TransactionProfile : Profile 
    {
        public TransactionProfile() 
        {
            CreateMap<TransactionRequest, Transaction>();
            CreateMap<Transaction, TransactionResponse>();
        }
    }
}
