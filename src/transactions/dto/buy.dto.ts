import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class BuyDTO {
  @IsInt()
  @IsNotEmpty()
  readonly user_id: number;

  @IsInt({})
  @IsNotEmpty()
  @Min(1)
  readonly price: number;
}
