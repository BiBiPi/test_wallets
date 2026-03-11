import { Inject, Injectable } from '@nestjs/common';
import postgres from 'postgres';
import { RedisClientType } from 'redis';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject('SQL') private readonly sql: postgres.Sql,
    @Inject('REDIS') private readonly resis: RedisClientType,
  ) {}

  async getAll() {
    return await this.sql`SELECT * FROM transactions`;
  }

  async buy(user_id: number, price: number) {
    const result = await this.sql.begin(async () => {
      const existUser = await this
        .sql`SELECT id FROM users WHERE id = ${user_id} for update`; // LOCK OR WAIT OTHER TRANSACTIONS
      if (!existUser) throw new Error('User not found');

      const [{ total_balance }] = await this
        .sql`SELECT SUM(amount) as total_balance FROM transactions WHERE user_id = ${user_id}`;
      if (total_balance < price) throw new Error('Insufficient funds');

      await this
        .sql`INSERT INTO transactions(user_id, action, amount, ts) VALUES (${user_id}, 'DOWN', ${-price}, NOW()) RETURNING *`;

      return await this
        .sql`UPDATE users SET balance = ${total_balance} WHERE id = ${user_id}`;
    });

    return result;
  }
}
