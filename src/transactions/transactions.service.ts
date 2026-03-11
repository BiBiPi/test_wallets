import { Inject, Injectable } from '@nestjs/common';
import postgres from 'postgres';
import { RedisClientType } from 'redis';
import { DateTime } from 'luxon';

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
      const [{ exist_user }] = await this
        .sql`SELECT id as exist_user FROM users WHERE id = ${user_id} for update`; // LOCK OR WAIT OTHER TRANSACTIONS
      if (!exist_user) throw new Error('User not found');

      let oldSum = (await this.resis.get(`user:${exist_user}`)) ?? 0;

      if (!oldSum) {
        const [{ total_balance }] = await this
          .sql`SELECT SUM(amount) as total_balance FROM transactions WHERE user_id = ${user_id} and ts::date < NOW()::date`;

        oldSum = total_balance;

        await this.resis.set(`user:${exist_user}`, total_balance, {
          EXAT: +DateTime.now().plus({ day: 1 }).startOf('day') / 1000,
        });
      }

      const [{ total_balance }] = await this
        .sql`SELECT SUM(amount) as total_balance FROM transactions WHERE user_id = ${user_id} and ts::date >= NOW()::date`;

      if (Number(total_balance) + Number(oldSum) < price)
        throw new Error('Insufficient funds');

      await this
        .sql`INSERT INTO transactions(user_id, action, amount, ts) VALUES (${user_id}, 'DOWN', ${-price}, NOW()) RETURNING *`;

      return await this
        .sql`UPDATE users SET balance = ${Number(total_balance) + Number(oldSum)} WHERE id = ${user_id} RETURNING *`;
    });

    return result;
  }
}
