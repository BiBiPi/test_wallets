import { Body, Controller, Get, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { BuyDTO } from './dto/buy.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('all')
  getAll() {
    return this.transactionsService.getAll();
  }

  @Post('buy')
  buy(@Body() buy: BuyDTO) {
    return this.transactionsService.buy(buy.user_id, buy.price);
  }
}
