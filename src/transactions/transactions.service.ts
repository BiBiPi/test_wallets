import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
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
      const [user] = await this
        .sql`SELECT id FROM users WHERE id = ${user_id} for update`; // LOCK OR WAIT OTHER TRANSACTIONS

      if (!user)
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);

      let oldSum = await this.resis.get(`user:${user.id}`);

      if (!oldSum) {
        const [balance] = await this
          .sql`SELECT SUM(amount) as total_balance FROM transactions WHERE user_id = ${user_id} and ts::date < NOW()::date`;

        oldSum = balance.total_balance ?? 0;

        await this.resis.set(`user:${user.id}`, balance.total_balance ?? 0, {
          EXAT: +DateTime.now().plus({ day: 1 }).startOf('day') / 1000,
        });
      }

      const [balance] = await this
        .sql`SELECT SUM(amount) as total_balance FROM transactions WHERE user_id = ${user_id} and ts::date >= NOW()::date`;

      if (Number(balance.total_balance) + Number(oldSum) < price)
        throw new HttpException('Insufficient funds', HttpStatus.BAD_REQUEST);

      await this
        .sql`INSERT INTO transactions(user_id, action, amount, ts) VALUES (${user_id}, 'DOWN', ${-price}, NOW()) RETURNING *`;

      return await this
        .sql`UPDATE users SET balance = ${Number(balance.total_balance) + Number(oldSum)} WHERE id = ${user_id} RETURNING *`;
    });

    return result;
  }
}
