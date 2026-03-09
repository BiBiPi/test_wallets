import { Body, Controller, Get, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('all')
  getAll() {
    return this.transactionsService.getAll();
  }

  @Post('buy')
  buy(@Body() buy: { user_id: number; price: number }) {
    const { user_id, price } = buy;

    return this.transactionsService.buy(user_id, price);
  }
}
