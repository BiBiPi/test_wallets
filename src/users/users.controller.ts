import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Validate } from 'class-validator';
import { DepostitDTO } from './dto/deposti.dto';

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
  deposit(@Body() deposit: DepostitDTO) {
    return this.usersService.deposit(deposit.user_id, deposit.amount);
  }
}
