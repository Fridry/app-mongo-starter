import { IsString, IsNotEmpty, IsPostalCode } from 'class-validator';

export class AddressDto {
  @IsNotEmpty()
  @IsString()
  street: string;

  @IsNotEmpty()
  @IsString()
  number: number;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  @IsPostalCode('BR')
  zipCode: string;

  @IsNotEmpty()
  @IsString()
  country: string;
}
