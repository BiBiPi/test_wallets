import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('all')
  getAll() {
    return this.usersService.getAll();
  }

  @Put('create')
  createUser() {
    return this.usersService.create();
  }

  @Patch('deposit')
  deposit(@Body() deposit: { user_id: number; amount: number }) {
    if (deposit.amount <= 0)
      throw new BadRequestException('Amount must be upper 0');

    const { user_id, amount } = deposit;
    return this.usersService.deposit(user_id, amount);
  }
}
