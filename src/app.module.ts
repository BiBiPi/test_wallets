import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { TransactionsService } from './transactions/transactions.service';
import { TransactionsController } from './transactions/transactions.controller';
import postgres from 'postgres';
import { createClient } from 'redis';
import { DateTime } from 'luxon';

@Module({
  imports: [],
  controllers: [UsersController, TransactionsController],
  providers: [
    {
      provide: 'SQL',
      useFactory: () =>
        postgres(
          process.env.PG_URL ?? `postgres://root:root@localhost:5432/test`,
        ),
    },
    {
      provide: 'REDIS',
      useFactory: async () => {
        console.log(+DateTime.now().plus({ day: 1 }).startOf('day'));
        const client = createClient({
          url: process.env.REDIS_URL ?? 'redis://localhost:6379',
        });

        client.on('error', (err) => console.log('Redis Client Error', err));
        await client.connect();

        return client;
      },
    },
    UsersService,
    TransactionsService,
  ],
})
export class AppModule {}
