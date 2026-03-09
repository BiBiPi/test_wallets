import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { TransactionsService } from './transactions/transactions.service';
import { TransactionsController } from './transactions/transactions.controller';
import postgres from 'postgres';

@Module({
  imports: [],
  controllers: [UsersController, TransactionsController],
  providers: [
    {
      provide: 'SQL',
      useValue: postgres(
        process.env.PG_CONNECTION ?? `postgres://root:root@localhost:5432/test`,
      ),
    },
    UsersService,
    TransactionsService,
  ],
})
export class AppModule {}
