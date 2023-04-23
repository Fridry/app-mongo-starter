import {
  IsString,
  IsNotEmpty,
  Length,
  IsEmail,
  IsArray,
  // IsStrongPassword,
} from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  @IsString()
  @Length(11, 11)
  cpf: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  // @IsStrongPassword({
  //   minLength: 6,

  // })
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsArray()
  tags: string[];
}
