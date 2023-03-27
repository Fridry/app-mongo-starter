import { Exclude } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  Length,
  MinLength,
} from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(11, 11)
  cpf: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Exclude()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
