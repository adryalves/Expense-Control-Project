# Descrição do Projeto

O presente projeto tem como objetivo implementar um sistema de controle de gastos residenciais. Nesse sistema, é possível cadastrar pessoas que seriam os residentes dessa casa, informando seu nome
e sua idade, além de cadastrar categorias, que são definidas por sua descrição e pela finalidade, a qual pertencem, podendo ser de receita, despesa ou ambas. Por fim, é possível criar transações
no qual se adiciona a descrição, o valor da transação, o tipo dela (receita ou despesa), a categoria referente a ela (que precisa ser condizente com o tipo da transação) e a pessoa que realizou
essa transação.

## Funcionalidades

- Criação, listagem, atualização e deleção de Pessoas
- Criação e listagem de Categorias
- Criação, listagem e atualização de transações
- Consulta de totais de receita, despesa e saldo por pessoa e o total geral do sistema
- Consulta de totais de receita, despesa e saldo por categoria e o total geral do sistema

## Tecnologias

- Back-end: C# e .Net.
- Front-end: React com typescript.
- Banco de dados: MySQL
- Infraestrutura: Docker e Docker Compose

## Como rodar o projeto?

Existe duas maneiras para executar o presente projeto. A opção com docker é a mais simples e a que recomendo, uma vez que apenas com um comando é possível ter a aplicação rodando completo, inclusive o banco de dados, sem a necessidade de ter as tecnologias instaladas localmente. Já a segunda opção é rodar manualmente, porém nessa é preciso ter as tecnologias instaladas para rodar e também é necessário criar o banco de dados localmente, e rodar o script do banco lá.

## Como rodar com Docker

### Pré-requisitos

- Docker Desktop instalado e rodando

### Passo a passo

1. Na raiz do projeto, insira os seguintes comando para fazer o build e subir os containers
   -  `docker compose build`
   -  `docker compose up`
2. Acesse a aplicação:
   - Frontend: `http://localhost:3000`
   - Backend (Swagger): `http://localhost:8080/swagger`

Assim, já é possível acessar a aplicação completa e testar as funcionalidades, inclusive salvando os dados no banco de dados.

3. Para parar os containers:
   - `docker compose down`

## Como rodar sem Docker

### Pré-requisitos

- Node.js 20+
- .NET SDK 8
- MySQL 8 rodando localmente (ex.: `localhost:3306`)

### 1) Rodar o banco de dados (MySQL local)

1. Crie o banco e o usuário (o usuario e senha são exemplos):
   - Banco: `expense_control`
   - Usuário: `app`
   - Senha: `app123`
2. Rode o Script do banco <br>
   Vou deixar o script do banco na raiz desse programa, de forma que é necessário abrir esse script e rodar ele dentro do MySQL para criar o banco e as tabelas.

### 2) Rodar o backend (API)

1. Entre na pasta do backend:
   - `cd backend/expense-control-api`
2. Configure a connection string <br>
   No arquivo appsettings.json modifique o valor da DefaultConnection que atualmente está assim "", para a connection string do seu banco. <br>
   Exemplo:
   - `"DefaultConnection":= "Server=localhost;Port=3306;Database=expense_control;User=app;Password=app123;"`
3. Rode a API:
   - `dotnet restore`
   - `dotnet run`
4. Acesse o Swagger:
   - `http://localhost:5145/swagger`

### 3) Rodar o frontend (React)

1. Em outro terminal, entre na pasta do frontend:
   - `cd frontend/expense-control-front`
2. Instale e rode:
   - `npm install`
   - `npm run dev`
3. Acesse a aplicação:
   - `http://localhost:5173`



