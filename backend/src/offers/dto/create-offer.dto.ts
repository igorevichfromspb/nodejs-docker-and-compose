import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateOfferDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsBoolean()
  @IsOptional()
  hidden?: boolean;

  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  itemId: number;
}
