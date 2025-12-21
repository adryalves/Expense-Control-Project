namespace expense_control_api.Results
{
    /// <summary>
    /// Essa classe funciona como uma classe para gerar resposta, por meio dela é possível registrar no service
    /// se algo deu errado na excecução da lógica do fluxo e o que deu errado. Dessa forma, é possível no controller recuperar
    /// o motivo de algum erro que possa ter ocorrido no service
    /// </summary>
    public class Result<T>
        {
            public bool Success { get; }
            public string Error { get; }
            public T Data { get; }

            private Result(bool success, T data, string error)
            {
                Success = success;
                Data = data;
                Error = error;
            }

            public static Result<T> Ok(T data)
                => new(true, data, null);

            public static Result<T> Fail(string error)
                => new(false, default, error);
        }
    }

