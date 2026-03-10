# Тестовое задание

Баланс которые высчитывается на основе истории таранзакций. 
Работает так: при списании вычисляется сумма всех операций (пополнения и списание баланса), затем проверяется доступны ли средства, и после записываем транзакцию и пересчитываем баланс. Весь этот набор действий атомарен и выполняеться в ACID транзакции.

В кэш кладу старые данные по транзакциям, чтобы не задействовать всю таблицу для подчета баланса, а только часть.

#### Запуск базы в докере: 

```bash 
docker run --name test1 -p 5432:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=root -e POSTGRES_DB=test -d postgres:17`
```

#### Описание таблиц:

```SQL
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    balance INT CHECK (balance >= 0) NOT NULL
);

CREATE TYPE status AS ENUM ('UP', 'DOWN');

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT, 
    action status NOT NULL, 
    amount INT NOT NULL, 
    ts TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx__user_id__ts ON transactions(user_id, ts); -- Для кэширования.
```

#### Пополнение баланса:

```bash
curl localhost:3000/users/deposit \
  -X PATCH \
  -H 'Content-Type: application/json' \
  -d '{ "user_id": 1, "amount": 100 }'
```

#### Списание баланса после покупки:

```bash
curl localhost:3000/transactions/buy \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{ "user_id": 1, "price": 100 }'
```

Допонительные методы для проврки:

```bash
curl localhost:3000/users/all
curl localhost:3000/users/create -X PUT

curl localhost:3000/transactions/all
```

```sql
INSERT INTO users (balance)
SELECT 0 FROM generate_series(1, 1000000);

INSERT INTO transactions (user_id, action, amount, ts)
SELECT 1, 'UP', 1, NOW() FROM generate_series(1, 1000000);
```